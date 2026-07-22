import { createPrimitiveBlueprint, TEST_NODE_IDS } from "../fixtures/testBlueprintFixtures";
import { createRegressionSpec, assertEqual } from "../helpers/testAssertions";
import { applyInspectorPropertyForSpec, formatUnitForSpec, parseUnitForSpec } from "../helpers/testInspectorHarness";
import type { WidgetProperty } from "../../types/property";

const blueprint = createPrimitiveBlueprint();
const section = blueprint.nodes[TEST_NODE_IDS.section];

const maxWidthProperty: WidgetProperty = {
  id: "maxWidth",
  label: "Max width",
  type: "slider",
  target: "style",
  category: "layout",
  responsive: true,
  min: 0,
  max: 4000,
  step: 1,
  unit: "px",
  units: ["px", "%", "em", "rem", "vw", "vh"],
};

const parsedKnown = parseUnitForSpec("72rem");
const parsedUnknown = parseUnitForSpec("240qu");
const formatted = formatUnitForSpec(80, "vw");
const updated = applyInspectorPropertyForSpec(section, maxWidthProperty, "72rem", "tablet");

export const unitPickerSpec = createRegressionSpec({
  id: "inspector/unit-picker",
  title: "Inspector unit picker baseline",
  bugIds: ["BUG-0006", "BUG-0007"],
  level: "L1",
  status: "compile-safe",
  runnerRequirement: "Connect to rendered unit picker controls once component test runner exists.",
  assertions: [
    assertEqual("known unit parses", parsedKnown.unit, "rem"),
    assertEqual("known unit value parses", parsedKnown.value, 72),
    assertEqual("unknown unit falls back to px", parsedUnknown.unit, "px"),
    assertEqual("format unit serializes CSS value", formatted, "80vw"),
    assertEqual("unit update writes active tablet value", (updated.style.maxWidth as Record<string, unknown>).tablet, "72rem"),
  ],
});
