import { resolveDesignPlan } from "../lib/designPlan";
import { buildExperienceStrategy } from "../lib/experienceIntelligence";
import type { BrandContextWithName, IntentAgentOutput } from "./types";

export function runIntentAgent({
  userPrompt,
  brandContext,
}: {
  userPrompt: string;
  brandContext: BrandContextWithName | null;
}): IntentAgentOutput {
  const plan = resolveDesignPlan(userPrompt);
  const strategy = buildExperienceStrategy({
    userPrompt,
    plan,
    brandContext,
  });

  return { plan, strategy };
}
