// /modules/builder/ai/prompt/outputContract.ts

export const outputContract = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT CONTRACT (CRITICAL)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- Output MUST be valid JSON
- Output MUST be a SINGLE object
- Root key MUST represent a "page" node

ALLOWED NODE TYPES ONLY:
- page
- section
- container
- column
- heading
- text
- image
- button
- spacer

NODE REQUIREMENTS
Every node MUST include:
- id (string)
- type (string)
- props (object)
- children (array)

IMAGE RULES
- Image blocks MUST include:
  - alt text
  - descriptive intent in props (for AI image generation)

BUTTON RULES
- Button blocks MUST include readable label text
- Buttons MUST NOT be full-width unless explicitly a CTA section

STYLE EXPECTATIONS
- Spacing, typography, and alignment MUST be explicit
- Avoid visual ambiguity
- Layout must be production-ready

FINAL CHECK
If ANY rule is violated:
- Output an empty JSON object: {}
`;
