import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { buildV11VisualFixture } from "../benchmarks/visual/visualFixture";
import { interpretTailwind } from "../interpreter/tailwindInterpreter";

const location = { file: "layout-semantics.tsx", line: 1, column: 1 };
const tw = (classes: string) => interpretTailwind(classes, location);

test("preserves flex growth, shrink, basis, min-width, fractions and arbitrary widths", () => {
  assert.deepEqual(tw("flex-1").layout, {
    flex: "1 1 0%",
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "0%",
  });
  assert.equal(tw("shrink-0").layout.flexShrink, 0);
  assert.equal(tw("grow").layout.flexGrow, 1);
  assert.equal(tw("basis-1/2").layout.flexBasis, "50%");
  assert.equal(tw("min-w-0").style.minWidth, 0);
  assert.equal(tw("w-1/2").style.width, "50%");
  assert.equal(tw("w-[37%]").style.width, "37%");
  assert.equal(tw("max-w-[1500px]").style.maxWidth, "1500px");
});

test("preserves grids, responsive layout, centering, aspect and image behavior", () => {
  const result = tw(
    "grid grid-cols-1 gap-8 mx-auto w-full aspect-video object-cover lg:grid-cols-12",
  );
  assert.equal(result.layout.display, "grid");
  assert.equal(result.layout.gridTemplateColumns, "repeat(1, minmax(0, 1fr))");
  assert.equal(
    result.responsive.desktop?.gridTemplateColumns,
    "repeat(12, minmax(0, 1fr))",
  );
  assert.equal(result.style.marginLeft, "auto");
  assert.equal(result.style.width, "100%");
  assert.equal(result.style.aspectRatio, "16 / 9");
  assert.equal(result.style.objectFit, "cover");
  assert.equal(
    tw("lg:col-span-7 lg:col-start-6").responsive.desktop?.gridColumn,
    "span 7 / span 7",
  );
  assert.equal(
    tw("flex-col md:flex-row").responsive.tablet?.flexDirection,
    "row",
  );
});

test("full-page lowering uses explicit block wrappers and full sections without fixture branches", () => {
  const fixture = buildV11VisualFixture("full-page-engineering-company");
  const nodes = Object.values(fixture.blueprint.nodes);
  assert.ok(
    nodes
      .filter((node) => node.type === "section")
      .every((node) => node.props.container === "full"),
  );
  assert.ok(
    nodes
      .filter(
        (node) =>
          node.type === "container" &&
          !fixture.graph.nodes[node.id].layout.display,
      )
      .every((node) => node.style.display === "block"),
  );
  const footerGrid = nodes.find(
    (node) =>
      node.style.gridTemplateColumns &&
      fixture.graph.nodes[node.id].provenance.nearestSemanticSection ===
        "footer",
  );
  assert.deepEqual(footerGrid?.style.gridTemplateColumns, {
    mobile: "repeat(1, minmax(0, 1fr))",
    tablet: "repeat(4, minmax(0, 1fr))",
    desktop: "repeat(4, minmax(0, 1fr))",
  });
  const compiler = readFileSync(
    new URL("../compiler/blueprintCompiler.ts", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(
    compiler,
    /full-page-engineering-company|engineering website|semanticRole\s*===\s*["']services/,
  );
});

test("diagnostics are metadata and never enter preview document flow", () => {
  const route = readFileSync(
    new URL(
      "../../../../app/internal/v11-visual/[fixtureId]/page.tsx",
      import.meta.url,
    ),
    "utf8",
  );
  assert.doesNotMatch(route, /<aside|v11-compilation-diagnostics/);
  assert.match(route, /data-diagnostic-count/);
});
