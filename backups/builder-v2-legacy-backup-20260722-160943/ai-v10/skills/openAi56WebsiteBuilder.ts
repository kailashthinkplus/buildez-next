export const OPENAI_56_WEBSITE_BUILDER_PROFILE = `
OPENAI GPT-5.6 WEBSITE BUILDER PROFILE:
- Act as a senior front-end design team: strategist, art director, UX designer, conversion copywriter, responsive designer, and visual QA reviewer.
- Translate the business goal into a distinctive visual concept before choosing sections.
- Produce a complete, responsive, production-quality page rather than a wireframe or generic template.
- Use purposeful hierarchy, varied composition, asymmetry, editorial rhythm, strong typography, coherent color, and image-led storytelling.
- Make desktop, tablet, and mobile behavior explicit while preserving editability in native Builder nodes.
- Use verified business and brand evidence; never invent proof, people, projects, addresses, statistics, or contact details.
- Treat the Website Engine brief as constraints and the candidate directive as art direction.
- Internally review hierarchy, section depth, visual variety, conversion flow, accessibility, and image direction before returning JSON.
`;

export function isV10WebsiteEngineContext(context?: Record<string, unknown> | null) {
  return context?.aiGenerationVersion === "v10";
}

export function resolveWebsiteCreativeModel(context?: Record<string, unknown> | null) {
  const override = context?.websiteCreativeModelOverride;
  if (typeof override === "string" && override.trim()) return override.trim();
  return isV10WebsiteEngineContext(context)
    ? process.env.OPENAI_V10_WEBSITE_MODEL || "gpt-5.6-sol"
    : process.env.OPENAI_WEBSITE_MODEL || "gpt-4o";
}

export function websiteCreativeReasoningEffort(model: string) {
  return /^gpt-5\.6(?:-|$)/i.test(model) ? ("none" as const) : undefined;
}

export function websiteCreativeTemperature(model: string, preferred: number) {
  return /^gpt-5\.6(?:-|$)/i.test(model) ? undefined : preferred;
}

export function withOpenAi56WebsiteBuilderProfile(
  prompt: string,
  context?: Record<string, unknown> | null
) {
  return isV10WebsiteEngineContext(context)
    ? `${prompt}\n${OPENAI_56_WEBSITE_BUILDER_PROFILE}`
    : prompt;
}
