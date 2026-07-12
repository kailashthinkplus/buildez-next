import assert from "node:assert/strict";
import test from "node:test";

import { createPrimitiveBlueprint, TEST_NODE_IDS } from "../../fixtures/testBlueprintFixtures";
import { resolveRenderStyle } from "../../../core/rendering/renderStyleResolver";
import { RESPONSIVE_BREAKPOINTS } from "../../../core/responsive/responsiveBreakpoints";
import { normalizeColumnWidths } from "../../../layout/columnStructure";

test("RC-T2 equal columns serialize deterministically", () => {
  assert.deepEqual(normalizeColumnWidths(3), [33.333, 33.333, 33.333]);
});

test("RC-T2 canvas width never rewrites semantic width or min-width", () => {
  const blueprint = createPrimitiveBlueprint();
  const source = blueprint.nodes[TEST_NODE_IDS.container];
  const node = { ...source, style: { ...source.style, width: "1600px", minWidth: 1400 } };
  const canvas = resolveRenderStyle(node, blueprint, { device: "desktop", canvasWidth: 1200 });
  const runtime = resolveRenderStyle(node, blueprint, { device: "desktop" });
  assert.equal(canvas.width, "1600px");
  assert.equal(canvas.minWidth, "1400px");
  assert.deepEqual(canvas, runtime);
});

test("RC-T2 emits Flex, Grid, two-axis gap, and overflow fields responsively", () => {
  const blueprint = createPrimitiveBlueprint();
  const source = blueprint.nodes[TEST_NODE_IDS.container];
  const node = {
    ...source,
    style: {
      ...source.style,
      rowGap: { desktop: 24, mobile: 8 }, columnGap: "2rem",
      flexGrow: 1, flexShrink: 0, flexBasis: "30%", order: { desktop: 1, mobile: 3 },
      gridTemplateRows: "auto 1fr", gridColumn: "2 / span 3", gridRow: "1 / 3",
      overflowX: "auto", overflowY: "hidden",
    },
  };
  const style = resolveRenderStyle(node, blueprint, { device: "mobile" });
  assert.equal(style.rowGap, "8px");
  assert.equal(style.columnGap, "2rem");
  assert.equal(style.flexGrow, 1);
  assert.equal(style.flexShrink, 0);
  assert.equal(style.flexBasis, "30%");
  assert.equal(style.order, 3);
  assert.equal(style.gridTemplateRows, "auto 1fr");
  assert.equal(style.gridColumn, "2 / span 3");
  assert.equal(style.gridRow, "1 / 3");
  assert.equal(style.overflowX, "auto");
  assert.equal(style.overflowY, "hidden");
});

test("RC-T2 canonical viewport widths remain desktop/tablet/mobile", () => {
  assert.deepEqual(RESPONSIVE_BREAKPOINTS, { desktop: 1200, tablet: 768, mobile: 390 });
});
