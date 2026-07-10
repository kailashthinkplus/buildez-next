import type { JsonValue } from "../sdk";
import type { PipelineGateName } from "./pipelineGates";

export type PipelineExecutionMode = "dry-run" | "plan-only" | "metadata-only" | "shadow";

export type PipelineStageName =
  | "planner"
  | "business-intelligence"
  | "brand-intelligence"
  | "content-intelligence"
  | "experience"
  | "pattern-intelligence"
  | "inspiration"
  | "visual-mood"
  | "media-intelligence"
  | "motion-intelligence"
  | "design"
  | "creative-library"
  | "component-engine"
  | "composition-engine"
  | "website-spec-builder"
  | "compiler"
  | "builder-blueprint"
  | "mapper-plan"
  | "simulation"
  | "critic"
  | "similarity"
  | "candidate-evolution"
  | "repair"
  | "self-play"
  | "learning";

export type PipelineStageStatus = "planned" | "completed" | "skipped" | "blocked";

/**
 * Pipeline stage planned by the AI v10 Orchestrator.
 *
 * @example
 * const stage = buildPipelineStages()[0];
 */
export type PipelineStage = Readonly<{
  id: string;
  name: PipelineStageName;
  order: number;
  label: string;
  requiredInputs: string[];
  expectedArtifacts: string[];
  supportedModes: PipelineExecutionMode[];
  gateNames: PipelineGateName[];
  metadata: Record<string, JsonValue>;
}>;

/**
 * Result metadata for one pipeline stage.
 *
 * @example
 * const result: PipelineStageResult = { stageId: "stage.planner", stageName: "planner", status: "completed", artifactIds: [], warnings: [], reason: "Planner ran." };
 */
export type PipelineStageResult = Readonly<{
  stageId: string;
  stageName: PipelineStageName;
  status: PipelineStageStatus;
  artifactIds: string[];
  warnings: string[];
  reason: string;
  blockedBy: string[];
  durationMs: number;
  metadata: Record<string, JsonValue>;
}>;

const STAGE_DEFINITIONS: Omit<PipelineStage, "id" | "order" | "supportedModes" | "metadata">[] = [
  { name: "planner", label: "AI Planner", requiredInputs: ["prompt-or-structured-context"], expectedArtifacts: ["PlannerResult"], gateNames: [] },
  { name: "business-intelligence", label: "Business Intelligence", requiredInputs: ["PlannerResult"], expectedArtifacts: ["BusinessIntelligenceProfile"], gateNames: [] },
  { name: "brand-intelligence", label: "Brand Intelligence", requiredInputs: ["BusinessIntelligenceProfile"], expectedArtifacts: ["BrandIntelligenceProfile"], gateNames: [] },
  { name: "content-intelligence", label: "Content Intelligence", requiredInputs: ["BusinessIntelligenceProfile", "BrandIntelligenceProfile"], expectedArtifacts: ["ContentStrategy"], gateNames: [] },
  { name: "experience", label: "Experience Engine", requiredInputs: ["ContentStrategy"], expectedArtifacts: ["ExperienceStrategy"], gateNames: [] },
  { name: "pattern-intelligence", label: "Pattern Intelligence", requiredInputs: ["ExperienceStrategy"], expectedArtifacts: ["PatternIntelligenceResult"], gateNames: [] },
  { name: "inspiration", label: "Inspiration Engine", requiredInputs: ["BrandIntelligenceProfile", "PatternIntelligenceResult"], expectedArtifacts: ["InspirationProfile"], gateNames: [] },
  { name: "visual-mood", label: "Visual Mood Engine", requiredInputs: ["InspirationProfile"], expectedArtifacts: ["VisualMoodProfile"], gateNames: [] },
  { name: "media-intelligence", label: "Media Intelligence", requiredInputs: ["VisualMoodProfile"], expectedArtifacts: ["MediaStrategy"], gateNames: [] },
  { name: "motion-intelligence", label: "Motion Intelligence", requiredInputs: ["VisualMoodProfile"], expectedArtifacts: ["MotionStrategy"], gateNames: [] },
  { name: "design", label: "Design Engine", requiredInputs: ["VisualMoodProfile", "BrandIntelligenceProfile"], expectedArtifacts: ["DesignResult"], gateNames: [] },
  { name: "creative-library", label: "Creative Library", requiredInputs: ["DesignResult"], expectedArtifacts: ["CreativeLibraryResult"], gateNames: [] },
  { name: "component-engine", label: "Component Engine", requiredInputs: ["CreativeLibraryResult", "PatternIntelligenceResult"], expectedArtifacts: ["ComponentResult"], gateNames: [] },
  { name: "composition-engine", label: "Composition Engine", requiredInputs: ["ComponentResult", "ExperienceStrategy"], expectedArtifacts: ["CompositionResult"], gateNames: [] },
  { name: "website-spec-builder", label: "WebsiteSpec Builder", requiredInputs: ["CompositionResult"], expectedArtifacts: ["WebsiteSpec"], gateNames: [] },
  { name: "compiler", label: "Website Compiler", requiredInputs: ["WebsiteSpec"], expectedArtifacts: ["CompiledWebsitePlan"], gateNames: [] },
  { name: "builder-blueprint", label: "Builder Blueprint", requiredInputs: ["CompiledWebsitePlan"], expectedArtifacts: ["BuilderBlueprintResult"], gateNames: [] },
  { name: "mapper-plan", label: "Native Builder Mapper Plan", requiredInputs: ["BuilderBlueprintResult"], expectedArtifacts: ["NativeBuilderMappingPlan"], gateNames: [] },
  { name: "simulation", label: "Simulation Engine", requiredInputs: ["NativeBuilderMappingPlan"], expectedArtifacts: ["SimulationResult"], gateNames: [] },
  { name: "critic", label: "Critic Engine", requiredInputs: ["SimulationResult"], expectedArtifacts: ["CriticResult"], gateNames: [] },
  { name: "similarity", label: "Similarity & Diversity", requiredInputs: ["CriticResult"], expectedArtifacts: ["SimilarityResult"], gateNames: [] },
  { name: "candidate-evolution", label: "Candidate Evolution", requiredInputs: ["SimilarityResult"], expectedArtifacts: ["EvolutionResult"], gateNames: [] },
  { name: "repair", label: "Repair Engine", requiredInputs: ["CriticResult", "EvolutionResult"], expectedArtifacts: ["RepairResult"], gateNames: [] },
  { name: "self-play", label: "Self-Play Optimization", requiredInputs: ["RepairResult"], expectedArtifacts: ["SelfPlayResult"], gateNames: [] },
  { name: "learning", label: "Learning Engine", requiredInputs: ["SelfPlayResult"], expectedArtifacts: ["LearningResult"], gateNames: ["persistence"] },
];

/**
 * Builds the full AI v10 pipeline stage list.
 *
 * @example
 * const stages = buildPipelineStages("dry-run");
 */
export function buildPipelineStages(mode: PipelineExecutionMode = "dry-run"): readonly PipelineStage[] {
  return Object.freeze(
    STAGE_DEFINITIONS.map((stage, index) =>
      Object.freeze({
        ...stage,
        id: `pipeline.stage.${String(index + 1).padStart(2, "0")}.${stage.name}`,
        order: index + 1,
        supportedModes: ["dry-run", "plan-only", "metadata-only", "shadow"] as const,
        metadata: { mode, metadataOnly: true },
      })
    )
  );
}
