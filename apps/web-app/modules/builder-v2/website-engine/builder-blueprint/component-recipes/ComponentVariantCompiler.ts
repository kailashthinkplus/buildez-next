import type { WidgetBlueprintSeed } from "../widgetBlueprint";
import type { RecipeContext } from "../recipes";

/** Native, deterministic compiler contract for one exact component variant. */
export interface ComponentVariantCompiler {
  readonly variantId: string;
  compile(context: RecipeContext): WidgetBlueprintSeed[];
}
