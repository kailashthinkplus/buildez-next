import type { EngineResult } from "../sdk";
import type { RepairInput } from "./repairInput";
import type { RepairResult } from "./repairPlan";

/**
 * Validates Repair Engine input.
 *
 * @example
 * const validation = validateRepairInput(input);
 */
export function validateRepairInput(input: RepairInput): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  if (!input.criticResult && !input.similarityResult && !input.simulationResult && !input.evolutionResult && !input.compiledPlan) {
    issues.push("Repair input is sparse; only baseline repair planning can run.");
  }
  if (input.featureFlags && Object.values(input.featureFlags).some(Boolean)) {
    issues.push("Repair Engine should remain inert with feature flags false.");
  }
  return Object.freeze({ valid: true, issues });
}

/**
 * Validates Repair Engine result.
 *
 * @example
 * const validation = validateRepairResult(result);
 */
export function validateRepairResult(result: RepairResult): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  if (!result.id) issues.push("Repair result requires an id.");
  if (!result.version) issues.push("Repair result requires a version.");
  if (!result.plan) issues.push("Repair plan is required.");
  if (result.plan.actions.some((action) => !action.target || !action.category || !action.severity)) issues.push("Every action requires target, category, and severity.");
  if (result.plan.actions.some((action) => action.severity === "blocker" && action.priority.score < 80)) issues.push("Hard failures must produce high-priority repair actions.");
  if (result.prioritizedActions.some((action, index) => action.priority.rank !== index + 1)) issues.push("Actions must be prioritized in rank order.");
  if (!result.trace.includes("repair.metadata-only")) issues.push("Trace must include metadata-only execution.");
  if (result.applied || result.rendered || result.builderNodesCreated || result.mapperExecuted) issues.push("Repair result must not apply changes or create output.");
  return Object.freeze({ valid: issues.length === 0, issues });
}

/**
 * Validates EngineResult<RepairResult>.
 *
 * @example
 * const validation = validateRepairEngineResult(result);
 */
export function validateRepairEngineResult(result: EngineResult<RepairResult>): { valid: boolean; issues: string[] } {
  const validation = validateRepairResult(result.data);
  const issues = [...validation.issues];
  if (result.trace.module !== "repair") issues.push("EngineResult trace module must be repair.");
  return Object.freeze({ valid: issues.length === 0, issues });
}

/* ==========================================================
   RC-15 Blueprint Repair Validation Gates
========================================================== */

import { serializeBlueprint } from "../../core/serialization";
import { validateBlueprint } from "../../core/validation";
import type { BuilderBlueprint } from "../../types/blueprint";
import { ComponentVariantCompilerRegistry } from "../builder-blueprint/component-recipes";
import { buildComponentCatalog } from "../components/componentCatalog";
import type { BlueprintRepairAction } from "./RepairAction";

export type RepairValidationGate = Readonly<{
  gate: "blueprint" | "component-compatibility" | "responsive" | "serialization";
  valid: boolean;
  issues: readonly string[];
}>;

export type BlueprintRepairValidationResult = Readonly<{
  valid: boolean;
  gates: readonly RepairValidationGate[];
  issues: readonly string[];
}>;

function componentCompatibilityGate(
  action?: BlueprintRepairAction,
  businessFamily?: string
): RepairValidationGate {
  if (action?.type !== "replace_component_variant") {
    return Object.freeze({
      gate: "component-compatibility",
      valid: true,
      issues: Object.freeze([]),
    });
  }

  const catalog = buildComponentCatalog();
  const from = catalog.find((item) => item.id === action.from);
  const to = catalog.find((item) => item.id === action.to);
  const issues: string[] = [];

  if (!to) issues.push(`Unknown replacement component: ${action.to ?? "missing"}.`);
  if (!to || !ComponentVariantCompilerRegistry.ids().includes(to.id as never)) {
    issues.push(`Replacement has no registered native compiler: ${action.to ?? "missing"}.`);
  }
  if (from && to && from.family !== to.family && from.category !== to.category) {
    issues.push(`Incompatible component families: ${from.family} → ${to.family}.`);
  }
  if (
    to &&
    businessFamily &&
    !to.metadata.compatibleFamilies.includes(businessFamily as never)
  ) {
    issues.push(`${to.id} is incompatible with ${businessFamily}.`);
  }

  return Object.freeze({
    gate: "component-compatibility",
    valid: !issues.length,
    issues: Object.freeze(issues),
  });
}

function responsiveRepairGate(
  blueprint: BuilderBlueprint
): RepairValidationGate {
  const unsafe = Object.values(blueprint.nodes).filter((node) => {
    const width =
      node.style.width && typeof node.style.width === "object"
        ? (node.style.width as Record<string, unknown>).mobile
        : undefined;
    const minWidth =
      node.style.minWidth && typeof node.style.minWidth === "object"
        ? (node.style.minWidth as Record<string, unknown>).mobile
        : node.style.minWidth;

    return (
      Number.parseFloat(String(width ?? "0")) > 600 ||
      Number.parseFloat(String(minWidth ?? "0")) > 390
    );
  });
  const issues = unsafe.map((node) => `Mobile overflow risk at ${node.id}.`);

  return Object.freeze({
    gate: "responsive",
    valid: !issues.length,
    issues: Object.freeze(issues),
  });
}

export function validateRepairBlueprint(
  blueprint: BuilderBlueprint,
  action?: BlueprintRepairAction,
  businessFamily?: string
): BlueprintRepairValidationResult {
  const validation = validateBlueprint(blueprint);
  const serialized = serializeBlueprint(blueprint);

  const blueprintGate = Object.freeze({
    gate: "blueprint" as const,
    valid: validation.valid,
    issues: Object.freeze(
      validation.issues
        .filter((item) => item.severity === "error")
        .map((item) => `${item.code}: ${item.message}`)
    ),
  });
  const serializationGate = Object.freeze({
    gate: "serialization" as const,
    valid: serialized.ok,
    issues: Object.freeze(
      "errors" in serialized
        ? serialized.errors.map((item) => `${item.code}: ${item.message}`)
        : []
    ),
  });
  const gates = Object.freeze([
    blueprintGate,
    componentCompatibilityGate(action, businessFamily),
    responsiveRepairGate(blueprint),
    serializationGate,
  ]);
  const issues = Object.freeze(gates.flatMap((gate) => gate.issues));

  return Object.freeze({
    valid: gates.every((gate) => gate.valid),
    gates,
    issues,
  });
}
