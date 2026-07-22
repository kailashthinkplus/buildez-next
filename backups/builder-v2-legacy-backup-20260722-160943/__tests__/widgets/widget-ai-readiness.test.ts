import { createRegressionSpec, assertCondition } from "../helpers/testAssertions";
import { buildWidgetAiReadiness, getBlockedAiWidgets } from "../../widgets/widgetAiReadiness";

const readiness = buildWidgetAiReadiness();
const blocked = getBlockedAiWidgets();
const embed = readiness.find((entry) => entry.type === "embed");
const popup = readiness.find((entry) => entry.type === "popupModal");

export const widgetAiReadinessSpec = createRegressionSpec({
  id: "widgets/widget-ai-readiness",
  title: "Widget AI readiness metadata baseline",
  bugIds: ["BUG-0003", "BUG-0012", "BUG-0042"],
  level: "L1",
  status: "compile-safe",
  runnerRequirement: "Connect to AI compatibility gate once AI node actions are allowed.",
  assertions: [
    assertCondition("AI readiness is explicit for every widget", readiness.every((entry) => Boolean(entry.status))),
    assertCondition("AI insertion remains disabled", readiness.every((entry) => !entry.canAIInsert)),
    assertCondition("blocked widget list is non-empty", blocked.length > 0),
    assertCondition("restricted embed widget is gated", embed?.status === "gated"),
    assertCondition("restricted embed widget has safety warning", Boolean(embed?.warnings.length)),
    assertCondition("popup metadata widget is gated", popup?.status === "gated"),
  ],
});
