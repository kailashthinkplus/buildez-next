import { CommandBus, type CommandHistoryMetadata } from "../../core/commands/CommandBus";
import type { BuilderCommand } from "../../core/commands/BuilderCommand";
import type { BuilderBlueprint, BuilderNode } from "../../types/blueprint";
import { buildBuilderBlueprint } from "../builder-blueprint/BuilderBlueprintEngine";
import type { BuilderBlueprintInput } from "../builder-blueprint/builderBlueprint";
import { evaluateVisualQuality } from "../visual-quality";
import type { BlueprintRepairPlan } from "./repairPlan";
import type { BlueprintRepairAction } from "./RepairAction";
import { calculateRepairEffectiveness, type RepairEffectivenessScore } from "./RepairEffectivenessScore";
import { validateRepairBlueprint, type BlueprintRepairValidationResult } from "./repairValidation";
import { ChangeLayoutPatternCommand, ReduceContentDensityCommand, ReplaceComponentVariantCommand, UpdateDesignTokenCommand } from "./commands";
import { descendants, sectionNode } from "./commands/repairCommandUtils";

export type RepairExecutionInput = Readonly<{
  blueprint: BuilderBlueprint;
  plan: BlueprintRepairPlan;
  mode: "apply" | "simulate";
  compileInput?: BuilderBlueprintInput;
  businessFamily?: string;
  selectedComponents?: readonly string[];
}>;

export type RepairExecutionResult = Readonly<{
  status: "applied" | "simulated" | "rejected";
  blueprint: BuilderBlueprint;
  validation: BlueprintRepairValidationResult;
  effectiveness: RepairEffectivenessScore;
  history: readonly CommandHistoryMetadata[];
  executedActionIds: readonly string[];
  sourceBlueprintMutated: false;
  persisted: boolean;
  commandBus?: CommandBus;
}>;

function replacementBlueprint(input: BuilderBlueprintInput, action: BlueprintRepairAction): BuilderBlueprint | undefined {
  if (!action.sectionId || !action.to) return undefined;
  const cloned = structuredClone(input);
  const compositionResult = cloned.compositionResult ? { ...cloned.compositionResult, orderedSectionSequence: cloned.compositionResult.orderedSectionSequence.map((section) => section.id === action.sectionId ? { ...section, componentId: action.to! } : section) } : undefined;
  const websiteSpec = cloned.websiteSpec ? { ...cloned.websiteSpec, sections: cloned.websiteSpec.sections.map((section) => String(section.id) === action.sectionId ? { ...section, componentVariantRef: action.to } : section) } : undefined;
  const next = { ...cloned, compositionResult, websiteSpec } as BuilderBlueprintInput;
  return buildBuilderBlueprint(next).nativeBlueprint;
}

function replacementNodes(source: BuilderBlueprint, compiled: BuilderBlueprint, sectionId: string): BuilderNode[] {
  const oldSection = sectionNode(source, sectionId); const newSection = sectionNode(compiled, sectionId);
  if (!oldSection || !newSection) return [];
  const oldByType = new Map<string, BuilderNode[]>();
  for (const id of descendants(source, oldSection.id)) { const node = source.nodes[id]; oldByType.set(node.type, [...(oldByType.get(node.type) ?? []), node]); }
  const counters = new Map<string, number>();
  return descendants(compiled, newSection.id).map((id) => {
    const node = compiled.nodes[id]; const index = counters.get(node.type) ?? 0; counters.set(node.type, index + 1); const old = oldByType.get(node.type)?.[index];
    if (!old || !["heading", "text", "button", "image"].includes(node.type)) return node;
    const props = { ...node.props };
    for (const key of ["text", "url", "src", "alt", "aiImagePrompt"]) if (old.props[key] !== undefined) props[key] = old.props[key];
    return { ...node, props };
  });
}

function commandFor(action: BlueprintRepairAction, input: RepairExecutionInput): BuilderCommand | undefined {
  if (!action.approved) return undefined;
  if (action.type === "replace_component_variant" && action.sectionId && action.to && input.compileInput) {
    const compiled = replacementBlueprint(input.compileInput, action); if (!compiled) return undefined;
    return new ReplaceComponentVariantCommand(action.sectionId, action.from, action.to, replacementNodes(input.blueprint, compiled, action.sectionId), action.id);
  }
  if (action.type === "change_layout_pattern" && action.sectionId && action.pattern) return new ChangeLayoutPatternCommand(action.sectionId, action.pattern, action.id);
  if (action.type === "adjust_design_token" && action.token && action.delta) return new UpdateDesignTokenCommand(action.token, action.delta, action.id);
  if (action.type === "reduce_content_density" && action.sectionId) return new ReduceContentDensityCommand(action.sectionId, action.id);
  return undefined;
}

export function executeRepairPlan(input: RepairExecutionInput): RepairExecutionResult {
  const source = structuredClone(input.blueprint);
  const approved = input.plan.actions.filter((action) => action.approved);
  const preflight = approved.map((action) => validateRepairBlueprint(source, action, input.businessFamily));
  const failed = preflight.find((result) => !result.valid);
  const beforeScore = evaluateVisualQuality({ blueprint: source, selectedComponents: input.selectedComponents }).overall;
  if (failed || !approved.length) return Object.freeze({ status: "rejected", blueprint: source, validation: failed ?? validateRepairBlueprint(source), effectiveness: calculateRepairEffectiveness(beforeScore, beforeScore, 0), history: Object.freeze([]), executedActionIds: Object.freeze([]), sourceBlueprintMutated: false, persisted: false });
  const commands = approved.map((action) => commandFor(action, input));
  if (commands.some((command) => !command)) {
    const validation = Object.freeze({ valid: false, gates: Object.freeze([]), issues: Object.freeze(["An approved repair could not be converted to a Builder command."]) });
    return Object.freeze({ status: "rejected", blueprint: source, validation, effectiveness: calculateRepairEffectiveness(beforeScore, beforeScore, 0), history: Object.freeze([]), executedActionIds: Object.freeze([]), sourceBlueprintMutated: false, persisted: false });
  }
  const validationBus = new CommandBus(); validationBus.initialize(source);
  try { validationBus.transaction("Validate Approved Visual Repairs", () => commands.forEach((command) => validationBus.execute(command!))); } catch {
    const validation = Object.freeze({ valid: false, gates: Object.freeze([]), issues: Object.freeze(["The proposed Builder command transaction failed Blueprint validation."]) });
    return Object.freeze({ status: "rejected", blueprint: source, validation, effectiveness: calculateRepairEffectiveness(beforeScore, beforeScore, 0), history: Object.freeze([]), executedActionIds: Object.freeze([]), sourceBlueprintMutated: false, persisted: false });
  }
  const candidateValidation = validateRepairBlueprint(validationBus.getBlueprint(), undefined, input.businessFamily);
  if (!candidateValidation.valid) return Object.freeze({ status: "rejected", blueprint: source, validation: candidateValidation, effectiveness: calculateRepairEffectiveness(beforeScore, beforeScore, 0), history: Object.freeze([]), executedActionIds: Object.freeze([]), sourceBlueprintMutated: false, persisted: false });
  const bus = new CommandBus(); bus.initialize(source);
  try { bus.transaction("Apply Approved Visual Repairs", () => commands.forEach((command) => bus.execute(command!))); } catch { const validation = validateRepairBlueprint(source); return Object.freeze({ status: "rejected", blueprint: source, validation, effectiveness: calculateRepairEffectiveness(beforeScore, beforeScore, 0), history: Object.freeze([]), executedActionIds: Object.freeze([]), sourceBlueprintMutated: false, persisted: false }); }
  const blueprint = bus.getBlueprint();
  const validation = validateRepairBlueprint(blueprint, undefined, input.businessFamily);
  if (!validation.valid) { bus.undo(); return Object.freeze({ status: "rejected", blueprint: source, validation, effectiveness: calculateRepairEffectiveness(beforeScore, beforeScore, 0), history: Object.freeze(bus.getHistoryMetadata()), executedActionIds: Object.freeze([]), sourceBlueprintMutated: false, persisted: false }); }
  const selected = [...(input.selectedComponents ?? [])]; for (const action of approved) if (action.type === "replace_component_variant" && action.to) { const index = selected.indexOf(action.from ?? ""); if (index >= 0) selected[index] = action.to; }
  const afterScore = evaluateVisualQuality({ blueprint, selectedComponents: selected }).overall;
  const effectiveness = calculateRepairEffectiveness(beforeScore, afterScore, Math.min(...approved.map((action) => action.confidence)));
  return Object.freeze({ status: input.mode === "simulate" ? "simulated" : "applied", blueprint, validation, effectiveness, history: Object.freeze(bus.getHistoryMetadata()), executedActionIds: Object.freeze(approved.map((action) => action.id)), sourceBlueprintMutated: false, persisted: input.mode === "apply", commandBus: bus });
}

export const RepairExecutor = Object.freeze({ execute: executeRepairPlan });
