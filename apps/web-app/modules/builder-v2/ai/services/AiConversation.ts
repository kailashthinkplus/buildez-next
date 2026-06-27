"use client";

import { useAiStore } from "../store/useAiStore";

/* ==========================================================
   TYPES
========================================================== */

export interface RunAiOptions {
  pageId: string;
  prompt: string;
  tone?: string;
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
  }: RunAiOptions) {
    const store = useAiStore.getState();

    try {
      store.setStatus("running");
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

      const res = await fetch("/api/builder-v2/ai/generate", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pageId,
          prompt: finalPrompt,
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
        ? result.metadata.agents
        : [];

      store.setAgents(agents);

      store.setStatus("success");

      return result;

    } catch (err) {

      console.error(err);

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
