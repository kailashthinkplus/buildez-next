import { createRegressionSpec, assertCondition } from "../helpers/testAssertions";
import { buildWidgetInspectorSupport, getWidgetInspectorSupport } from "../../widgets/widgetInspectorSupport";

const support = buildWidgetInspectorSupport();

export const widgetInspectorSupportSpec = createRegressionSpec({
  id: "widgets/widget-inspector-support",
  title: "Widget inspector support metadata baseline",
  bugIds: ["BUG-0003", "BUG-0007", "BUG-0042"],
  level: "L1",
  status: "compile-safe",
  runnerRequirement: "Connect to rendered inspector tabs once component test runner exists.",
  assertions: [
    assertCondition("all widgets declare advanced control metadata", support.every((entry) => entry.hasAdvancedControls)),
    assertCondition("content widgets declare content controls", Boolean(getWidgetInspectorSupport("heading")?.hasContentControls)),
    assertCondition("layout widgets declare design controls", Boolean(getWidgetInspectorSupport("section")?.hasDesignControls)),
    assertCondition("scaffold widgets declare motion-ready metadata", Boolean(getWidgetInspectorSupport("carousel")?.motionReadyMetadata)),
    assertCondition("theme-compatible widgets exist", support.some((entry) => entry.hasThemeTokenCompatibility)),
  ],
});
