import { createPrimitiveBlueprint, TEST_NODE_IDS } from "../fixtures/testBlueprintFixtures";
import { createRegressionSpec, assertCondition, assertEqual } from "../helpers/testAssertions";
import {
  applyInspectorBindingForSpec,
  hasVisibleBindingEffect,
  validateVisibleBindingsForSpec,
  type InspectorBindingSpec,
} from "../helpers/testInspectorHarness";
import { buildPropertyUpdate } from "../../core/properties/propertyUpdatePipeline";
import type { WidgetProperty } from "../../types/property";

const blueprint = createPrimitiveBlueprint();
const heading = blueprint.nodes[TEST_NODE_IDS.heading];
const colorBinding: InspectorBindingSpec = {
  propertyId: "color",
  target: "style",
  value: "#123456",
};
const textBinding: InspectorBindingSpec = {
  propertyId: "text",
  target: "props",
  value: "Inspector-bound heading",
};
const colorBound = applyInspectorBindingForSpec(heading, colorBinding);
const textBound = applyInspectorBindingForSpec(heading, textBinding);

const visibleProperties: WidgetProperty[] = [
  { id: "text", label: "Text", type: "text", target: "props", category: "content" },
  { id: "fontSize", label: "Font size", type: "slider", target: "style", category: "style", responsive: true },
  { id: "color", label: "Color", type: "color", target: "style", category: "style" },
];
const unsupportedProperties: WidgetProperty[] = [
  { id: "gradient", label: "Gradient", type: "gradient", target: "style", category: "style" },
];
const visibleValidation = validateVisibleBindingsForSpec(heading, visibleProperties);
const unsupportedValidation = validateVisibleBindingsForSpec(heading, unsupportedProperties);
const responsivePatch = buildPropertyUpdate({
  node: heading,
  property: visibleProperties[1],
  value: 32,
  device: "mobile",
});

export const propertyBindingSpec = createRegressionSpec({
  id: "inspector/property-binding",
  title: "Inspector property binding baseline",
  bugIds: ["BUG-0007"],
  level: "L1",
  status: "compile-safe",
  runnerRequirement: "Connect to rendered inspector controls once component test runner exists.",
  assertions: [
    assertCondition("style binding writes to style", hasVisibleBindingEffect(colorBound, colorBinding)),
    assertEqual("style binding keeps expected value", colorBound.style.color, "#123456"),
    assertCondition("prop binding writes to props", hasVisibleBindingEffect(textBound, textBinding)),
    assertEqual("prop binding keeps expected value", textBound.props.text, "Inspector-bound heading"),
    assertCondition("visible controls have valid bindings", visibleValidation.valid),
    assertCondition(
      "unimplemented controls are disabled or hidden",
      unsupportedValidation.bindings.every((binding) => !binding.visible && Boolean(binding.disabledReason))
    ),
    assertEqual(
      "property update changes expected responsive node path",
      (responsivePatch.style?.fontSize as Record<string, unknown>)?.mobile,
      32
    ),
  ],
});
