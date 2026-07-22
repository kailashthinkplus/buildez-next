import { createEngineResult, createEngineWarning, type EngineResult, type EngineWarning, type GenerationDecision, type JsonValue } from "../sdk";
import { detectInspirationRisks } from "./inspirationRisks";
import { matchInspirationProfiles } from "./inspirationMatching";
import { scoreInspirationMatches } from "./inspirationScoring";
import { buildInspirationSources } from "./inspirationSources";
import { extractInspirationTraits, traitsByKind } from "./inspirationTraits";
import { type InspirationInput, type InspirationMetrics, type InspirationProfile, resolveInspirationFamilyContext } from "./inspirationProfile";
import { validateInspirationProfile, validationIssuesToInspirationErrors } from "./validation";
import { INSPIRATION_ENGINE_VERSION_STRING } from "./version";

function deterministicId(input: InspirationInput, family: string) {
  const source = [input.businessProfile?.id, input.brandProfile?.id, input.designResult?.id, family]
    .filter(Boolean).join("-").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 72);
  return `inspiration.${source || "unknown"}`;
}

function warning(code: string, message: string, severity: EngineWarning["severity"] = "minor", metadata?: Record<string, JsonValue>) {
  return createEngineWarning(code, message, "inspiration", severity, metadata);
}

function metrics(sourceCount: number, matchCount: number, riskCount: number, warningCount: number): InspirationMetrics {
  return Object.freeze({ sourceCount, matchCount, riskCount, warningCount });
}

export function buildInspirationProfile(input: InspirationInput): InspirationProfile {
  const familyContext = resolveInspirationFamilyContext(input);
  const sources = buildInspirationSources();
  const matches = matchInspirationProfiles(input, familyContext, sources).sort((left, right) => right.score.overall - left.score.overall);
  const selectedMatches = matches.filter((match) => match.score.overall >= 0.55).slice(0, 4);
  const selectedSources = sources.filter((source) => selectedMatches.some((match) => match.sourceId === source.id));
  const traits = extractInspirationTraits(sources, selectedMatches);
  const risks = detectInspirationRisks(input, sources, selectedMatches);
  const confidence = scoreInspirationMatches(matches);
  return Object.freeze({
    id: deterministicId(input, familyContext.family),
    version: INSPIRATION_ENGINE_VERSION_STRING,
    selectedInspirationCategories: selectedSources.map((source) => source.category),
    inspirationTraits: traits.map((trait) => `${trait.kind}: ${trait.value}`),
    spacingTraits: traitsByKind(traits, "spacing"),
    typographyTraits: traitsByKind(traits, "typography"),
    compositionTraits: traitsByKind(traits, "composition"),
    motionPhilosophy: traitsByKind(traits, "motion"),
    imageryStyle: traitsByKind(traits, "imagery"),
    navigationStyle: traitsByKind(traits, "navigation"),
    ctaStyle: traitsByKind(traits, "cta"),
    cardStyle: traitsByKind(traits, "card"),
    backgroundStyle: traitsByKind(traits, "background"),
    interactionStyle: traitsByKind(traits, "interaction"),
    suitableIndustries: Array.from(new Set(selectedSources.flatMap((source) => source.suitableIndustries.map(String)))),
    unsuitableIndustries: Array.from(new Set(selectedSources.flatMap((source) => source.unsuitableIndustries.map(String)))),
    risks,
    confidence: confidence.score,
    explanations: [
      `Resolved inspiration family as ${familyContext.family}.`,
      `Selected ${selectedSources.length} inspiration categories from local metadata.`,
      "Inspiration is metadata only and must not be copied from websites.",
    ],
    warnings: [],
  });
}

function createDecision(profile: InspirationProfile): GenerationDecision {
  return Object.freeze({
    id: "inspiration.decision.profile",
    stage: "inspiration",
    selected: profile.selectedInspirationCategories,
    rejected: ["website_scraping", "provider_calls", "copying_websites", "component_selection", "builder_nodes"],
    rationale: "Deterministic local inspiration metadata selected without fetching or copying websites.",
    inputs: profile.inspirationTraits,
    outputs: ["InspirationProfile"],
    confidence: profile.confidence,
    warnings: profile.confidence < 0.55 ? ["low-confidence"] : [],
  });
}

export function runInspirationEngine(input: InspirationInput = {}): EngineResult<InspirationProfile> {
  const profile = buildInspirationProfile(input);
  const warnings = [
    ...(profile.confidence < 0.55 ? [warning("LOW_INSPIRATION_CONFIDENCE", "Inspiration confidence is low; more brand/design context should be provided.", "major", { confidence: profile.confidence })] : []),
    ...(input.missingFacts?.length || input.missingAssets?.length ? [warning("MISSING_INSPIRATION_FACTS", "Missing facts/assets remain explicit and were not converted into inspiration claims.", "minor")] : []),
  ];
  const data: InspirationProfile = Object.freeze({ ...profile, warnings: warnings.map((item) => item.message) });
  const validation = validateInspirationProfile(data);
  const errors = validation.valid ? [] : validationIssuesToInspirationErrors(validation.issues);
  return createEngineResult({
    module: "inspiration",
    stage: "profile",
    status: errors.length ? "error" : warnings.length ? "warning" : "ok",
    data,
    warnings,
    errors,
    decisions: [createDecision(data)],
    confidence: data.confidence,
    metadata: {
      localOnly: true,
      noLlm: true,
      noDb: true,
      noNetwork: true,
      noProviders: true,
      noScraping: true,
      noCopying: true,
      noGeneration: true,
      noBuilderNodes: true,
      realEstateIsFixtureOnly: true,
      explanations: data.explanations,
      risks: data.risks as unknown as JsonValue,
      metrics: metrics(buildInspirationSources().length, data.selectedInspirationCategories.length, data.risks.length, warnings.length) as unknown as Record<string, JsonValue>,
      validationIssues: validation.issues.map((issue) => `${issue.path}:${issue.code}`),
    },
  });
}

export const InspirationEngine = Object.freeze({ run: runInspirationEngine });
