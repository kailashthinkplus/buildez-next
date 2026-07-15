import { runBuilderBlueprintEngine } from "../builder-blueprint";
import { runComponentEngine } from "../components";
import { runCompositionEngine } from "../composition";
import { runDecisionEngine } from "../decision";
import { runWebsiteCompiler } from "../compiler";
import { runCritic } from "../critic";
import { runNativeBuilderMapper } from "../mapper";
import { runAIV10Orchestrator } from "../orchestrator";
import { runAIPlanner } from "../planner";
import { runRendererParityCheck } from "../renderer-parity";
import { runRepair } from "../repair";
import { runShadowComparison } from "../shadow-comparison";
import { AI_V10_ENABLED, MAPPER_EXECUTION_ENABLED, WEBSITE_ENGINE_ENABLED } from "../sdk";
import { runWebsiteSpecBuilder } from "../specification";
import { adaptPreviewBlueprint } from "./adaptPreviewBlueprint";
import type { InternalPreviewInput } from "./previewInput";
import { INTERNAL_PREVIEW_FIXTURE_BUSINESS } from "./previewFixtures";
import { createPreviewTrace } from "./previewTrace";
import type { InternalPreviewResult } from "./types";
import { validatePreviewBlueprint } from "./previewValidation";
import { INTERNAL_PREVIEW_VERSION } from "./version";

function stableRequestId(prompt: string) {
  let hash = 2166136261;
  for (const character of prompt) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  return `preview-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

export function buildInternalPreview(input: InternalPreviewInput): InternalPreviewResult {
  const requestId = input.requestId ?? stableRequestId(input.prompt);
  const trace = createPreviewTrace(requestId);
  const businessContext = input.businessContext ?? INTERNAL_PREVIEW_FIXTURE_BUSINESS;
  const plannerResult = trace.run("planner", () => runAIPlanner({ prompt: input.prompt, businessContext }).data);
  const componentResult = trace.run("components", () => runComponentEngine({ businessProfile: undefined }).data);
  const compositionResult = trace.run("composition", () => runCompositionEngine({ componentResult }).data);
  const specification = trace.run("specification", () => runWebsiteSpecBuilder({ businessContext, componentResult, compositionResult }).data);
  const decisionPlan = trace.run("decision", () => runDecisionEngine().data.plan);
  const compiler = trace.run("compiler", () => runWebsiteCompiler({ decisionPlan, componentResult, compositionResult, websiteSpec: specification.websiteSpec }).data);
  const builderBlueprintArtifact = trace.run("builder-blueprint", () => runBuilderBlueprintEngine({ websiteSpec: specification.websiteSpec, websiteDNA: specification.websiteDNA, compiledPlan: compiler.plan, componentResult, compositionResult }).data);
  const canonicalBlueprint = adaptPreviewBlueprint(builderBlueprintArtifact);
  const mapperResult = trace.run("mapper-plan", () => runNativeBuilderMapper({ builderBlueprintResult: builderBlueprintArtifact }).data);
  const rendererParityResult = trace.run("renderer-parity", () => runRendererParityCheck({ blueprint: canonicalBlueprint, mappingPlan: mapperResult.mappingPlan, sourceId: requestId }));
  const criticResult = trace.run("critic", () => runCritic({ websiteSpec: specification.websiteSpec, websiteDNA: specification.websiteDNA, compiledPlan: compiler.plan, builderBlueprintResult: builderBlueprintArtifact, mappingPlan: mapperResult.mappingPlan, rendererParityResult, componentResult, compositionResult }).data);
  const repairRecommendations = trace.run("repair", () => runRepair({ criticResult, rendererParityResult, websiteSpec: specification.websiteSpec, websiteDNA: specification.websiteDNA, compiledPlan: compiler.plan, builderBlueprintResult: builderBlueprintArtifact, mappingPlan: mapperResult.mappingPlan, componentResult, compositionResult }).data);
  const orchestratorResult = trace.run("orchestrator-evidence", () => runAIV10Orchestrator({ prompt: input.prompt, mode: "shadow", plannerInput: { businessContext }, artifacts: { plannerResult, websiteSpec: specification.websiteSpec, compiledPlan: compiler.plan, builderBlueprintResult: builderBlueprintArtifact, mappingPlan: mapperResult.mappingPlan, criticResult, repairResult: repairRecommendations }, metadata: input.metadata }).data);
  const aiV9ShadowComparisonResult = input.aiV9Evidence === undefined ? undefined : trace.run("ai-v9-shadow", () => runShadowComparison({ prompt: input.prompt, aiV9Artifact: input.aiV9Evidence, v10OrchestratorResult: orchestratorResult, v10WebsiteSpec: specification.websiteSpec, v10CompiledWebsitePlan: compiler.plan, v10BuilderBlueprintResult: builderBlueprintArtifact, criticResult, rendererParityResult }).data);
  const validation = validatePreviewBlueprint(canonicalBlueprint);
  const warnings = [...builderBlueprintArtifact.warnings, ...mapperResult.warnings, ...rendererParityResult.warnings].map((warning) => `${warning.code}: ${warning.message}`);
  return Object.freeze({ requestId, pipelineVersion: INTERNAL_PREVIEW_VERSION, generationMode: "deterministic-fixture", input, plannerResult, websiteSpec: specification.websiteSpec, intelligenceArtifacts: Object.freeze({ businessContext: businessContext as never, componentResultId: componentResult.id, compositionResultId: compositionResult.id }), compiledPlan: compiler.plan, builderBlueprintArtifact, canonicalBlueprint, mapperResult, validation, criticResult, repairRecommendations, rendererParityResult, aiV9ShadowComparisonResult, orchestratorResult, warnings: Object.freeze(warnings), errors: Object.freeze(validation.issues.slice()), stageTimings: Object.freeze(trace.timings.slice()), deterministicTrace: Object.freeze([...trace.events, "preview.no-store-write", "preview.no-command-execution", "preview.no-persistence", "preview.no-provider-call"]), featureFlagSnapshot: Object.freeze({ WEBSITE_ENGINE_ENABLED, AI_V10_ENABLED, MAPPER_EXECUTION_ENABLED }), externalProviderUsage: Object.freeze({ llm: false, image: false, database: false, network: false, paidApi: false }), disposable: true });
}
