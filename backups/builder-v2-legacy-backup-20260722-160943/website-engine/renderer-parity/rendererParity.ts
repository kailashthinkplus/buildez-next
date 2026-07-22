import type { BuilderBlueprint } from "../../types/blueprint";
import type { NativeBuilderMappingPlan } from "../mapper";
import type { EngineWarning } from "../sdk";
import { collectRendererParityMetrics, type RendererParityMetrics } from "./parityMetrics";
import { buildParitySnapshot, compareParitySnapshots, type RendererParitySnapshot } from "./paritySnapshot";
import { buildRendererParityRules, type RendererParityRule, type RendererParityRuleCategory } from "./parityRules";
import { buildRenderTargetMatrix, type RenderTargetDescriptor } from "./renderTargets";
import { RENDERER_PARITY_VERSION_STRING } from "./version";

export type RendererParityWarning = EngineWarning;

export type RendererParityIssue = Readonly<{
  id: string;
  ruleId: string;
  category: RendererParityRuleCategory;
  severity: "info" | "minor" | "major" | "blocker";
  target: string;
  message: string;
  nodeId?: string;
}>;

export type RendererParityInput = Readonly<{
  mappingPlan?: NativeBuilderMappingPlan;
  blueprint?: BuilderBlueprint;
  sourceId?: string;
  featureFlags?: Readonly<Record<string, boolean>>;
}>;

export type RendererParityResult = Readonly<{
  id: string;
  version: string;
  targetMatrix: RenderTargetDescriptor[];
  rules: RendererParityRule[];
  snapshots: RendererParitySnapshot[];
  issues: RendererParityIssue[];
  warnings: RendererParityWarning[];
  metrics: RendererParityMetrics;
  parityReady: boolean;
  screenshotCaptured: false;
  rendered: false;
  sideEffects: false;
  trace: string[];
}>;

function parityIssue(input: {
  id: string;
  ruleId: string;
  category: RendererParityRuleCategory;
  severity: RendererParityIssue["severity"];
  target: string;
  message: string;
  nodeId?: string;
}): RendererParityIssue {
  return Object.freeze(input);
}

function collectIssues(input: RendererParityInput, snapshots: RendererParitySnapshot[], mismatchCodes: string[]): RendererParityIssue[] {
  const issues: RendererParityIssue[] = [];
  const targets = snapshots.map((snapshot) => snapshot.target);
  for (const target of ["canvas", "preview", "published", "export"]) {
    if (!targets.includes(target as typeof targets[number])) {
      issues.push(parityIssue({ id: `parity.issue.target.${target}`, ruleId: "parity.rule.target-coverage", category: "target-coverage", severity: "blocker", target, message: "Renderer parity target matrix must include canvas, preview, published, and export." }));
    }
  }
  if (!input.mappingPlan && !input.blueprint) {
    issues.push(parityIssue({ id: "parity.issue.reference.missing", ruleId: "parity.rule.mapper-compatibility", category: "mapper-compatibility", severity: "blocker", target: "all", message: "Renderer parity input requires a mapping plan or Builder Blueprint reference." }));
  }
  if (input.mappingPlan && !input.mappingPlan.validation.valid) {
    issues.push(parityIssue({ id: "parity.issue.mapper.invalid", ruleId: "parity.rule.mapper-compatibility", category: "mapper-compatibility", severity: "blocker", target: "all", message: "Mapping plan must be valid before renderer parity can be trusted." }));
  }
  for (const snapshot of snapshots) {
    for (const widgetType of snapshot.unsupportedWidgetTypes) {
      issues.push(parityIssue({ id: `parity.issue.${snapshot.target}.widget.${widgetType}`, ruleId: "parity.rule.widget-support", category: "widget-support", severity: "blocker", target: snapshot.target, message: `Unsupported widget type for parity contracts: ${widgetType}.` }));
    }
    if (!snapshot.hasResponsiveMetadata) {
      issues.push(parityIssue({ id: `parity.issue.${snapshot.target}.responsive`, ruleId: "parity.rule.responsive", category: "responsive", severity: "major", target: snapshot.target, message: "Responsive metadata is missing for parity verification." }));
    }
    if (!snapshot.hasStyleBindings) {
      issues.push(parityIssue({ id: `parity.issue.${snapshot.target}.styles`, ruleId: "parity.rule.style-binding", category: "style-binding", severity: "major", target: snapshot.target, message: "Style bindings are missing for parity verification." }));
    }
    if (snapshot.requiredAssetCount > 0 && snapshot.missingAssetCount > 0) {
      issues.push(parityIssue({ id: `parity.issue.${snapshot.target}.assets`, ruleId: "parity.rule.asset-readiness", category: "asset-readiness", severity: "major", target: snapshot.target, message: "Required assets include missing entries that must remain explicit before rendering." }));
    }
    if (!snapshot.hasMotionMetadata) {
      issues.push(parityIssue({ id: `parity.issue.${snapshot.target}.motion`, ruleId: "parity.rule.motion-metadata", category: "motion-metadata", severity: "minor", target: snapshot.target, message: "Motion metadata is missing or explicitly absent for this target." }));
    }
  }
  for (const code of mismatchCodes) {
    issues.push(parityIssue({ id: `parity.issue.mismatch.${code.toLowerCase().replace(/[^a-z0-9]+/g, ".")}`, ruleId: "parity.rule.target-coverage", category: "target-coverage", severity: "major", target: code.split(":")[0] ?? "all", message: `Metadata snapshot mismatch: ${code}.` }));
  }
  return issues;
}

/**
 * Runs metadata-only renderer parity checks over a Builder Blueprint or native mapping plan.
 *
 * @example
 * const result = runRendererParityCheck({ mappingPlan });
 */
export function runRendererParityCheck(input: RendererParityInput = {}): RendererParityResult {
  const targetMatrix = buildRenderTargetMatrix();
  const rules = buildRendererParityRules();
  const snapshots = targetMatrix.map((target) => buildParitySnapshot({ target, blueprint: input.blueprint, mappingPlan: input.mappingPlan }));
  const mismatchCodes = compareParitySnapshots(snapshots);
  const issues = collectIssues(input, snapshots, mismatchCodes);
  const warnings = issues
    .filter((issue) => issue.severity !== "info")
    .map((issue) => Object.freeze({
      code: issue.id.toUpperCase().replace(/[^A-Z0-9]+/g, "_"),
      message: issue.message,
      module: "renderer",
      severity: issue.severity === "blocker" ? "major" as const : issue.severity,
      targetId: issue.nodeId,
      metadata: { target: issue.target, category: issue.category },
    }));
  const metrics = collectRendererParityMetrics(targetMatrix, snapshots, issues, warnings.length);
  return Object.freeze({
    id: `renderer-parity.${input.sourceId ?? input.mappingPlan?.id ?? "local"}`,
    version: RENDERER_PARITY_VERSION_STRING,
    targetMatrix,
    rules,
    snapshots,
    issues,
    warnings,
    metrics,
    parityReady: issues.filter((issue) => issue.severity === "blocker" || issue.severity === "major").length === 0,
    screenshotCaptured: false as const,
    rendered: false as const,
    sideEffects: false as const,
    trace: [
      "renderer-parity.metadata-only",
      "no-screenshot-capture",
      "no-rendering-behavior-change",
      "no-canvas-runtime-edit",
      "no-builder-store-write",
      "no-production-wiring",
    ],
  });
}
