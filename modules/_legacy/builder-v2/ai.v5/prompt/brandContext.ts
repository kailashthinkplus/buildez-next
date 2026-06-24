// /Users/kailash/buildez/apps/web-app/modules/builder/ai/prompt/brandContext.ts

/* ============================================================
   LAYER 4 — BRAND CONTEXT
   Purpose: Control tone, visuals, and aesthetic intent
============================================================ */

export interface BrandContextInput {
  brandName?: string;
  industry?: string;
  audience?: string;
  tone?: "minimal" | "modern" | "marketing" | "branding" | "fancy" | "sophisticated";
  visualStyle?: string;
  logoProvided?: boolean;
  colorStrategy?: "auto-from-logo" | "manual" | "hybrid";
  primaryColors?: string[];
}

export function brandContext(input: BrandContextInput) {
  return `
BRAND CONTEXT:
- Brand name: ${input.brandName ?? "Not specified"}
- Industry: ${input.industry ?? "General"}
- Target audience: ${input.audience ?? "General users"}
- Brand tone: ${input.tone ?? "modern"}
- Visual style: ${input.visualStyle ?? "clean, high-contrast, professional"}

LOGO & COLOR STRATEGY:
- Logo provided: ${input.logoProvided ? "Yes" : "No"}
- Color strategy: ${input.colorStrategy ?? "auto-from-logo"}
${input.primaryColors?.length ? `
- Primary brand colors: ${input.primaryColors.join(", ")}
` : ""}

DESIGN GUIDANCE:
- Match layout density and spacing to brand tone
- Use typography hierarchy to reinforce confidence
- Prefer visual clarity over decoration
- Avoid gimmicky or experimental layouts unless explicitly requested
`.trim();
}
