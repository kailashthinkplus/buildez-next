import type { EngineResult } from "../sdk";
import { runCompositionEngine } from "./CompositionEngine";
import type { CompositionInput, CompositionResult } from "./compositionPlan";

export type RunCompositionInput = CompositionInput;

export function runComposition(input: RunCompositionInput = {}): EngineResult<CompositionResult> {
  return runCompositionEngine(input);
}
