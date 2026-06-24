// apps/web-app/modules/builder/ai-v6/types.ts

/* ============================================================
   INTENTS
============================================================ */

export type AIV6Intent =
  | "generate_page"
  | "edit_page";

/* ============================================================
   AI STAGES (CRITICAL FOR TOKEN SAFETY)
============================================================ */

export type AIV6Stage =
  | "layout"
  | "content"
  | "design";

/* ============================================================
   BRAND CONTEXT
============================================================ */

export interface AIV6BrandContext {
  logoUrl?: string | null;
  designTokens?: {
    colors?: Record<string, string>;
    typography?: Record<string, any>;
  } | null;
}

/* ============================================================
   USER REFINEMENTS
============================================================ */

export interface AIV6Refinements {
  tone?: "professional" | "friendly" | "premium" | "bold";
  density?: "minimal" | "balanced" | "detailed";
  cta?: "soft" | "standard" | "aggressive";
}

/* ============================================================
   COMPILER INPUT (AUTHORITATIVE)
============================================================ */

export interface CompileInput {
  /** What the user is trying to do */
  intent: AIV6Intent;

  /** Which AI stage is being executed */
  stage: AIV6Stage;

  /** User’s natural language request */
  userMessage: string;

  /** Optional brand context */
  brandContext?: AIV6BrandContext;

  /** Optional refinement controls */
  refinements?: AIV6Refinements;

  /** Optional attachment summary (files, images, etc.) */
  attachmentSummary?: string;
}

/* ============================================================
   COMPILED PAYLOAD
============================================================ */

export interface CompiledAIPayload {
  provider: "openai";
  model: "gpt-5.1";
  payload: {
    system: string;
    user: string;
    max_output_tokens: number;
  };
  estimatedTokens: number;
}
