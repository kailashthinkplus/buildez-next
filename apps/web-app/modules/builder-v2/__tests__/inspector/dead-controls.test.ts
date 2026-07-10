import { createPrimitiveBlueprint, TEST_NODE_IDS } from "../fixtures/testBlueprintFixtures";
import { createRegressionSpec, assertCondition } from "../helpers/testAssertions";
import { validateVisibleBindingsForSpec } from "../helpers/testInspectorHarness";
import type { WidgetProperty } from "../../types/property";

const blueprint = createPrimitiveBlueprint();
const heading = blueprint.nodes[TEST_NODE_IDS.heading];

const properties: WidgetProperty[] = [
  { id: "color", label: "Color", type: "color", target: "style", category: "style" },
  { id: "fontSize", label: "Font size", type: "slider", target: "style", category: "style", responsive: true, unit: "px" },
  { id: "textAlign", label: "Alignment", type: "alignment", target: "style", category: "style", responsive: true },
  { id: "gradient", label: "Gradient", type: "gradient", target: "style", category: "style" },
  { id: "shadow", label: "Shadow", type: "shadow", target: "style", category: "style" },
];

const validation = validateVisibleBindingsForSpec(heading, properties);
const visible = validation.bindings.filter((binding) => binding.visible);
const hidden = validation.bindings.filter((binding) => !binding.visible);

export const deadControlsSpec = createRegressionSpec({
  id: "inspector/dead-controls",
  title: "Inspector dead control baseline",
  bugIds: ["BUG-0007"],
  level: "L1",
  status: "compile-safe",
  runnerRequirement: "Connect to rendered inspector controls once component test runner exists.",
  assertions: [
    assertCondition("visible controls all have binding paths", visible.every((binding) => Boolean(binding.path))),
    assertCondition("unimplemented controls are hidden with reasons", hidden.every((binding) => Boolean(binding.disabledReason))),
    assertCondition("alignment is now renderable", visible.some((binding) => binding.propertyId === "textAlign")),
    assertCondition("gradient remains hidden until implemented", hidden.some((binding) => binding.propertyId === "gradient")),
    assertCondition("shadow remains hidden until implemented", hidden.some((binding) => binding.propertyId === "shadow")),
  ],
});
