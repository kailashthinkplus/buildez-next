// /Users/kailash/buildez/apps/web-app/modules/builder/ai/prompt/buildAIPrompt.ts

/* ============================================================
   BUILD AI PROMPT — DETERMINISTIC COMPOSER
   (Versioning is documented externally — code stays clean)
============================================================ */

import { systemRules } from "./systemRules";
import { layoutRules } from "./layoutRules";
import { outputContract } from "./outputContract";
import { pageContext } from "./pageContext";
import { brandContext, BrandContextInput } from "./brandContext";

/* ============================================================
   INPUT CONTRACT
============================================================ */

export interface BuildAIPromptInput {
  userIntent: string;

  // Optional but powerful
  brand?: BrandContextInput;

  page?: {
    pagePurpose?: string;
    deviceStrategy?: "mobile-first" | "desktop-first";
    existingPageSummary?: string;
  };
}

/* ============================================================
   PROMPT BUILDER (AUTHORITATIVE)
============================================================ */

export function buildAIPrompt(input: BuildAIPromptInput): string {
  if (!input?.userIntent || typeof input.userIntent !== "string") {
    throw new Error("buildAIPrompt: userIntent is required");
  }

  return [
    systemRules,
    layoutRules,
    pageContext(input.page),
    input.brand ? brandContext(input.brand) : null,
    `USER REQUEST:\n"${input.userIntent}"`,
    outputContract,
  ]
    .filter(Boolean)
    .join("\n\n");
}
