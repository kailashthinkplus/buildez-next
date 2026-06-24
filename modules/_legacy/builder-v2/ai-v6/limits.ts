// apps/web-app/modules/builder/ai-v6/limits.ts

export const AI_LIMITS = {
  MAX_USER_CHARS: 800,
  MAX_BRAND_CHARS: 600,
  MAX_ATTACHMENT_CHARS: 400,
  MAX_OUTPUT_TOKENS: 10000,
};

export function truncate(input: string, max: number) {
  if (!input) return "";
  return input.length <= max
    ? input
    : input.slice(0, max) + "…";
}

export function estimateTokens(text: string): number {
  // Safe heuristic: ~4 chars per token
  return Math.ceil(text.length / 4);
}
