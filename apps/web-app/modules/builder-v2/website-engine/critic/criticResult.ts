import type { EngineSeverity, EngineWarning, JsonValue } from "../sdk";
import { CRITIC_ENGINE_VERSION_STRING } from "./version";

/**
 * Critic dimensions evaluated from metadata without screenshots or rendering.
 *
 * @example
 * const category: CriticCategory = "content-truth";
 */
export type CriticCategory =
  | "visual-hierarchy"
  | "typography"
  | "spacing"
  | "composition"
  | "design-dna"
  | "creative-library"
  | "content-truth"
  | "conversion"
  | "accessibility"
  | "seo"
  | "performance"
  | "mobile"
  | "editability"
  | "renderer-parity"
  | "industry-fit"
  | "asset-readiness"
  | "motion";

/**
 * Normalized score for one critic category.
 *
 * @example
 * const score: CriticScore = { category: "seo", score: 88, weight: 1, passed: true, reasons: ["metadata present"] };
 */
export type CriticScore = Readonly<{
  category: CriticCategory;
  score: number;
  weight: number;
  passed: boolean;
  reasons: string[];
}>;

/**
 * Actionable issue detected by a critic category.
 *
 * @example
 * const issue: CriticIssue = createCriticIssue({ category: "mobile", severity: "major", message: "Mobile plan is missing." });
 */
export type CriticIssue = Readonly<{
  id: string;
  category: CriticCategory;
  severity: EngineSeverity;
  message: string;
  targetId?: string;
  repairHint: string;
}>;

/**
 * Non-blocking critic warning that reuses the SDK warning shape.
 *
 * @example
 * const warning: CriticWarning = { code: "LOW_SCORE", message: "Category needs repair.", module: "critic", severity: "minor" };
 */
export type CriticWarning = EngineWarning;

/**
 * Suggested next action for repair or manual review.
 *
 * @example
 * const recommendation: CriticRecommendation = { id: "rec.cta", category: "conversion", priority: "high", message: "Add primary CTA.", repairHint: "Select a native button CTA." };
 */
export type CriticRecommendation = Readonly<{
  id: string;
  category: CriticCategory;
  priority: "low" | "medium" | "high" | "critical";
  message: string;
  repairHint: string;
}>;

/**
 * Publish-blocking failure that future Repair must handle before release.
 *
 * @example
 * const failure: CriticHardFailure = createHardFailure({ category: "content-truth", code: "PLACEHOLDER_COPY", message: "Placeholder copy remains.", repairHint: "Replace with provided content or mark missing." });
 */
export type CriticHardFailure = Readonly<{
  id: string;
  category: CriticCategory;
  code: string;
  message: string;
  repairHint: string;
  blocksPublish: true;
}>;

/**
 * Quality gate definition used to decide preview and publish readiness.
 *
 * @example
 * const gate: QualityGate = { id: "gate.publish", label: "Publish", threshold: 90, blocksPublish: true, description: "Publish recommendation threshold." };
 */
export type QualityGate = Readonly<{
  id: string;
  label: string;
  threshold: number;
  blocksPublish: boolean;
  description: string;
}>;

/**
 * Result for one quality gate.
 *
 * @example
 * const passed = gateResult.passed;
 */
export type QualityGateResult = Readonly<{
  gate: QualityGate;
  passed: boolean;
  score: number;
  hardFailureCount: number;
  notes: string[];
}>;

/**
 * Critic confidence calculated from metadata completeness and upstream signals.
 *
 * @example
 * const confidence: CriticConfidence = { score: 0.82, reasons: ["simulation provided"] };
 */
export type CriticConfidence = Readonly<{
  score: number;
  reasons: string[];
}>;

/**
 * Operational metrics for a metadata-only critic run.
 *
 * @example
 * const count = metrics.issueCount;
 */
export type CriticMetrics = Readonly<{
  categoryCount: number;
  issueCount: number;
  warningCount: number;
  recommendationCount: number;
  hardFailureCount: number;
  qualityGateCount: number;
  repairHintCount: number;
  metadataOnly: true;
  rendered: false;
  screenshotCaptured: false;
  sideEffects: false;
}>;

/**
 * Public website evaluation summary used by dashboards and future Repair.
 *
 * @example
 * const evaluation: WebsiteEvaluation = result.evaluation;
 */
export type WebsiteEvaluation = Readonly<{
  score: number;
  passed: boolean;
  previewReady: boolean;
  publishRecommended: boolean;
  requiresRepair: boolean;
  summary: string;
  dimensions: Record<CriticCategory, number>;
}>;

/**
 * Category-level critic payload used internally before aggregation.
 *
 * @example
 * const issues = categoryResult.issues;
 */
export type CriticCategoryResult = Readonly<{
  score: CriticScore;
  issues: CriticIssue[];
  hardFailures: CriticHardFailure[];
  recommendations: CriticRecommendation[];
}>;

/**
 * Complete result emitted by the Critic Engine.
 *
 * @example
 * const publish = criticResult.publishRecommended;
 */
export type CriticResult = Readonly<{
  id: string;
  version: typeof CRITIC_ENGINE_VERSION_STRING;
  overallScore: number;
  passed: boolean;
  previewReady: boolean;
  publishRecommended: boolean;
  publishRecommendation: "publish_recommended" | "preview_ready" | "repair_required" | "blocked";
  categoryScores: CriticScore[];
  hardFailures: CriticHardFailure[];
  issues: CriticIssue[];
  warnings: CriticWarning[];
  recommendations: CriticRecommendation[];
  repairHints: string[];
  qualityGateResults: QualityGateResult[];
  confidence: CriticConfidence;
  metrics: CriticMetrics;
  evaluation: WebsiteEvaluation;
  trace: string[];
  metadata: Record<string, JsonValue>;
  rendered: false;
  screenshotCaptured: false;
  sideEffects: false;
}>;

function slug(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, ".").replace(/(^\.|\.$)/g, "").slice(0, 72);
}

/**
 * Creates a stable critic issue id from issue metadata.
 *
 * @example
 * const issue = createCriticIssue({ category: "seo", severity: "minor", message: "Meta description signal is weak.", repairHint: "Add SEO summary metadata." });
 */
export function createCriticIssue(input: Omit<CriticIssue, "id"> & { id?: string }): CriticIssue {
  return Object.freeze({
    id: input.id ?? `critic.issue.${input.category}.${input.severity}.${slug(input.message)}`,
    category: input.category,
    severity: input.severity,
    message: input.message,
    targetId: input.targetId,
    repairHint: input.repairHint,
  });
}

/**
 * Creates a publish-blocking hard failure.
 *
 * @example
 * const failure = createHardFailure({ category: "editability", code: "NO_MAPPING", message: "No editable mapping intent.", repairHint: "Regenerate mapper intent." });
 */
export function createHardFailure(input: Omit<CriticHardFailure, "id" | "blocksPublish"> & { id?: string }): CriticHardFailure {
  return Object.freeze({
    id: input.id ?? `critic.failure.${input.category}.${slug(input.code)}`,
    category: input.category,
    code: input.code,
    message: input.message,
    repairHint: input.repairHint,
    blocksPublish: true as const,
  });
}

/**
 * Creates a repair recommendation.
 *
 * @example
 * const rec = createRecommendation({ category: "asset-readiness", priority: "high", message: "Declare missing assets.", repairHint: "Request uploads or choose allowed omission." });
 */
export function createRecommendation(input: Omit<CriticRecommendation, "id"> & { id?: string }): CriticRecommendation {
  return Object.freeze({
    id: input.id ?? `critic.recommendation.${input.category}.${slug(input.message)}`,
    category: input.category,
    priority: input.priority,
    message: input.message,
    repairHint: input.repairHint,
  });
}
