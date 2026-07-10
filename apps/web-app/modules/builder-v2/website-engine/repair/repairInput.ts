import type { BuilderBlueprintResult } from "../builder-blueprint";
import type { ComponentResult } from "../components";
import type { CompositionResult } from "../composition";
import type { CompiledWebsitePlan } from "../compiler";
import type { CriticResult } from "../critic";
import type { CreativeLibraryResult } from "../creative-library";
import type { DesignDNA } from "../creative-library/dna";
import type { RecipeAssemblyResult } from "../creative-library/fragments";
import type { CandidateWinner, EvolutionResult } from "../evolution";
import type { NativeBuilderMappingPlan } from "../mapper";
import type { MediaStrategy } from "../media-intelligence";
import type { MotionStrategy } from "../motion-intelligence";
import type { RendererParityResult } from "../renderer-parity";
import type { JsonValue, MissingFact, WebsiteDNA, WebsiteSpec } from "../sdk";
import type { SimilarityResult } from "../similarity";
import type { SimulationResult } from "../simulation";

/**
 * Inputs accepted by the metadata-only Repair Engine.
 *
 * @example
 * const input: RepairInput = { criticResult, similarityResult };
 */
export type RepairInput = Readonly<{
  winner?: CandidateWinner;
  evolutionResult?: EvolutionResult;
  criticResult?: CriticResult;
  similarityResult?: SimilarityResult;
  simulationResult?: SimulationResult;
  rendererParityResult?: RendererParityResult;
  websiteSpec?: WebsiteSpec;
  websiteDNA?: WebsiteDNA;
  designDNA?: DesignDNA;
  creativeLibraryResult?: CreativeLibraryResult;
  recipeAssemblyResults?: readonly RecipeAssemblyResult[];
  compiledPlan?: CompiledWebsitePlan;
  builderBlueprintResult?: BuilderBlueprintResult;
  mappingPlan?: NativeBuilderMappingPlan;
  componentResult?: ComponentResult;
  compositionResult?: CompositionResult;
  mediaStrategy?: MediaStrategy;
  motionStrategy?: MotionStrategy;
  missingFacts?: readonly MissingFact[];
  missingAssets?: readonly (MissingFact | string)[];
  featureFlags?: Readonly<Record<string, boolean>>;
  metadata?: Record<string, JsonValue>;
}>;
