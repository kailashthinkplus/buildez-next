// /Users/kailash/buildez/apps/web-app/modules/builder/ai/aiActions.ts

import { AIRunContext, AIResponse } from "./aiTypes";

/* ============================================================
   AI ACTIONS — FRONTEND API ADAPTERS
   - No Blueprint logic
   - No prompt logic
   - No UI state
============================================================ */

/* ============================================================
   TEXT REWRITE
============================================================ */

export async function aiRewriteText(input: string): Promise<string> {
  const res = await fetch("/api/ai/rewrite", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: input }),
  });

  if (!res.ok) {
    throw new Error("AI rewrite failed");
  }

  const data = await res.json();
  return data.text;
}

/* ============================================================
   IMAGE GENERATION
============================================================ */

export async function aiGenerateImage(
  prompt: string
): Promise<string> {
  const res = await fetch("/api/ai/image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  if (!res.ok) {
    throw new Error("AI image generation failed");
  }

  const data = await res.json();
  return data.imageUrl;
}

/* ============================================================
   BLUEPRINT AI (EDIT / GENERATE)
============================================================ */

export async function aiRunBlueprint(
  context: AIRunContext
): Promise<AIResponse> {
  const res = await fetch("/api/ai/blueprint", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(context),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(
      error?.error || "Blueprint AI failed"
    );
  }

  const data = (await res.json()) as AIResponse;
  return data;
}
