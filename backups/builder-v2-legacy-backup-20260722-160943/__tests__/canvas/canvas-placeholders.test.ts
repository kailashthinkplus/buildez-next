import { createRegressionSpec, assertCondition, assertEqual } from "../helpers/testAssertions";
import { BUILDER_CANVAS_PLACEHOLDER_METADATA } from "../../canvas/builderUxMetadata";

export const canvasPlaceholdersSpec = createRegressionSpec({
  id: "canvas/canvas-placeholders",
  title: "Canvas placeholder metadata baseline",
  bugIds: ["BUG-0020", "BUG-0021"],
  level: "L2",
  status: "compile-safe",
  runnerRequirement: "Connect to rendered canvas placeholder states once browser runner exists.",
  assertions: [
    assertCondition("empty states are tracked", BUILDER_CANVAS_PLACEHOLDER_METADATA.emptyStates),
    assertCondition("drop zones are tracked", BUILDER_CANVAS_PLACEHOLDER_METADATA.dropZones),
    assertCondition("insert indicators are tracked", BUILDER_CANVAS_PLACEHOLDER_METADATA.insertIndicators),
    assertCondition("section placeholders are tracked", BUILDER_CANVAS_PLACEHOLDER_METADATA.sectionPlaceholders),
    assertCondition("bottom add-section area is tracked", BUILDER_CANVAS_PLACEHOLDER_METADATA.bottomAddSectionArea),
    assertCondition("new section opens column picker", BUILDER_CANVAS_PLACEHOLDER_METADATA.addSectionOpensColumnPicker),
    assertCondition("container placeholders are tracked", BUILDER_CANVAS_PLACEHOLDER_METADATA.containerPlaceholders),
    assertCondition("loading placeholders are tracked", BUILDER_CANVAS_PLACEHOLDER_METADATA.loadingPlaceholders),
    assertEqual("placeholder metadata does not change runtime rendering", BUILDER_CANVAS_PLACEHOLDER_METADATA.runtimeRenderingChanged, false),
  ],
});
