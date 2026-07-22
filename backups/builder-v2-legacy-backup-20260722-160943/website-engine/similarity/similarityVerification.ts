import { createEngineResult, createEngineWarning, type EngineResult } from "../sdk";
import { runSimilarityEngine } from "./SimilarityEngine";
import type { SimilarityResult, WebsiteSimilarityProfile } from "./similarityResult";
import { validateSimilarityEngineResult } from "./similarityValidation";

/**
 * Compile-safe verification report for Similarity & Diversity Engine.
 *
 * @example
 * const report = runSimilarityVerification().data;
 */
export type SimilarityVerificationReport = Readonly<{
  passed: boolean;
  checks: readonly string[];
  failures: readonly string[];
  sampleResult: SimilarityResult;
}>;

const previousProfile: WebsiteSimilarityProfile = Object.freeze({
  id: "previous.restaurant.profile",
  industry: "restaurant",
  archetype: "restaurant_menu",
  designDnaId: "dna.previous",
  designDnaAxes: Object.freeze({ gridSystem: "editorial", typographyRhythm: "serif-led", sectionRhythm: "proof-to-action", motionRhythm: "minimal" }),
  recipeIds: ["hero.restaurant.editorial", "menu.grid.rich", "cta.booking"],
  recipeFamilies: ["hero", "menu", "cta"],
  heroRecipeId: "hero.restaurant.editorial",
  fragmentIds: ["layout.editorial", "cta.booking", "typography.serif"],
  fragmentFamilies: ["layout", "cta", "typography"],
  componentIds: ["hero.restaurant", "menu.grid"],
  componentFamilies: ["hero", "menu"],
  sectionSequence: ["hero", "menu", "proof", "cta"],
  layoutRhythm: ["editorial", "balanced"],
  motionRhythm: ["minimal"],
  typographyRhythm: ["serif-led"],
  ctaCadence: ["early-cta", "final-cta", "repeat-3"],
  visualDensity: ["balanced"],
  metadata: {},
});

/**
 * Runs local deterministic verification without persistence, rendering, screenshots, or external calls.
 *
 * @example
 * const result = runSimilarityVerification();
 */
export function runSimilarityVerification(): EngineResult<SimilarityVerificationReport> {
  const sample = runSimilarityEngine({
    previousWebsiteProfiles: [previousProfile],
    compiledPlan: {
      id: "compiled.similarity.verification",
      version: "verification",
      engineVersion: "verification",
      decisionPlanId: "decision.verification",
      selectedBusinessFamily: "food_and_beverage",
      selectedIndustry: "restaurant",
      selectedArchetype: "restaurant_menu",
      selectedWebsiteGoal: "booking",
      selectedDesignLanguage: "Editorial",
      selectedCompositionStrategy: "proof-to-action",
      themeIntent: [],
      creativeDirection: { inspiration: [], visualMood: [], media: { requiredImages: [], requiredVideos: [], maps: [], readiness: 100, truthRules: [], missingAssets: [] }, motion: { language: "minimal", parallax: "none", reveal: "fade", reducedMotion: "required", notes: [] }, providerNotes: [] },
      visualMoodSummary: [],
      mediaStrategySummary: [],
      motionStrategySummary: [],
      sections: [],
      components: [],
      assetRequirements: [],
      ctaPlan: ["early-cta", "final-cta"],
      seoPlan: [],
      accessibilityPlan: [],
      responsivePlan: [],
      qualityGates: [],
      missingFacts: [],
      missingAssets: [],
      constraintViolations: [],
      explanations: [],
      warnings: [],
      metadata: { repositoryReferencesUsed: [], graphReferencesUsed: [], constraintReferencesUsed: [], featureFlags: {}, engineVersions: {}, trace: [] },
      editable: true,
      outputKind: "mapper-ready-plan",
    },
  });
  const validation = validateSimilarityEngineResult(sample);
  const checks = [
    "returns EngineResult<SimilarityResult>",
    "normalizes similarity score",
    "normalizes diversity score",
    "includes all required dimensions",
    "allows missing DB-backed history",
    "records metadata-only trace",
    "does not persist history",
  ];
  const failures = [
    ...validation.issues,
    ...(sample.data.persisted || sample.data.rendered || sample.data.screenshotCaptured || sample.data.sideEffects ? ["Similarity Engine reported side effects."] : []),
  ];

  return createEngineResult({
    module: "similarity",
    stage: "verification",
    data: Object.freeze({ passed: failures.length === 0, checks, failures, sampleResult: sample.data }),
    status: failures.length ? "warning" : "ok",
    warnings: failures.map((failure) => createEngineWarning("SIMILARITY_VERIFICATION_FAILED", failure, "similarity", "major")),
    metadata: { phase: "PHASE_35_5_SIMILARITY_DIVERSITY_ENGINE", metadataOnly: true },
  });
}
