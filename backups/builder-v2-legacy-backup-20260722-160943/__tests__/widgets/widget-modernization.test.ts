import { createRegressionSpec, assertCondition } from "../helpers/testAssertions";
import { buildWidgetModernizationSummary, getScaffoldWidgetTypes } from "../../widgets/widgetModernization";

const summary = buildWidgetModernizationSummary();
const scaffolds = getScaffoldWidgetTypes();

export const widgetModernizationSpec = createRegressionSpec({
  id: "widgets/widget-modernization",
  title: "Widget modernization production baseline",
  bugIds: ["BUG-0003", "BUG-0012", "BUG-0042"],
  level: "L1",
  status: "compile-safe",
  runnerRequirement: "Connect to rendered widget library once widget runner exists.",
  assertions: [
    assertCondition("modernization summary includes registered widgets", summary.registeredWidgets > 0),
    assertCondition("production catalog is mostly native", summary.productionReadyWidgets >= 35),
    assertCondition("BSP-15 removed scaffold-only widget backlog", summary.scaffoldWidgets === 0),
    assertCondition("accordion is no longer scaffold-only", !scaffolds.includes("accordion")),
    assertCondition("tabs are no longer scaffold-only", !scaffolds.includes("tabs")),
    assertCondition("carousel is no longer scaffold-only", !scaffolds.includes("carousel")),
    assertCondition("restricted widgets remain explicitly gated", summary.blockedAiWidgets >= summary.scaffoldWidgets),
  ],
});
