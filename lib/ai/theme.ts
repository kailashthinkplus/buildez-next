// /apps/web-app/lib/ai/theme.ts

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// -------------------------------
// Multi-layer prompt for themes
// -------------------------------

const THEME_SYSTEM = `
You are BuildEZ AI Theme Engine — a senior brand designer.

Your job:
Generate **beautiful, premium, modern website themes**. 
Not generic. Not flat. Not minimal-bland.

Your inspirations:
- Framer templates
- Webflow agency sites
- Linear.app aesthetic
- Vercel / Notion polish
- D2C brand sophistication

Style Types You Can Create:
- Minimal Luxury
- Bold & Energetic
- Soft Pastel Premium
- Dark Mode Futuristic
- Playful Tech Startup
- Elegant Portfolio

RULES:
- Colors must be harmonious & accessible.
- Gradients must be subtle, modern, elegant.
- Typography must be premium and contemporary.
- Spacing must feel airy and modern.
- Shadows must be tasteful (not heavy).
- Radii must reflect the personality (soft / sharp / round).
- Return ONLY JSON.
`;

// -------------------------------
// THEME GENERATOR FUNCTION
// -------------------------------

export async function generateTheme(userPrompt: string) {
  const prompt = `
${THEME_SYSTEM}

User Prompt:
"${userPrompt}"

Return ONLY JSON theme object with this structure:

{
  "colors": {
    "primary": "...",
    "secondary": "...",
    "background": "...",
    "surface": "...",
    "text": "...",
    "muted": "...",
    "gradient": "linear-gradient(...)"
  },
  "typography": {
    "fontFamily": "...",
    "headings": {
      "h1": 48,
      "h2": 36,
      "h3": 28
    },
    "body": 18
  },
  "spacing": {
    "sectionY": 96,
    "sectionX": 24,
    "gap": 32
  },
  "radii": {
    "card": 16,
    "button": 12
  },
  "shadows": {
    "card": "0px 4px 24px rgba(0,0,0,0.08)",
    "button": "0px 2px 12px rgba(0,0,0,0.12)"
  }
}
`;

  const res = await openai.chat.completions.create({
    model: "gpt-4.1",
    temperature: 0.35,
    messages: [
      { role: "system", content: prompt }
    ],
  });

  const content = res.choices[0].message?.content || "{}";
  return JSON.parse(content);
}
