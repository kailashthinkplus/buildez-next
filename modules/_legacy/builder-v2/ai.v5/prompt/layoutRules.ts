// /modules/builder/ai/prompt/layoutRules.ts

export const layoutRules = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BLUEPRINT STRUCTURE RULES (STRICT)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ROOT RULES
- Root node MUST be type "page"
- Page children MUST be "section" nodes only
- Do NOT place text or blocks directly under page

SECTION RULES
- Each section MUST contain at least one container
- Sections define vertical rhythm
- Sections MUST include paddingTop and paddingBottom
- Do NOT create empty sections

CONTAINER RULES
- Containers control width and layout
- Container MUST specify layout:
  - "columns" for multi-column layouts
  - "block" for stacked layouts
- Containers MUST include a gap value
- Containers SHOULD include maxWidth
- Containers MAY contain columns OR blocks (but columns preferred)

COLUMN RULES
- Columns MAY contain ONLY content blocks
- Columns MUST define width when used in multi-column layouts
- Valid widths: percentages or "auto"
- Columns MUST NOT contain other columns

BLOCK RULES
Allowed content blocks:
- heading
- text
- image
- button
- spacer

BLOCK CONSTRAINTS
- Blocks MUST NOT have children
- Blocks MUST include meaningful props
- No empty blocks
- No placeholder-only blocks

LAYOUT SAFETY
- Avoid more than 6 sections unless clearly necessary
- Prefer strong layouts over many weak sections
- Do NOT rely on browser defaults for spacing or alignment
`;
