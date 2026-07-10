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

/* ==========================================================
   AI CONVERSATION SERVICE
========================================================== */

export class AiConversation {
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

      const res = await fetch("/api/builder-v2/ai/generate-v9", {
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

      const agents = Array.isArray(result?.metadata?.agents)
        ? [...result.metadata.agents]
        : [];
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

      return result;

    } catch (err) {

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
