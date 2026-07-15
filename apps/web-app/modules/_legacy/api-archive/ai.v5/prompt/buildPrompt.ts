// /Users/kailash/buildez/apps/web-app/app/api/ai/prompt/buildPrompt.ts

/* ============================================================
   API → PROMPT BRIDGE (AUTHORITATIVE)
   ------------------------------------------------------------
   • All API routes MUST call this file
   • No prompt strings are built inline in routes
   • Deterministic adapter → prompt engine only
============================================================ */

import {
  buildAIPrompt,
  type BuildAIPromptInput,
} from "@/modules/builder/ai/prompt/buildAIPrompt";

/* ============================================================
   API INPUT CONTRACT
   ------------------------------------------------------------
   This is the ONLY shape API routes may pass into the
   prompt system.
============================================================ */

export interface BuildPromptApiInput {
  /** Required user intent (derived from interview / user action) */
  userIntent: string;

  /** Brand context (from finalized AI interview answers) */
  brand?: {
    industry?: string;
    tone?: string;
    visualStyle?: string;
    audience?: string;
    logoUrl?: string;

    /** Color decision strategy */
    colorStrategy?: "auto-from-logo" | "manual" | "hybrid";
    primaryColor?: string;
    secondaryColor?: string;
  };

  /** Page grounding context */
  page?: {
    pagePurpose?: string;
    deviceStrategy?: "mobile-first" | "desktop-first";
    existingPageSummary?: string;
  };
}

/* ============================================================
   BRIDGE FUNCTION
   ------------------------------------------------------------
   • Single entry point for prompt generation from APIs
   • Performs shape adaptation only
   • Validation of required answers happens upstream
============================================================ */

export function buildPromptForApi(
  input: BuildPromptApiInput
): string {
  if (!input || !input.userIntent) {
    throw new Error("buildPromptForApi: userIntent is required");
  }

  const promptInput: BuildAIPromptInput = {
    userIntent: input.userIntent,

    brand: input.brand
      ? {
          industry: input.brand.industry,
          tone: input.brand.tone,
          visualStyle: input.brand.visualStyle,
          audience: input.brand.audience,
          logoUrl: input.brand.logoUrl,
          colorStrategy: input.brand.colorStrategy,
          primaryColor: input.brand.primaryColor,
          secondaryColor: input.brand.secondaryColor,
        }
      : undefined,

    page: input.page
      ? {
          pagePurpose: input.page.pagePurpose,
          deviceStrategy: input.page.deviceStrategy,
          existingPageSummary: input.page.existingPageSummary,
        }
      : undefined,
  };

  return buildAIPrompt(promptInput);
}
