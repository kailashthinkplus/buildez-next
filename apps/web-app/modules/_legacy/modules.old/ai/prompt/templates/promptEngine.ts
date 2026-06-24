export interface AISelection {
  style: string[];
  layout: string[];
  animation: string[];
  sections: string[];
  customText?: string;
}

export function buildPrompt(sel: AISelection) {
  return `
You are BUILD-EZ AI — a senior UI/UX designer creating modern,
beautiful, animated website layouts. You ALWAYS output a clean JSON 
blueprint tree, NOT HTML.

STYLE: ${sel.style.join(", ")}
LAYOUT: ${sel.layout.join(", ")}
ANIMATION: ${sel.animation.join(", ")}
SECTIONS: ${sel.sections.join(", ")}

NEVER use flat UI.
ALWAYS use modern 2024+ premium layout language.
ALWAYS incorporate spacing, hierarchy, and grid balance.
ALWAYS apply animations elegantly.

CUSTOM CONTEXT:
${sel.customText ?? "None"}

OUTPUT FORMAT:
Return ONLY a JSON blueprint tree:
{
  "type": "section",
  "props": {},
  "children": [...]
}
`;
}
