import type { JsonValue } from "../sdk";
import type { AIV10OrchestratorArtifactInput } from "./orchestratorInput";
import type { PipelineStage, PipelineStageName } from "./pipelineStages";

export type PipelineArtifactKind =
  | "planner-result"
  | "business-profile"
  | "brand-profile"
  | "content-strategy"
  | "experience-strategy"
  | "pattern-result"
  | "inspiration-profile"
  | "visual-mood-profile"
  | "media-strategy"
  | "motion-strategy"
  | "design-result"
  | "creative-library-result"
  | "component-result"
  | "composition-result"
  | "website-spec"
  | "compiled-plan"
  | "builder-blueprint"
  | "mapping-plan"
  | "simulation-result"
  | "critic-result"
  | "similarity-result"
  | "evolution-result"
  | "repair-result"
  | "self-play-result"
  | "learning-result";

/**
 * Metadata-only record of a pipeline artifact.
 *
 * @example
 * const artifact: PipelineArtifact = { id: "artifact.planner", stageId: "stage.planner", stageName: "planner", kind: "planner-result", available: true, summary: "PlannerResult provided.", metadata: {} };
 */
export type PipelineArtifact = Readonly<{
  id: string;
  stageId: string;
  stageName: PipelineStageName;
  kind: PipelineArtifactKind;
  available: boolean;
  summary: string;
  metadata: Record<string, JsonValue>;
}>;

const ARTIFACT_KIND_BY_STAGE: Record<PipelineStageName, PipelineArtifactKind> = {
  planner: "planner-result",
  "business-intelligence": "business-profile",
  "brand-intelligence": "brand-profile",
  "content-intelligence": "content-strategy",
  experience: "experience-strategy",
  "pattern-intelligence": "pattern-result",
  inspiration: "inspiration-profile",
  "visual-mood": "visual-mood-profile",
  "media-intelligence": "media-strategy",
  "motion-intelligence": "motion-strategy",
  design: "design-result",
  "creative-library": "creative-library-result",
  "component-engine": "component-result",
  "composition-engine": "composition-result",
  "website-spec-builder": "website-spec",
  compiler: "compiled-plan",
  "builder-blueprint": "builder-blueprint",
  "mapper-plan": "mapping-plan",
  simulation: "simulation-result",
  critic: "critic-result",
  similarity: "similarity-result",
  "candidate-evolution": "evolution-result",
  repair: "repair-result",
  "self-play": "self-play-result",
  learning: "learning-result",
};

const INPUT_KEY_BY_STAGE: Record<PipelineStageName, keyof AIV10OrchestratorArtifactInput> = {
  planner: "plannerResult",
  "business-intelligence": "businessProfile",
  "brand-intelligence": "brandProfile",
  "content-intelligence": "contentStrategy",
  experience: "experienceStrategy",
  "pattern-intelligence": "patternIntelligence",
  inspiration: "inspirationProfile",
  "visual-mood": "visualMoodProfile",
  "media-intelligence": "mediaStrategy",
  "motion-intelligence": "motionStrategy",
  design: "designResult",
  "creative-library": "creativeLibraryResult",
  "component-engine": "componentResult",
  "composition-engine": "compositionResult",
  "website-spec-builder": "websiteSpec",
  compiler: "compiledPlan",
  "builder-blueprint": "builderBlueprintResult",
  "mapper-plan": "mappingPlan",
  simulation: "simulationResult",
  critic: "criticResult",
  similarity: "similarityResult",
  "candidate-evolution": "evolutionResult",
  repair: "repairResult",
  "self-play": "selfPlayResult",
  learning: "learningResult",
};

function summarizeUnknown(value: unknown): Record<string, JsonValue> {
  if (!value || typeof value !== "object") return { valueType: typeof value };
  const record = value as Record<string, unknown>;
  const metadata: Record<string, JsonValue> = { valueType: "object" };
  if (typeof record.id === "string") metadata.id = record.id;
  if (typeof record.version === "string") metadata.version = record.version;
  if (Array.isArray(record.warnings)) metadata.warningCount = record.warnings.length;
  if (Array.isArray(record.issues)) metadata.issueCount = record.issues.length;
  return metadata;
}

/**
 * Returns the input artifact for a pipeline stage.
 *
 * @example
 * const artifact = getInputArtifactForStage({ websiteSpec: {} }, "website-spec-builder");
 */
export function getInputArtifactForStage(input: AIV10OrchestratorArtifactInput | undefined, stageName: PipelineStageName): unknown {
  if (!input) return undefined;
  const key = INPUT_KEY_BY_STAGE[stageName];
  return input[key] ?? input[stageName];
}

/**
 * Builds metadata-only artifact records for stage outputs.
 *
 * @example
 * const artifact = buildPipelineArtifact(stage, plannerResult);
 */
export function buildPipelineArtifact(stage: PipelineStage, value: unknown): PipelineArtifact {
  const available = value !== undefined;
  return Object.freeze({
    id: `pipeline.artifact.${stage.name}`,
    stageId: stage.id,
    stageName: stage.name,
    kind: ARTIFACT_KIND_BY_STAGE[stage.name],
    available,
    summary: available ? `${ARTIFACT_KIND_BY_STAGE[stage.name]} metadata is available.` : `${ARTIFACT_KIND_BY_STAGE[stage.name]} metadata was not executed or provided.`,
    metadata: {
      ...summarizeUnknown(value),
      metadataOnly: true,
      fullArtifactStored: false,
    },
  });
}

/**
 * Collects available artifacts from a pipeline run.
 *
 * @example
 * const artifacts = collectPipelineArtifacts(stageArtifacts);
 */
export function collectPipelineArtifacts(artifacts: readonly PipelineArtifact[]): readonly PipelineArtifact[] {
  return Object.freeze([...artifacts]);
}
