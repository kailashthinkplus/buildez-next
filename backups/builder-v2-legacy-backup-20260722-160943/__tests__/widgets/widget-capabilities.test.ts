import { createRegressionSpec, assertCondition } from "../helpers/testAssertions";
import {
  REGISTERED_WIDGET_DEFINITIONS,
  buildRegisteredWidgetCapabilities,
  buildWidgetCapabilities,
  getWidgetCapability,
} from "../../widgets/widgetCapabilities";

const capabilities = buildWidgetCapabilities();
const registeredCapabilities = buildRegisteredWidgetCapabilities();

export const widgetCapabilitiesSpec = createRegressionSpec({
  id: "widgets/widget-capabilities",
  title: "Widget capability metadata baseline",
  bugIds: ["BUG-0003", "BUG-0042"],
  level: "L1",
  status: "compile-safe",
  runnerRequirement: "Connect to registry initialization once executable widget tests exist.",
  assertions: [
    assertCondition("every registered widget has capability metadata", REGISTERED_WIDGET_DEFINITIONS.every((definition) => Boolean(getWidgetCapability(definition.type)))),
    assertCondition("registered capability count matches registered definitions", registeredCapabilities.length === REGISTERED_WIDGET_DEFINITIONS.length),
    assertCondition("all capabilities declare inspector groups", capabilities.every((capability) => capability.supportedInspectorGroups.length > 0)),
    assertCondition("all capabilities declare serialization requirements", capabilities.every((capability) => capability.serializationRequirements.length >= 6)),
  ],
});
