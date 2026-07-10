import type { EngineResult } from "../sdk";
import { runComponentEngine } from "./ComponentEngine";
import type { ComponentInput, ComponentResult } from "./componentVariant";

export type SelectComponentsInput = ComponentInput;
export type ComponentSelectionResult = ComponentResult;

/**
 * Backward-compatible wrapper for the Phase 27 Component Engine.
 *
 * @example
 * const result = selectComponents(input);
 */
export function selectComponents(input: SelectComponentsInput = {}): EngineResult<ComponentSelectionResult> {
  return runComponentEngine(input);
}
