import { createRegressionSpec, assertCondition } from "../helpers/testAssertions";
import { buildWidgetSerializationSupport, validateWidgetSerializationSupport } from "../../widgets/widgetSerializationSupport";

const support = buildWidgetSerializationSupport();
const validation = validateWidgetSerializationSupport();

export const widgetSerializationSupportSpec = createRegressionSpec({
  id: "widgets/widget-serialization-support",
  title: "Widget serialization support metadata baseline",
  bugIds: ["BUG-0037", "BUG-0042"],
  level: "L1",
  status: "compile-safe",
  runnerRequirement: "Connect to serialized widget fixtures once executable tests exist.",
  assertions: [
    assertCondition("serialization support validates", validation.valid),
    assertCondition("all widgets require native editable shape", support.every((entry) => entry.requiresNativeEditableShape)),
    assertCondition("no widget allows opaque output", support.every((entry) => !entry.opaqueOutputAllowed)),
    assertCondition("registered widgets support clipboard", support.filter((entry) => !entry.type.includes("embed")).some((entry) => entry.supportsClipboard)),
  ],
});
