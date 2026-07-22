import { createEngineResult, createEngineWarning, type EngineResult, type EngineWarning, type GenerationDecision, type JsonValue } from "../sdk";
import { inferReducedMotionProfile } from "./accessibilityProfile";
import { inferCameraMovement } from "./cameraMovement";
import { inferHoverBehavior } from "./hoverBehavior";
import { inferMicroInteractions } from "./microInteractions";
import { inferMotionLanguage } from "./motionLanguage";
import { detectMotionRisks } from "./motionRisks";
import { inferPageTransitions } from "./pageTransitions";
import { inferParallaxStrategy } from "./parallaxStrategy";
import { inferPerformanceProfile } from "./performanceProfile";
import { inferRevealStrategy } from "./revealStrategy";
import { inferScrollBehavior } from "./scrollBehavior";
import { inferStickyBehavior } from "./stickyBehavior";
import { inferTransitionBehavior } from "./transitionBehavior";
import { validateMotionStrategy, validationIssuesToMotionErrors } from "./validation";
import { MOTION_INTELLIGENCE_VERSION_STRING } from "./version";
import { resolveMotionFamilyContext, type MotionConfidence, type MotionInput, type MotionMetrics, type MotionStrategy } from "./motionStrategy";

function deterministicId(input: MotionInput, family: string) {
  const source = [input.businessProfile?.id, input.brandProfile?.id, input.visualMoodProfile?.id, input.mediaStrategy?.id, family]
    .filter(Boolean).join("-").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 72);
  return `motion.${source || "unknown"}`;
}

function bounded(value: number) {
  return Math.max(0, Math.min(1, Number(value.toFixed(2))));
}

function warning(code: string, message: string, severity: EngineWarning["severity"] = "minor", metadata?: Record<string, JsonValue>) {
  return createEngineWarning(code, message, "motion-intelligence", severity, metadata);
}

/** Scores confidence for MotionStrategy inference. */
export function scoreMotionConfidence(input: MotionInput, riskCount: number): MotionConfidence {
  const score = bounded(
    0.18 +
    (input.businessProfile ? 0.1 : 0) +
    (input.brandProfile ? 0.12 : 0) +
    (input.experienceStrategy ? 0.1 : 0) +
    (input.patternIntelligence ? 0.08 : 0) +
    (input.designResult ? 0.12 : 0) +
    (input.inspirationProfile ? 0.08 : 0) +
    (input.visualMoodProfile ? 0.14 : 0) +
    (input.mediaStrategy ? 0.12 : 0) -
    Math.min(0.08, riskCount * 0.01)
  );
  return Object.freeze({
    score,
    reasons: [
      `businessProfile=${Boolean(input.businessProfile)}`,
      `brandProfile=${Boolean(input.brandProfile)}`,
      `experienceStrategy=${Boolean(input.experienceStrategy)}`,
      `visualMoodProfile=${Boolean(input.visualMoodProfile)}`,
      `mediaStrategy=${Boolean(input.mediaStrategy)}`,
      `risks=${riskCount}`,
    ],
  });
}

function providerCandidates(strategy: Pick<MotionStrategy, "motionLanguage" | "parallaxStrategy" | "microInteractions">) {
  return [
    ...(strategy.parallaxStrategy.level === "None" ? [] : [`parallax metadata candidate: ${strategy.parallaxStrategy.level}`]),
    ...(strategy.motionLanguage === "Immersive" || strategy.motionLanguage === "Automotive" ? [`cinematic behavior candidate: ${strategy.motionLanguage}`] : []),
    ...(strategy.microInteractions.interactions.length ? ["micro-interaction metadata candidate"] : []),
  ];
}

function collectMetrics(input: MotionInput, strategy: MotionStrategy, warningCount: number): MotionMetrics {
  return Object.freeze({
    warningCount,
    riskCount: strategy.risks.length,
    providerCandidateCount: strategy.providerCandidates.length,
    repositoryRecordCount: input.repositoryRecords?.length ?? 0,
    graphNodeCount: input.graphNodes?.length ?? 0,
    graphEdgeCount: input.graphEdges?.length ?? 0,
  });
}

function createDecision(strategy: MotionStrategy, confidence: MotionConfidence): GenerationDecision {
  return Object.freeze({
    id: "motion-intelligence.decision.strategy",
    stage: "motion-intelligence",
    selected: [strategy.motionLanguage, strategy.scrollBehavior.strategy, strategy.revealStrategy.primary, strategy.parallaxStrategy.level],
    rejected: ["animation_code", "css_generation", "html_generation", "js_timelines", "provider_execution", "library_selection", "builder_nodes"],
    rationale: "Deterministic motion language selected without animation code, providers, CSS, HTML, JS timelines, libraries, or Builder nodes.",
    inputs: ["businessProfile", "brandProfile", "experienceStrategy", "designResult", "inspirationProfile", "visualMoodProfile", "mediaStrategy"],
    outputs: ["MotionStrategy"],
    confidence: confidence.score,
    warnings: confidence.score < 0.55 ? ["low-confidence"] : [],
  });
}

/** Builds a MotionStrategy without producing animation implementation. */
export function buildMotionStrategy(input: MotionInput): MotionStrategy {
  const context = resolveMotionFamilyContext(input);
  const motionLanguage = inferMotionLanguage(input, context);
  const scrollBehavior = inferScrollBehavior(input, context);
  const revealStrategy = inferRevealStrategy(input, context);
  const parallaxStrategy = inferParallaxStrategy(input, context);
  const cameraMovement = inferCameraMovement(input, context);
  const hoverBehavior = inferHoverBehavior(input, context);
  const transitionBehavior = inferTransitionBehavior(input, context);
  const microInteractions = inferMicroInteractions(input, context);
  const stickyBehavior = inferStickyBehavior(input, context);
  const pageTransitions = inferPageTransitions(input, context);
  const performanceProfile = inferPerformanceProfile(input, context);
  const reducedMotion = inferReducedMotionProfile(input, context);
  const partial = { parallaxStrategy, performanceProfile };
  const risks = detectMotionRisks(input, context, partial);
  const candidates = providerCandidates({ motionLanguage, parallaxStrategy, microInteractions });
  const confidence = scoreMotionConfidence(input, risks.length);
  return Object.freeze({
    id: deterministicId(input, context.family),
    version: MOTION_INTELLIGENCE_VERSION_STRING,
    motionLanguage,
    scrollBehavior,
    revealStrategy,
    parallaxStrategy,
    cameraMovement,
    hoverBehavior,
    transitionBehavior,
    microInteractions,
    stickyBehavior,
    pageTransitions,
    performanceProfile,
    reducedMotion,
    accessibilityNotes: [
      "Reduced-motion behavior is required.",
      "Motion must not hide primary CTAs or critical content.",
      "Decorative motion must be removable without changing meaning.",
    ],
    providerCandidates: candidates,
    risks,
    warnings: [],
    confidence: confidence.score,
  });
}

/** Runs deterministic local Motion Intelligence. */
export function runMotionIntelligence(input: MotionInput = {}): EngineResult<MotionStrategy> {
  const strategy = buildMotionStrategy(input);
  const warnings = [
    ...(strategy.confidence < 0.55 ? [warning("LOW_MOTION_CONFIDENCE", "Motion confidence is low; more experience, design, mood, or media context should be provided.", "major", { confidence: strategy.confidence })] : []),
    ...(strategy.parallaxStrategy.level !== "None" ? [warning("PARALLAX_REQUIRES_REDUCED_MOTION", "Parallax recommendations require reduced-motion alternatives.", "minor", { parallax: strategy.parallaxStrategy.level })] : []),
  ];
  const data: MotionStrategy = Object.freeze({ ...strategy, warnings: warnings.map((item) => item.message), confidence: scoreMotionConfidence(input, strategy.risks.length).score });
  const validation = validateMotionStrategy(data);
  const errors = validation.valid ? [] : validationIssuesToMotionErrors(validation.issues);
  const metrics = collectMetrics(input, data, warnings.length);

  return createEngineResult({
    module: "motion-intelligence",
    stage: "strategy",
    status: errors.length ? "error" : warnings.length ? "warning" : "ok",
    data,
    warnings,
    errors,
    decisions: [createDecision(data, scoreMotionConfidence(input, data.risks.length))],
    confidence: data.confidence,
    metadata: {
      localOnly: true,
      noLlm: true,
      noMl: true,
      noDb: true,
      noNetwork: true,
      noProviders: true,
      noProviderExecution: true,
      noHiggsfield: true,
      noGsap: true,
      noFramerMotion: true,
      noThreeJs: true,
      noAnimationCode: true,
      noCssGeneration: true,
      noHtmlGeneration: true,
      noJsTimelines: true,
      noBuilderNodes: true,
      realEstateIsFixtureOnly: true,
      motionStrategyOnly: true,
      confidence: data.confidence,
      metrics: metrics as unknown as Record<string, JsonValue>,
      validationIssues: validation.issues.map((issue) => `${issue.path}:${issue.code}`),
    },
  });
}

export const MotionIntelligenceEngine = Object.freeze({ run: runMotionIntelligence });
