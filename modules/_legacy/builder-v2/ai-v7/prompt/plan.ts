export function imagePrompt(sections: string[]) {
  return `
You are generating image prompts for a website builder.

CRITICAL CONTRACT (DO NOT BREAK):
- Section names are matched programmatically.
- You MUST use the section names EXACTLY as provided.
- Do NOT rename, rephrase, or add words to section names.
- Do NOT add words like "section", "area", or punctuation.
- If the section name is "Hero", use "Hero:" — nothing else.

--------------------------------------------------
STRICT OUTPUT RULES
--------------------------------------------------

1. One line per section.
2. Each line MUST start with the EXACT section name,
   followed immediately by a colon.
3. Use ONLY the section names given below.
4. After the colon, describe ONE strong visual concept.
5. Do NOT include URLs, camera brands, or stock site names.
6. Do NOT include explanations or formatting.
7. Do NOT skip any section.

--------------------------------------------------
FORMAT (EXACT)
--------------------------------------------------

Section Name: visual description

--------------------------------------------------
SECTIONS (USE THESE NAMES VERBATIM)
--------------------------------------------------

${sections.join("\n")}

--------------------------------------------------
EXAMPLE (FORMAT ONLY)
--------------------------------------------------

Hero: cinematic wide-angle view of a modern home interior with warm natural light, premium materials, and clean architectural lines
Custom Cabinetry Solutions: detailed close-up of handcrafted wood cabinetry showcasing texture, joinery, and finish
`;
}
