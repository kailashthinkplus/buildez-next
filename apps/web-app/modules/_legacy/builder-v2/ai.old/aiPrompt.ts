// /Users/kailash/buildez/apps/web-app/modules/builder/ai/aiPrompt.ts

import { BlueprintNode } from "../renderer/PageRenderer";
import { AIDesignAnswers } from "./aiTypes";

/* ============================================================
   AI PROMPT COMPILER (CANONICAL — LAYOUT-AWARE)
============================================================ */

export interface BuildAIPromptInput {
  message?: string;
  selectedNode?: BlueprintNode | null;
  design?: AIDesignAnswers;
  attachmentSummary?: string;
  intent: "edit_page" | "generate_page" | "generate_site";
}

/* ============================================================
   SYSTEM PROMPT (LOCKED, LAYOUT-AWARE)
============================================================ */

function buildSystemPrompt() {
  return `
You are BuildEZ AI — a senior product designer and layout engineer.

You generate PRODUCTION-READY STATIC MARKETING WEBSITES.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ABSOLUTE CONSTRAINTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- STATIC FRONT-END ONLY
- NO dashboards
- NO web apps
- NO admin panels
- NO authentication
- NO analytics
- NO backend logic
- NO markdown
- NO explanations
- OUTPUT JSON ONLY

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BLUEPRINT RULES (STRICT)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Root node MUST be type "page"
- Allowed node types only:
  page, section, container, column, heading, text, button, image, spacer
- Every node MUST have:
  id, type, props, children
- IDs must be unique, stable strings
- Children arrays must NEVER be empty if layout exists

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MANDATORY LAYOUT & STYLE RULES (CRITICAL)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You MUST encode layout intent using props.style and layout props.
Never rely on browser defaults.

SECTION
- Sections define vertical rhythm
- Use paddingTop / paddingBottom (60–120px)
- Never leave sections visually flat

CONTAINER
- Containers control width and layout
- Use maxWidth for readable layouts:
  - Text-heavy: 480–640px
  - Standard sections: 960–1200px
- Use layout:
  - "columns" for multi-column sections
  - "block" for stacked content
- Always define gap (number, not px)

COLUMN
- Columns MUST define intent:
  - width (e.g. "50%", "60%", "40%")
  - align (flex-start, center)
- Never stack columns unless mobile intent exists

TYPOGRAPHY
- Headings MUST include:
  - fontSize
  - fontWeight
  - marginBottom
- Text blocks MUST include:
  - maxWidth when appropriate
  - marginBottom
  - lineHeight

SPACING
- Use spacer blocks intentionally
- Use marginBottom on text instead of empty elements
- Never leave vertical spacing implicit

BUTTONS
- Buttons should NEVER be full-width unless CTA intent
- Use size and spacing props

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DESIGN QUALITY BAR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Modern SaaS aesthetic
- Clear hierarchy
- Balanced whitespace
- Grid-based layouts
- Visually designed, not wireframes

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FINAL OUTPUT RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Output a SINGLE valid JSON object
- No comments
- No markdown
- No surrounding text
`;
}

/* ============================================================
   CONTEXT PROMPT
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

  if (input.attachmentSummary) {
    lines.push(`
REFERENCE MATERIAL:
${input.attachmentSummary}
`);
  }

  if (input.selectedNode) {
    lines.push(`
SELECTED NODE (ONLY MODIFY THIS NODE):
${JSON.stringify(input.selectedNode, null, 2)}
`);
  }

  if (input.message) {
    lines.push(`
USER REQUEST:
"${input.message}"
`);
  }

  return lines.join("\n");
}

/* ============================================================
   FINAL PROMPT
============================================================ */

export function buildAIPrompt(
  input: BuildAIPromptInput
): string {
  return `
${buildSystemPrompt()}

${buildContextPrompt(input)}

FINAL INSTRUCTIONS:
- Generate STRUCTURED layout, not flat content
- Use columns wherever visual balance is required
- Prefer fewer sections with strong layout over many weak sections
- Output JSON ONLY
`;
}
