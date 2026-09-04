import { createUsage, estimateTokenCount } from "../CostEstimator";
import type { ModelProvider, ModelRequest, ModelResponse } from "../types";

type OpenAIChatCompletionResponse = {
  model?: string;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
};

function getApiKey() {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) {
    throw new Error("Missing OPENAI_API_KEY");
  }
  return key;
}

function modelForTask(request: ModelRequest) {
  if (request.model) return request.model;
  if (request.task === "classify" || request.task === "summarize") {
    return process.env.OPENAI_WEBSITE_LIGHT_MODEL || "gpt-4o-mini";
  }
  return process.env.OPENAI_WEBSITE_MODEL || "gpt-4o";
}

export class OpenAIProvider implements ModelProvider {
  readonly id = "openai" as const;

  async complete(request: ModelRequest): Promise<ModelResponse> {
    const model = modelForTask(request);
    const debugLabel = request.debugLabel?.trim() || `website-engine-${request.task}`;
    const startedAt = Date.now();
    console.log("[OPENAI REQUEST]", {
      debugLabel,
      model,
      task: request.task,
      messageCount: request.messages.length,
      inputCharacters: request.messages.reduce((total, message) => total + message.content.length, 0),
      maxCompletionTokens: request.maxOutputTokens ?? 800,
    });

    let res: Response;
    try {
      res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getApiKey()}`,
        },
        body: JSON.stringify({
          model,
          messages: request.messages,
          temperature: request.temperature ?? 0.2,
          max_completion_tokens: request.maxOutputTokens ?? 800,
        }),
        cache: "no-store",
      });
    } catch (error) {
      console.error("[OPENAI REQUEST ERROR]", {
        debugLabel,
        model,
        task: request.task,
        durationMs: Date.now() - startedAt,
        error: error instanceof Error ? `${error.name}: ${error.message}` : "unknown network error",
      });
      throw error;
    }

    if (!res.ok) {
      const rawError = await res.text().catch(() => "");
      console.error("[OPENAI RESPONSE ERROR]", {
        debugLabel,
        model,
        task: request.task,
        status: res.status,
        durationMs: Date.now() - startedAt,
        errorCharacters: rawError.length,
      });
      throw new Error(`OpenAI API error (${res.status}): ${rawError}`);
    }

    let raw: OpenAIChatCompletionResponse;
    try {
      raw = (await res.json()) as OpenAIChatCompletionResponse;
    } catch (error) {
      console.error("[OPENAI RESPONSE PARSE ERROR]", {
        debugLabel,
        model,
        task: request.task,
        durationMs: Date.now() - startedAt,
        error: error instanceof Error ? `${error.name}: ${error.message}` : "unknown response parse error",
      });
      throw error;
    }
    const text = raw.choices?.[0]?.message?.content?.trim() || "";
    const inputTokens =
      raw.usage?.prompt_tokens ??
      request.messages.reduce(
        (sum, message) => sum + estimateTokenCount(message.content),
        0
      );
    const outputTokens =
      raw.usage?.completion_tokens ?? estimateTokenCount(text);
    console.log("[OPENAI RESPONSE]", {
      debugLabel,
      model: raw.model || model,
      task: request.task,
      durationMs: Date.now() - startedAt,
      promptTokens: inputTokens,
      completionTokens: outputTokens,
      totalTokens: raw.usage?.total_tokens ?? inputTokens + outputTokens,
    });

    return {
      text,
      provider: this.id,
      model: raw.model || model,
      usage: createUsage({
        provider: this.id,
        model: raw.model || model,
        inputTokens,
        outputTokens,
      }),
      raw,
    };
  }
}
