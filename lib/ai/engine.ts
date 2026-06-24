// /apps/web-app/lib/ai/engine.ts

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// ------------------------------------------------------------
// LAYER 1 — CONTEXT NORMALIZATION
// ------------------------------------------------------------

function normalizeContext(userPrompt: string) {
  return `
You are BuildEZ AI — a professional web designer + conversion copywriter.

Interpret the user's idea and convert it into a structured creative brief.

Return a JSON object with:
{
  "brand_voice": "...",
  "target_audience": "...",
  "design_direction": "...",
  "tone": "...",
  "goals": "...",
  "marketing_strategy": "...",
  "style_references": "...",
  "summary": "..."
}

User Idea:
${userPrompt}
`;
}

// ------------------------------------------------------------
// LAYER 2 — DESIGN LANGUAGE + COPY PHILOSOPHY
// ------------------------------------------------------------

export const DESIGN_PHILOSOPHY = `
Write like a senior conversion-focused copywriter designing
a $10,000+ premium landing page.

RULES:
- Never generic. Never bland. Never "AI sounding."
- Always punchy, emotional, modern, and intentional.
- Use bold statements, sharp microcopy, and real rhythm.
- Follow contemporary SaaS/D2C/portfolio design patterns.
- Use modern landing page energy (Framer/Webflow-level).
- Use story structure: tension → clarity → benefit → proof.

AVOID:
- Filler text
- Repetitive patterns
- Minimal generic lines like "We provide solutions"
- Uninspired headlines
- SEO-style robotic tone

EMBRACE:
- Emotional hooks
- Strong metaphors
- Brand personality
- Short + long line rhythm
- Microcopy that feels “designed”
- Confidence, clarity, sophistication
`;

// ------------------------------------------------------------
// LAYER 3 — STRUCTURE INTELLIGENCE
// ------------------------------------------------------------

export const STRUCTURE_GUIDANCE = `
You are BuildEZ Layout Brain.

Based on the design brief + philosophy,
generate the optimal *section structure* for the page.

Valid types:
- hero
- features
- testimonials
- faq
- pricing
- cta
- steps
- stats
- gallery

Rules:
- Use only meaningful sections
- Order must be intentional
- Avoid redundant patterns
- Don't overload the page
- Every section must have a purpose
`;

// ------------------------------------------------------------
// INTERNAL — CALL OPENAI
// ------------------------------------------------------------

async function askGPT(messages: any[], temperature = 0.35) {
  const res = await openai.chat.completions.create({
    model: "gpt-4.1",
    temperature,
    messages,
  });

  return res.choices[0].message?.content || "";
}

// ------------------------------------------------------------
// PUBLIC — 1) PAGE OUTLINE GENERATOR
// ------------------------------------------------------------

export async function generatePageOutline(userPrompt: string) {
  const outlinePrompt = `
${STRUCTURE_GUIDANCE}

User Prompt:
${userPrompt}

Return ONLY JSON:
{
  "outline": [
    { "type": "hero", "notes": "..." },
    { "type": "features", "notes": "..." },
    { "type": "testimonials", "notes": "..." },
    ...
  ]
}
`;

  const response = await askGPT([
    { role: "system", content: outlinePrompt },
  ]);

  return JSON.parse(response);
}

// ------------------------------------------------------------
// PUBLIC — 2) PAGE BLUEPRINT GENERATOR
// ------------------------------------------------------------

export async function generatePageBlueprint(userPrompt: string, outline: any) {
  const finalPrompt = `
${DESIGN_PHILOSOPHY}

You now generate the FINAL page blueprint using the user's idea,
the normalized design brief, and the outline structure.

Return ONLY JSON:

{
  "sections": [
    {
      "id": "auto",
      "type": "<from outline>",
      "data": { ...beautiful high-quality content... }
    }
  ]
}

User Prompt:
${userPrompt}

Outline:
${JSON.stringify(outline, null, 2)}
`;

  const response = await askGPT([{ role: "system", content: finalPrompt }]);

  return JSON.parse(response);
}

// ------------------------------------------------------------
// PUBLIC — 3) SINGLE SECTION GENERATOR
// ------------------------------------------------------------

export async function generateSection(type: string, userPrompt: string) {
  const sectionPrompt = `
${DESIGN_PHILOSOPHY}

Generate a SINGLE section:

{
  "id": "auto",
  "type": "${type}",
  "data": { ...rich content... }
}

User Prompt:
${userPrompt}
`;

  const response = await askGPT([{ role: "system", content: sectionPrompt }]);

  return JSON.parse(response);
}

// ------------------------------------------------------------
// PUBLIC — 4) SECTION REWRITER
// ------------------------------------------------------------

export async function rewriteSection(section: any, userPrompt: string) {
  const rewritePrompt = `
${DESIGN_PHILOSOPHY}

Rewrite the following section.  
Preserve:
- same type
- same id
- same data keys

Improve:
- tone
- clarity
- emotional pull
- storytelling
- modern copy

Section:
${JSON.stringify(section, null, 2)}

User Prompt:
${userPrompt}

Return ONLY the rewritten JSON section.
`;

  const response = await askGPT([{ role: "system", content: rewritePrompt }]);

  return JSON.parse(response);
}

// ------------------------------------------------------------
// PUBLIC — 5) FULL PAGE REWRITER
// ------------------------------------------------------------

export async function rewritePage(sections: any[], userPrompt: string) {
  const rewritePrompt = `
${DESIGN_PHILOSOPHY}

Rewrite ALL sections of this page.

Maintain:
- section order
- section id
- section type
- structure integrity

Improve:
- emotional impact
- clarity
- brand voice
- conversion strategy
- storytelling
- variety in writing patterns

Sections:
${JSON.stringify(sections, null, 2)}

User Prompt:
${userPrompt}

Return ONLY:

{
  "sections": [ ...rewritten sections... ]
}
`;

  const response = await askGPT([{ role: "system", content: rewritePrompt }]);

  return JSON.parse(response);
}
