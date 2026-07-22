import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { validateBlueprint } from "../../core/validation";
import { serializeBlueprint } from "../../core/serialization";
import { collectRenderCustomCss } from "../../core/rendering/renderCustomCss";
import { parseTsx } from "../ast/parser";
import { normalizeTsx } from "../ast/normalize";
import { buildDesignGraph } from "../design-graph/builder";
import { validateDesignGraph } from "../design-graph/validator";
import { interpretJsx } from "../interpreter/jsxInterpreter";
import { compileDesignGraphToBlueprint } from "../compiler/blueprintCompiler";
import { parseResidualCss } from "../css-layer/cssAst";
import { sanitizeResidualCss } from "../css-layer/sanitizer";
import { validateLocalSelector } from "../css-layer/scoper";
import { classifyNodeDesign } from "../css-layer/classifier";
import { lowerResidualCss } from "../css-layer/lowering";
import { createBenchmarkReport } from "../benchmarks/reports/benchmarkReport";
import { buildV11VisualFixture, isV11VisualFixtureId, isV11VisualPreviewAvailable } from "../benchmarks/visual/visualFixture";
import { assessUntrustedSource } from "../security/sourceGate";

function sourcePipeline(source: string, file = "inline.tsx") {
  const parsed = parseTsx(source, file);
  const normalized = normalizeTsx(parsed);
  const graph = buildDesignGraph(normalized);
  const compilation = compileDesignGraphToBlueprint(graph);
  return { parsed, normalized, graph, compilation };
}

function fixture(name: "luxury-real-estate" | "modern-saas") {
  const url = new URL(`../fixtures/${name}.tsx`, import.meta.url);
  return sourcePipeline(readFileSync(url, "utf8"), url.pathname);
}

test("expands local arrow and function components with literal props and static children", () => {
  const result = sourcePipeline(`
    const Card = ({ value }) => <article><strong>{value}</strong></article>;
    function Frame({ children }) { return <section>{children}</section>; }
    export default function Page() { return <Frame><Card value="24 residences" /></Frame>; }
  `);
  assert.equal(result.graph.diagnostics.length, 0);
  assert.ok(Object.values(result.graph.nodes).some((node) => node.content === "24 residences"));
  assert.equal(Object.values(result.graph.nodes).filter((node) => node.type === "section").length, 1);
  assert.ok(!Object.values(result.graph.nodes).some((node) => node.provenance.sourceElement === "Card"));
});

test("evaluates bounded static arrays and expands map callbacks", () => {
  const result = sourcePipeline(`
    const items = [{ title: "One" }, { title: "Two" }, { title: "Three" }];
    const Item = ({ title }) => <article><h2>{title}</h2></article>;
    export default function Page() { return <section>{items.map((item) => <Item title={item.title} />)}</section>; }
  `);
  assert.deepEqual(Object.values(result.graph.nodes).filter((node) => node.type === "heading").map((node) => node.content), ["One", "Two", "Three"]);
});

test("evaluates type-only assertions inside static array data", () => {
  const result = sourcePipeline(`
    const values = [
      { icon: "bottle" as const, title: "Pure ingredients" },
      { icon: "leaf" as string, title: "Sustainable beauty" },
    ];
    export default function Page() {
      return <section>{values.map((value) => <article><p>{value.icon}</p><h2>{value.title}</h2></article>)}</section>;
    }
  `, "type-assertions.tsx");

  assert.equal(
    result.graph.diagnostics.filter(
      (diagnostic) => diagnostic.code === "UNSUPPORTED_RUNTIME_EXPRESSION",
    ).length,
    0,
  );
  assert.deepEqual(
    Object.values(result.graph.nodes)
      .filter((node) => node.type === "heading")
      .map((node) => node.content),
    ["Pure ingredients", "Sustainable beauty"],
  );
});

test("evaluates common display-only string formatting calls", () => {
  const result = sourcePipeline(`
    const items = [{ title: "studio" }, { title: "work" }];
    export default function Page() { return <section>{items.map((item, index) => <p>{String(index + 1).padStart(2, "0")} {item.title.toUpperCase()}</p>)}</section>; }
  `);
  assert.equal(result.graph.diagnostics.length, 0);
  assert.deepEqual(Object.values(result.graph.nodes).filter((node) => node.type === "text").map((node) => node.content), ["01 STUDIO", "02 WORK"]);
});

test("rejects runtime expressions, hooks, and arbitrary imports with locations", () => {
  const runtime = sourcePipeline(`import thing from "external"; export default function Page(){ const [x] = useState(1); return <section>{fetch('/x')}</section>; }`);
  const codes = runtime.graph.diagnostics.map((item) => item.code);
  assert.ok(codes.includes("ARBITRARY_IMPORT_REJECTED"));
  assert.ok(codes.includes("HOOK_REJECTED"));
  assert.ok(codes.includes("UNSUPPORTED_RUNTIME_EXPRESSION") || codes.includes("UNSUPPORTED_VISIBLE_EXPRESSION"));
  assert.ok(runtime.graph.diagnostics.every((item) => item.location.line > 0 && item.location.column > 0));
});

test("reports complete source metadata for every unsupported visible expression", () => {
  const file = "diagnostics/unsupported-visible.tsx";
  const source = [
    "export default function Page() {",
    "  return <section>",
    "      {window.location}",
    "    </section>;",
    "}",
  ].join("\n");
  const result = sourcePipeline(source, file);
  const diagnostics = result.graph.diagnostics.filter(
    (item) => item.code === "UNSUPPORTED_VISIBLE_EXPRESSION",
  );

  assert.equal(diagnostics.length, 1);
  for (const diagnostic of diagnostics) {
    assert.equal(diagnostic.astNodeType, "MemberExpression");
    assert.equal(diagnostic.sourceSnippet, "window.location");
    assert.deepEqual(diagnostic.location, {
      file,
      line: 3,
      column: 8,
    });
  }
});

test("accepts computed className when it resolves entirely from static values", () => {
  const source = `export default function Page(){const featured=true;return <section aria-label="hero" className={featured ? "bg-black text-white" : "bg-white text-black"}><h1 className={\`text-5xl \${featured ? "font-bold" : "font-normal"}\`}>Studio</h1></section>}`;
  const gate = assessUntrustedSource(source, "static-class.tsx");
  assert.equal(gate.safe, true, gate.findings.map((item) => item.code).join(", "));
});

test("enforces component depth and expanded node budgets", () => {
  const recursive = normalizeTsx(parseTsx(`const A=()=> <A/>; export default function Page(){return <A/>}`, "recursive.tsx"));
  const depthResult = interpretJsx(recursive, { maxComponentDepth: 2 });
  assert.ok(depthResult.diagnostics.some((item) => item.code === "COMPONENT_DEPTH_BUDGET"));
  const nodes = normalizeTsx(parseTsx(`export default function Page(){return <section><div/><div/><div/></section>}`, "nodes.tsx"));
  const nodeResult = interpretJsx(nodes, { maxNodeCount: 2 });
  assert.ok(nodeResult.diagnostics.some((item) => item.code === "NODE_COUNT_BUDGET"));
});

test("parses, scopes, classifies, sanitizes, and lowers residual CSS", () => {
  const luxury = fixture("luxury-real-estate");
  const glass = Object.values(luxury.graph.nodes).find((node) => node.effects.some((effect) => effect.declarations["backdrop-filter"]));
  assert.ok(glass);
  assert.ok(classifyNodeDesign(glass!).native.includes("position"));
  assert.ok(classifyNodeDesign(glass!).residual.length >= 2);
  const lowered = lowerResidualCss(glass!);
  assert.equal(lowered.safe, true);
  assert.match(lowered.customCss ?? "", /selector::before/);
  assert.match(lowered.customCss ?? "", /backdrop-filter/);
  assert.equal(validateLocalSelector("selector:hover"), true);
  assert.equal(validateLocalSelector("body *"), false);
});

test("rejects unscoped selectors, imports, and external URLs without discarding safe properties", () => {
  const luxury = fixture("luxury-real-estate");
  const node = Object.values(luxury.graph.nodes)[1];
  const unsafe = sanitizeResidualCss(parseResidualCss(`body { color:red } selector { display:grid; background-image:url(https://evil.example/x) } @import "x";`), node);
  const codes = unsafe.diagnostics.map((item) => item.code);
  assert.ok(codes.includes("UNSAFE_CSS_SELECTOR"));
  assert.ok(codes.includes("UNSAFE_CSS_AT_RULE"));
  assert.ok(codes.includes("UNSAFE_CSS_VALUE") || codes.includes("UNSAFE_CSS_PROPERTY"));
  assert.match(unsafe.css, /display:\s*grid/);
});

test("preserves safe element, descendant, child, attribute, and pseudo selectors", () => {
  const result = sourcePipeline(`
    export default function Page() {
      return <main><nav className="nav"><a className="link" href="#x"><span>Go</span></a></nav><style>{\`
        html { scroll-behavior: smooth; }
        body { margin: 0; color: #222; }
        main { overflow: clip; font-family: system-ui; }
        a { text-decoration-thickness: 2px; }
        #x-target[data-state="ready"] { accent-color: rebeccapurple; }
        .nav > a[href="#x"]:hover span:last-child { text-underline-offset: 4px; }
      \`}</style></main>;
    }
  `, "general-safe-css.tsx");
  const nodes = Object.values(result.compilation.blueprint.nodes);
  const pageCss = String((result.compilation.blueprint.nodes[result.compilation.blueprint.root].props.advanced as any)?.customCss ?? "");
  const linkCss = nodes
    .map((node) => String((node.props.advanced as any)?.customCss ?? ""))
    .find((css) => /text-decoration-thickness/.test(css)) ?? "";
  const navCss = nodes
    .map((node) => String((node.props.advanced as any)?.customCss ?? ""))
    .find((css) => /a\[href="#x"\]/.test(css)) ?? "";

  assert.match(pageCss, /scroll-behavior:\s*smooth/);
  assert.match(pageCss, /font-family:\s*system-ui/);
  assert.match(pageCss, /selector #x-target\[data-state="ready"\]/);
  assert.match(linkCss, /text-decoration-thickness:\s*2px/);
  assert.match(navCss, /selector\s*>\s*a\[href="#x"\]:hover span:last-child/);
  assert.ok(!result.compilation.diagnostics.some((item) => item.code.startsWith("UNSAFE_CSS")));
  assert.equal(validateBlueprint(result.compilation.blueprint).valid, true);
});

test("preserves safe per-element CSS when a sibling declaration is rejected", () => {
  const result = sourcePipeline(`
    export default function Page() {
      return <section><article className="glass-card">Visible card</article><style>{\`
        .glass-card {
          backdrop-filter: blur(12px);
          behavior: url(unsafe.htc);
        }
      \`}</style></section>;
    }
  `, "mixed-css.tsx");
  const card = Object.values(result.compilation.blueprint.nodes).find(
    (node) => node.name === "article",
  );
  const customCss = String((card?.props.advanced as any)?.customCss ?? "");

  assert.match(customCss, /selector\s*\{[^}]*backdrop-filter:\s*blur\(12px\)/s);
  assert.doesNotMatch(customCss, /behavior|unsafe\.htc/);
  assert.ok(
    result.compilation.diagnostics.some(
      (diagnostic) => diagnostic.code === "UNSAFE_CSS_PROPERTY",
    ),
  );
  assert.equal(validateBlueprint(result.compilation.blueprint).valid, true);
  assert.match(
    collectRenderCustomCss(result.compilation.blueprint),
    new RegExp(`\\[data-node-id="${card?.id}"\\][^{]*\\{[^}]*backdrop-filter`, "s"),
  );
});

test("lowers root CSS variables to inheritable page custom CSS", () => {
  const result = sourcePipeline(`
    export default function Page() {
      return <main><section><article className="card">Card</article></section><style>{\`
        :root { --surface: #fafaf8; --ink: #2a2726; }
        .card { background: var(--surface); }
      \`}</style></main>;
    }
  `, "root-variables.tsx");
  const page = result.compilation.blueprint.nodes[result.compilation.blueprint.root];
  const pageCss = String((page.props.advanced as any)?.customCss ?? "");

  assert.match(pageCss, /selector\s*\{[^}]*--surface:\s*#fafaf8/s);
  assert.match(pageCss, /--ink:\s*#2a2726/);
  assert.ok(
    !result.compilation.diagnostics.some(
      (diagnostic) =>
        diagnostic.code === "UNSAFE_CSS_SELECTOR" &&
        diagnostic.feature === ":root",
    ),
  );
  assert.equal(validateBlueprint(result.compilation.blueprint).valid, true);
  assert.match(collectRenderCustomCss(result.compilation.blueprint), /--surface:\s*#fafaf8/);
});

test("lowers a safe universal box-sizing reset onto every editable node", () => {
  const result = sourcePipeline(`
    export default function Page() {
      return <main><section><article>Card</article></section><style>{\`
        * { box-sizing: border-box; }
      \`}</style></main>;
    }
  `, "universal-box-sizing.tsx");
  const blueprint = result.compilation.blueprint;

  for (const node of Object.values(blueprint.nodes)) {
    assert.match(
      String((node.props.advanced as any)?.customCss ?? ""),
      /selector\s*\{[^}]*box-sizing:\s*border-box/s,
    );
  }
  assert.ok(
    !result.compilation.diagnostics.some(
      (diagnostic) =>
        diagnostic.code === "UNSAFE_CSS_SELECTOR" &&
        diagnostic.feature === "*",
    ),
  );
  assert.equal(validateBlueprint(blueprint).valid, true);
  const renderedCss = collectRenderCustomCss(blueprint);
  assert.match(renderedCss, /box-sizing:\s*border-box/);
  assert.doesNotMatch(renderedCss, /(^|})\s*\*\s*\{/);
});

test("preserves responsive resets, grid placement, negative overlap, and typography", () => {
  const luxury = fixture("luxury-real-estate");
  const editorial = Object.values(luxury.compilation.blueprint.nodes).find((node) => node.style.gridColumn && JSON.stringify(node.style.gridColumn).includes("6 / span 7"));
  assert.deepEqual(editorial?.style.gridColumn, { desktop: "6 / span 7", tablet: "auto", mobile: "auto" });
  const overlap = Object.values(luxury.compilation.blueprint.nodes).find((node) => node.type === "image" && node.props.mediaRole === "editorial-image");
  assert.deepEqual(overlap?.style.marginTop, { desktop: -64, tablet: -64, mobile: 0 });
  const heading = Object.values(luxury.compilation.blueprint.nodes).find((node) => String(node.props.text).startsWith("Architecture shaped"));
  assert.deepEqual(heading?.style.fontSize, { desktop: 96, tablet: 72, mobile: 48 });
  assert.ok(!luxury.compilation.diagnostics.some((item) => item.code === "RESPONSIVE_RESET_UNRESOLVED"));
});

test("extracts media roles and lowers them into editable image props", () => {
  const luxury = fixture("luxury-real-estate");
  const roles = Object.values(luxury.graph.nodes).flatMap((node) => node.media?.role ? [node.media.role] : []);
  assert.ok(roles.includes("hero-background"));
  assert.ok(roles.includes("floating-card-image"));
  assert.ok(roles.includes("gallery-item"));
  const hero = Object.values(luxury.graph.nodes).find((node) => node.media?.role === "hero-background");
  assert.equal(hero?.media?.background, true);
  assert.equal(hero?.media?.objectFit, "cover");
  assert.ok(Object.values(luxury.compilation.blueprint.nodes).some((node) => node.props.mediaRole === "hero-background"));
});

test("M3 visual harness fails closed in production and accepts only committed fixture IDs", () => {
  assert.equal(isV11VisualPreviewAvailable("production"), false);
  assert.equal(isV11VisualPreviewAvailable("development"), true);
  assert.equal(isV11VisualFixtureId("luxury-real-estate"), true);
  assert.equal(isV11VisualFixtureId("unknown"), false);
  const visual = buildV11VisualFixture("modern-saas");
  assert.equal(validateBlueprint(visual.blueprint).valid, true);
  assert.equal(serializeBlueprint(visual.blueprint).ok, true);
});

for (const name of ["luxury-real-estate", "modern-saas"] as const) {
  test(`${name} compiles primitive-only and passes existing validation and serialization`, () => {
    const result = fixture(name);
    assert.equal(validateDesignGraph(result.graph).valid, true);
    assert.equal(validateBlueprint(result.compilation.blueprint).valid, true);
    assert.equal(serializeBlueprint(result.compilation.blueprint).ok, true);
    assert.ok(Object.values(result.compilation.blueprint.nodes).every((node) => ["page", "section", "container", "heading", "text", "button", "image"].includes(node.type)));
  });

  test(`${name} produces complete three-viewport render-contract and fidelity reports`, () => {
    const result = fixture(name);
    const report = createBenchmarkReport(result.parsed, result.graph, result.compilation);
    assert.deepEqual(report.captures.map((capture) => capture.viewport), ["desktop", "tablet", "mobile"]);
    assert.ok(report.captures.every((capture) => capture.canvasRuntimeParity));
    assert.ok(report.captures.every((capture) => capture.pixelScreenshotCertified === false));
    assert.deepEqual(Object.keys(report.fidelity.categories).sort(), ["colorsBackgrounds", "content", "editability", "effects", "layout", "mediaRoles", "rendererParity", "responsiveComposition", "structure", "typography"].sort());
    assert.equal(report.fidelity.nonCompensating, true);
    assert.equal(report.fidelity.criticalFailures.length, 0);
    assert.equal(report.fidelity.passed, true);
  });
}
