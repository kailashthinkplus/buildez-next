import type { EngineSeverity, EngineWarning, JsonValue } from "../sdk";
import { REPAIR_ENGINE_VERSION_STRING } from "./version";

/**
 * Repair categories planned by the metadata-only Repair Engine.
 *
 * @example
 * const category: RepairCategory = "content-truth";
 */
export type RepairCategory =
  | "structural"
  | "content-truth"
  | "design"
  | "composition"
  | "component"
  | "creative-diversity"
  | "similarity-reduction"
  | "accessibility"
  | "seo"
  | "performance"
  | "mobile"
  | "editability"
  | "motion-safety"
  | "asset-readiness"
  | "renderer-parity";

/**
 * Severity for a repair action.
 *
 * @example
 * const severity: RepairSeverity = "major";
 */
export type RepairSeverity = EngineSeverity;

/**
 * Metadata-only action types supported by Repair.
 *
 * @example
 * const type: RepairActionType = "replace-recipe";
 */
export type RepairActionType =
  | "replace-recipe"
  | "replace-fragment"
  | "retune-design-dna"
  | "adjust-composition-order"
  | "adjust-cta-cadence"
  | "replace-component-variant"
  | "add-missing-trust-section"
  | "remove-placeholder-copy"
  | "mark-missing-fact"
  | "reduce-motion"
  | "add-mobile-cta"
  | "add-accessibility-fallback"
  | "declare-asset-required"
  | "use-safe-asset-substitution"
  | "add-seo-requirement"
  | "add-editability-binding"
  | "add-renderer-parity-warning";

/**
 * Target for a repair action.
 *
 * @example
 * const target: RepairTarget = { id: "hero", scope: "section", label: "Hero" };
 */
export type RepairTarget = Readonly<{
  id: string;
  scope: "candidate" | "plan" | "section" | "component" | "recipe" | "fragment" | "asset" | "motion" | "seo" | "accessibility" | "renderer" | "page";
  label: string;
}>;

/**
 * Repair rule that triggered an action.
 *
 * @example
 * const rule: RepairRule = { id: "rule.truth", category: "content-truth", description: "No placeholder copy." };
 */
export type RepairRule = Readonly<{
  id: string;
  category: RepairCategory;
  description: string;
}>;

/**
 * Repair hint carried from critic, similarity, simulation, or evolution.
 *
 * @example
 * const hint: RepairHint = { source: "critic", message: "Remove placeholder copy." };
 */
export type RepairHint = Readonly<{
  source: "critic" | "similarity" | "simulation" | "evolution" | "renderer-parity" | "repair";
  message: string;
}>;

/**
 * Priority metadata for sorting repair actions.
 *
 * @example
 * const priority: RepairPriority = { rank: 1, score: 100, reason: "Hard failure" };
 */
export type RepairPriority = Readonly<{
  rank: number;
  score: number;
  reason: string;
}>;

/**
 * One metadata-only repair action. It is never applied by Phase 36.
 *
 * @example
 * const action: RepairAction = createRepairAction({ type: "mark-missing-fact", category: "content-truth", severity: "major", target: pageTarget(), instruction: "Keep fact missing.", expectedImpact: 12, risk: "low", confidence: 0.9, ruleId: "truth" });
 */
export type RepairAction = Readonly<{
  id: string;
  type: RepairActionType;
  category: RepairCategory;
  severity: RepairSeverity;
  target: RepairTarget;
  instruction: string;
  expectedImpact: number;
  risk: "low" | "medium" | "high";
  confidence: number;
  priority: RepairPriority;
  hints: RepairHint[];
  ruleId: string;
  metadata: Record<string, JsonValue>;
  applied: false;
  createsBuilderNodes: false;
  generatesCode: false;
}>;

/**
 * Repair plan emitted by the Repair Engine.
 *
 * @example
 * const plan: RepairPlan = result.plan;
 */
export type RepairPlan = Readonly<{
  id: string;
  version: typeof REPAIR_ENGINE_VERSION_STRING;
  sourceCandidateId?: string;
  actions: RepairAction[];
  rules: RepairRule[];
  hints: RepairHint[];
  priorities: RepairPriority[];
  expectedImpact: number;
  risk: "low" | "medium" | "high";
  confidence: number;
  metadata: Record<string, JsonValue>;
  applied: false;
}>;

/**
 * Repair confidence.
 *
 * @example
 * const confidence = result.confidence.score;
 */
export type RepairConfidence = Readonly<{ score: number; reasons: string[] }>;

/**
 * Repair metrics.
 *
 * @example
 * const count = result.metrics.actionCount;
 */
export type RepairMetrics = Readonly<{
  actionCount: number;
  highPriorityActionCount: number;
  ruleCount: number;
  hintCount: number;
  warningCount: number;
  categoryCount: number;
  metadataOnly: true;
  applied: false;
  rendered: false;
  builderNodesCreated: false;
  mapperExecuted: false;
}>;

export type RepairWarning = EngineWarning;

/**
 * Complete Repair Engine output.
 *
 * @example
 * const result: RepairResult = repair.data;
 */
export type RepairResult = Readonly<{
  id: string;
  version: typeof REPAIR_ENGINE_VERSION_STRING;
  plan: RepairPlan;
  prioritizedActions: RepairAction[];
  targetModules: string[];
  targetSections: string[];
  targetComponents: string[];
  confidence: RepairConfidence;
  warnings: RepairWarning[];
  metrics: RepairMetrics;
  trace: string[];
  metadata: Record<string, JsonValue>;
  applied: false;
  rendered: false;
  builderNodesCreated: false;
  mapperExecuted: false;
}>;

function slug(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, ".").replace(/(^\.|\.$)/g, "").slice(0, 64);
}

/**
 * Builds a stable page target.
 *
 * @example
 * const target = pageTarget();
 */
export function pageTarget(label = "Page"): RepairTarget {
  return Object.freeze({ id: "page", scope: "page", label });
}

/**
 * Creates a metadata-only repair action.
 *
 * @example
 * const action = createRepairAction({ type: "remove-placeholder-copy", category: "content-truth", severity: "blocker", target: pageTarget(), instruction: "Remove placeholder copy.", expectedImpact: 20, risk: "low", confidence: 0.9, ruleId: "truth.placeholder" });
 */
export function createRepairAction(input: Omit<RepairAction, "id" | "priority" | "applied" | "createsBuilderNodes" | "generatesCode" | "metadata" | "hints"> & {
  id?: string;
  priorityScore?: number;
  priorityReason?: string;
  hints?: RepairHint[];
  metadata?: Record<string, JsonValue>;
}): RepairAction {
  const score = input.priorityScore ?? (input.severity === "blocker" ? 100 : input.severity === "major" ? 80 : input.severity === "minor" ? 55 : 30);
  return Object.freeze({
    id: input.id ?? `repair.action.${input.category}.${input.type}.${slug(input.target.id)}.${slug(input.instruction)}`,
    type: input.type,
    category: input.category,
    severity: input.severity,
    target: input.target,
    instruction: input.instruction,
    expectedImpact: Math.max(0, Math.min(100, Math.round(input.expectedImpact))),
    risk: input.risk,
    confidence: Math.max(0, Math.min(1, Number(input.confidence.toFixed(2)))),
    priority: Object.freeze({ rank: 0, score, reason: input.priorityReason ?? `${input.severity} ${input.category} repair.` }),
    hints: input.hints ?? [],
    ruleId: input.ruleId,
    metadata: input.metadata ?? {},
    applied: false as const,
    createsBuilderNodes: false as const,
    generatesCode: false as const,
  });
}
