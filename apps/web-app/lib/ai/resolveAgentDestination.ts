/**
 * Dashboard "ask BuildEZ anything" chatboxes (CopilotPromptCard) always
 * routed to the general website builder regardless of what was asked —
 * even a request clearly about SEO, page speed, or WhatsApp automation.
 * This classifies a free-text prompt against the specialist AI agents so
 * those requests land on the agent that actually owns the fix, with the
 * general website builder as the fallback for anything else.
 *
 * Deliberately a fast, deterministic keyword match rather than another LLM
 * call — classifying "which of ~10 categories" doesn't need model reasoning,
 * and a wrong guess here only costs a redirect, not a failed generation.
 */
export type AgentDestinationId =
  | "seo-agent"
  | "geo-agent"
  | "speed-agent"
  | "accessibility-agent"
  | "conversion-agent"
  | "quality-agent"
  | "business-agent"
  | "marketing-agent"
  | "whatsapp-agent"
  | "chatbot-agent";

const AGENT_KEYWORDS: ReadonlyArray<readonly [AgentDestinationId, RegExp]> = [
  ["whatsapp-agent", /\bwhatsapp\b/i],
  ["chatbot-agent", /\b(?:chatbot|live chat|chat widget|ai chat assistant)\b/i],
  ["seo-agent", /\b(?:seo|search ranking|meta description|meta title|sitemap|search console|organic traffic|keyword)\b/i],
  ["geo-agent", /\b(?:geo|generative engine optimi[sz]ation|ai search visibility|answer engine|chatgpt search|perplexity)\b/i],
  ["speed-agent", /\b(?:page speed|site speed|core web vitals|lighthouse score|slow (?:page|site|loading)|loading time|performance score)\b/i],
  ["accessibility-agent", /\b(?:accessibility|a11y|wcag|screen reader|alt text|aria label)\b/i],
  ["conversion-agent", /\b(?:conversion rate|cro\b|checkout funnel|abandoned cart|call[- ]to[- ]action|cta\b|bounce rate)\b/i],
  ["quality-agent", /\b(?:broken link|404 error|qa\b|quality (?:check|audit)|cross[- ]browser|bug on (?:the|my) (?:site|page|website))\b/i],
  ["business-agent", /\b(?:business (?:strategy|plan|insights)|revenue growth|market analysis|competitor analysis)\b/i],
  ["marketing-agent", /\b(?:marketing campaign|email campaign|social media (?:post|strategy)|ad copy|content calendar)\b/i],
];

/** Returns the specialist agent this prompt is actually about, or null when it's a general build/edit request. */
export function resolveAgentDestination(prompt: string): AgentDestinationId | null {
  const text = prompt.trim();
  if (!text) return null;
  for (const [agentId, pattern] of AGENT_KEYWORDS) {
    if (pattern.test(text)) return agentId;
  }
  return null;
}
