import { createPrimitiveBlueprint, TEST_NODE_IDS } from "../fixtures/testBlueprintFixtures";
import { createRegressionSpec, assertCondition, assertEqual } from "../helpers/testAssertions";
import { applyInspectorPropertyForSpec, clearInspectorPropertyForSpec } from "../helpers/testInspectorHarness";
import type { WidgetProperty } from "../../types/property";

const blueprint = createPrimitiveBlueprint();
const heading = blueprint.nodes[TEST_NODE_IDS.heading];

const colorProperty: WidgetProperty = {
  id: "color",
  label: "Color",
  type: "color",
  target: "style",
  category: "style",
  responsive: true,
  themeTokenReady: true,
};

const desktopColor = applyInspectorPropertyForSpec(heading, colorProperty, "#123456", "desktop");
const mobileColor = applyInspectorPropertyForSpec(desktopColor, colorProperty, "#abcdef", "mobile");
const clearedColor = clearInspectorPropertyForSpec(mobileColor, colorProperty, "mobile");

export const colorPickerSpec = createRegressionSpec({
  id: "inspector/color-picker",
  title: "Inspector color picker baseline",
  bugIds: ["BUG-0001", "BUG-0007"],
  level: "L1",
  status: "compile-safe",
  runnerRequirement: "Connect to rendered color picker controls once component test runner exists.",
  assertions: [
    assertCondition("color property carries theme token-ready metadata", colorProperty.themeTokenReady === true),
    assertEqual("desktop color writes responsive desktop value", (desktopColor.style.color as unknown as Record<string, unknown>).desktop, "#123456"),
    assertEqual("mobile color writes active device only", (mobileColor.style.color as unknown as Record<string, unknown>).mobile, "#abcdef"),
    assertEqual("desktop color survives mobile edit", (mobileColor.style.color as unknown as Record<string, unknown>).desktop, "#123456"),
    assertCondition("clear color keeps a real style binding", Object.prototype.hasOwnProperty.call(clearedColor.style, "color")),
  ],
});
