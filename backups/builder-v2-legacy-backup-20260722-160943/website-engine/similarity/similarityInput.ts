import type { BuilderBlueprintResult } from "../builder-blueprint";
import type { ComponentResult } from "../components";
import type { CompositionResult } from "../composition";
import type { CompiledWebsitePlan } from "../compiler";
import type { CriticResult } from "../critic";
import type { CreativeLibraryResult, CreativeRecipeSelection } from "../creative-library";
import type { DesignDNA } from "../creative-library/dna";
import type { CreativeFragmentSelection, RecipeAssemblyResult } from "../creative-library/fragments";
import type { NativeBuilderMappingPlan } from "../mapper";
import type { WebsiteDNA, WebsiteSpec } from "../sdk";
import type { WebsiteSimilarityProfile } from "./similarityResult";

/**
 * Inputs accepted by the deterministic Similarity & Diversity Engine.
 *
 * @example
 * const input: SimilarityInput = { creativeLibraryResult, previousWebsiteProfiles: [] };
 */
export type SimilarityInput = Readonly<{
  websiteSpec?: WebsiteSpec;
  websiteDNA?: WebsiteDNA;
  designDNA?: DesignDNA;
  creativeLibraryResult?: CreativeLibraryResult;
  recipeAssemblyResults?: readonly RecipeAssemblyResult[];
  componentResult?: ComponentResult;
  compositionResult?: CompositionResult;
  compiledPlan?: CompiledWebsitePlan;
  builderBlueprintResult?: BuilderBlueprintResult;
  mappingPlan?: NativeBuilderMappingPlan;
  criticResult?: CriticResult;
  previousWebsiteProfiles?: readonly WebsiteSimilarityProfile[];
  previousRecipeSelections?: readonly (CreativeRecipeSelection | string)[];
  previousFragmentSelections?: readonly (CreativeFragmentSelection | string)[];
  previousDesignDnaProfiles?: readonly DesignDNA[];
  featureFlags?: Readonly<Record<string, boolean>>;
}>;
