import type { BuilderBlueprint } from "../../types/blueprint";
import { assertSemanticHydrationComplete } from "../creative/semanticHydrationValidation";

export async function persistAfterSemanticHydration<T>(
  blueprint: BuilderBlueprint,
  persist: () => Promise<T>,
  context = "AI v10 persistence"
): Promise<T> {
  assertSemanticHydrationComplete(blueprint, context);
  return persist();
}
