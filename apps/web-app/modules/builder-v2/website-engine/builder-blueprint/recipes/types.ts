import type { BuilderBlueprintInput } from "../builderBlueprint";
import type { WidgetBlueprintSeed } from "../widgetBlueprint";

export type SemanticSection = Readonly<{
  id: string;
  type: string;
  purpose: string;
  componentVariantId?: string;
  componentCategory?: string;
  patternIds: string[];
  order: number;
}>;

export type RecipeContext = Readonly<{
  input: BuilderBlueprintInput;
  section: SemanticSection;
  sectionNodeId: string;
  key: string;
}>;

export type SemanticRecipe = (context: RecipeContext) => WidgetBlueprintSeed[];
export type SemanticRecipeName = "hero" | "about" | "feature-grid" | "services" | "pricing" | "comparison" | "gallery" | "portfolio" | "timeline" | "testimonials" | "faq" | "stats" | "cta" | "contact" | "footer";

