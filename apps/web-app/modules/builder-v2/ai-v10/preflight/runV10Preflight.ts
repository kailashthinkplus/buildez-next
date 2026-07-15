import { callOpenAIChatCompletion, extractAssistantText } from "@/app/api/_lib/openai";
import { runAIPlanner } from "../../website-engine/planner/AIPlanner";

export type V10PreflightOption = Readonly<{
  id: string;
  label: string;
  description: string;
  promptAddition: string;
  contextPatch?: Record<string, string>;
}>;

export type V10PreflightQuestion = Readonly<{
  id: string;
  label: string;
  whyItMatters: string;
  options: readonly V10PreflightOption[];
}>;

export type V10PreflightResult = Readonly<{
  summary: string;
  interpretedUseCase: string;
  engineeredPrompt: string;
  questions: readonly V10PreflightQuestion[];
  agentTrace: readonly { agent: string; stage: string; ok: boolean; summary: string }[];
  timing: Readonly<{ durationMs: number; model: string; tokenBudget: number; fallbackUsed: boolean }>;
  providerStatus?: Readonly<{
    ok: boolean;
    category: "success" | PreflightProviderErrorCategory;
    message?: string;
  }>;
}>;

export type PreflightProviderErrorCategory = "timeout" | "rate_limit" | "quota" | "permission" | "network" | "invalid_response" | "provider_error";

export type V10PreflightDependencies = Readonly<{
  complete: typeof callOpenAIChatCompletion;
}>;

const DEFAULT_DEPENDENCIES: V10PreflightDependencies = Object.freeze({
  complete: callOpenAIChatCompletion,
});

type PreflightOutput = Omit<V10PreflightResult, "agentTrace" | "timing">;

export const DEFAULT_V10_PREFLIGHT_MODEL = "gpt-4o-mini";
export const DEFAULT_V10_PREFLIGHT_TOKEN_BUDGET = 2000;
export const DEFAULT_V10_PREFLIGHT_TIMEOUT_MS = 12000;
const MAX_V10_PREFLIGHT_TOTAL_MS = 15000;

export function resolveV10PreflightConfig(env: NodeJS.ProcessEnv = process.env) {
  const requestedBudget = Number(env.OPENAI_V10_PREFLIGHT_MAX_COMPLETION_TOKENS || DEFAULT_V10_PREFLIGHT_TOKEN_BUDGET);
  const requestedTimeout = Number(env.OPENAI_V10_PREFLIGHT_TIMEOUT_MS || DEFAULT_V10_PREFLIGHT_TIMEOUT_MS);
  return {
    model: env.OPENAI_V10_PREFLIGHT_MODEL?.trim() || DEFAULT_V10_PREFLIGHT_MODEL,
    tokenBudget: Number.isFinite(requestedBudget) ? Math.max(1200, Math.min(2400, Math.floor(requestedBudget))) : DEFAULT_V10_PREFLIGHT_TOKEN_BUDGET,
    timeoutMs: Number.isFinite(requestedTimeout) ? Math.max(5000, Math.floor(requestedTimeout)) : DEFAULT_V10_PREFLIGHT_TIMEOUT_MS,
  };
}

export function classifyPreflightProviderError(error: unknown): PreflightProviderErrorCategory {
  const text = error instanceof Error ? `${error.name} ${error.message}` : String(error);
  if (/insufficient_quota/i.test(text)) return "quota";
  if (/insufficient permissions|openai api error \((401|403)\)|\b(401|403)\b/i.test(text)) return "permission";
  if (/rate_limit|rate limit|openai api error \(429\)|\b429\b/i.test(text)) return "rate_limit";
  if (/timeout|timed out|abort/i.test(text)) return "timeout";
  if (/network request failed|fetch failed|econnreset|socket/i.test(text)) return "network";
  if (/website strategy response|json|parse|unexpected end/i.test(text)) return "invalid_response";
  return "provider_error";
}

function safeProviderMessage(category: PreflightProviderErrorCategory) {
  const messages: Record<PreflightProviderErrorCategory, string> = {
    timeout: "The optional AI brief service timed out.",
    rate_limit: "The optional AI brief service was temporarily rate-limited.",
    quota: "The optional AI brief service quota was unavailable.",
    permission: "The optional AI brief service was not permitted for this request.",
    network: "The optional AI brief service could not be reached.",
    invalid_response: "The optional AI brief service returned an incomplete response.",
    provider_error: "The optional AI brief service was temporarily unavailable.",
  };
  return messages[category];
}

function shouldRetryProvider(category: PreflightProviderErrorCategory) {
  return category === "rate_limit" || category === "network" || category === "provider_error" || category === "invalid_response";
}

function isNonRetryableProviderError(error: unknown) {
  const text = error instanceof Error ? error.message : String(error);
  return /insufficient_quota|insufficient permissions|openai api error \((401|403|404)\)|unsupported model|model.*not.*supported|invalid_request_error|invalid request/i.test(text);
}

function parse(value: string): PreflightOutput {
  const block = value.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)?.[1] ?? value;
  const start = block.indexOf("{");
  const end = block.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("The website strategy response was incomplete. Please try again.");
  return JSON.parse(block.slice(start, end + 1));
}

function wordCount(value: unknown) {
  return typeof value === "string" ? value.trim().split(/\s+/).filter(Boolean).length : 0;
}

function limitWords(value: string, maximum: number) {
  const words = value.trim().split(/\s+/).filter(Boolean);
  return words.length <= maximum ? words.join(" ") : words.slice(0, maximum).join(" ");
}

function compactOutput(output: PreflightOutput): PreflightOutput {
  return {
    ...output,
    summary: limitWords(output.summary || "", 25),
    interpretedUseCase: limitWords(output.interpretedUseCase || "", 20),
    engineeredPrompt: limitWords(output.engineeredPrompt || "", 250),
    questions: Array.isArray(output.questions) ? output.questions.map((question) => ({
      ...question,
      options: Array.isArray(question.options) ? question.options.map((option) => ({
        ...option,
        label: limitWords(option.label || "", 8),
        description: limitWords(option.description || "", 25),
        promptAddition: limitWords(option.promptAddition || "", 25),
      })) : question.options,
    })) : output.questions,
  };
}

function validateOutput(output: PreflightOutput) {
  if (!Array.isArray(output.questions) || output.questions.length !== 4 || output.questions.some((question) => !Array.isArray(question.options) || question.options.length !== 3)) {
    throw new Error("The website strategy did not produce the required decisions. Please try again.");
  }
  const lengthInvalid = wordCount(output.summary) < 1
    || wordCount(output.summary) > 25
    || wordCount(output.interpretedUseCase) < 1
    || wordCount(output.interpretedUseCase) > 20
    || wordCount(output.engineeredPrompt) < 1
    || wordCount(output.engineeredPrompt) > 250
    || output.questions.some((question) => question.options.some((option) =>
      wordCount(option.label) < 1
      || wordCount(option.label) > 8
      || wordCount(option.description) < 1
      || wordCount(option.description) > 25
      || wordCount(option.promptAddition) < 1
      || wordCount(option.promptAddition) > 25
    ));
  if (lengthInvalid) throw new Error("The website strategy response was incomplete. Please try again.");
}

function deterministicPreflight(input: { prompt: string; context?: Record<string, unknown> | null }, planner: ReturnType<typeof runAIPlanner>["data"]): PreflightOutput {
  const context = input.context || {};
  const intent = planner.interpretedIntent;
  const business = typeof context.companyName === "string" && context.companyName.trim() ? context.companyName.trim() : "the business";
  const industry = typeof context.industry === "string" && context.industry.trim()
    ? context.industry.trim()
    : intent?.businessFamily?.replace(/_/g, " ") || "business";
  const audience = typeof context.audience === "string" && context.audience.trim() ? context.audience.trim() : intent?.audience?.[0] || "qualified customers";
  const useCase = intent?.summary || `${industry} website for ${business}`;
  const question = (id: string, label: string, whyItMatters: string, options: Array<[string, string, string]>) => ({
    id,
    label,
    whyItMatters,
    options: options.map(([optionLabel, description, promptAddition], index) => ({ id: `${id}-${index + 1}`, label: optionLabel, description, promptAddition })),
  });
  return {
    summary: `A focused ${industry} website for ${audience}, shaped around four decisions that materially change the visitor journey.`,
    interpretedUseCase: limitWords(useCase, 20),
    engineeredPrompt: limitWords(`Create the requested website for ${business}, serving ${audience} in the ${industry} use case. Treat the supplied request and saved context as authoritative, and do not invent business facts, credentials, project names, prices, statistics, testimonials, awards, or locations. Build a clear narrative from immediate relevance through differentiated value, useful evidence, offer exploration, objection handling, and a focused conversion close. Use varied editorial compositions instead of repeating identical card grids or balanced split sections. Establish deliberate hierarchy through typography, spacing, contrast, image scale, and section rhythm. Give every section a distinct communication job and an editable native Builder structure. Content must sound customer-facing, specific to the detected use case, concise, and free from internal instructions or placeholder language. Imagery should support the selected direction with truthful alt text and practical generation prompts. Prioritize responsive behavior across desktop, tablet, and mobile, including readable line lengths, clear tap targets, sensible stacking, and preserved content order. Maintain accessible heading structure, contrast, focus behavior, and motion restraint. Use calls to action consistently without placing the same button everywhere. The Website Engine owns detailed component selection, composition, validation, and final specification. Original request: ${input.prompt}`, 250),
    questions: [
      question("conversion", `How should ${business} convert visitors?`, "This determines the page journey and strongest calls to action.", [
        ["Book a qualified consultation", "Guide serious visitors toward a scheduled conversation after establishing fit and trust.", "Build toward a consultation or appointment conversion."],
        ["Compare offers before contact", "Help visitors understand choices and evidence before inviting a focused enquiry.", "Prioritize offer comparison before the enquiry step."],
        ["Start with direct action", "Make the primary transaction or request immediately available with supporting reassurance nearby.", "Put the primary direct action at the center of the journey."],
      ]),
      question("art-direction", `Which visual story suits ${industry}?`, "This changes hierarchy, composition, typography, and visual rhythm.", [
        ["Editorial story with visual pauses", "Use expressive typography, asymmetric compositions, and calm transitions between ideas.", "Use an editorial narrative with asymmetric visual pauses."],
        ["Immersive imagery-led journey", "Let large relevant visuals create emotion while concise copy guides the next action.", "Lead with immersive imagery and restrained supporting copy."],
        ["Structured evidence-led presentation", "Use precise hierarchy and clearly organized evidence for confident comparison.", "Use a structured evidence-led visual system."],
      ]),
      question("proof", `What should earn ${audience} trust?`, "This determines which evidence appears early and how claims are supported.", [
        ["Lead with measurable evidence", "Prioritize verified outcomes, scale, credentials, or performance signals where supplied.", "Place verified measurable evidence early in the narrative."],
        ["Show process and expertise", "Explain how the work happens and what makes the approach dependable.", "Build trust through a clear process and expertise story."],
        ["Use detailed portfolio stories", "Demonstrate value through selected work, offers, or outcomes with useful context.", "Use detailed portfolio or outcome stories as primary proof."],
      ]),
      question("imagery", `How should visitors experience ${business}?`, "This shapes image subjects, sequencing, atmosphere, and interaction depth.", [
        ["Document real work authentically", "Favor credible environments, products, projects, or services over generic stock scenes.", "Use authentic documentary imagery of the real work."],
        ["Explain the experience step by step", "Use visuals to make the customer journey, process, or service easier to understand.", "Sequence imagery around the customer experience."],
        ["Balance environments and people", "Combine contextual spaces with human moments for scale, relevance, and warmth.", "Balance contextual environments with natural human moments."],
      ]),
    ],
  };
}

export async function runV10Preflight(input: {
  prompt: string;
  context?: Record<string, unknown> | null;
}, dependencies: V10PreflightDependencies = DEFAULT_DEPENDENCIES): Promise<V10PreflightResult> {
  const planner = runAIPlanner({ prompt: input.prompt }).data;
  const startedAt = Date.now();
  const config = resolveV10PreflightConfig();
  const messages = [
    {
      role: "system" as const,
      content: `You are the BuildEZ v10 Brief Architect. Before website generation, convert a raw request into an expert website brief and a short set of meaningful choices. Return one complete JSON object only. Keep the entire response below 1,500 tokens and never truncate JSON.

Create exactly 4 questions tailored to the detected industry and use case:
1. primary conversion/business outcome,
2. visual/art-direction approach,
3. content/proof strategy,
4. imagery or experience strategy.

Each question has exactly 3 concrete options. Never use generic labels such as Professional, Premium, Modern, Friendly, Bold, Generate leads, or Other by themselves. Options must describe materially different outcomes a non-designer can understand. Include contextPatch only when it adds useful saved context.

Keep summary at 25 words or fewer and interpretedUseCase at 20 words or fewer. engineeredPrompt must be a compact 150–250 word downstream brief covering audience, goal, journey, visual direction, layout variety, content and imagery direction, conversion, responsiveness, accessibility, and anti-generic constraints. It is not a complete website specification; the Website Engine owns detailed specification and composition. Option labels are at most 8 words, descriptions at most 25 words, and promptAddition is one concise instruction. Do not invent business facts. Do not begin generation.`,
    },
    {
      role: "user" as const,
      content: JSON.stringify({
        rawPrompt: input.prompt,
        savedContext: input.context || {},
        plannerInterpretation: planner.interpretedIntent,
        requiredSchema: {
          summary: "one-sentence interpretation shown to user",
          interpretedUseCase: "specific industry and website use case",
          engineeredPrompt: "compact 150–250 word generation brief, not a website specification",
          questions: [{ id: "stable-id", label: "question", whyItMatters: "short explanation", options: [{ id: "stable-id", label: "specific choice", description: "impact", promptAddition: "instructions appended to brief", contextPatch: { designIntent: "optional" } }] }],
        },
      }),
    },
  ];
  let output: PreflightOutput | undefined;
  let fallbackUsed = false;
  let providerCategory: PreflightProviderErrorCategory | "success" = "success";
  for (let attempt = 0; attempt < 2 && !output; attempt += 1) {
    try {
      const remainingMs = MAX_V10_PREFLIGHT_TOTAL_MS - (Date.now() - startedAt);
      if (remainingMs <= 0) {
        providerCategory = "timeout";
        break;
      }
      const completion = await dependencies.complete({
        debugLabel: `v10-preflight-strategy-${attempt + 1}`,
        model: config.model,
        maxCompletionTokens: config.tokenBudget,
        timeoutMs: Math.min(config.timeoutMs, remainingMs),
        responseFormat: "json_object",
        messages: attempt === 0 ? messages : [
          ...messages,
          { role: "user", content: "The previous JSON was incomplete. Return the complete compact JSON object now. Do not add commentary and do not omit any required field." },
        ],
      });
      const candidate = compactOutput(parse(extractAssistantText(completion)));
      validateOutput(candidate);
      output = candidate;
    } catch (error) {
      providerCategory = classifyPreflightProviderError(error);
      if (providerCategory === "timeout" || isNonRetryableProviderError(error) || !shouldRetryProvider(providerCategory)) break;
    }
  }
  if (!output) {
    output = compactOutput(deterministicPreflight(input, planner));
    validateOutput(output);
    fallbackUsed = true;
  }
  const fallbackSummary = "Prepared a deterministic Engine-ready brief after the optional AI strategy service was unavailable.";
  return {
    ...output,
    agentTrace: [
      { agent: "IntentAgent", stage: "preflight-intent", ok: true, summary: `Interpreted ${output.interpretedUseCase}.` },
      { agent: "BriefArchitectAgent", stage: "prompt-engineering", ok: true, summary: fallbackUsed ? fallbackSummary : "Converted the request into an Engine-ready generation brief." },
      { agent: "DecisionInterviewAgent", stage: "user-decisions", ok: true, summary: fallbackUsed ? "Prepared four use-case-aware decisions using the local fallback." : "Prepared four use-case-aware decisions for user approval." },
    ],
    timing: { durationMs: Date.now() - startedAt, model: config.model, tokenBudget: config.tokenBudget, fallbackUsed },
    providerStatus: fallbackUsed
      ? { ok: false, category: providerCategory === "success" ? "invalid_response" : providerCategory, message: safeProviderMessage(providerCategory === "success" ? "invalid_response" : providerCategory) }
      : { ok: true, category: "success" },
  };
}
