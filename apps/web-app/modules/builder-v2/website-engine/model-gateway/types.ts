export type ModelProviderId = "openai";

export type ModelTask =
  | "classify"
  | "reason"
  | "copy"
  | "repair"
  | "summarize"
  | "critic";

export type ModelMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type ModelBudget = {
  maxInputTokens?: number;
  maxOutputTokens?: number;
  maxEstimatedCents?: number;
};

export type ModelRequest = {
  task: ModelTask;
  messages: ModelMessage[];
  model?: string;
  temperature?: number;
  maxOutputTokens?: number;
  budget?: ModelBudget;
  cacheKey?: string;
  metadata?: Record<string, unknown>;
};

export type ModelUsage = {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCostCents: number;
};

export type ModelResponse = {
  text: string;
  provider: ModelProviderId;
  model: string;
  usage: ModelUsage;
  cached?: boolean;
  raw?: unknown;
};

export type ModelProvider = {
  id: ModelProviderId;
  complete(input: ModelRequest): Promise<ModelResponse>;
};

export type ModelGatewayOptions = {
  provider?: ModelProviderId;
  defaultModel?: string;
  cacheEnabled?: boolean;
  defaultBudget?: ModelBudget;
};
