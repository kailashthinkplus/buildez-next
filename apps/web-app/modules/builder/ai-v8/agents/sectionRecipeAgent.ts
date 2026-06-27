import { getRequiredSectionIds } from "../lib/designPlan";
import type { IntentAgentOutput, SectionRecipeOutput } from "./types";

export function runSectionRecipeAgent(
  intent: IntentAgentOutput
): SectionRecipeOutput {
  return {
    requiredSectionIds: getRequiredSectionIds(intent.plan),
    approvedComponents: intent.plan.recipe.componentLibrary,
  };
}
