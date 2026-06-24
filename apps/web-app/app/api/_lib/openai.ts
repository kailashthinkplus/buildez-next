export type ChatRole = "system" | "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  maxCompletionTokens?: number;
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

export async function callOpenAIChatCompletion(
  input: ChatCompletionRequest
): Promise<ChatCompletionResponse> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getApiKey()}`,
    },
    body: JSON.stringify({
      model: input.model,
      messages: input.messages,
      temperature: input.temperature,
      max_completion_tokens: input.maxCompletionTokens,
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const rawError = await res.text();
    throw new Error(`OpenAI API error (${res.status}): ${rawError}`);
  }

  return (await res.json()) as ChatCompletionResponse;
}

export function extractAssistantText(response: ChatCompletionResponse): string {
  return response.choices?.[0]?.message?.content?.trim() || "";
}
