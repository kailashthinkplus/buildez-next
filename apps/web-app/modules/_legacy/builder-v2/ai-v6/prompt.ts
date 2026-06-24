// apps/web-app/modules/builder/ai-v6/prompt.ts

import { CompileInput } from "./types";
import { AI_LIMITS, truncate } from "./limits";

/* ============================================================
   SYSTEM PROMPT (V6 — MINIMAL & LOCKED)
============================================================ */

export function buildSystemPrompt(): string {
  return `
You are BuildEZ AI.

RULES:
- Output ONLY valid JSON
- No markdown
- No explanations
- No questions
- Deterministic output
- Static marketing websites only

Return one complete, production-ready website blueprint.
`.trim();
}

/* ============================================================
   USER PROMPT (STRUCTURED, SMALL)
============================================================ */

export function buildUserPrompt(input: CompileInput): string {
  const lines: string[] = [];

  lines.push(`INTENT: ${input.intent}`);
  lines.push(
    `REQUEST: "${truncate(
      input.userMessage,
      AI_LIMITS.MAX_USER_CHARS
    )}"`
  );

  if (input.refinements) {
    lines.push(`REFINEMENTS: ${JSON.stringify(input.refinements)}`);
  }

  if (input.brandContext?.designTokens) {
    lines.push(
      `BRAND_TOKENS: ${truncate(
        JSON.stringify(input.brandContext.designTokens),
        AI_LIMITS.MAX_BRAND_CHARS
      )}`
    );
  }

  if (input.brandContext?.logoUrl) {
    lines.push(`LOGO_URL: ${input.brandContext.logoUrl}`);
  }

  if (input.attachmentSummary) {
    lines.push(
      `REFERENCE: ${truncate(
        input.attachmentSummary,
        AI_LIMITS.MAX_ATTACHMENT_CHARS
      )}`
    );
  }

  return lines.join("\n");
}
