import { createEngineResult, createEngineWarning, type EngineResult } from "../sdk";
import { runCriticEngine } from "./CriticEngine";
import type { CriticResult } from "./criticResult";
import { validateCriticEngineResult } from "./criticValidation";

/**
 * Compile-safe verification report for the metadata-only Critic Engine.
 *
 * @example
 * const report = runCriticVerification().data;
 */
export type CriticVerificationReport = Readonly<{
  passed: boolean;
  checks: readonly string[];
  failures: readonly string[];
  sampleResult: CriticResult;
}>;

/**
 * Runs deterministic critic verification without rendering, screenshots, network, DB, LLM, MCP, or providers.
 *
 * @example
 * const result = runCriticVerification();
 */
export function runCriticVerification(): EngineResult<CriticVerificationReport> {
  const sample = runCriticEngine({
    compiledPlan: {
      id: "compiled.verification",
      version: "verification",
      engineVersion: "verification",
      decisionPlanId: "decision.verification",
      selectedBusinessFamily: "food_and_beverage",
      selectedIndustry: "restaurant",
      selectedArchetype: "restaurant_menu",
      selectedWebsiteGoal: "lead_generation",
      selectedDesignLanguage: "Warm",
      selectedCompositionStrategy: "trust-first",
      themeIntent: ["metadata-only"],
      creativeDirection: {
        inspiration: [],
        visualMood: [],
        media: { requiredImages: [], requiredVideos: [], maps: [], readiness: 100, truthRules: [], missingAssets: [] },
        motion: { language: "minimal", parallax: "none", reveal: "fade", reducedMotion: "required", notes: [] },
        providerNotes: [],
      },
      visualMoodSummary: [],
      mediaStrategySummary: [],
      motionStrategySummary: [],
      sections: [],
      components: [],
      assetRequirements: [],
      ctaPlan: [],
      seoPlan: [],
      accessibilityPlan: [],
      responsivePlan: [],
      qualityGates: [],
      missingFacts: ["menu prices"],
      missingAssets: ["restaurant food photos"],
      constraintViolations: ["placeholder copy"],
      explanations: [],
      warnings: [],
      metadata: {
        repositoryReferencesUsed: [],
        graphReferencesUsed: [],
        constraintReferencesUsed: [],
        featureFlags: {},
        engineVersions: {},
        trace: [],
      },
      editable: true,
      outputKind: "mapper-ready-plan",
    },
    featureFlags: {},
  });

  const validation = validateCriticEngineResult(sample);
  const checks = [
    "returns EngineResult<CriticResult>",
    "includes all critic categories",
    "normalizes score",
    "emits hard failures explicitly",
    "blocks publish recommendation on hard failure",
    "includes quality gates",
    "includes repair hints",
    "records metadata-only trace",
  ];
  const failures = [
    ...validation.issues,
    ...(sample.data.publishRecommended && sample.data.hardFailures.length > 0 ? ["Publish recommendation was not blocked by hard failures."] : []),
    ...(sample.data.rendered || sample.data.screenshotCaptured || sample.data.sideEffects ? ["Critic reported side effects."] : []),
  ];

  return createEngineResult({
    module: "critic",
    stage: "verification",
    data: Object.freeze({
      passed: failures.length === 0,
      checks,
      failures,
      sampleResult: sample.data,
    }),
    status: failures.length ? "warning" : "ok",
    warnings: failures.map((failure) => createEngineWarning("CRITIC_VERIFICATION_FAILED", failure, "critic", "major")),
    metadata: {
      phase: "PHASE_35_CRITIC_ENGINE",
      metadataOnly: true,
      noScreenshots: true,
      noRendering: true,
    },
  });
}
