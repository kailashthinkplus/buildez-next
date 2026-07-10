import type { CompilerInput, CompiledQualityGate } from "./compiledPlan";

export function compileQualityGates(input: CompilerInput): CompiledQualityGate[] {
  return [
    ...input.decisionPlan.selectedQualityGates.map((gate) => Object.freeze({ id: `quality.${gate}`, category: gate.includes("asset") ? "asset-readiness" as const : "truth" as const, required: true, description: `Decision quality gate: ${gate}.`, source: "decision" as const })),
    ...(input.constraintResult?.evaluatedRuleIds ?? []).map((ruleId) => Object.freeze({ id: `quality.constraint.${ruleId}`, category: "truth" as const, required: true, description: `Carry forward constraint rule ${ruleId}.`, source: "constraint" as const })),
    ...(input.componentResult?.qualityChecks ?? []).map((check) => Object.freeze({ id: `quality.component.${check.componentId}.${check.check}`, category: "editability" as const, required: true, description: check.notes.join(" "), source: "component" as const })),
    ...(input.compositionResult?.qualityChecks ?? []).map((check) => Object.freeze({ id: `quality.composition.${check.check}`, category: "composition" as const, required: true, description: check.notes.join(" "), source: "composition" as const })),
    Object.freeze({ id: "quality.compiler.no-builder-output", category: "editability" as const, required: true, description: "Compiler output must remain mapper-ready and must not contain Builder nodes.", source: "compiler" as const }),
    Object.freeze({ id: "quality.compiler.accessibility", category: "accessibility" as const, required: true, description: "Carry accessibility and reduced-motion requirements forward.", source: "compiler" as const }),
    Object.freeze({ id: "quality.compiler.renderer-parity", category: "renderer-parity" as const, required: true, description: "Mapper and renderer parity must be preserved downstream.", source: "compiler" as const }),
  ];
}
