import { createHash } from "node:crypto";
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

  let res: Response | undefined;
  let networkError: unknown;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      console.log("[OPENAI REQUEST]", {
        debugLabel,
        attempt,
        model: requestBody.model,
        messageCount: input.messages.length,
        maxCompletionTokens: requestBody.max_completion_tokens,
        reasoningEffort: requestBody.reasoning_effort,
        responseFormat: requestBody.response_format,
        bodyBytes: Buffer.byteLength(JSON.stringify(requestBody)),
      });

      res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getApiKey()}`,
        },
        body: JSON.stringify(requestBody),
        cache: "no-store",
        signal: input.timeoutMs ? AbortSignal.timeout(input.timeoutMs) : undefined,
      });

      console.log("[OPENAI RESPONSE]", {
        debugLabel,
        status: res.status,
        model: requestBody.model,
        durationMs: Date.now() - startedAt,
      });

      break;
    } catch (error) {
      networkError = error;
      console.error("[OPENAI REQUEST ERROR]", {
        debugLabel,
        attempt,
        model: input.model,
        durationMs: Date.now() - startedAt,
        error: error instanceof Error ? `${error.name}: ${error.message}` : "unknown network error",
      });
      if (error instanceof Error && /timeout|abort/i.test(`${error.name} ${error.message}`)) break;
      if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, attempt * 750));
    }
  }
  if (!res) {
    const cause = networkError instanceof Error ? networkError.message : "unknown network failure";
    throw new Error(`OpenAI network request failed after 3 attempts: ${cause}`);
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
