import type { AIV10OrchestratorResult } from "../orchestrator";
import type { CriticResult } from "../critic";
import type { RendererParityResult } from "../renderer-parity";
import type { SimilarityResult } from "../similarity";
import type { SimulationResult } from "../simulation";
import type { JsonValue } from "../sdk";

/**
 * Input for metadata-only ai-v9 shadow comparison.
 *
 * @example
 * const input: ShadowComparisonInput = { prompt: "Build a clinic website", aiV9Artifact: { id: "v9" }, v10OrchestratorResult };
 */
export type ShadowComparisonInput = Readonly<{
  prompt?: string;
  aiV9Artifact?: unknown;
  aiV9BlueprintMetadata?: unknown;
  aiV9OutputMetadata?: unknown;
  v10OrchestratorResult?: AIV10OrchestratorResult;
  v10WebsiteSpec?: unknown;
  v10CompiledWebsitePlan?: unknown;
  v10BuilderBlueprintResult?: unknown;
  criticResult?: CriticResult;
  similarityResult?: SimilarityResult;
  rendererParityResult?: RendererParityResult;
  simulationResult?: SimulationResult;
  featureFlags?: Readonly<Record<string, boolean>>;
  metadata?: Record<string, JsonValue>;
}>;
