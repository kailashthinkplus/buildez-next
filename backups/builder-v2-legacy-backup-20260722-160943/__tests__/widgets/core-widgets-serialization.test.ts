import { createRegressionSpec, assertCondition, assertEqual } from "../helpers/testAssertions";
import {
  CORE_WIDGET_DEFINITIONS,
  getCoreWidgetTypesForSpec,
  widgetHasSerializableDefaultNode,
} from "../helpers/testWidgetHarness";

const coreTypes = getCoreWidgetTypesForSpec();

export const coreWidgetsSerializationSpec = createRegressionSpec({
  id: "widgets/core-widgets-serialization",
  title: "Core widget default serialization baseline",
  bugIds: ["BUG-0037"],
  level: "L1",
  status: "compile-safe",
  runnerRequirement: "Expand to registry-level tests once widget registration is isolated for tests.",
  assertions: [
    assertEqual("core widget count baseline", CORE_WIDGET_DEFINITIONS.length, 12),
    assertCondition("page widget is present", coreTypes.includes("page")),
    assertCondition("section widget is present", coreTypes.includes("section")),
    assertCondition("button widget is present", coreTypes.includes("button")),
    assertCondition(
      "all core widget defaults are JSON serializable",
      CORE_WIDGET_DEFINITIONS.every(widgetHasSerializableDefaultNode)
    ),
  ],
});
