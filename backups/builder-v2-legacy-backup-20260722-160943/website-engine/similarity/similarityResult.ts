import type { EngineSeverity, EngineWarning, JsonValue } from "../sdk";
import { SIMILARITY_ENGINE_VERSION_STRING } from "./version";

/**
 * Similarity dimensions evaluated from metadata.
 *
 * @example
 * const dimension: SimilarityDimension = "recipe-overlap";
 */
export type SimilarityDimension =
  | "design-dna"
  | "recipe-overlap"
  | "fragment-overlap"
  | "component-overlap"
  | "composition-order"
  | "layout-rhythm"
  | "motion-rhythm"
  | "typography-rhythm"
  | "cta-cadence"
  | "visual-density"
  | "industry-archetype"
  | "creative-family";

/**
 * Comparison target used when evaluating a candidate against history.
 *
 * @example
 * const target: SimilarityComparisonTarget = { id: "previous.1", label: "Previous output", profile };
 */
export type SimilarityComparisonTarget = Readonly<{
  id: string;
  label: string;
  profile: WebsiteSimilarityProfile;
}>;

/**
 * Metadata profile used for deterministic similarity comparisons.
 *
 * @example
 * const profile = buildWebsiteSimilarityProfile(input);
 */
export type WebsiteSimilarityProfile = Readonly<{
  id: string;
  industry?: string;
  archetype?: string;
  designDnaId?: string;
  designDnaAxes: Record<string, string>;
  recipeIds: string[];
  recipeFamilies: string[];
  heroRecipeId?: string;
  fragmentIds: string[];
  fragmentFamilies: string[];
  componentIds: string[];
  componentFamilies: string[];
  sectionSequence: string[];
  layoutRhythm: string[];
  motionRhythm: string[];
  typographyRhythm: string[];
  ctaCadence: string[];
  visualDensity: string[];
  metadata: Record<string, JsonValue>;
}>;

/**
 * Normalized similarity score for a single dimension.
 *
 * @example
 * const score: SimilarityScore = { dimension: "design-dna", score: 0.4, targetId: "baseline", reasons: [] };
 */
export type SimilarityScore = Readonly<{
  dimension: SimilarityDimension;
  score: number;
  targetId: string;
  reasons: string[];
}>;

/**
 * Issue emitted when similarity is too high or diversity metadata is weak.
 *
 * @example
 * const issue: SimilarityIssue = { id: "issue", dimension: "recipe-overlap", severity: "major", message: "High overlap.", repairHint: "Swap recipes." };
 */
export type SimilarityIssue = Readonly<{
  id: string;
  dimension: SimilarityDimension;
  severity: EngineSeverity;
  message: string;
  targetId?: string;
  repairHint: string;
}>;

/**
 * Warning emitted by Similarity Engine.
 *
 * @example
 * const warning: SimilarityWarning = { code: "SIMILARITY_HIGH", message: "High overlap.", module: "similarity", severity: "major" };
 */
export type SimilarityWarning = EngineWarning;

/**
 * Diversity score derived inversely from similarity and penalties.
 *
 * @example
 * const diversity: DiversityScore = { score: 88, grade: "acceptable", reasons: [] };
 */
export type DiversityScore = Readonly<{
  score: number;
  grade: "excellent" | "acceptable" | "weak" | "fail";
  reasons: string[];
}>;

/**
 * Deterministic penalty applied to diversity score.
 *
 * @example
 * const penalty: DiversityPenalty = { code: "RECIPE_REPEAT", dimension: "recipe-overlap", amount: 12, reason: "Same recipes repeat." };
 */
export type DiversityPenalty = Readonly<{
  code: string;
  dimension: SimilarityDimension;
  amount: number;
  reason: string;
  hardFailure: boolean;
}>;

/**
 * Recommendation for improving diversity.
 *
 * @example
 * const rec: DiversityRecommendation = { id: "rec", priority: "high", dimension: "design-dna", message: "Vary DNA.", repairHint: "Change axes." };
 */
export type DiversityRecommendation = Readonly<{
  id: string;
  priority: "low" | "medium" | "high" | "critical";
  dimension: SimilarityDimension;
  message: string;
  repairHint: string;
}>;

/**
 * Confidence score for similarity evaluation.
 *
 * @example
 * const confidence: SimilarityConfidence = { score: 0.78, reasons: ["history provided"] };
 */
export type SimilarityConfidence = Readonly<{ score: number; reasons: string[] }>;

/**
 * Operational metrics for Similarity Engine.
 *
 * @example
 * const count = metrics.targetCount;
 */
export type SimilarityMetrics = Readonly<{
  targetCount: number;
  dimensionCount: number;
  issueCount: number;
  warningCount: number;
  penaltyCount: number;
  recommendationCount: number;
  metadataOnly: true;
  persisted: false;
  rendered: false;
  screenshotCaptured: false;
  sideEffects: false;
}>;

/**
 * Complete metadata-only Similarity & Diversity result.
 *
 * @example
 * const diversity = result.diversityScore.score;
 */
export type SimilarityResult = Readonly<{
  id: string;
  version: typeof SIMILARITY_ENGINE_VERSION_STRING;
  profile: WebsiteSimilarityProfile;
  overallSimilarityScore: number;
  overallDiversityScore: DiversityScore;
  passed: boolean;
  closestMatches: SimilarityComparisonTarget[];
  dimensionScores: SimilarityScore[];
  recipeOverlap: number;
  fragmentOverlap: number;
  designDnaOverlap: number;
  componentOverlap: number;
  sectionOrderOverlap: number;
  layoutRhythmOverlap: number;
  motionRhythmOverlap: number;
  typographyRhythmOverlap: number;
  ctaCadenceOverlap: number;
  diversityPenalties: DiversityPenalty[];
  diversityRecommendations: DiversityRecommendation[];
  repairHints: string[];
  issues: SimilarityIssue[];
  warnings: SimilarityWarning[];
  confidence: SimilarityConfidence;
  metrics: SimilarityMetrics;
  trace: string[];
  metadata: Record<string, JsonValue>;
  persisted: false;
  rendered: false;
  screenshotCaptured: false;
  sideEffects: false;
}>;

function slug(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, ".").replace(/(^\.|\.$)/g, "").slice(0, 72);
}

/**
 * Creates a stable similarity issue.
 *
 * @example
 * const issue = createSimilarityIssue("recipe-overlap", "major", "High recipe overlap.", "Swap recipes.");
 */
export function createSimilarityIssue(dimension: SimilarityDimension, severity: EngineSeverity, message: string, repairHint: string, targetId?: string): SimilarityIssue {
  return Object.freeze({
    id: `similarity.issue.${dimension}.${severity}.${slug(message)}`,
    dimension,
    severity,
    message,
    repairHint,
    targetId,
  });
}
