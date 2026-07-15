// ============================================================================
// AI BLUEPRINT ROUTE — V4 (FULL BLUEPRINT, NO PATCHES)
// ============================================================================

import { NextResponse } from "next/server";

import { generateBlueprint } from "@/app/api/ai/_lib/llm";
import { summarizeAttachments } from "@/app/api/ai/_lib/attachments";
import { buildAIPrompt } from "@/modules/builder/ai/aiPrompt";

import type { BlueprintNode } from "@/modules/builder/renderer/PageRenderer";

// ----------------------------------------------------------------------------
// LIMITS (SAFE DEFAULTS)
// ----------------------------------------------------------------------------
const MAX_PROMPT_LENGTH = 8000;
const MAX_ATTACHMENTS = 5;

// ----------------------------------------------------------------------------
// POST
// ----------------------------------------------------------------------------
export async function POST(req: Request) {
  console.log("[AI API] /api/ai/blueprint called");

  try {
    const body = await req.json();

    console.log("[AI API] Raw body:", body);

    /**
     * EXPECTED PAYLOAD
     *
     * {
     *   prompt: string
     *   page: BlueprintNode
     *   context?: {
     *     message?: string
     *     attachments?: []
     *     regenerate?: boolean
     *   }
     * }
     */
    const { prompt, page, context = {} } = body ?? {};

    // ------------------------------------------------------------------------
    // HARD GUARDS
    // ------------------------------------------------------------------------
    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid prompt" },
        { status: 400 }
      );
    }

    if (!page || typeof page !== "object") {
      return NextResponse.json(
        { error: "Missing or invalid page blueprint" },
        { status: 400 }
      );
    }

    if (prompt.length > MAX_PROMPT_LENGTH) {
      return NextResponse.json(
        { error: "Prompt too long" },
        { status: 413 }
      );
    }

    const attachments = Array.isArray(context.attachments)
      ? context.attachments
      : [];

    if (attachments.length > MAX_ATTACHMENTS) {
      return NextResponse.json(
        { error: "Too many attachments" },
        { status: 400 }
      );
    }

    console.log("[AI API] Prompt OK");
    console.log("[AI API] Attachments:", attachments.length);
    console.log("[AI API] Regenerate:", context.regenerate === true);

    // ------------------------------------------------------------------------
    // ATTACHMENT SUMMARY (OPTIONAL)
    // ------------------------------------------------------------------------
    const attachmentSummary =
      attachments.length > 0
        ? summarizeAttachments(attachments)?.summaryText
        : undefined;

    // ------------------------------------------------------------------------
    // BUILD AI PROMPT
    // ------------------------------------------------------------------------
    const finalPrompt = buildAIPrompt({
      message: prompt,
      selectedNode: null, // 🔒 Page-level generation only
      attachmentSummary,
    });

    console.log("[AI API] Final AI prompt built");

    // ------------------------------------------------------------------------
    // CALL LLM — FULL BLUEPRINT GENERATION
    // ------------------------------------------------------------------------
    const nextBlueprint = await generateBlueprint(finalPrompt);

    // ------------------------------------------------------------------------
    // VALIDATE AI RESPONSE (HARD FAIL SAFE)
    // ------------------------------------------------------------------------
    if (
      !nextBlueprint ||
      typeof nextBlueprint !== "object" ||
      nextBlueprint.type !== "page" ||
      !Array.isArray(nextBlueprint.children)
    ) {
      console.error("[AI API] Invalid blueprint returned by AI", nextBlueprint);

      return NextResponse.json(
        { error: "AI returned invalid blueprint" },
        { status: 422 }
      );
    }

    console.log("[AI API] Blueprint generated", {
      sections: nextBlueprint.children.length,
    });

    // ------------------------------------------------------------------------
    // SUCCESS RESPONSE — V4 CONTRACT
    // ------------------------------------------------------------------------
    return NextResponse.json({
      nextBlueprint: nextBlueprint as BlueprintNode,
    });
  } catch (err: any) {
    console.error("[AI API] Fatal error:", err);

    return NextResponse.json(
      {
        error: err?.message ?? "AI generation failed",
      },
      { status: 500 }
    );
  }
}
