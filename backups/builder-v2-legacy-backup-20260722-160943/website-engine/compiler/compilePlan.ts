import { createEngineResult, type EngineResult } from "../sdk";
import { compileAssets } from "./assetCompiler";
import { collectCompilerMetadataVersions, COMPILED_WEBSITE_PLAN_VERSION } from "./compiledPlan";
import type { CompilerInput, CompilerMetrics, CompilerResult, CompilerWarning, CompiledWebsitePlan } from "./compiledPlan";
import { compileComponents } from "./componentCompiler";
import { compileCreativeDirection } from "./creativeCompiler";
import { compileQualityGates } from "./qualityGateCompiler";
import { compileResponsiveRules } from "./responsiveCompiler";
import { compileSections } from "./sectionCompiler";
import { compileTrace } from "./traceCompiler";
import { validateCompiledWebsitePlan } from "./validation";

function unique(values: readonly (string | undefined)[]) {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value))));
}

function compileThemeIntent(input: CompilerInput) {
  return unique([
    input.designResult?.designLanguage.name,
    input.designResult?.themeProfile.themeName,
    input.designResult?.themeProfile.radius ? `radius: ${input.designResult.themeProfile.radius}` : undefined,
    input.designResult?.themeProfile.shadow ? `shadow: ${input.designResult.themeProfile.shadow}` : undefined,
    ...(input.designResult?.themeProfile.background ?? []),
    input.decisionPlan.selectedDesignLanguage,
  ]);
}

function compileVisualMoodSummary(input: CompilerInput) {
  const mood = input.visualMoodProfile;
  if (!mood) return [];
  return unique([
    `emotion: ${mood.primaryEmotion} / ${mood.secondaryEmotion}`,
    `lighting: ${mood.lighting.kind}`,
    `camera: ${mood.cameraLanguage.kind}`,
    `image style: ${mood.imageStyle.primary}`,
    `atmosphere: ${mood.atmosphere.tone}`,
    `contrast: ${mood.contrast.level}`,
  ]);
}

function compileMediaStrategySummary(input: CompilerInput) {
  const media = input.mediaStrategy;
  if (!media) return [];
  return unique([
    `readiness: ${media.assetReadiness.score}`,
    ...media.realAssetRequirements.map((item) => `real asset required: ${item}`),
    ...media.stockRiskWarnings.map((item) => `stock risk: ${item}`),
  ]);
}

function compileMotionStrategySummary(input: CompilerInput) {
  const motion = input.motionStrategy;
  if (!motion) return [];
  return unique([
    `language: ${motion.motionLanguage}`,
    `scroll: ${motion.scrollBehavior.strategy}`,
    `reveal: ${motion.revealStrategy.primary}`,
    `parallax: ${motion.parallaxStrategy.level}`,
    `reduced motion: ${motion.reducedMotion.strategy}`,
  ]);
}

function compileCtaPlan(input: CompilerInput) {
  return unique([
    input.decisionPlan.selectedCTAStrategy,
    ...(input.contentStrategy?.ctaStrategy ?? []),
    ...(input.experienceStrategy?.ctaCadence ?? []),
    ...(input.compositionResult?.ctaCadence.notes ?? []),
  ]);
}

function compileSeoPlan(input: CompilerInput) {
  return unique([
    input.decisionPlan.selectedSEOStrategy,
    ...(input.contentStrategy?.seoContentStrategy ?? []),
    ...(input.websiteSpec?.seoRequirements ?? []),
  ]);
}

function compileAccessibilityPlan(input: CompilerInput) {
  return unique([
    input.decisionPlan.selectedAccessibilityStrategy,
    ...(input.websiteSpec?.accessibilityRequirements ?? []),
    ...(input.designResult?.accessibilityContrastNotes ?? []),
    ...(input.motionStrategy?.accessibilityNotes ?? []),
  ]);
}

function missingFactLabels(input: CompilerInput, sections: CompiledWebsitePlan["sections"]) {
  return unique([
    ...(input.websiteSpec?.missingFacts ?? []).map((fact) => fact.label ?? String(fact.id)),
    ...(input.businessProfile?.missingBusinessFacts ?? []).map((fact) => fact.label),
    ...(input.brandProfile?.missingBrandFacts ?? []),
    ...(input.contentStrategy?.missingContentFacts ?? []),
    ...sections.flatMap((section) => section.missingFacts),
    ...input.decisionPlan.warnings.filter((warning) => warning.toLowerCase().includes("missing fact")),
  ]);
}

function missingAssetLabels(input: CompilerInput) {
  return unique([
    ...(input.mediaStrategy?.missingAssets ?? []),
    ...(input.componentResult?.recommendedSelections.flatMap((selection) => selection.requirements.missingAssets) ?? []),
    ...(input.designResult?.brandAdaptationReport.missingAssets ?? []),
  ]);
}

function compileWarnings(input: CompilerInput): CompilerWarning[] {
  const textWarnings = [
    ...input.decisionPlan.warnings,
    ...(input.componentResult?.warnings ?? []),
    ...(input.compositionResult?.warnings ?? []),
    ...(input.inspirationProfile?.warnings ?? []),
    ...(input.visualMoodProfile?.warnings ?? []),
    ...(input.mediaStrategy?.warnings ?? []),
    ...(input.motionStrategy?.warnings ?? []),
  ];
  return [
    ...textWarnings.map((message) => Object.freeze({ code: "UPSTREAM_WARNING", message, severity: "major" as const })),
    ...(input.constraintResult?.violations ?? []).map((violation) => Object.freeze({
      code: "CONSTRAINT_VIOLATION",
      message: violation.message,
      targetId: violation.targetId ? String(violation.targetId) : undefined,
      severity: violation.severity === "blocker" ? "major" as const : violation.severity,
    })),
  ];
}

/**
 * Collects compiler metrics for a compiled plan.
 *
 * @example
 * const metrics = collectCompilerMetrics(plan);
 */
export function collectCompilerMetrics(plan: CompiledWebsitePlan): CompilerMetrics {
  return Object.freeze({
    sectionCount: plan.sections.length,
    componentCount: plan.components.length,
    assetRequirementCount: plan.assetRequirements.length,
    responsiveRuleCount: plan.responsivePlan.length,
    qualityGateCount: plan.qualityGates.length,
    warningCount: plan.warnings.length,
    missingFactCount: plan.missingFacts.length,
    missingAssetCount: plan.missingAssets.length,
    upstreamInputCount: Object.keys(plan.metadata.engineVersions).length,
  });
}

/**
 * Compiles upstream Website Engine decisions into a mapper-ready plan.
 *
 * @example
 * const plan = compileWebsitePlan({ decisionPlan });
 */
export function compileWebsitePlan(input: CompilerInput): CompiledWebsitePlan {
  const sections = compileSections(input);
  const components = compileComponents(input, sections);
  const assetRequirements = compileAssets(input);
  const responsivePlan = compileResponsiveRules(input, sections);
  const qualityGates = compileQualityGates(input);
  const warnings = compileWarnings(input);

  return Object.freeze({
    id: "compiled-website-plan.local",
    version: COMPILED_WEBSITE_PLAN_VERSION,
    engineVersion: COMPILED_WEBSITE_PLAN_VERSION,
    decisionPlanId: String(input.decisionPlan.id),
    specId: input.websiteSpec ? String(input.websiteSpec.id) : undefined,
    selectedBusinessFamily: input.decisionPlan.selectedBusinessFamily,
    selectedIndustry: input.decisionPlan.selectedIndustry,
    selectedArchetype: input.decisionPlan.selectedArchetype,
    selectedWebsiteGoal: input.decisionPlan.selectedWebsiteGoal,
    selectedDesignLanguage: input.decisionPlan.selectedDesignLanguage,
    selectedCompositionStrategy: input.decisionPlan.selectedCompositionStrategy,
    designTokens: input.designResult?.designTokens,
    themeIntent: compileThemeIntent(input),
    creativeDirection: compileCreativeDirection(input),
    visualMoodSummary: compileVisualMoodSummary(input),
    mediaStrategySummary: compileMediaStrategySummary(input),
    motionStrategySummary: compileMotionStrategySummary(input),
    sections,
    components,
    assetRequirements,
    ctaPlan: compileCtaPlan(input),
    seoPlan: compileSeoPlan(input),
    accessibilityPlan: compileAccessibilityPlan(input),
    responsivePlan,
    qualityGates,
    missingFacts: missingFactLabels(input, sections),
    missingAssets: missingAssetLabels(input),
    constraintViolations: (input.constraintResult?.violations ?? []).map((violation) => violation.ruleId),
    explanations: [
      Object.freeze({
        id: "compiler-explanation.plan",
        summary: "Compiled mapper-ready Website Engine plan from deterministic upstream modules.",
        inputs: [
          String(input.decisionPlan.id),
          ...(input.websiteSpec ? [String(input.websiteSpec.id)] : []),
          ...(input.businessProfile ? [String(input.businessProfile.id)] : []),
          ...(input.brandProfile ? [String(input.brandProfile.id)] : []),
          ...(input.contentStrategy ? [String(input.contentStrategy.id)] : []),
          ...(input.experienceStrategy ? [String(input.experienceStrategy.id)] : []),
          ...(input.patternIntelligence ? [String(input.patternIntelligence.id)] : []),
          ...(input.designResult ? [String(input.designResult.id)] : []),
          ...(input.componentResult ? [String(input.componentResult.id)] : []),
          ...(input.compositionResult ? [String(input.compositionResult.id)] : []),
        ],
        outputs: ["sections", "components", "creativeDirection", "assets", "responsivePlan", "qualityGates"],
        rationale: [
          ...input.decisionPlan.explanations.flatMap((explanation) => explanation.reasons),
          ...(input.componentResult?.explanations ?? []),
          ...(input.compositionResult?.explanations ?? []),
        ],
      }),
    ],
    warnings,
    metadata: {
      repositoryReferencesUsed: input.decisionPlan.repositoryReferencesUsed,
      graphReferencesUsed: input.decisionPlan.graphReferencesUsed,
      constraintReferencesUsed: input.decisionPlan.constraintReferencesUsed,
      featureFlags: input.featureFlags ?? {},
      engineVersions: collectCompilerMetadataVersions(input),
      trace: compileTrace(input),
    },
    editable: true,
    outputKind: "mapper-ready-plan",
  });
}

/**
 * Runs the local deterministic Website Compiler.
 *
 * @example
 * const result = runWebsiteCompiler({ decisionPlan });
 */
export function runWebsiteCompiler(input: CompilerInput): EngineResult<CompilerResult> {
  const plan = compileWebsitePlan(input);
  const validation = validateCompiledWebsitePlan(plan);
  const validationWarnings: CompilerWarning[] = validation.issues.map((item) => Object.freeze({
    code: item.code,
    message: `${item.path}: ${item.message}`,
    severity: "major" as const,
  }));
  const finalPlan = validationWarnings.length
    ? Object.freeze({ ...plan, warnings: [...plan.warnings, ...validationWarnings] })
    : plan;
  const metrics = collectCompilerMetrics(finalPlan);
  const result: CompilerResult = Object.freeze({
    plan: finalPlan,
    metrics,
    warnings: finalPlan.warnings,
  });

  return createEngineResult({
    module: "compiler",
    stage: "compile-plan",
    status: validation.valid
      ? finalPlan.warnings.length ? "warning" : "ok"
      : "warning",
    data: result,
    metadata: {
      localOnly: true,
      outputKind: finalPlan.outputKind,
      sectionCount: metrics.sectionCount,
      componentCount: metrics.componentCount,
      validationIssueCount: validation.issues.length,
    },
  });
}
