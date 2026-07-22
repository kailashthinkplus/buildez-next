import type { BusinessFamily } from "../sdk";
import type { BuilderPrimitiveType } from "../builder-blueprint/builderBlueprint";
import type { RecipeContext } from "../builder-blueprint/recipes";
import type { WidgetBlueprintSeed } from "../builder-blueprint/widgetBlueprint";

export type LayoutArchetypeId =
  | "editorialSplitHero" | "cinematicFullBleedHero" | "asymmetricStorySection"
  | "bentoShowcase" | "imageStoryNarrative" | "floatingProofSection"
  | "galleryJourney" | "quoteInterlude" | "framedCTA" | "architecturalProjectShowcase";

export type LayoutArchetypeDefinition = Readonly<{
  id: LayoutArchetypeId;
  semanticPurpose: string;
  allowedWidgetAnatomy: readonly BuilderPrimitiveType[];
  layoutStructure: string;
  responsiveTransformation: string;
  spacingBehavior: string;
  mediaRole: string;
  typographyIntent: string;
  supportedIndustries: readonly (BusinessFamily | "government")[];
  compile(context: RecipeContext): WidgetBlueprintSeed[];
}>;

