import { createHash } from "node:crypto";
import { fetchWithRetry } from "@/lib/net/fetchWithRetry";

export type ChatRole = "system" | "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface ChatCompletionRequest {
  model: string;
  debugLabel?: string;
  messages: ChatMessage[];
  temperature?: number;
  maxCompletionTokens?: number;
  reasoningEffort?: "none" | "low" | "medium" | "high" | "xhigh";
  timeoutMs?: number;
  responseFormat?: "json_object";
}

interface ChatCompletionResponse {
  id?: string;
  model?: string;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
  choices?: Array<{
    message?: {
      role?: string;
      content?: string | null;
    };
  }>;
}

function getApiKey() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    throw new Error("Missing OPENAI_API_KEY");
  }
  return key;
}

export function modelSupportsReasoningEffort(model: string) {
  return /^(?:gpt-5(?:\.|-|$)|o[1-9](?:-|$))/i.test(model);
}

export async function callOpenAIChatCompletion(
  input: ChatCompletionRequest
): Promise<ChatCompletionResponse> {
  const debugLabel = input.debugLabel?.trim() || "unlabeled-openai-call";
  const startedAt = Date.now();
  const requestBody: Record<string, unknown> = {
    model: input.model,
    messages: input.messages,
  };
  if (input.temperature !== undefined) {
    requestBody.temperature = input.temperature;
  }
  if (input.maxCompletionTokens !== undefined) {
    requestBody.max_completion_tokens = input.maxCompletionTokens;
  }
  if (input.reasoningEffort !== undefined && modelSupportsReasoningEffort(input.model)) {
    requestBody.reasoning_effort = input.reasoningEffort;
  }
  if (input.responseFormat) {
    requestBody.response_format = { type: input.responseFormat };
  }

  console.log("[OPENAI REQUEST]", {
    debugLabel,
    model: requestBody.model,
    messageCount: input.messages.length,
    maxCompletionTokens: requestBody.max_completion_tokens,
    reasoningEffort: requestBody.reasoning_effort,
    responseFormat: requestBody.response_format,
    bodyBytes: Buffer.byteLength(JSON.stringify(requestBody)),
  });

  let res: Response;
  try {
    res = await fetchWithRetry(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getApiKey()}`,
        },
        body: JSON.stringify(requestBody),
        cache: "no-store",
      },
      {
        // Long generation calls default to 3 minutes when the caller doesn't
        // specify one; a request that never times out is worse than one that
        // fails fast and lets the caller's own fallback handling kick in.
        timeoutMs: input.timeoutMs ?? 180_000,
        maxAttempts: 3,
        onRetry: (attempt, reason) => {
          console.warn("[OPENAI REQUEST RETRY]", { debugLabel, attempt, reason, model: input.model });
        },
      },
    );

    console.log("[OPENAI RESPONSE]", {
      debugLabel,
      status: res.status,
      model: requestBody.model,
      durationMs: Date.now() - startedAt,
    });
  } catch (error) {
    console.error("[OPENAI REQUEST ERROR]", {
      debugLabel,
      model: input.model,
      durationMs: Date.now() - startedAt,
      error: error instanceof Error ? `${error.name}: ${error.message}` : "unknown network error",
    });
    const cause = error instanceof Error ? error.message : "unknown network failure";
    throw new Error(`OpenAI network request failed: ${cause}`);
  }

  if (!res.ok) {
    const rawError = await res.text();

    try {
      const fs = await import("node:fs/promises");
      await fs.writeFile(
        "/tmp/buildez-openai-failed-request.json",
        JSON.stringify(requestBody, null, 2),
        "utf8"
      );

      console.error("[OpenAI failed request captured]", {
        debugLabel,
        path: "/tmp/buildez-openai-failed-request.json",
        model: input.model,
        messageCount: input.messages.length,
        requestBytes: Buffer.byteLength(JSON.stringify(requestBody), "utf8"),
        maxCompletionTokens: input.maxCompletionTokens,
        reasoningEffort: input.reasoningEffort,
        responseFormat: input.responseFormat,
      });
    } catch (captureError) {
      console.error("[OpenAI request capture failed]", { debugLabel, captureError });
    }

    const key = getApiKey();

    const keyFingerprint = createHash("sha256")
      .update(key)
      .digest("hex")
      .slice(0, 12);

    console.error("[OpenAI request failed]", {
      debugLabel,
      status: res.status,
      model: input.model,
      endpoint: "/v1/chat/completions",
      keyFingerprint,
      keyLength: key.length,
      response: rawError,
    });

    throw new Error(
      `OpenAI API error (${res.status}) using model "${input.model}" [key:${keyFingerprint}]: ${rawError}`
    );
  }

  let response: ChatCompletionResponse;
  try {
    response = (await res.json()) as ChatCompletionResponse;
  } catch (error) {
    console.error("[OPENAI RESPONSE PARSE ERROR]", {
      debugLabel,
      model: input.model,
      durationMs: Date.now() - startedAt,
      error: error instanceof Error ? `${error.name}: ${error.message}` : "unknown response parse error",
    });
    throw error;
  }
  console.log("[OPENAI RESPONSE BODY]", {
    debugLabel,
    model: response.model || input.model,
    durationMs: Date.now() - startedAt,
    promptTokens: response.usage?.prompt_tokens,
    completionTokens: response.usage?.completion_tokens,
    totalTokens: response.usage?.total_tokens,
  });
  return response;
}

export function extractAssistantText(response: ChatCompletionResponse): string {
  return response.choices?.[0]?.message?.content?.trim() || "";
}
