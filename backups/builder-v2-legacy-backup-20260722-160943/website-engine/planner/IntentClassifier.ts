import { modelGateway } from "../model-gateway";
import type {
  IntentClassifierInput,
  WebsiteGoal,
  WebsiteIndustry,
  WebsiteIntentClassification,
} from "./types";

function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function signalText(input: IntentClassifierInput) {
  return [
    input.prompt,
    input.pageTitle,
    input.siteName,
    text(input.context?.industry),
    text(input.context?.useCase),
    text(input.context?.audience),
    text(input.context?.offer),
    text(input.context?.location),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function inferIndustry(raw: string): WebsiteIndustry {
  if (/real estate|property|villa|apartment|developer|builder|construction/.test(raw)) {
    return "real-estate";
  }
  if (/clinic|doctor|medical|hospital|dental|dermatology|health/.test(raw)) {
    return "healthcare";
  }
  if (/restaurant|cafe|hotel|resort|hospitality|dining/.test(raw)) {
    return "hospitality";
  }
  if (/shop|store|ecommerce|product|retail|fashion|beauty/.test(raw)) {
    return "ecommerce";
  }
  if (/saas|software|platform|app|dashboard/.test(raw)) return "saas";
  if (/school|college|academy|course|education/.test(raw)) return "education";
  if (/law|legal|attorney|advocate/.test(raw)) return "legal";
  if (/finance|wealth|accounting|insurance|bank/.test(raw)) return "finance";
  if (/portfolio|artist|designer|photographer|studio/.test(raw)) return "portfolio";
  if (/consulting|agency|services/.test(raw)) return "professional-services";
  return "unknown";
}

function inferGoal(raw: string, industry: WebsiteIndustry): WebsiteGoal {
  if (/appointment|book|schedule/.test(raw)) return "appointment-booking";
  if (/reserve|reservation|table|room/.test(raw)) return "reservation";
  if (/buy|shop|order|checkout/.test(raw)) return "sales";
  if (industry === "portfolio") return "portfolio-enquiry";
  if (/learn|information|brochure/.test(raw)) return "information";
  return "lead-generation";
}

function deterministicClassification(
  input: IntentClassifierInput
): WebsiteIntentClassification {
  const raw = signalText(input);
  const industry = inferIndustry(raw);
  const primaryGoal = inferGoal(raw, industry);

  return {
    industry,
    businessType:
      industry === "unknown" ? "business website" : `${industry} website`,
    archetype:
      industry === "real-estate"
        ? "real-estate-lead-generation"
        : `${industry}-conversion`,
    primaryGoal,
    secondaryGoals: primaryGoal === "lead-generation" ? [] : ["lead-generation"],
    targetAudience:
      industry === "real-estate"
        ? "buyers comparing projects and booking site visits"
        : "qualified visitors comparing trust, fit, and next steps",
    buyerJourney: ["arrive", "understand", "compare", "trust", "act"],
    conversionFunnel: ["hero CTA", "proof", "offer details", "final CTA"],
    locationAwareness: text(input.context?.location),
    trustSignals: [],
    brandPersonality: ["credible", "clear", "premium"],
    tone: text(input.context?.tone) || "professional",
    visualDirection:
      industry === "real-estate"
        ? "premium architectural, image-led, calm buyer confidence"
        : "premium, specific, conversion-focused",
    expectedDeliverable: "production-ready editable website specification",
    confidence: industry === "unknown" ? 45 : 72,
    evidence: [industry === "unknown" ? "No strong industry signal found." : `Detected ${industry} from prompt/context.`],
    missingContext: [],
  };
}

function parseJsonObject(value: string) {
  try {
    return JSON.parse(value) as Record<string, unknown>;
  } catch {
    const match = value.match(/\{[\s\S]*\}/);
    return match ? (JSON.parse(match[0]) as Record<string, unknown>) : {};
  }
}

function normalizeClassification(
  parsed: Record<string, unknown>,
  fallback: WebsiteIntentClassification
): WebsiteIntentClassification {
  return {
    ...fallback,
    ...parsed,
    industry:
      typeof parsed.industry === "string"
        ? (parsed.industry as WebsiteIndustry)
        : fallback.industry,
    primaryGoal:
      typeof parsed.primaryGoal === "string"
        ? (parsed.primaryGoal as WebsiteGoal)
        : fallback.primaryGoal,
    secondaryGoals: Array.isArray(parsed.secondaryGoals)
      ? (parsed.secondaryGoals.filter(Boolean).map(String) as WebsiteGoal[])
      : fallback.secondaryGoals,
    buyerJourney: Array.isArray(parsed.buyerJourney)
      ? parsed.buyerJourney.filter(Boolean).map(String)
      : fallback.buyerJourney,
    conversionFunnel: Array.isArray(parsed.conversionFunnel)
      ? parsed.conversionFunnel.filter(Boolean).map(String)
      : fallback.conversionFunnel,
    trustSignals: Array.isArray(parsed.trustSignals)
      ? parsed.trustSignals.filter(Boolean).map(String)
      : fallback.trustSignals,
    brandPersonality: Array.isArray(parsed.brandPersonality)
      ? parsed.brandPersonality.filter(Boolean).map(String)
      : fallback.brandPersonality,
    evidence: Array.isArray(parsed.evidence)
      ? parsed.evidence.filter(Boolean).map(String)
      : fallback.evidence,
    missingContext: Array.isArray(parsed.missingContext)
      ? parsed.missingContext.filter(Boolean).map(String)
      : fallback.missingContext,
    confidence:
      typeof parsed.confidence === "number" ? parsed.confidence : fallback.confidence,
  };
}

export async function classifyWebsiteIntent(
  input: IntentClassifierInput
): Promise<WebsiteIntentClassification> {
  const fallback = deterministicClassification(input);
  const context = input.context || {};
  const cacheKey = `intent:${JSON.stringify({
    prompt: input.prompt,
    pageTitle: input.pageTitle,
    siteName: input.siteName,
    industry: context.industry,
    useCase: context.useCase,
    audience: context.audience,
    offer: context.offer,
  })}`;

  try {
    const response = await modelGateway.complete({
      task: "classify",
      debugLabel: "v10-website-engine-intent-classifier",
      temperature: 0,
      maxOutputTokens: 700,
      cacheKey,
      budget: {
        maxInputTokens: 2400,
        maxOutputTokens: 800,
        maxEstimatedCents: 1,
      },
      messages: [
        {
          role: "system",
          content:
            "You classify website generation requests for BuildEZ. Return strict JSON only. Do not design layouts.",
        },
        {
          role: "user",
          content: JSON.stringify(
            {
              prompt: input.prompt,
              pageTitle: input.pageTitle,
              siteName: input.siteName,
              context,
              requiredShape: fallback,
              allowedIndustries: [
                "real-estate",
                "healthcare",
                "hospitality",
                "ecommerce",
                "saas",
                "education",
                "legal",
                "finance",
                "portfolio",
                "professional-services",
                "unknown",
              ],
            },
            null,
            2
          ),
        },
      ],
    });

    return normalizeClassification(parseJsonObject(response.text), fallback);
  } catch {
    return fallback;
  }
}

export function classifyWebsiteIntentDeterministic(
  input: IntentClassifierInput
) {
  return deterministicClassification(input);
}
