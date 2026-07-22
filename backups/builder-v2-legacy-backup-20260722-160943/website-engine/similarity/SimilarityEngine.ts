import { createEngineResult, createEngineWarning, type EngineResult } from "../sdk";
import { compareComponents } from "./componentSimilarity";
import { compareComposition } from "./compositionSimilarity";
import { compareCTACadence } from "./ctaSimilarity";
import { compareDesignDNA, designDnaAxes } from "./designDnaSimilarity";
import { buildDiversityRecommendations, buildSimilarityIssues, buildSimilarityRepairHints } from "./diversityRecommendations";
import { dimensionScore, jaccard, scoreDiversity, scoreOverallSimilarity } from "./diversityScoring";
import { compareFragmentSelections } from "./fragmentSimilarity";
import { compareLayoutRhythm, compareVisualDensity } from "./layoutSimilarity";
import { compareMotionRhythm } from "./motionSimilarity";
import { compareCreativeFamilies, compareRecipeSelections } from "./recipeSimilarity";
import type { SimilarityInput } from "./similarityInput";
import type {
  DiversityPenalty,
  SimilarityComparisonTarget,
  SimilarityConfidence,
  SimilarityMetrics,
  SimilarityResult,
  SimilarityScore,
  WebsiteSimilarityProfile,
} from "./similarityResult";
import { validateSimilarityInput, validateSimilarityResult } from "./similarityValidation";
import { compareTypographyRhythm } from "./typographySimilarity";
import { SIMILARITY_ENGINE_VERSION_STRING } from "./version";

function unique(values: readonly (string | undefined)[]): string[] {
  return [...new Set(values.filter((value): value is string => Boolean(value)))];
}

function stringsFromRecord(record: Record<string, unknown> | undefined): string[] {
  if (!record) return [];
  return Object.values(record).flatMap((value) => Array.isArray(value) ? value.map(String) : [String(value)]).filter(Boolean);
}

/**
 * Builds a comparable website similarity profile from available metadata.
 *
 * @example
 * const profile = buildWebsiteSimilarityProfile({ creativeLibraryResult, designDNA });
 */
export function buildWebsiteSimilarityProfile(input: SimilarityInput): WebsiteSimilarityProfile {
  const recipeSelections = input.creativeLibraryResult?.selections ?? [];
  const assemblyResults = input.recipeAssemblyResults ?? [];
  const compiledSections = input.compiledPlan?.sections ?? [];
  const compiledComponents = input.compiledPlan?.components ?? [];
  const componentSelections = input.componentResult?.recommendedSelections ?? [];
  const composition = input.compositionResult;

  const recipeIds = unique([
    ...recipeSelections.map((selection) => selection.recipe.id),
    ...assemblyResults.map((assembly) => assembly.baseRecipe.id),
  ]);
  const recipeFamilies = unique([
    ...recipeSelections.map((selection) => selection.recipe.family),
    ...assemblyResults.map((assembly) => assembly.baseRecipe.family),
  ]);
  const heroRecipeId = recipeSelections.find((selection) => selection.recipe.family === "hero")?.recipe.id
    ?? assemblyResults.find((assembly) => assembly.baseRecipe.family === "hero")?.baseRecipe.id;
  const fragmentIds = unique([
    ...assemblyResults.flatMap((assembly) => assembly.selections.map((selection) => selection.fragment.id)),
    ...recipeSelections.flatMap((selection) => [
      ...selection.recipe.fragments.layoutFragments,
      ...selection.recipe.fragments.mediaFragments,
      ...selection.recipe.fragments.typographyFragments,
      ...selection.recipe.fragments.spacingFragments,
      ...selection.recipe.fragments.motionFragments,
      ...selection.recipe.fragments.ctaFragments,
      ...selection.recipe.fragments.backgroundFragments,
      ...selection.recipe.fragments.interactionFragments,
    ]),
  ]);
  const fragmentFamilies = unique(assemblyResults.flatMap((assembly) => assembly.selections.map((selection) => selection.fragment.family)));
  const componentIds = unique([
    ...componentSelections.map((selection) => selection.variant.id),
    ...compiledComponents.map((component) => String(component.componentVariantId)),
  ]);
  const componentFamilies = unique([
    ...componentSelections.map((selection) => selection.variant.family),
    ...compiledComponents.map((component) => String(component.componentFamilyId)),
    ...compiledSections.flatMap((section) => section.componentFamilyIds.map(String)),
  ]);
  const sectionSequence = unique([
    ...(composition?.orderedSectionSequence.map((section) => section.category || section.family || section.id) ?? []),
    ...compiledSections.sort((left, right) => left.order - right.order).map((section) => section.type || String(section.patternId)),
  ]);
  const layoutRhythm = unique([
    input.designDNA?.gridSystem,
    input.designDNA?.sectionRhythm,
    composition?.pageRhythm.rhythm,
    composition?.visualBreathing.level,
    input.compiledPlan?.selectedCompositionStrategy,
    ...recipeSelections.map((selection) => selection.recipe.metadata.layoutPattern),
  ]);
  const motionRhythm = unique([
    input.designDNA?.motionRhythm,
    input.compiledPlan?.creativeDirection.motion.language,
    input.compiledPlan?.creativeDirection.motion.reveal,
    ...recipeSelections.map((selection) => selection.recipe.metadata.motionSuitability),
  ]);
  const typographyRhythm = unique([
    input.designDNA?.typographyRhythm,
    ...recipeSelections.map((selection) => selection.recipe.metadata.typographyRhythm),
  ]);
  const ctaCadence = unique([
    composition ? `repeat-${composition.ctaCadence.repeatEverySections}` : undefined,
    composition?.ctaCadence.earlyCta ? "early-cta" : undefined,
    composition?.ctaCadence.finalCta ? "final-cta" : undefined,
    ...(input.compiledPlan?.ctaPlan ?? []),
    ...recipeSelections.map((selection) => selection.recipe.metadata.ctaProminence),
  ]);
  const visualDensity = unique([
    input.designDNA?.densityLevel,
    input.designDNA?.whitespaceLevel,
    composition?.visualBreathing.level,
    ...recipeSelections.map((selection) => selection.recipe.metadata.visualDensity),
    ...recipeSelections.map((selection) => selection.recipe.metadata.contentDensity),
  ]);

  return Object.freeze({
    id: `similarity.profile.${input.compiledPlan?.id ?? input.websiteSpec?.id ?? input.designDNA?.id ?? "candidate"}`,
    industry: input.compiledPlan?.selectedIndustry ?? input.websiteSpec?.business.industry,
    archetype: input.compiledPlan?.selectedArchetype ?? input.websiteSpec?.archetype,
    designDnaId: input.designDNA?.id,
    designDnaAxes: designDnaAxes(input.designDNA),
    recipeIds,
    recipeFamilies,
    heroRecipeId,
    fragmentIds,
    fragmentFamilies,
    componentIds,
    componentFamilies,
    sectionSequence,
    layoutRhythm,
    motionRhythm,
    typographyRhythm,
    ctaCadence,
    visualDensity,
    metadata: {
      featureFlags: input.featureFlags ? stringsFromRecord(input.featureFlags as Record<string, unknown>) : [],
      criticScore: input.criticResult?.overallScore ?? null,
    },
  });
}

function buildTargets(input: SimilarityInput, profile: WebsiteSimilarityProfile): SimilarityComparisonTarget[] {
  const explicitTargets = (input.previousWebsiteProfiles ?? []).map((previous, index) => Object.freeze({
    id: previous.id || `previous.profile.${index}`,
    label: `Previous website profile ${index + 1}`,
    profile: previous,
  }));
  const recipeHistoryTarget = input.previousRecipeSelections?.length ? Object.freeze({
    id: "history.recipes",
    label: "Previous recipe selections",
    profile: Object.freeze({ ...profile, id: "history.recipes", recipeIds: input.previousRecipeSelections.map((item) => typeof item === "string" ? item : item.recipe.id), recipeFamilies: input.previousRecipeSelections.map((item) => typeof item === "string" ? item.split(".")[0] ?? item : item.recipe.family) }),
  }) : undefined;
  const fragmentHistoryTarget = input.previousFragmentSelections?.length ? Object.freeze({
    id: "history.fragments",
    label: "Previous fragment selections",
    profile: Object.freeze({ ...profile, id: "history.fragments", fragmentIds: input.previousFragmentSelections.map((item) => typeof item === "string" ? item : item.fragment.id), fragmentFamilies: input.previousFragmentSelections.map((item) => typeof item === "string" ? item.split(".")[0] ?? item : item.fragment.family) }),
  }) : undefined;
  const dnaTargets = (input.previousDesignDnaProfiles ?? []).map((dna, index) => Object.freeze({
    id: `history.design-dna.${index}`,
    label: `Previous Design DNA ${index + 1}`,
    profile: Object.freeze({ ...profile, id: `history.design-dna.${index}`, designDnaId: dna.id, designDnaAxes: designDnaAxes(dna) }),
  }));
  const baselineTarget = Object.freeze({
    id: "baseline.internal-diversity-rules",
    label: "Internal baseline diversity rules",
    profile: Object.freeze({
      ...profile,
      id: "baseline.internal-diversity-rules",
      recipeIds: [],
      fragmentIds: [],
      componentIds: [],
      sectionSequence: [],
      designDnaAxes: {},
    }),
  });
  const targets = [explicitTargets, recipeHistoryTarget, fragmentHistoryTarget, dnaTargets].flat().filter(Boolean) as SimilarityComparisonTarget[];
  return targets.length ? targets : [baselineTarget];
}

function compareIndustryArchetype(candidate: WebsiteSimilarityProfile, target: WebsiteSimilarityProfile): SimilarityScore {
  const score = (candidate.industry && candidate.industry === target.industry ? 0.45 : 0) + (candidate.archetype && candidate.archetype === target.archetype ? 0.45 : 0);
  return dimensionScore("industry-archetype", score, target.id, [`Industry match: ${candidate.industry === target.industry}.`, `Archetype match: ${candidate.archetype === target.archetype}.`]);
}

function compareAgainstTarget(candidate: WebsiteSimilarityProfile, target: WebsiteSimilarityProfile): SimilarityScore[] {
  return [
    compareDesignDNA(candidate, target),
    compareRecipeSelections(candidate, target),
    compareFragmentSelections(candidate, target),
    compareComponents(candidate, target),
    compareComposition(candidate, target),
    compareLayoutRhythm(candidate, target),
    compareMotionRhythm(candidate, target),
    compareTypographyRhythm(candidate, target),
    compareCTACadence(candidate, target),
    compareVisualDensity(candidate, target),
    compareIndustryArchetype(candidate, target),
    compareCreativeFamilies(candidate, target),
  ];
}

function buildPenalties(profile: WebsiteSimilarityProfile, closestTarget: SimilarityComparisonTarget | undefined, scores: readonly SimilarityScore[]): DiversityPenalty[] {
  if (!closestTarget) return [];
  const byDimension = new Map(scores.filter((score) => score.targetId === closestTarget.id).map((score) => [score.dimension, score.score]));
  const penalties: DiversityPenalty[] = [];
  const sameIndustryArchetype = profile.industry && profile.industry === closestTarget.profile.industry && profile.archetype && profile.archetype === closestTarget.profile.archetype;
  const heroRepeat = profile.heroRecipeId && profile.heroRecipeId === closestTarget.profile.heroRecipeId;
  const fragmentFamilyOverlap = jaccard(profile.fragmentFamilies, closestTarget.profile.fragmentFamilies);

  if ((byDimension.get("design-dna") ?? 0) >= 0.9) penalties.push(Object.freeze({ code: "SAME_DESIGN_DNA_MINIMAL_VARIATION", dimension: "design-dna", amount: 18, reason: "Same Design DNA profile appears reused with minimal variation.", hardFailure: true }));
  if (heroRepeat && fragmentFamilyOverlap >= 0.7) penalties.push(Object.freeze({ code: "SAME_HERO_RECIPE_FRAGMENT_COMBO", dimension: "fragment-overlap", amount: 16, reason: "Same hero recipe and fragment family combination repeats.", hardFailure: true }));
  if ((byDimension.get("composition-order") ?? 0) >= 0.85 && (byDimension.get("component-overlap") ?? 0) >= 0.7) penalties.push(Object.freeze({ code: "SAME_SECTION_SEQUENCE_HIGH_COMPONENT_OVERLAP", dimension: "composition-order", amount: 18, reason: "Same section sequence repeats with high component overlap.", hardFailure: true }));
  if ((byDimension.get("recipe-overlap") ?? 0) >= 0.85) penalties.push(Object.freeze({ code: "SAME_RECIPE_SET_ABOVE_THRESHOLD", dimension: "recipe-overlap", amount: 18, reason: "Same recipe set appears above threshold.", hardFailure: true }));
  if (sameIndustryArchetype && (byDimension.get("layout-rhythm") ?? 0) >= 0.85 && (byDimension.get("typography-rhythm") ?? 0) >= 0.75) penalties.push(Object.freeze({ code: "SAME_VISUAL_RHYTHM_SAME_INDUSTRY_ARCHETYPE", dimension: "layout-rhythm", amount: 16, reason: "Same visual rhythm appears above threshold for the same industry and archetype.", hardFailure: true }));
  if ((byDimension.get("creative-family") ?? 0) >= 0.75) penalties.push(Object.freeze({ code: "CREATIVE_FAMILY_REPETITION", dimension: "creative-family", amount: 8, reason: "Creative Library family repetition is high.", hardFailure: false }));
  return penalties;
}

function confidenceFor(input: SimilarityInput, targetCount: number): SimilarityConfidence {
  const signals = [
    Boolean(input.designDNA),
    Boolean(input.creativeLibraryResult),
    Boolean(input.recipeAssemblyResults?.length),
    Boolean(input.componentResult || input.compiledPlan?.components.length),
    Boolean(input.compositionResult || input.compiledPlan?.sections.length),
    targetCount > 0,
  ];
  const score = Math.max(0.25, Math.min(1, signals.filter(Boolean).length / signals.length));
  return Object.freeze({
    score: Number(score.toFixed(2)),
    reasons: [`Similarity metadata signals present: ${signals.filter(Boolean).length}/${signals.length}.`, `Comparison target count: ${targetCount}.`],
  });
}

function metricsFor(result: Omit<SimilarityResult, "metrics">): SimilarityMetrics {
  return Object.freeze({
    targetCount: result.closestMatches.length,
    dimensionCount: result.dimensionScores.length,
    issueCount: result.issues.length,
    warningCount: result.warnings.length,
    penaltyCount: result.diversityPenalties.length,
    recommendationCount: result.diversityRecommendations.length,
    metadataOnly: true as const,
    persisted: false as const,
    rendered: false as const,
    screenshotCaptured: false as const,
    sideEffects: false as const,
  });
}

/**
 * Runs deterministic metadata-only Similarity & Diversity evaluation.
 *
 * @example
 * const result = runSimilarityEngine({ creativeLibraryResult, previousWebsiteProfiles });
 */
export function runSimilarityEngine(input: SimilarityInput = {}): EngineResult<SimilarityResult> {
  const inputValidation = validateSimilarityInput(input);
  const profile = buildWebsiteSimilarityProfile(input);
  const targets = buildTargets(input, profile);
  const targetScores = targets.map((target) => ({ target, scores: compareAgainstTarget(profile, target.profile) }));
  const ranked = targetScores
    .map(({ target, scores }) => ({ target, overall: scoreOverallSimilarity(scores) }))
    .sort((left, right) => right.overall - left.overall);
  const closest = ranked.slice(0, 3).map((entry) => entry.target);
  const closestTarget = ranked[0]?.target;
  const dimensionScores = targetScores.flatMap((entry) => entry.scores);
  const closestDimensionScores = dimensionScores.filter((score) => score.targetId === closestTarget?.id);
  const overallSimilarity = scoreOverallSimilarity(closestDimensionScores);
  const penalties = buildPenalties(profile, closestTarget, dimensionScores);
  const diversityScore = scoreDiversity(overallSimilarity, penalties);
  const recommendations = buildDiversityRecommendations(overallSimilarity, penalties);
  const issues = buildSimilarityIssues(penalties);
  if (overallSimilarity >= 0.85) issues.push({ id: "similarity.issue.overall.fail", dimension: "design-dna", severity: "blocker", message: "Overall similarity is 0.85 or higher.", repairHint: "Create a materially different Design DNA, recipe set, section sequence, and visual rhythm." });
  else if (overallSimilarity >= 0.71) issues.push({ id: "similarity.issue.overall.needs-diversity", dimension: "creative-family", severity: "major", message: "Overall similarity needs diversity improvement.", repairHint: "Vary recipes, fragments, layout rhythm, and CTA cadence before handoff." });

  const warnings = [
    ...inputValidation.issues.map((issue) => createEngineWarning("SIMILARITY_INPUT_WARNING", issue, "similarity", "minor")),
    ...issues.filter((issue) => issue.severity !== "info").map((issue) => createEngineWarning(issue.id.toUpperCase().replace(/[^A-Z0-9]+/g, "_"), issue.message, "similarity", issue.severity === "blocker" ? "major" : issue.severity, { dimension: issue.dimension, repairHint: issue.repairHint })),
  ];
  const confidence = confidenceFor(input, targets.length);
  const baseResult = {
    id: `similarity.${profile.id}`,
    version: SIMILARITY_ENGINE_VERSION_STRING,
    profile,
    overallSimilarityScore: overallSimilarity,
    overallDiversityScore: diversityScore,
    passed: overallSimilarity <= 0.7 && diversityScore.score >= 75 && !penalties.some((penalty) => penalty.hardFailure),
    closestMatches: closest,
    dimensionScores,
    recipeOverlap: closestDimensionScores.find((score) => score.dimension === "recipe-overlap")?.score ?? 0,
    fragmentOverlap: closestDimensionScores.find((score) => score.dimension === "fragment-overlap")?.score ?? 0,
    designDnaOverlap: closestDimensionScores.find((score) => score.dimension === "design-dna")?.score ?? 0,
    componentOverlap: closestDimensionScores.find((score) => score.dimension === "component-overlap")?.score ?? 0,
    sectionOrderOverlap: closestDimensionScores.find((score) => score.dimension === "composition-order")?.score ?? 0,
    layoutRhythmOverlap: closestDimensionScores.find((score) => score.dimension === "layout-rhythm")?.score ?? 0,
    motionRhythmOverlap: closestDimensionScores.find((score) => score.dimension === "motion-rhythm")?.score ?? 0,
    typographyRhythmOverlap: closestDimensionScores.find((score) => score.dimension === "typography-rhythm")?.score ?? 0,
    ctaCadenceOverlap: closestDimensionScores.find((score) => score.dimension === "cta-cadence")?.score ?? 0,
    diversityPenalties: penalties,
    diversityRecommendations: recommendations,
    repairHints: buildSimilarityRepairHints(recommendations),
    issues,
    warnings,
    confidence,
    trace: [
      "similarity.metadata-only",
      "no-history-persistence",
      "no-screenshot-capture",
      "no-rendering",
      "no-builder-node-creation",
      "no-mapper-execution",
      "no-network-db-llm-mcp-provider-calls",
      "feature-flags-remain-false",
    ],
    metadata: { inputValidationIssues: inputValidation.issues },
    persisted: false as const,
    rendered: false as const,
    screenshotCaptured: false as const,
    sideEffects: false as const,
  };
  const result = Object.freeze({ ...baseResult, metrics: metricsFor(baseResult) });
  const resultValidation = validateSimilarityResult(result);

  return createEngineResult({
    module: "similarity",
    stage: "metadata-diversity-evaluation",
    data: result,
    status: resultValidation.valid && result.passed ? "ok" : warnings.length || !result.passed ? "warning" : "ok",
    warnings: resultValidation.valid ? warnings : [...warnings, ...resultValidation.issues.map((issue) => createEngineWarning("SIMILARITY_RESULT_WARNING", issue, "similarity", "major"))],
    metadata: {
      phase: "PHASE_35_5_SIMILARITY_DIVERSITY_ENGINE",
      metadataOnly: true,
      overallSimilarity,
      diversityScore: diversityScore.score,
    },
    confidence: confidence.score,
  });
}
