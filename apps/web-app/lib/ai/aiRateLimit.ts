import { applyRateLimit } from "@/lib/api/rate-limit";

export type AiRateLimitScope = "agent-run" | "agent-followup" | "builder-agent";

const WINDOW_SECONDS = 3600;

export const AI_RATE_LIMIT_SCOPES: { scope: AiRateLimitScope; label: string }[] = [
  { scope: "agent-run", label: "AI Agent runs" },
  { scope: "agent-followup", label: "AI Agent follow-ups" },
  { scope: "builder-agent", label: "Builder AI requests" },
];

export function aiRateLimitKey(scope: AiRateLimitScope, userId: string) {
  return `rl:ai:${scope}:user:${userId}`;
}

// `limit` is read from the acting tenant's plan (Plan.aiAgentRunLimitPerHour,
// aiAgentFollowupLimitPerHour, builderAgentLimitPerHour) so it varies by plan.
export async function enforceAiRateLimit(scope: AiRateLimitScope, userId: string, limit: number) {
  await applyRateLimit({
    key: aiRateLimitKey(scope, userId),
    limit,
    windowSeconds: WINDOW_SECONDS,
  });
}
