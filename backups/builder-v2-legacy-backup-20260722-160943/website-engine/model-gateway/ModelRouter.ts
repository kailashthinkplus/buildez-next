import { OpenAIProvider } from "./providers/openai";
import type { ModelProvider, ModelProviderId } from "./types";

export class ModelRouter {
  private readonly providers: Record<ModelProviderId, ModelProvider>;

  constructor(providers?: Partial<Record<ModelProviderId, ModelProvider>>) {
    this.providers = {
      openai: providers?.openai || new OpenAIProvider(),
    };
  }

  getProvider(provider: ModelProviderId = "openai") {
    return this.providers[provider];
  }
}
