import type { BuilderBlueprintInput } from "./builderBlueprint";
import type { WidgetBlueprintSeed } from "./widgetBlueprint";
import { compileSemanticBlueprint } from "./SemanticBlueprintCompiler";

/**
 * Expands semantic component recipes into editable Builder primitive seeds.
 *
 * @example
 * const seeds = expandComponentRecipes(input);
 */
export function expandComponentRecipes(input: BuilderBlueprintInput): WidgetBlueprintSeed[] {
  return compileSemanticBlueprint(input).seeds;
}
