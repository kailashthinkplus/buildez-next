export function sectionPlanPrompt(
  userPrompt: string
) {
  return `
You are a senior website information architect.

TASK:
Based on the user's request, list the most important sections
this specific website needs.

GUIDELINES:
- Sections must be SPECIFIC to the business or use case
- Avoid generic placeholders unless absolutely necessary
- Prefer intent-based, human-readable names
- Titles should sound like real website sections written by a human

IMPORTANT (LAYOUT AWARENESS):
- When possible, include a clear intent hint in the title such as:
  Hero, Features, Services, Process, Pricing, Projects,
  Case Studies, Testimonials, About, Contact, Get Started
- Do NOT force these words unnaturally
- Natural language always comes first, intent hint second

RULES:
- One section per line
- Maximum 6 sections
- No descriptions
- No formatting
- No JSON
- Do NOT include Header or Footer

USER REQUEST:
${userPrompt}

GOOD EXAMPLES:
Hero — Your Vision, Built Right
Custom Cabinetry Services
Our Design & Build Process
Featured Projects & Case Studies
Client Testimonials
Get Started — Request a Quote

BAD EXAMPLES:
Section One
Services
About
Content
More Info

OUTPUT:
`.trim();
}
