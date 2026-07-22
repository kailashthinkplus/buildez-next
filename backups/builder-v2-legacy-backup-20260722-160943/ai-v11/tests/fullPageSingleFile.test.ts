import assert from "node:assert/strict";
import test from "node:test";
import { buildV11VisualFixture } from "../benchmarks/visual/visualFixture";
import { parseTsx } from "../ast/parser";
import { normalizeTsx } from "../ast/normalize";
import { buildDesignGraph } from "../design-graph/builder";
import { compileDesignGraphToBlueprint } from "../compiler/blueprintCompiler";
import { validateFullPageCompleteness } from "../validator/fullPageCompleteness";

const fixture = buildV11VisualFixture("full-page-engineering-company");
const report = fixture.completeness!;
const graphNodes = Object.values(fixture.graph.nodes);
const blueprintNodes = Object.values(fixture.blueprint.nodes);

test("complete self-contained TSX is statically parsed into the entire page", () => {
  assert.equal(report.valid, true, report.issues.join(" "));
  assert.deepEqual(report.sectionSequence, [
    "navbar",
    "hero",
    "about",
    "advantages",
    "services",
    "process",
    "projects",
    "contact",
    "footer",
  ]);
  assert.deepEqual(report.source, report.compiled);
  assert.equal(report.source.sections, 9);
  assert.ok(report.source.text > 70);
  assert.ok(report.source.media >= 8);
  assert.ok(report.source.interactive >= 15);
});

test("default page, local helpers, arrays, maps, and provenance are preserved", () => {
  assert.equal(fixture.graph.metadata.componentName, "Website");
  assert.deepEqual([...report.localComponents].sort(), [
    "ArrowMark",
    "ServiceCard",
  ]);
  assert.ok(report.mapExpressions >= 3);
  assert.ok(
    graphNodes.some(
      (node) => node.provenance.localComponentOrigin === "ServiceCard",
    ),
  );
  assert.ok(
    graphNodes
      .filter((node) => node.type !== "page")
      .every((node) => node.provenance.sourceFile && node.provenance.line > 0),
  );
  assert.ok(
    graphNodes
      .filter((node) => !["page", "section"].includes(node.type))
      .every((node) => node.provenance.nearestSemanticSection),
  );
});

test("embedded CSS and arbitrary responsive Tailwind values survive safely", () => {
  assert.ok(report.embeddedCss.rules >= 5);
  assert.ok(report.embeddedCss.keyframes >= 1);
  assert.ok(report.embeddedCss.emittedNodes >= 4);
  assert.ok(report.arbitraryValues.includes("min-h-[100svh]"));
  assert.ok(report.arbitraryValues.includes("max-w-[1500px]"));
  assert.ok(report.arbitraryValues.includes("text-[72px]"));
  assert.ok(blueprintNodes.some((node) => node.style.minHeight === "100svh"));
  assert.ok(blueprintNodes.some((node) => node.style.maxWidth === "1500px"));
  assert.ok(
    blueprintNodes.some((node) =>
      String((node.props.advanced as any)?.customCss).includes(
        "selector:hover img",
      ),
    ),
  );
  assert.equal(
    graphNodes.some((node) => node.provenance.sourceElement === "style"),
    false,
  );
});

test("SVG, links, images, header, hero, footer, validation and round trip survive", () => {
  assert.ok(report.inlineSvgs >= 1);
  assert.ok(
    blueprintNodes.some(
      (node) => node.type === "icon" && node.props.iconName === "arrow-right",
    ),
  );
  for (const node of graphNodes.filter(
    (item) => item.type === "button" && item.attributes.href,
  ))
    assert.equal(
      fixture.blueprint.nodes[node.id].props.href,
      node.attributes.href,
    );
  for (const node of graphNodes.filter((item) => item.type === "image")) {
    assert.equal(
      fixture.blueprint.nodes[node.id].props.src,
      node.attributes.src,
    );
    assert.equal(
      fixture.blueprint.nodes[node.id].props.alt,
      node.attributes.alt,
    );
  }
  assert.deepEqual(report.compiledSemanticRoles, report.sourceSemanticRoles);
  assert.equal(
    fixture.blueprint.nodes[fixture.blueprint.root].children.at(0) &&
      fixture.blueprint.nodes[
        fixture.blueprint.nodes[fixture.blueprint.root].children[0]
      ].name,
    "primary-navigation",
  );
  assert.equal(
    fixture.blueprint.nodes[fixture.blueprint.root].children.at(-1) &&
      fixture.blueprint.nodes[
        fixture.blueprint.nodes[fixture.blueprint.root].children.at(-1)!
      ].name,
    "footer",
  );
  assert.equal(fixture.diagnostics.length, 0);
});

test("navigation nested inside a header satisfies full-page completeness", () => {
  const source = `export default function Page(){return <><header><nav aria-label="primary-navigation"><a href="#work">Work</a></nav></header><section aria-label="hero"><h1>Studio</h1></section><footer aria-label="footer"><p>Contact</p></footer></>}`;
  const parsed = parseTsx(source, "nested-navigation.tsx");
  const graph = buildDesignGraph(normalizeTsx(parsed));
  const compilation = compileDesignGraphToBlueprint(graph);
  const report = validateFullPageCompleteness({ source, ast: parsed.ast, graph, blueprint: compilation.blueprint, diagnostics: compilation.diagnostics });
  assert.equal(report.valid, true, report.issues.join("\n"));
});

test("recoverable text and href losses are review warnings rather than fatal page failures", () => {
  const paragraphs = Array.from({ length: 10 }, (_, index) => `<p>Detail ${index + 1}</p>`).join("");
  const source = `export default function Page(){return <><header><nav aria-label="primary-navigation"><a href="#shop">Shop</a></nav></header><section aria-label="hero"><h1>Store</h1>${paragraphs}</section><footer aria-label="footer"><p>Footer</p></footer></>}`;
  const parsed = parseTsx(source, "recoverable-loss.tsx");
  const graph = buildDesignGraph(normalizeTsx(parsed));
  const compilation = compileDesignGraphToBlueprint(graph);
  const blueprint = structuredClone(compilation.blueprint);
  const removable = Object.values(blueprint.nodes).find((node) => node.type === "text" && node.props.text === "Detail 1");
  if (removable) delete blueprint.nodes[removable.id];
  const linked = Object.values(blueprint.nodes).find((node) => node.type === "button" && node.props.href === "#shop");
  if (linked) delete linked.props.href;
  const report = validateFullPageCompleteness({ source, ast: parsed.ast, graph, blueprint, diagnostics: compilation.diagnostics });
  assert.equal(report.valid, true, report.issues.join("\n"));
  assert.match(report.warnings.join(" "), /text completeness|Href requires review/);
});

test("Sanjeevini parity page compiles completely from the same trusted TSX", () => {
  const parity = buildV11VisualFixture("sanjeevini-premium-parity");
  assert.equal(parity.completeness?.valid, true, parity.completeness?.issues.join("\n"));
  assert.ok(Object.keys(parity.blueprint.nodes).length > 80);
  assert.ok((parity.completeness?.compiled.sections || 0) >= 7);
});
