import { BlueprintNode } from "../renderer/PageRenderer";
import { AIDesignAnswers } from "./aiTypes";

/* ============================================================
   AI PROMPT COMPILER (CANONICAL — GENERATION / REFINEMENT)
============================================================ */

/* ============================================================
   REFINEMENT TYPES (STEP 6)
============================================================ */

export interface AIRefinements {
  tone?: "professional" | "friendly" | "premium" | "bold";
  density?: "minimal" | "balanced" | "detailed";
  cta?: "soft" | "standard" | "aggressive";
}

/* ============================================================
   BRAND CONTEXT (STEP 7.11 — CANONICAL)
============================================================ */

export interface AIBrandContext {
  logoUrl?: string | null;
  colors?: {
    primary?: string;
    onPrimary?: string;
    background?: string;
    surface?: string;
    textPrimary?: string;
  } | null;
}

/* ============================================================
   INPUT CONTRACT
============================================================ */

export interface BuildAIPromptInput {
  message?: string;
  selectedNode?: BlueprintNode | null;
  design?: AIDesignAnswers;
  attachmentSummary?: string;
  refinements?: AIRefinements;
  brandContext?: AIBrandContext;

  intent: "edit_page" | "generate_page" | "generate_site";
}

/* ============================================================
   SYSTEM PROMPT (HARD-LOCKED — NO QUESTIONS, ONE SHOT)
============================================================ */

function buildSystemPrompt() {
  return `
You are BuildEZ AI — a deterministic website layout and styling generator.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ABSOLUTE BEHAVIOR RULES (CRITICAL)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- YOU MUST NOT ask the user any questions
- YOU MUST NOT request clarification
- YOU MUST NOT pause or defer generation
- YOU MUST NOT output partial results
- YOU MUST NOT generate multiple alternatives
- YOU MUST make reasonable assumptions when information is missing
- YOU MUST generate a COMPLETE, FINAL RESULT IN ONE RESPONSE

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCOPE RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- STATIC MARKETING WEBSITES ONLY
- NO dashboards
- NO web apps
- NO admin panels
- NO authentication
- NO analytics
- NO backend logic

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT CONTRACT (STRICT)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Output EXACTLY ONE valid JSON object
- Root node MUST be type "page"
- Output JSON ONLY
- No comments
- No markdown
- No explanations
- No surrounding text

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BLUEPRINT SCHEMA (STRICT)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Allowed node types ONLY:
- page
- section
- container
- column
- heading
- text
- button
- image
- spacer

Every node MUST contain:
- id (string)
- type
- props (object, may be empty)
- children (array, never null)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LAYOUT RULES (NON-NEGOTIABLE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- page → section → container → column → blocks
- Containers MUST contain columns
- Columns MUST NOT contain columns
- Columns may only contain:
  heading, text, image, button, spacer
- No empty children arrays
- No implicit layout or spacing

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Sections define vertical rhythm
- Use paddingTop and paddingBottom (60–120)
- Never leave sections visually flat

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONTAINER RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Containers control width and layout
- Use maxWidth explicitly:
  - Text-heavy: 480–640
  - Standard sections: 960–1200
- Use layout:
  - "columns" for multi-column
  - "block" for stacked
- Always define gap (number, not px)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COLUMN RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Columns MUST define intent:
  - width ("100%", "60%", "40%", etc.)
  - align ("flex-start", "center")
- Never rely on browser defaults

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TYPOGRAPHY RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Headings MUST include:
  fontSize, fontWeight, marginBottom
- Text MUST include:
  lineHeight, marginBottom
- Use maxWidth where appropriate

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DESIGN QUALITY BAR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Industry-appropriate visual language
- Clear hierarchy
- Strong visual balance
- Real spacing, not wireframes
- Production-ready output
`;
}

/* ============================================================
   CONTEXT PROMPT (INPUT ONLY, NO DIALOG)
============================================================ */

function buildContextPrompt(input: BuildAIPromptInput) {
  const lines: string[] = [];

  lines.push(`MODE: ${input.intent}`);

  if (input.design) {
    lines.push(`
DESIGN CONTEXT:
- Website Category: ${input.design.websiteCategory}
- Industry: ${input.design.industry}
- Visual Style: ${input.design.visualStyle}
- Image Style: ${input.design.imageStyle}
- Pages: ${input.design.pages?.join(", ")}
`);
  }

  /* ---------------- BRAND CONTEXT (AUTHORITATIVE) ---------------- */

  if (input.brandContext?.colors) {
    lines.push(`
BRAND CONTEXT (AUTHORITATIVE):
${input.brandContext.logoUrl ? `- Logo URL: ${input.brandContext.logoUrl}` : ""}
${input.brandContext.colors.primary ? `- Primary Color: ${input.brandContext.colors.primary}` : ""}
${input.brandContext.colors.onPrimary ? `- On Primary: ${input.brandContext.colors.onPrimary}` : ""}
${input.brandContext.colors.background ? `- Background: ${input.brandContext.colors.background}` : ""}
${input.brandContext.colors.surface ? `- Surface: ${input.brandContext.colors.surface}` : ""}
${input.brandContext.colors.textPrimary ? `- Text Primary: ${input.brandContext.colors.textPrimary}` : ""}

RULES:
- These are brand colors — do NOT invent new ones
- Use primary color for CTAs
- Maintain readable contrast
- Styling must strictly align with brand
`);
  }

  if (input.refinements) {
    lines.push(`
REFINEMENTS:
- Tone: ${input.refinements.tone ?? "default"}
- Content Density: ${input.refinements.density ?? "default"}
- CTA Strength: ${input.refinements.cta ?? "default"}
`);
  }

  if (input.attachmentSummary) {
    lines.push(`
REFERENCE MATERIAL:
${input.attachmentSummary}
`);
  }

  if (input.selectedNode) {
    lines.push(`
TARGET NODE (ONLY MODIFY THIS NODE):
${JSON.stringify(input.selectedNode, null, 2)}
`);
  }

  if (input.message) {
    lines.push(`
USER INTENT:
"${input.message}"
`);
  }

  return lines.join("\n");
}

/* ============================================================
   FINAL PROMPT (ONE-SHOT GENERATION)
============================================================ */

export function buildAIPrompt(
  input: BuildAIPromptInput
): string {
  return `
${buildSystemPrompt()}

${buildContextPrompt(input)}

FINAL INSTRUCTIONS:
- Generate the FULL page in one pass
- Apply layout, spacing, and styling together
- Respect brand colors strictly
- Do NOT ask questions
- Do NOT explain decisions
- Output JSON ONLY
`;
}
