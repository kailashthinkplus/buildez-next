import type { AssetAgentOutput, IntentAgentOutput } from "./types";

export function runAssetAgent({
  userPrompt,
  intent,
}: {
  userPrompt: string;
  intent: IntentAgentOutput;
}): AssetAgentOutput {
  return {
    minimumImages: 4,
    contextPrompt: `${userPrompt}, ${intent.plan.recipe.label}, ${intent.plan.useCase}`,
    imageRules: [
      "Use one hero-scale visual direction and at least three supporting content-image directions.",
      "Prefer photorealistic, industry-specific prompts with lighting, composition, and material detail.",
      "Every image must support a specific section objective.",
      "Every rendered image needs useful alt text.",
    ],
  };
}
