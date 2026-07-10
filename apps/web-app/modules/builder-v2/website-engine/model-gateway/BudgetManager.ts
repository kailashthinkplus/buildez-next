import { estimateTokenCount } from "./CostEstimator";
import type { ModelBudget, ModelRequest } from "./types";

export class ModelBudgetError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ModelBudgetError";
  }
}

export function enforceRequestBudget(
  request: ModelRequest,
  fallbackBudget?: ModelBudget
) {
  const budget = {
    ...fallbackBudget,
    ...request.budget,
  };

  const estimatedInputTokens = request.messages.reduce(
    (sum, message) => sum + estimateTokenCount(message.content),
    0
  );
  const requestedOutputTokens = request.maxOutputTokens || 800;

  if (
    budget.maxInputTokens !== undefined &&
    estimatedInputTokens > budget.maxInputTokens
  ) {
    throw new ModelBudgetError(
      `Model input budget exceeded: ${estimatedInputTokens} > ${budget.maxInputTokens} tokens.`
    );
  }

  if (
    budget.maxOutputTokens !== undefined &&
    requestedOutputTokens > budget.maxOutputTokens
  ) {
    throw new ModelBudgetError(
      `Model output budget exceeded: ${requestedOutputTokens} > ${budget.maxOutputTokens} tokens.`
    );
  }

  return {
    estimatedInputTokens,
    requestedOutputTokens,
    budget,
  };
}
