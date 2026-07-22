import assert from "node:assert/strict";
import test from "node:test";

import { buildV11VisualFixture } from "../benchmarks/visual/visualFixture";

const fixture = buildV11VisualFixture("aznac-parity-single-file");
const graph = Object.values(fixture.graph.nodes);
const blueprint = Object.values(fixture.blueprint.nodes);

test("Aznac parity source statically expands a complete single-file website", () => {
  assert.equal(fixture.completeness?.valid, true);
  assert.deepEqual(fixture.completeness?.sectionSequence, [
    "navbar",
    "hero",
    "about",
    "advantages",
    "services",
    "process",
    "projects",
    "footer",
  ]);
  assert.deepEqual([...(fixture.completeness?.localComponents ?? [])].sort(), [
    "ArrowIcon",
    "ServiceCard",
  ]);
  assert.ok((fixture.completeness?.mapExpressions ?? 0) >= 4);
  assert.equal(
    fixture.completeness?.source.text,
    fixture.completeness?.compiled.text,
  );
  assert.equal(
    fixture.completeness?.source.media,
    fixture.completeness?.compiled.media,
  );
  assert.equal(
    fixture.completeness?.source.interactive,
    fixture.completeness?.compiled.interactive,
  );
});

test("hero media, responsive typography, controls, dots and embedded CSS survive", () => {
  const hero = graph.find((node) => node.semanticRole === "hero")!;
  assert.ok(graph.some((node) => node.media?.role === "hero-background"));
  const h1 = graph.find(
    (node) =>
      node.type === "heading" &&
      node.provenance.nearestSemanticSection === "hero",
  )!;
  assert.equal(h1.style.fontSize, "58px");
  assert.equal(h1.responsive.tablet?.fontSize, "88px");
  assert.equal(
    graph.filter(
      (node) =>
        node.provenance.nearestSemanticSection === "hero" &&
        node.attributes["aria-label"]?.includes("slide"),
    ).length,
    2,
  );
  assert.equal(hero.provenance.sourceElement, "section");
  assert.ok((fixture.completeness?.embeddedCss.rules ?? 0) >= 10);
  assert.ok(
    blueprint.some((node) =>
      String((node.props.advanced as any)?.customCss).includes(
        "selector:hover",
      ),
    ),
  );
});

test("asymmetry, four-card systems, process, mosaic and footer remain editable", () => {
  const inSection = (role: string) =>
    graph.filter((node) => node.provenance.nearestSemanticSection === role);
  assert.equal(
    inSection("advantages").filter(
      (node) => node.provenance.sourceElement === "article",
    ).length,
    4,
  );
  assert.equal(
    inSection("services").filter(
      (node) => node.media?.role === "editorial-image",
    ).length,
    4,
  );
  assert.equal(
    inSection("process").filter(
      (node) => node.provenance.sourceElement === "article",
    ).length,
    3,
  );
  assert.equal(
    inSection("projects").filter(
      (node) => node.provenance.sourceElement === "article",
    ).length,
    5,
  );
  assert.equal(
    inSection("projects").filter((node) => node.type === "image").length,
    5,
  );
  assert.equal(
    fixture.graph.nodes[
      fixture.graph.nodes[fixture.graph.rootId].children.at(-1)!
    ].semanticRole,
    "footer",
  );
  assert.ok(
    inSection("footer").filter((node) => node.type === "button").length >= 6,
  );
});

test("pipeline has no fixture-specific compiler path or V10 dependency", async () => {
  const compiler = await import("node:fs").then(({ readFileSync }) =>
    readFileSync(
      new URL("../compiler/blueprintCompiler.ts", import.meta.url),
      "utf8",
    ),
  );
  assert.doesNotMatch(compiler, /aznac-parity-single-file|ai-v10|V10/);
  assert.equal(fixture.blueprint.metadata.aiGenerated, true);
});
