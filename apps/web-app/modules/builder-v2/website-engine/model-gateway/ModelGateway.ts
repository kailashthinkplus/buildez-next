import { enforceRequestBudget } from "./BudgetManager";
import { promptCache } from "./PromptCache";
import { ModelRouter } from "./ModelRouter";
import type { ModelGatewayOptions, ModelRequest } from "./types";

export class ModelGateway {
  private readonly router: ModelRouter;
  private readonly options: ModelGatewayOptions;

  constructor(options: ModelGatewayOptions = {}, router = new ModelRouter()) {
    this.options = {
      provider: "openai",
      cacheEnabled: true,
      defaultBudget: {
        maxInputTokens: 6000,
        maxOutputTokens: 1200,
        maxEstimatedCents: 5,
      },
      ...options,
    };
    this.router = router;
  }

  async complete(request: ModelRequest) {
    const budgetCheck = enforceRequestBudget(
      request,
      this.options.defaultBudget
    );
    const cacheKey = this.options.cacheEnabled ? request.cacheKey : undefined;

    if (cacheKey) {
      const cached = promptCache.get(cacheKey);
      if (cached) return cached;
    }

    const provider = this.router.getProvider(this.options.provider);
    const response = await provider.complete(request);
    const maxEstimatedCents =
      request.budget?.maxEstimatedCents ??
      this.options.defaultBudget?.maxEstimatedCents;

    if (
      maxEstimatedCents !== undefined &&
      response.usage.estimatedCostCents > maxEstimatedCents
    ) {
      throw new Error(
        `Model response exceeded estimated budget: ${response.usage.estimatedCostCents.toFixed(
          3
        )}c > ${maxEstimatedCents}c.`
      );
    }

    if (response.usage.outputTokens > budgetCheck.requestedOutputTokens * 1.25) {
      throw new Error("Model response exceeded expected output token range.");
    }

    if (cacheKey) {
      promptCache.set(cacheKey, response);
    }

    return response;
  }
}

export const modelGateway = new ModelGateway();
