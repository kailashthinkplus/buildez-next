import { buildCommandCapabilities } from "./aiCommandCapability";
import { buildAICompatibilityMatrix, type AICompatibilityMatrix } from "./aiCompatibilityMatrix";
import {
  validateAICompatibility,
  type AICompatibilityMetrics,
  type AICompatibilityWarning,
} from "./aiCompatibilityValidation";
import { buildEditSafetyRules, type AIEditSafety } from "./aiEditSafety";
import { buildInspectorCapabilities } from "./aiInspectorCapability";
import { buildNodeCapabilities, buildWidgetCapabilities, NATIVE_AI_WIDGET_TYPES } from "./aiNodeCapability";
import { buildRegenerationScopes } from "./aiRegenerationScope";
import { runAICompatibilityVerification, type AICompatibilityVerificationResult } from "./aiCompatibilityVerification";
import { AI_COMPATIBILITY_VERSION_STRING } from "./version";

export type AICompatibilityResult = Readonly<{
  id: string;
  version: string;
  status: "blocked";
  aiReady: false;
  matrix: AICompatibilityMatrix;
  editSafetyRules: AIEditSafety[];
  warnings: AICompatibilityWarning[];
  metrics: AICompatibilityMetrics;
  verification: AICompatibilityVerificationResult;
  notes: string[];
}>;

export function runAICompatibilityAudit(): AICompatibilityResult {
  const matrix = buildAICompatibilityMatrix({
    nodeCapabilities: buildNodeCapabilities(),
    widgetCapabilities: buildWidgetCapabilities(),
    inspectorCapabilities: buildInspectorCapabilities(NATIVE_AI_WIDGET_TYPES),
    commandCapabilities: buildCommandCapabilities(),
    regenerationScopes: buildRegenerationScopes(NATIVE_AI_WIDGET_TYPES),
  });
  const editSafetyRules = buildEditSafetyRules();
  const validation = validateAICompatibility(matrix, editSafetyRules);
  const partial: Omit<AICompatibilityResult, "verification"> = Object.freeze({
    id: "builder-ai-compatibility.audit",
    version: AI_COMPATIBILITY_VERSION_STRING,
    status: "blocked",
    aiReady: false,
    matrix,
    editSafetyRules,
    warnings: validation.warnings,
    metrics: validation.metrics,
    notes: [
      "BSP-5 is metadata/contracts only.",
      "AI generation, Mapper execution, Builder node insertion, Builder store mutation, and CommandBus execution remain blocked.",
      "Compatibility cannot pass until release gate blockers are resolved and regression/stress suites are executable.",
    ],
  });
  const result: AICompatibilityResult = Object.freeze({
    ...partial,
    verification: runAICompatibilityVerification(partial as AICompatibilityResult),
  });
  return result;
}
