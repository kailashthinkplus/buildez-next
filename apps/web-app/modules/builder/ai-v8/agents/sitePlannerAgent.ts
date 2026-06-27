import type { IntentAgentOutput, SitePlannerOutput } from "./types";

export function runSitePlannerAgent(intent: IntentAgentOutput): SitePlannerOutput {
  return {
    pageType: "single-page-website",
    narrativeArc: intent.strategy.narrativeArc,
    conversionGoal: intent.strategy.brief.conversionGoal,
    sections: intent.plan.recipe.requiredSections.map((section) => ({
      id: section.id,
      objective: section.objective,
      requiredElements: section.requiredElements,
    })),
  };
}
