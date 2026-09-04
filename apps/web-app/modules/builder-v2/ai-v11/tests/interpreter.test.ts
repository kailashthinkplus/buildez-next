import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { validateBlueprint } from "../../core/validation";
import { serializeBlueprint } from "../../core/serialization";
import { parseTsx } from "../ast/parser";
import { normalizeTsx } from "../ast/normalize";
import { buildDesignGraph } from "../design-graph/builder";
import { validateDesignGraph } from "../design-graph/validator";
import { compileDesignGraphToBlueprint } from "../compiler/blueprintCompiler";

const fixtureUrl = new URL("../fixtures/luxury-real-estate.tsx", import.meta.url);
const fixtureFile = fixtureUrl.pathname;
const source = readFileSync(fixtureUrl, "utf8");

const parsed = parseTsx(source, fixtureFile);
const normalized = normalizeTsx(parsed);
const graph = buildDesignGraph(normalized);
const graphValidation = validateDesignGraph(graph);
const compilation = compileDesignGraphToBlueprint(graph);

test("V11 M1 parses TSX without executing the fixture", () => {
  assert.equal(parsed.ast.type, "File");
  assert.equal(normalized.componentName, "LuxuryRealEstate");
  assert.equal(normalized.root.type, "JSXFragment");
});

test("V11 M1 interprets a provenance-complete design graph", () => {
  assert.equal(graphValidation.valid, true, graphValidation.issues.join(", "));
  assert.equal(Object.values(graph.nodes).filter((node) => node.type === "section").length, 2);
  assert.equal(Object.values(graph.nodes).filter((node) => node.type === "heading").length, 6);
  assert.equal(Object.values(graph.nodes).filter((node) => node.type === "image").length, 6);
  assert.ok(Object.values(graph.nodes).every((node) => node.provenance.sourceFile && node.provenance.line > 0 && node.provenance.column > 0));
  const hero = Object.values(graph.nodes).find((node) => node.semanticRole === "luxury-residences-hero");
  assert.equal(hero?.layout.position, "relative");
  assert.equal(hero?.style.minHeight, "100vh");
  const heroHeading = Object.values(graph.nodes).find((node) => node.content?.startsWith("Architecture shaped"));
  assert.equal(heroHeading?.style.fontFamily, "Georgia, 'Times New Roman', serif");
  assert.equal(heroHeading?.responsive.tablet?.fontSize, 72);
  assert.equal(heroHeading?.responsive.desktop?.fontSize, 96);
});

test("V11 M1 compiles only primitive Builder nodes and passes existing validation", () => {
  const allowed = new Set(["page", "section", "container", "heading", "text", "button", "image"]);
  assert.ok(Object.values(compilation.blueprint.nodes).every((node) => allowed.has(node.type)));
  const validation = validateBlueprint(compilation.blueprint);
  assert.equal(validation.valid, true, validation.issues.map((issue) => issue.code).join(", "));
  assert.equal(serializeBlueprint(compilation.blueprint).ok, true);
  assert.equal(compilation.blueprint.nodes[compilation.blueprint.root].children.length, 2);
  assert.equal(Object.keys(compilation.provenance).length, Object.keys(compilation.blueprint.nodes).length);
  const heroHeading = Object.values(compilation.blueprint.nodes).find((node) => String(node.props.text).startsWith("Architecture shaped"));
  assert.deepEqual(heroHeading?.style.fontSize, { desktop: 96, tablet: 72, mobile: 48 });
});

test("V11 M1 golden pipeline summary remains stable", () => {
  const summary = {
    ast: { type: parsed.ast.type, root: normalized.root.type, component: normalized.componentName },
    graph: {
      version: graph.version,
      nodeCount: Object.keys(graph.nodes).length,
      types: Object.values(graph.nodes).reduce<Record<string, number>>((counts, node) => ({ ...counts, [node.type]: (counts[node.type] ?? 0) + 1 }), {}),
    },
    blueprint: {
      nodeCount: Object.keys(compilation.blueprint.nodes).length,
      rootChildren: compilation.blueprint.nodes[compilation.blueprint.root].children.length,
      types: Object.values(compilation.blueprint.nodes).reduce<Record<string, number>>((counts, node) => ({ ...counts, [node.type]: (counts[node.type] ?? 0) + 1 }), {}),
    },
    diagnosticCodes: [...new Set(compilation.diagnostics.map((diagnostic) => diagnostic.code))].sort(),
  };
  assert.deepEqual(summary, {
    ast: { type: "File", root: "JSXFragment", component: "LuxuryRealEstate" },
    graph: { version: "0", nodeCount: 52, types: { page: 1, image: 6, container: 21, text: 15, heading: 6, button: 1, section: 2 } },
    blueprint: { nodeCount: 52, rootChildren: 2, types: { page: 1, image: 6, container: 21, text: 15, heading: 6, button: 1, section: 2 } },
    diagnosticCodes: [],
  });
});

test("V11 M2 lowers residual design intent into scoped custom CSS", () => {
  const glass = Object.values(compilation.blueprint.nodes).find((node) => String((node.props.advanced as any)?.customCss).includes("backdrop-filter"));
  assert.ok(glass);
  assert.match(String((glass?.props.advanced as any)?.customCss), /selector::before/);
  assert.ok((compilation.provenance[glass!.id]?.line ?? 0) > 0);
});

test("V11 flattens nested inline elements so Builder leaf widgets never own children", () => {
  const source = `export default function Page(){return <section aria-label="hero"><h1>Build <span>beautifully</span></h1><a href="#work">See <strong>work</strong></a></section>}`;
  const graph = buildDesignGraph(normalizeTsx(parseTsx(source, "inline.tsx")));
  const result = compileDesignGraphToBlueprint(graph);
  const validation = validateBlueprint(result.blueprint);
  assert.equal(validation.valid, true, validation.issues.map((issue) => issue.code).join(", "));
  const leaves = Object.values(result.blueprint.nodes).filter((node) => ["heading", "text", "button", "image", "icon"].includes(node.type));
  assert.ok(leaves.every((node) => node.children.length === 0));
});

test("V11 preserves visual card children when an anchor wraps structured content", () => {
  const source = `export default function Page(){return <section aria-label="hero"><a href="#detail"><img src="/v11-premium/product.png" alt="Product"/><span>View detail</span></a></section>}`;
  const result = compileDesignGraphToBlueprint(buildDesignGraph(normalizeTsx(parseTsx(source, "linked-card.tsx"))));
  assert.equal(validateBlueprint(result.blueprint).valid, true);
  assert.equal(Object.values(result.blueprint.nodes).filter((node) => node.type === "image").length, 1);
});

test("V11 expands static arrays declared inside the generated page component", () => {
  const source = `export default function Page(){const items=[{title:"One"},{title:"Two"}];return <section aria-label="hero">{items.map((item)=><article><h2>{item.title}</h2></article>)}</section>}`;
  const graph = buildDesignGraph(normalizeTsx(parseTsx(source, "local-arrays.tsx")));
  assert.equal(graph.diagnostics.filter((item) => item.severity === "error").length, 0);
  assert.equal(Object.values(graph.nodes).filter((node) => node.type === "heading").length, 2);
});

test("V11 expands local arrays in an anonymous default component", () => {
  const source = `export default ()=>{const items=["One","Two"];return <section aria-label="hero">{items.map((item)=><p>{item}</p>)}</section>}`;
  const graph = buildDesignGraph(normalizeTsx(parseTsx(source, "anonymous-local-arrays.tsx")));
  assert.equal(graph.diagnostics.filter((item) => item.severity === "error").length, 0);
  assert.equal(Object.values(graph.nodes).filter((node) => node.type === "text").length, 2);
});

test("V11 resolves safe arithmetic, conditions, and bounded slices in visible JSX", () => {
  const source = `export default function Page(){const items=["A","B","C"];return <section aria-label="hero">{items.slice(0,2).map((item,index)=><p>{index + 1}. {item || "Item"}</p>)}</section>}`;
  const graph = buildDesignGraph(normalizeTsx(parseTsx(source, "safe-expressions.tsx")));
  assert.equal(graph.diagnostics.filter((item) => item.severity === "error").length, 0, graph.diagnostics.map((item) => item.code).join(", "));
  assert.equal(Object.values(graph.nodes).filter((node) => node.type === "text").length, 2);
});

test("V11 wraps non-section top-level JSX in an editable Builder section", () => {
  const source = `export default function Page(){return <div className="bg-white"><header><h1>Studio</h1></header><main><section aria-label="hero"><p>Welcome</p></section></main></div>}`;
  const result = compileDesignGraphToBlueprint(buildDesignGraph(normalizeTsx(parseTsx(source, "root-wrapper.tsx"))));
  const validation = validateBlueprint(result.blueprint);
  assert.equal(validation.valid, true, validation.issues.map((issue) => `${issue.code}:${issue.message}`).join("\n"));
  const root = result.blueprint.nodes[result.blueprint.root];
  assert.ok(root.children.every((id) => result.blueprint.nodes[id].type === "section"));
  assert.ok(result.diagnostics.some((item) => item.code === "ROOT_CONTENT_SECTION_WRAPPED"));
});

test("V11 preserves document theme, explicit line breaks, compact controls, and empty decoration", () => {
  const source = `export default function Page(){return <main className="bg-[#191919] text-white"><section aria-label="hero" className="relative"><h1>Rooted in Nature,<br/>Built for life.</h1><div className="absolute h-[520px] w-[520px] rounded-full border-[70px] border-dotted border-white"></div><a href="#hero" className="flex h-14 w-14 rounded-full">→</a></section></main>}`;
  const result = compileDesignGraphToBlueprint(buildDesignGraph(normalizeTsx(parseTsx(source, "document-theme.tsx"))));
  const root = result.blueprint.nodes[result.blueprint.root];
  const heading = Object.values(result.blueprint.nodes).find((node) => node.type === "heading");
  const button = Object.values(result.blueprint.nodes).find((node) => node.type === "button");
  const decoration = Object.values(result.blueprint.nodes).find((node) => node.style?.borderTopWidth === 70);
  assert.equal(root.style?.backgroundColor, "#191919");
  assert.equal(root.style?.color, "#ffffff");
  assert.match(String(heading?.props.text), /Nature,\nBuilt/);
  assert.equal(button?.style?.width, 56);
  assert.equal(button?.style?.height, 56);
  assert.equal(decoration?.style?.borderTopStyle, "dotted");
});
