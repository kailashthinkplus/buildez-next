import { createEngineResult, type BusinessContext, type EngineResult, type WebsiteGoalPlan, type WebsiteSpec } from "../sdk";
import { buildAccessibilityRequirements } from "./accessibilityRequirementBuilder";
import { buildAssetRequirements } from "./assetRequirementBuilder";
import { buildComponentPreferences, buildForbiddenComponents } from "./componentPreferenceBuilder";
import { buildContentRequirements } from "./contentRequirementBuilder";
import { buildConversionRules } from "./conversionRuleBuilder";
import { buildDesignRules } from "./designRuleBuilder";
import { buildFallbackStrategy } from "./fallbackStrategyBuilder";
import { buildMissingFacts } from "./missingFactsBuilder";
import { buildResponsiveRules } from "./responsiveRuleBuilder";
import { buildSectionSpecs } from "./sectionSpecBuilder";
import { buildSeoRequirements } from "./seoRequirementBuilder";
import { validateWebsiteSpecBuilderResult } from "./validation";
import { WEBSITE_SPEC_BUILDER_VERSION_STRING } from "./version";
import { buildWebsiteDNA } from "./websiteDnaBuilder";
import type { WebsiteSpecBuilderInput, WebsiteSpecBuilderResult, WebsiteSpecBuildMetrics, WebsiteSpecBuildWarning } from "./websiteSpec";

function unique(values: readonly string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function buildBusinessContext(input: WebsiteSpecBuilderInput): BusinessContext {
  return Object.freeze({
    businessName: input.businessContext?.businessName ?? input.businessProfile?.identity.name,
    family: input.businessProfile?.businessFamily ?? input.businessContext?.family ?? input.intent?.businessFamily ?? "unknown",
    industryId: input.businessProfile?.industryId ?? input.businessContext?.industryId ?? input.intent?.industryId,
    subIndustryId: input.businessProfile?.subIndustryId ?? input.businessContext?.subIndustryId ?? input.intent?.subIndustryId,
    location: input.businessContext?.location,
    audience: unique([
      ...(input.businessContext?.audience ?? []),
      ...(input.businessProfile?.customerTypes ?? []),
      ...(input.intent?.audience ?? []),
    ]),
    offerings: unique([...(input.businessContext?.offerings ?? []), ...(input.businessProfile?.offerModel ?? [])]),
    differentiators: unique([...(input.businessContext?.differentiators ?? []), ...(input.businessProfile?.differentiation ?? []), ...(input.brandProfile?.differentiation ?? [])]),
    proofPoints: unique([...(input.businessContext?.proofPoints ?? []), ...(input.businessProfile?.trustSignals ?? [])]),
    knownFacts: Object.freeze({ ...(input.businessContext?.knownFacts ?? {}), ...(input.knownFacts ?? {}) }),
    missingFacts: buildMissingFacts(input),
    sourceNotes: unique([...(input.businessContext?.sourceNotes ?? []), "Built by deterministic WebsiteSpec Builder."]),
  });
}

function buildGoals(input: WebsiteSpecBuilderInput): WebsiteGoalPlan {
  return Object.freeze({
    primaryGoal: input.decisionPlan?.selectedWebsiteGoal ?? input.intent?.primaryGoal ?? input.businessProfile?.conversionGoals[0] ?? "unknown",
    secondaryGoals: unique([
      ...(input.businessProfile?.conversionGoals.slice(1) ?? []),
      ...(input.intent?.archetypeHints.map((hint) => `support archetype: ${hint}`) ?? []),
    ]),
    conversionGoals: unique([
      ...(input.businessProfile?.conversionGoals ?? []),
      ...(input.contentStrategy?.ctaStrategy ?? []),
      ...(input.experienceStrategy?.ctaCadence ?? []),
    ]),
  });
}

function buildFactsUsed(input: WebsiteSpecBuilderInput): string[] {
  return unique([
    ...Object.keys(input.businessContext?.knownFacts ?? {}),
    ...Object.keys(input.knownFacts ?? {}),
    ...(input.businessProfile?.trustSignals.map((item) => `trust:${item}`) ?? []),
    ...(input.businessProfile?.differentiation.map((item) => `differentiation:${item}`) ?? []),
    ...(input.brandProfile?.existingBrandAssets.map((item) => `brand-asset:${item}`) ?? []),
  ]);
}

function compileWarnings(input: WebsiteSpecBuilderInput): WebsiteSpecBuildWarning[] {
  const messages = [
    ...(input.componentResult?.warnings ?? []),
    ...(input.compositionResult?.warnings ?? []),
    ...(input.inspirationProfile?.warnings ?? []),
    ...(input.visualMoodProfile?.warnings ?? []),
    ...(input.mediaStrategy?.warnings ?? []),
    ...(input.motionStrategy?.warnings ?? []),
    ...(!input.businessContext && !input.businessProfile ? ["Business context is missing; WebsiteSpec is still explicit about the gap."] : []),
    ...(!input.decisionPlan && !input.intent?.archetypeHints.length ? ["Archetype is not confidently known yet."] : []),
  ];
  return [
    ...messages.map((message) => Object.freeze({ code: "WEBSITE_SPEC_INPUT_WARNING", message, module: "specification", severity: "major" as const })),
    ...(input.constraintResult?.violations ?? []).map((violation) => Object.freeze({
      code: "CONSTRAINT_CARRIED_FORWARD",
      message: violation.message,
      module: "specification",
      targetId: violation.targetId ? String(violation.targetId) : undefined,
      severity: violation.severity === "blocker" ? "major" as const : violation.severity,
    })),
  ];
}

function collectMetrics(result: Omit<WebsiteSpecBuilderResult, "metrics">): WebsiteSpecBuildMetrics {
  return Object.freeze({
    sectionCount: result.sectionSpecs.length,
    contentRequirementCount: result.contentRequirements.length,
    componentPreferenceCount: result.componentPreferences.length,
    assetRequirementCount: result.assetRequirements.length,
    missingFactCount: result.missingFacts.length,
    warningCount: result.warnings.length,
    upstreamInputCount: [
      result.websiteSpec.businessIntelligenceRef,
      result.websiteSpec.brandIntelligenceRef,
      result.websiteSpec.contentStrategyRef,
      result.websiteSpec.experienceStrategyRef,
      result.websiteSpec.patternIntelligenceRef,
    ].filter(Boolean).length,
  });
}

function buildTrace(input: WebsiteSpecBuilderInput): string[] {
  return [
    "website-spec-builder.local-only",
    ...(input.businessProfile ? ["business-intelligence"] : []),
    ...(input.brandProfile ? ["brand-intelligence"] : []),
    ...(input.contentStrategy ? ["content-intelligence"] : []),
    ...(input.experienceStrategy ? ["experience-engine"] : []),
    ...(input.patternIntelligence ? ["pattern-intelligence"] : []),
    ...(input.inspirationProfile ? ["inspiration-engine"] : []),
    ...(input.visualMoodProfile ? ["visual-mood-engine"] : []),
    ...(input.mediaStrategy ? ["media-intelligence"] : []),
    ...(input.motionStrategy ? ["motion-intelligence"] : []),
    ...(input.designResult ? ["design-engine"] : []),
    ...(input.componentResult ? ["component-engine"] : []),
    ...(input.compositionResult ? ["composition-engine"] : []),
    "no-builder-nodes",
    "no-rendering",
    "no-react-css-html-js",
    "no-provider-db-network-llm-mcp",
  ];
}

/**
 * Builds a canonical WebsiteSpec from deterministic upstream Website Engine outputs.
 *
 * @example
 * const spec = buildWebsiteSpec({ businessProfile, contentStrategy });
 */
export function buildWebsiteSpec(input: WebsiteSpecBuilderInput = {}): WebsiteSpec {
  const dnaResult = buildWebsiteDNA(input);
  const sections = buildSectionSpecs(input);
  const missingFacts = buildMissingFacts(input);
  return Object.freeze({
    id: "website-spec.local",
    version: WEBSITE_SPEC_BUILDER_VERSION_STRING,
    business: buildBusinessContext(input),
    businessIntelligenceRef: input.businessProfile ? String(input.businessProfile.id) : undefined,
    brandIntelligenceRef: input.brandProfile ? String(input.brandProfile.id) : undefined,
    contentStrategyRef: input.contentStrategy ? String(input.contentStrategy.id) : undefined,
    experienceStrategyRef: input.experienceStrategy ? String(input.experienceStrategy.id) : undefined,
    patternIntelligenceRef: input.patternIntelligence ? String(input.patternIntelligence.id) : undefined,
    goals: buildGoals(input),
    archetype: input.decisionPlan?.selectedArchetype ?? input.intent?.archetypeHints[0] ?? "unknown",
    dna: dnaResult.dna,
    sections,
    contentRequirements: buildContentRequirements(input),
    componentPreferences: buildComponentPreferences(input),
    forbiddenComponents: buildForbiddenComponents(input),
    designRules: buildDesignRules(input),
    assetRequirements: buildAssetRequirements(input),
    seoRequirements: buildSeoRequirements(input),
    accessibilityRequirements: buildAccessibilityRequirements(input),
    conversionRules: buildConversionRules(input),
    responsiveRules: buildResponsiveRules(input),
    factsUsed: buildFactsUsed(input),
    missingFacts,
    confidence: Math.max(0, Math.min(1, input.decisionPlan?.confidence ?? input.intent?.confidence ?? input.businessProfile?.confidence ?? 0.35)),
    fallbackStrategy: buildFallbackStrategy(input),
  });
}

/**
 * Runs all WebsiteSpec Builder helpers and returns the full result envelope.
 *
 * @example
 * const result = buildWebsiteSpecBuilderResult({ decisionPlan });
 */
export function buildWebsiteSpecBuilderResult(input: WebsiteSpecBuilderInput = {}): WebsiteSpecBuilderResult {
  const websiteDNA = buildWebsiteDNA(input);
  const websiteSpec = buildWebsiteSpec(input);
  const warnings = compileWarnings(input);
  const partial = Object.freeze({
    websiteSpec,
    websiteDNA: websiteDNA.dna,
    sectionSpecs: websiteSpec.sections,
    contentRequirements: websiteSpec.contentRequirements ?? [],
    componentPreferences: websiteSpec.componentPreferences ?? [],
    forbiddenComponents: websiteSpec.forbiddenComponents ?? [],
    designRules: websiteSpec.designRules ?? [],
    assetRequirements: websiteSpec.assetRequirements ?? [],
    seoRequirements: websiteSpec.seoRequirements ?? [],
    accessibilityRequirements: websiteSpec.accessibilityRequirements ?? [],
    conversionRules: websiteSpec.conversionRules ?? [],
    responsiveRules: websiteSpec.responsiveRules ?? [],
    factsUsed: websiteSpec.factsUsed,
    missingFacts: websiteSpec.missingFacts,
    fallbackStrategy: websiteSpec.fallbackStrategy ?? buildFallbackStrategy(input),
    explanations: [
      Object.freeze({
        id: "website-spec-builder.explanation",
        summary: "Built canonical WebsiteSpec and WebsiteDNA from deterministic upstream metadata.",
        inputs: buildTrace(input).filter((item) => !item.startsWith("no-")),
        outputs: ["WebsiteSpec", "WebsiteDNA", "SectionSpec[]"],
        rationale: [
          ...websiteDNA.explanations,
          "Missing facts remain explicit.",
          "WebsiteSpec is canonical before Compiler.",
        ],
      }),
    ],
    warnings,
    trace: buildTrace(input),
  });
  return Object.freeze({ ...partial, metrics: collectMetrics(partial) });
}

/**
 * Runs deterministic local WebsiteSpec Builder.
 *
 * @example
 * const result = runWebsiteSpecBuilder({ intent });
 */
export function runWebsiteSpecBuilder(input: WebsiteSpecBuilderInput = {}): EngineResult<WebsiteSpecBuilderResult> {
  const result = buildWebsiteSpecBuilderResult(input);
  const validation = validateWebsiteSpecBuilderResult(result);
  const validationWarnings: WebsiteSpecBuildWarning[] = validation.issues.map((issue) => Object.freeze({
    code: issue.code,
    message: `${issue.path}: ${issue.message}`,
    module: "specification",
    severity: "major" as const,
  }));
  const finalResult = validationWarnings.length
    ? Object.freeze({ ...result, warnings: [...result.warnings, ...validationWarnings], metrics: Object.freeze({ ...result.metrics, warningCount: result.metrics.warningCount + validationWarnings.length }) })
    : result;
  return createEngineResult({
    module: "specification",
    stage: "website-spec-builder",
    status: validation.valid && finalResult.warnings.length === 0 ? "ok" : "warning",
    data: finalResult,
    warnings: finalResult.warnings,
    metadata: {
      localOnly: true,
      sectionCount: finalResult.metrics.sectionCount,
      missingFactCount: finalResult.metrics.missingFactCount,
      validationIssueCount: validation.issues.length,
      trace: finalResult.trace,
    },
  });
}
