import { runV10Preflight, type V10PreflightResult } from "./runV10Preflight";

type PreflightRunner = (input: { prompt: string; context?: Record<string, unknown> | null }) => Promise<V10PreflightResult>;

export async function prepareV10PreflightResponse(body: unknown, runner: PreflightRunner = runV10Preflight) {
  const request = body && typeof body === "object" ? body as Record<string, unknown> : {};
  const prompt = typeof request.prompt === "string" ? request.prompt.trim() : "";
  if (!prompt) return { status: 400, payload: { error: "Missing prompt" } } as const;
  const context = request.context && typeof request.context === "object" && !Array.isArray(request.context)
    ? request.context as Record<string, unknown>
    : {};
  try {
    return { status: 200, payload: await runner({ prompt, context }) } as const;
  } catch (error) {
    const detail = error instanceof Error ? error.message : "";
    return { status: 500, payload: { error: detail || "Website strategy preparation failed" } } as const;
  }
}
