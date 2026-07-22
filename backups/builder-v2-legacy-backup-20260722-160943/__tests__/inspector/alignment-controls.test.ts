import { createPrimitiveBlueprint, TEST_NODE_IDS } from "../fixtures/testBlueprintFixtures";
import { createRegressionSpec, assertCondition, assertEqual } from "../helpers/testAssertions";
import { applyInspectorPropertyForSpec, isAlignmentValidForSpec } from "../helpers/testInspectorHarness";
import type { WidgetProperty } from "../../types/property";

const blueprint = createPrimitiveBlueprint();
const heading = blueprint.nodes[TEST_NODE_IDS.heading];
const container = blueprint.nodes[TEST_NODE_IDS.container];

const textAlignmentProperty: WidgetProperty = {
  id: "textAlign",
  label: "Alignment",
  type: "alignment",
  target: "style",
  category: "style",
  responsive: true,
};

const justifyProperty: WidgetProperty = {
  id: "justifyContent",
  label: "Justify",
  type: "alignment",
  target: "style",
  category: "layout",
  responsive: true,
};

const centeredHeading = applyInspectorPropertyForSpec(heading, textAlignmentProperty, "center", "mobile");
const centeredContainer = applyInspectorPropertyForSpec(container, justifyProperty, "center", "desktop");

export const alignmentControlsSpec = createRegressionSpec({
  id: "inspector/alignment-controls",
  title: "Inspector alignment controls baseline",
  bugIds: ["BUG-0008", "BUG-0007"],
  level: "L1",
  status: "compile-safe",
  runnerRequirement: "Connect to rendered alignment segmented controls once component test runner exists.",
  assertions: [
    assertCondition("left text alignment is valid", isAlignmentValidForSpec("left", "text")),
    assertCondition("justify text alignment is valid", isAlignmentValidForSpec("justify", "text")),
    assertCondition("stretch layout alignment is valid", isAlignmentValidForSpec("stretch", "horizontal")),
    assertEqual("text alignment writes active mobile value", (centeredHeading.style.textAlign as unknown as Record<string, unknown>).mobile, "center"),
    assertEqual("layout alignment writes active desktop value", (centeredContainer.style.justifyContent as unknown as Record<string, unknown>).desktop, "center"),
  ],
});
