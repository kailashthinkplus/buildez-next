import type { BuilderBlueprint, BuilderBlueprintResult } from "../builder-blueprint";
import type { ComponentResult } from "../components";
import type { CompositionResult } from "../composition";
import type { CompiledWebsitePlan } from "../compiler";
import type { ContentStrategy, ExperienceStrategy, JsonValue, MissingFact, WebsiteDNA, WebsiteSpec } from "../sdk";
import type { CreativeLibraryResult } from "../creative-library";
import type { DesignDNA } from "../creative-library/dna";
import type { RecipeAssemblyResult } from "../creative-library/fragments";
import type { DesignResult } from "../design";
import type { NativeBuilderMappingPlan } from "../mapper";
import type { MediaStrategy } from "../media-intelligence";
import type { MotionStrategy } from "../motion-intelligence";
import type { RendererParityResult } from "../renderer-parity";
import type { SimulationResult } from "../simulation";

/**
 * Metadata accepted by the Critic Engine. No screenshots, DOM, or rendered output are required.
 *
 * @example
 * const input: CriticInput = { simulationResult, rendererParityResult };
 */
export type CriticInput = Readonly<{
  websiteSpec?: WebsiteSpec;
  websiteDNA?: WebsiteDNA;
  compiledPlan?: CompiledWebsitePlan;
  builderBlueprintResult?: BuilderBlueprintResult;
  builderBlueprint?: BuilderBlueprint;
  mappingPlan?: NativeBuilderMappingPlan;
  simulationResult?: SimulationResult;
  rendererParityResult?: RendererParityResult;
  creativeLibraryResult?: CreativeLibraryResult;
  designDNA?: DesignDNA;
  recipeAssemblyResults?: readonly RecipeAssemblyResult[];
  designResult?: DesignResult;
  contentStrategy?: ContentStrategy;
  experienceStrategy?: ExperienceStrategy;
  mediaStrategy?: MediaStrategy;
  motionStrategy?: MotionStrategy;
  componentResult?: ComponentResult;
  compositionResult?: CompositionResult;
  knownFacts?: Readonly<Record<string, JsonValue>>;
  missingFacts?: readonly MissingFact[];
  missingAssets?: readonly (MissingFact | string)[];
  featureFlags?: Readonly<Record<string, boolean>>;
}>;
