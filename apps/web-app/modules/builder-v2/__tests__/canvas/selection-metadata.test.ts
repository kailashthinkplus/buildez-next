import { createRegressionSpec, assertCondition } from "../helpers/testAssertions";
import { BUILDER_SELECTION_UX_METADATA } from "../../canvas/builderUxMetadata";

export const selectionMetadataSpec = createRegressionSpec({
  id: "canvas/selection-metadata",
  title: "Premium selection UX metadata baseline",
  bugIds: ["BUG-0021"],
  level: "L2",
  status: "compile-safe",
  runnerRequirement: "Connect to rendered canvas overlay once browser runner exists.",
  assertions: [
    assertCondition("selection outline enabled", BUILDER_SELECTION_UX_METADATA.selectionOutline),
    assertCondition("hover outline enabled", BUILDER_SELECTION_UX_METADATA.hoverOutline),
    assertCondition("drop indicators enabled", BUILDER_SELECTION_UX_METADATA.dropIndicators),
    assertCondition("resize handles tracked", BUILDER_SELECTION_UX_METADATA.resizeHandles),
    assertCondition("snap indicators tracked", BUILDER_SELECTION_UX_METADATA.snapIndicators),
    assertCondition("spacing guides tracked", BUILDER_SELECTION_UX_METADATA.spacingGuides),
    assertCondition("selection metadata is builder-only", BUILDER_SELECTION_UX_METADATA.builderOnly),
  ],
});
