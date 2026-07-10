import type { ModelProviderId, ModelUsage } from "./types";

type ModelPricing = {
  inputCentsPerMillion: number;
  outputCentsPerMillion: number;
};

const OPENAI_PRICING: Record<string, ModelPricing> = {
  "gpt-4o": {
    inputCentsPerMillion: 250,
    outputCentsPerMillion: 1000,
  },
  "gpt-4o-mini": {
    inputCentsPerMillion: 15,
    outputCentsPerMillion: 60,
  },
  "gpt-4.1-mini": {
    inputCentsPerMillion: 40,
    outputCentsPerMillion: 160,
  },
};

const DEFAULT_PRICING: ModelPricing = {
  inputCentsPerMillion: 250,
  outputCentsPerMillion: 1000,
};

export function estimateTokenCount(text: string) {
  if (!text.trim()) return 0;
  return Math.ceil(text.length / 4);
}

export function estimateModelCostCents(input: {
  provider: ModelProviderId;
  model: string;
  inputTokens: number;
  outputTokens: number;
}) {
  const pricing =
    input.provider === "openai"
      ? OPENAI_PRICING[input.model] || DEFAULT_PRICING
      : DEFAULT_PRICING;

  return (
    (input.inputTokens / 1_000_000) * pricing.inputCentsPerMillion +
    (input.outputTokens / 1_000_000) * pricing.outputCentsPerMillion
  );
}

export function createUsage(input: {
  provider: ModelProviderId;
  model: string;
  inputTokens: number;
  outputTokens: number;
}): ModelUsage {
  return {
    inputTokens: input.inputTokens,
    outputTokens: input.outputTokens,
    totalTokens: input.inputTokens + input.outputTokens,
    estimatedCostCents: estimateModelCostCents(input),
  };
}
