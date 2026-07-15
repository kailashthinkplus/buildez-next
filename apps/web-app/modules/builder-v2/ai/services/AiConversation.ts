"use client";

import { useAiStore } from "../store/useAiStore";

/* ==========================================================
   TYPES
========================================================== */

export interface RunAiOptions {
  pageId: string;
  prompt: string;
  tone?: string;
  context?: Record<string, unknown> | null;
}

export type AiGenerationVersion = "v9" | "v10";

export function resolveAiGenerationEndpoint(
  context?: Record<string, unknown> | null
) {
  return context?.aiGenerationVersion === "v10"
    ? "/api/builder-v2/ai/generate-v10"
    : "/api/builder-v2/ai/generate-v9";
}

/* ==========================================================
   AI CONVERSATION SERVICE
========================================================== */

export class AiConversation {
  private static activeController: AbortController | null = null;
  /* --------------------------------------------------------
     RUN WEBSITE GENERATION
  -------------------------------------------------------- */

  static async run({
    pageId,
    prompt,
    tone,
    context,
  }: RunAiOptions) {
    const store = useAiStore.getState();
    let progressTimer: ReturnType<typeof setInterval> | undefined;
    const controller = new AbortController();
    AiConversation.activeController?.abort();
    AiConversation.activeController = controller;

    try {
      store.setStatus("running");
      store.setErrorMessage(null);
      store.setElapsed(0);
      store.setAgents([]);

      const finalPrompt = tone
        ? `${prompt}

Tone: ${tone}

Instructions:
- Match the selected tone
- Create professional content
- Build responsive sections
- Use strong CTAs`
        : prompt;

      const generationRunId =
        context?.aiGenerationVersion === "v10" && typeof context.generationRunId === "string"
          ? context.generationRunId
          : "";
      let lastProgressSignature = "";
      if (generationRunId) {
        const subject = [context?.companyName, context?.industry, context?.useCase]
          .find((value) => typeof value === "string" && value.trim()) as string | undefined;
        store.setAgents([{
          agent: "IntentAgent",
          stage: "starting-engine",
          ok: true,
          summary: `Starting website generation${subject ? ` for ${subject}` : " from your approved brief"}.`,
        }]);
        const pollProgress = async () => {
          try {
            const progressResponse = await fetch(`/api/builder-v2/ai/progress-v10?runId=${encodeURIComponent(generationRunId)}`, {
              credentials: "include",
              cache: "no-store",
            });
            if (!progressResponse.ok) return;
            const snapshot = (await progressResponse.json())?.progress;
            const progress = snapshot?.current;
            if (!progress?.agent || !progress?.summary) return;
            const signature = `${progress.stage}:${progress.completed}:${progress.updatedAt}`;
            if (signature === lastProgressSignature) return;
            lastProgressSignature = signature;
            const events = Array.isArray(snapshot?.events) ? snapshot.events : [progress];
            useAiStore.getState().setAgents(events.map((event: any) => ({
              agent: event.agent,
              stage: event.stage,
              ok: true,
              summary: event.summary,
            })));
          } catch {
            // Progress is optional; the generation request remains authoritative.
          }
        };
        void pollProgress();
        progressTimer = setInterval(pollProgress, 1000);
      }

      const res = await fetch(resolveAiGenerationEndpoint(context), {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pageId,
          prompt: finalPrompt,
          context,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        let message = "AI request failed";

        try {
          const payload = await res.json();
          message = payload?.error || payload?.message || message;
        } catch {
          try {
            message = (await res.text()) || message;
          } catch {
            // Keep generic fallback.
          }
        }

        throw new Error(message);
      }

      const result = await res.json();
      if (progressTimer) clearInterval(progressTimer);

      const agents = [...useAiStore.getState().agents];
      const qualityWarnings = Array.isArray(result?.metadata?.qualityWarnings)
        ? result.metadata.qualityWarnings.filter(Boolean)
        : [];

      if (
        result?.metadata?.qualityStatus === "needs_improvement" &&
        qualityWarnings.length
      ) {
        agents.push({
          agent: "QualityGateAgent",
          stage: "quality",
          ok: false,
          summary:
            `Generated a usable draft at ${result.metadata.qualityScore ?? "unknown"}/100; visual quality needs improvement.`,
          warnings: qualityWarnings,
        });
      }

      store.setAgents(agents);

      store.setStatus("success");
      AiConversation.activeController = null;

      return result;

    } catch (err) {

      if (progressTimer) clearInterval(progressTimer);

      if (controller.signal.aborted) {
        store.setStatus("idle");
        store.setElapsed(0);
        AiConversation.activeController = null;
        return null;
      }

      console.error(err);

      const message = err instanceof Error ? err.message : "AI request failed";
      store.setErrorMessage(message);
      store.setStatus("error");

      throw err;

    }
  }

  /* --------------------------------------------------------
     STOP CURRENT GENERATION
  -------------------------------------------------------- */

  static abort() {

    const store = useAiStore.getState();

    AiConversation.activeController?.abort();
    AiConversation.activeController = null;
    store.addMessage({ role: "assistant", text: "Generation stopped by user.", ts: Date.now(), kind: "text" });
    store.setStatus("idle");

    store.setElapsed(0);

  }

  /* --------------------------------------------------------
     RESET CONVERSATION
  -------------------------------------------------------- */

  static reset() {

    useAiStore.getState().reset();

  }
}
