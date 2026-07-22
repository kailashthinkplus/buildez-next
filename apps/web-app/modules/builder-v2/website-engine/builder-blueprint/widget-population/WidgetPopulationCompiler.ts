import type { NodeType } from "../../../types/blueprint";
import { NativeVisualCapabilityRegistry } from "../../native-visual-capabilities";
import type { WidgetPopulationContext, WidgetPopulationResult } from "./contracts";
import { DedicatedPopulationCompilers } from "./compilers";
import { policyFor } from "./industryRolePolicies";
import { WidgetPopulationRegistry } from "./WidgetPopulationRegistry";

export function compileWidgetPopulation(context: WidgetPopulationContext): WidgetPopulationResult {
  const contract = WidgetPopulationRegistry.get(context.selectedWidgetType);
  const compiler = DedicatedPopulationCompilers.find((candidate)=>candidate.widgetType === context.selectedWidgetType);
  const native = NativeVisualCapabilityRegistry.get(context.selectedWidgetType);
  if (!contract || !compiler || !native?.registered || !native.inspectorSupported || !native.serializable || !native.canvasSupported || !native.runtimeSupported) return { ok:false,widgetType:context.selectedWidgetType,diagnostics:[{code:"production-support-missing",severity:"error",message:"Widget lacks a complete registered compiler/Inspector/persistence/renderer contract."}] };
  const family = context.businessProfile?.businessFamily ?? "unknown";
  const policy = policyFor(family);
  if (policy.forbid.includes(context.selectedWidgetType)) return rejected(context.selectedWidgetType,"industry-forbidden","The industry policy forbids this widget for the supplied context.",contract.fallbackPolicy.replacementWidget);
  const roleCorpus = `${context.sectionIntent.type} ${context.narrativeRole}`.toLowerCase();
  if (!contract.supportedNarrativeRoles.some((role)=>roleCorpus.includes(role.replace(/-/g,"_")) || roleCorpus.includes(role))) return rejected(context.selectedWidgetType,"role-incompatible","The selected widget is not compatible with the section narrative role.",contract.fallbackPolicy.replacementWidget);
  return compiler.compile(context, contract);
}

function rejected(widgetType: NodeType, code: string, reason: string, replacement?: NodeType): WidgetPopulationResult { return {ok:false,widgetType,diagnostics:[{code,severity:"error",message:reason}],replacementRecommendation:replacement ? {widgetType:replacement,reason} : undefined}; }
