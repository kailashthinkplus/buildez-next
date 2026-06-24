// apps/web-app/modules/builder/ai-v6/prompt/buildUserPrompt.ts

import { CompileInput } from "../types";

/* ============================================================
   USER PROMPT BUILDER — STAGE SAFE & TOKEN MINIMAL
============================================================ */

/**
 * Builds the USER prompt sent to the AI provider.
 * - Stage scoped
 * - Token safe
 * - Deterministic
 * - Builder-action compatible
 */
export function buildUserPrompt(
  input: CompileInput
): string {
  const {
    intent,
    stage,
    userMessage,
    refinements,
    brandContext,
    attachmentSummary,
  } = input;

  const lines: string[] = [];

  /* ------------------------------------------------------------
     INTENT (MANDATORY)
  ------------------------------------------------------------ */

  lines.push(`INTENT: ${intent}`);

  /* ------------------------------------------------------------
     STAGE (MANDATORY)
  ------------------------------------------------------------ */

  lines.push(`STAGE: ${stage}`);

  /* ------------------------------------------------------------
     USER REQUEST (MANDATORY)
  ------------------------------------------------------------ */

  lines.push(`REQUEST: "${userMessage}"`);

  /* ------------------------------------------------------------
     REFINEMENTS (OPTIONAL — COMPACT)
  ------------------------------------------------------------ */

  if (refinements && Object.keys(refinements).length > 0) {
    lines.push(
      `REFINEMENTS: ${JSON.stringify(refinements)}`
    );
  }

  /* ------------------------------------------------------------
     BRAND CONTEXT (OPTIONAL — HIGH SIGNAL ONLY)
  ------------------------------------------------------------ */

  if (brandContext) {
    const brandBits: Record<string, any> = {};

    if (brandContext.logoUrl) {
      brandBits.logoUrl = brandContext.logoUrl;
    }

    if (brandContext.designTokens?.colors) {
      brandBits.colors =
        brandContext.designTokens.colors;
    }

    if (brandContext.designTokens?.typography) {
      brandBits.typography =
        brandContext.designTokens.typography;
    }

    if (Object.keys(brandBits).length > 0) {
      lines.push(
        `BRAND_CONTEXT: ${JSON.stringify(brandBits)}`
      );
    }
  }

  /* ------------------------------------------------------------
     ATTACHMENTS (OPTIONAL — SUMMARY ONLY)
  ------------------------------------------------------------ */

  if (attachmentSummary) {
    lines.push(
      `ATTACHMENTS: ${attachmentSummary}`
    );
  }

  /* ------------------------------------------------------------
     STAGE-SPECIFIC OUTPUT CONTRACT (CRITICAL)
  ------------------------------------------------------------ */

  if (stage === "layout") {
    lines.push(`
OUTPUT CONTRACT:
Return JSON ONLY with:
{
  "stage": "layout",
  "actions": [ builder layout actions ]
}

Rules:
- actions only
- structure only
- props must be empty objects
- no text
- no copy
- no images
- no design tokens
`.trim());
  }

  if (stage === "content") {
    lines.push(`
OUTPUT CONTRACT:
Return JSON ONLY with:
{
  "stage": "content",
  "actions": [ update-node text actions ]
}

Rules:
- update existing nodes only
- text props only
- no layout changes
- no new nodes
- no styling
`.trim());
  }

  if (stage === "design") {
    lines.push(`
OUTPUT CONTRACT:
Return JSON ONLY with:
{
  "stage": "design",
  "designTokens": { }
}

Rules:
- tokens only
- no actions
- no layout
- no content
`.trim());
  }

  /* ------------------------------------------------------------
     FINAL GUARANTEES
  ------------------------------------------------------------ */

  lines.push(`
FINAL RULES:
- Output ONLY valid JSON
- No markdown
- No explanations
- No comments
- No trailing commas
`.trim());

  return lines.join("\n");
}
