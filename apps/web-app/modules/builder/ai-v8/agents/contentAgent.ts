import type { ContentAgentOutput, IntentAgentOutput } from "./types";

export function runContentAgent(intent: IntentAgentOutput): ContentAgentOutput {
  return {
    audience: intent.strategy.brief.audience,
    primaryOffer: intent.strategy.brief.primaryOffer,
    proofPoints: intent.strategy.brief.proofPoints,
    copyRules: [
      ...intent.plan.recipe.copyRules,
      ...intent.strategy.brief.contentDepth,
      "Avoid generic AI marketing phrases.",
      "Use concrete labels, credible numbers, and action-specific CTAs where plausible.",
    ],
  };
}
