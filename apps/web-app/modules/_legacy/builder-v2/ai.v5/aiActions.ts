// /Users/kailash/buildez/apps/web-app/modules/builder/ai/aiActions.ts

import {
  AIRunContext,
  AIResponse,
} from "./aiTypes";

import {
  startAIRuntime,
  updateAIRuntimeStep,
  finishAIRuntime,
  failAIRuntime,
} from "./state/aiRuntime.store";

/* ============================================================
   AI ACTIONS — FRONTEND API ADAPTERS
   - No Blueprint logic
   - No prompt logic
   - No UI state
   - Runtime lifecycle orchestration ONLY
============================================================ */

/* ============================================================
   TEXT REWRITE
============================================================ */

export async function aiRewriteText(
  input: string
): Promise<string> {
  startAIRuntime("starting", "Starting rewrite");

  try {
    updateAIRuntimeStep(
      "generating",
      "Rewriting text"
    );

    const res = await fetch("/api/ai/rewrite", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: input }),
    });

    if (!res.ok) {
      throw new Error("AI rewrite failed");
    }

    const data = await res.json();

    finishAIRuntime();
    return data.text;
  } catch (err: any) {
    failAIRuntime(err?.message);
    throw err;
  }
}

/* ============================================================
   IMAGE GENERATION
============================================================ */

export async function aiGenerateImage(
  prompt: string
): Promise<string> {
  startAIRuntime("starting", "Starting image generation");

  try {
    updateAIRuntimeStep(
      "generating",
      "Generating image"
    );

    const res = await fetch("/api/ai/image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    if (!res.ok) {
      throw new Error(
        "AI image generation failed"
      );
    }

    const data = await res.json();

    finishAIRuntime();
    return data.imageUrl;
  } catch (err: any) {
    failAIRuntime(err?.message);
    throw err;
  }
}

/* ============================================================
   BLUEPRINT AI (EDIT / GENERATE)
============================================================ */

export async function aiRunBlueprint(
  context: AIRunContext
): Promise<AIResponse> {
  startAIRuntime(
    "starting",
    "Starting AI blueprint run"
  );

  try {
    updateAIRuntimeStep(
      "understanding",
      "Understanding context"
    );

    updateAIRuntimeStep(
      "generating",
      "Generating blueprint actions"
    );

    const res = await fetch("/api/ai/blueprint", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(context),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(
        error?.error ||
          "Blueprint AI failed"
      );
    }

    updateAIRuntimeStep(
      "planning",
      "Planning changes"
    );

    const data =
      (await res.json()) as AIResponse;

    updateAIRuntimeStep(
      "finalizing",
      "Finalizing AI output"
    );

    finishAIRuntime();
    return data;
  } catch (err: any) {
    failAIRuntime(err?.message);
    throw err;
  }
}
