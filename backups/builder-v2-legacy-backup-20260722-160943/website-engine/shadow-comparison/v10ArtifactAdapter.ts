import type { JsonValue } from "../sdk";
import type { ShadowComparisonInput } from "./shadowInput";
import type { V10ShadowArtifact } from "./shadowResult";

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" ? value as Record<string, unknown> : undefined;
}

function categoryScore(critic: ShadowComparisonInput["criticResult"] | undefined, category: string): number | undefined {
  return critic?.categoryScores.find((score) => score.category === category)?.score;
}

function metadataFor(input: ShadowComparisonInput): Record<string, JsonValue> {
  return {
    metadataOnly: true,
    orchestratorProvided: Boolean(input.v10OrchestratorResult),
    websiteSpecProvided: Boolean(input.v10WebsiteSpec),
    compiledPlanProvided: Boolean(input.v10CompiledWebsitePlan),
    builderBlueprintProvided: Boolean(input.v10BuilderBlueprintResult),
    criticProvided: Boolean(input.criticResult),
    similarityProvided: Boolean(input.similarityResult),
    rendererParityProvided: Boolean(input.rendererParityResult),
    simulationProvided: Boolean(input.simulationResult),
  };
}

/**
 * Adapts provided Website Engine v10 metadata into a shadow artifact summary.
 *
 * @example
 * const v10 = adaptV10Artifact({ v10OrchestratorResult });
 */
export function adaptV10Artifact(input: ShadowComparisonInput): V10ShadowArtifact {
  const orchestrator = input.v10OrchestratorResult;
  const spec = asRecord(input.v10WebsiteSpec);
  const compiledPlan = asRecord(input.v10CompiledWebsitePlan);
  const builderBlueprint = asRecord(input.v10BuilderBlueprintResult);
  const provided = Boolean(orchestrator || spec || compiledPlan || builderBlueprint || input.criticResult || input.similarityResult || input.rendererParityResult || input.simulationResult);
  const qualityScore = input.criticResult?.overallScore;
  const editabilityScore = categoryScore(input.criticResult, "editability") ?? input.simulationResult?.editabilityResult.score;
  const rendererParityScore = categoryScore(input.criticResult, "renderer-parity") ?? input.simulationResult?.parityResult.score;
  const diversityScore = input.similarityResult?.overallDiversityScore.score;
  const performanceRisk = input.simulationResult ? 100 - input.simulationResult.performanceResult.score : undefined;
  const safetyRisk = input.criticResult ? Math.min(100, input.criticResult.hardFailures.length * 25 + input.criticResult.issues.filter((issue) => issue.category === "content-truth").length * 15) : undefined;
  const repairabilityScore = input.criticResult ? Math.max(0, 100 - input.criticResult.hardFailures.length * 20 - input.criticResult.recommendations.length * 2) : undefined;
  const nativeBuilderCompatible = input.rendererParityResult ? input.rendererParityResult.parityReady : undefined;
  const warningCount = (orchestrator?.warnings.length ?? 0) + (input.criticResult?.warnings.length ?? 0) + (input.similarityResult?.warnings.length ?? 0) + (input.rendererParityResult?.warnings.length ?? 0) + (input.simulationResult?.warnings.length ?? 0);
  const issueCount = (input.criticResult?.issues.length ?? 0) + (input.similarityResult?.issues.length ?? 0) + (input.rendererParityResult?.issues.length ?? 0) + (input.simulationResult?.issues.length ?? 0);
  const completedStageCount = orchestrator?.stageResults.filter((stage) => stage.status === "completed").length;
  const blockedStageCount = orchestrator?.stageResults.filter((stage) => stage.status === "blocked").length;
  const missingSignals = [
    !provided ? "v10 artifact metadata" : undefined,
    qualityScore === undefined ? "v10 critic quality score" : undefined,
    editabilityScore === undefined ? "v10 editability score" : undefined,
    rendererParityScore === undefined ? "v10 renderer parity score" : undefined,
    diversityScore === undefined ? "v10 diversity score" : undefined,
    performanceRisk === undefined ? "v10 performance risk" : undefined,
    safetyRisk === undefined ? "v10 safety risk" : undefined,
    repairabilityScore === undefined ? "v10 repairability score" : undefined,
    nativeBuilderCompatible === undefined ? "v10 native Builder compatibility" : undefined,
  ].filter(Boolean) as string[];

  return Object.freeze({
    id: orchestrator?.id ?? (typeof spec?.id === "string" ? spec.id : typeof compiledPlan?.id === "string" ? compiledPlan.id : typeof builderBlueprint?.id === "string" ? builderBlueprint.id : "shadow.v10.provided-artifact"),
    provided,
    source: orchestrator ? "orchestrator" : provided ? "provided" : "missing",
    summary: provided ? "Website Engine v10 metadata was provided for shadow comparison." : "Website Engine v10 metadata was not provided; comparison is incomplete.",
    qualityScore,
    editabilityScore,
    rendererParityScore,
    diversityScore,
    performanceRisk,
    safetyRisk,
    repairabilityScore,
    nativeBuilderCompatible,
    completedStageCount,
    blockedStageCount,
    warningCount,
    issueCount,
    missingSignals,
    metadata: metadataFor(input),
  });
}
