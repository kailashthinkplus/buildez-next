import type { AICompatibilityMatrix } from "./aiCompatibilityMatrix";
import type { AIEditSafety } from "./aiEditSafety";

export type AICompatibilityWarning = Readonly<{
  code: string;
  severity: "info" | "warning" | "critical";
  message: string;
  blockers: string[];
}>;

export type AICompatibilityMetrics = Readonly<{
  widgetCount: number;
  aiInsertSafeCount: number;
  aiInspectorSafeCount: number;
  aiCommandExecutionSafeCount: number;
  aiPublishSafeCount: number;
  satisfiedSafetyRuleCount: number;
  totalSafetyRuleCount: number;
  compatibilityScore: number;
}>;

export type AICompatibilityValidationResult = Readonly<{
  valid: boolean;
  warnings: AICompatibilityWarning[];
  metrics: AICompatibilityMetrics;
}>;

export function validateAICompatibility(
  matrix: AICompatibilityMatrix,
  safetyRules: readonly AIEditSafety[]
): AICompatibilityValidationResult {
  const warnings: AICompatibilityWarning[] = [];
  const aiInsertSafeCount = matrix.widgetCapabilities.filter((capability) => capability.canAIInsert).length;
  const aiInspectorSafeCount = matrix.widgetCapabilities.filter((capability) => capability.canAIUseInspector).length;
  const aiCommandExecutionSafeCount = matrix.commandCapabilities.filter((capability) => capability.canAIExecute).length;
  const aiPublishSafeCount = matrix.widgetCapabilities.filter((capability) => capability.canAIPublishSafely).length;
  const satisfiedSafetyRuleCount = safetyRules.filter((rule) => rule.currentlySatisfied).length;

  if (aiInsertSafeCount === 0) {
    warnings.push(warning("AI_INSERT_BLOCKED", "critical", "No native widget is currently safe for AI insertion.", ["RELEASE_GATE_FAILED"]));
  }

  if (aiCommandExecutionSafeCount === 0) {
    warnings.push(warning("AI_COMMANDBUS_BLOCKED", "critical", "AI CommandBus execution remains blocked.", ["BUG-0031", "BUG-0033"]));
  }

  if (aiPublishSafeCount === 0) {
    warnings.push(warning("AI_PUBLISH_BLOCKED", "critical", "No AI-generated Builder output is currently safe to publish.", ["BUG-0026", "BUG-0027", "BUG-0039"]));
  }

  const metrics: AICompatibilityMetrics = Object.freeze({
    widgetCount: matrix.widgetCapabilities.length,
    aiInsertSafeCount,
    aiInspectorSafeCount,
    aiCommandExecutionSafeCount,
    aiPublishSafeCount,
    satisfiedSafetyRuleCount,
    totalSafetyRuleCount: safetyRules.length,
    compatibilityScore: calculateScore({
      widgetCount: matrix.widgetCapabilities.length,
      aiInsertSafeCount,
      aiInspectorSafeCount,
      aiCommandExecutionSafeCount,
      aiPublishSafeCount,
      satisfiedSafetyRuleCount,
      totalSafetyRuleCount: safetyRules.length,
    }),
  });

  return Object.freeze({
    valid: warnings.every((entry) => entry.severity !== "critical"),
    warnings,
    metrics,
  });
}

function calculateScore(input: Omit<AICompatibilityMetrics, "compatibilityScore">): number {
  const widgetDenominator = Math.max(input.widgetCount, 1);
  const safetyDenominator = Math.max(input.totalSafetyRuleCount, 1);
  const weighted =
    (input.aiInsertSafeCount / widgetDenominator) * 25 +
    (input.aiInspectorSafeCount / widgetDenominator) * 20 +
    (input.aiCommandExecutionSafeCount > 0 ? 15 : 0) +
    (input.aiPublishSafeCount / widgetDenominator) * 25 +
    (input.satisfiedSafetyRuleCount / safetyDenominator) * 15;
  return Math.round(weighted);
}

function warning(code: string, severity: AICompatibilityWarning["severity"], message: string, blockers: string[]): AICompatibilityWarning {
  return Object.freeze({ code, severity, message, blockers });
}
