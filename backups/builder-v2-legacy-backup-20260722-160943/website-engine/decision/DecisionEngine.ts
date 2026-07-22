import type { EngineResult } from "../sdk";
import type { DecisionInput, DecisionResult } from "./decision";
import { runDecisionEngine } from "./decisionPlan";

/**
 * Deterministic Decision Engine facade.
 *
 * @example
 * const result = DecisionEngine.run({ reasoningResult });
 */
export const DecisionEngine = Object.freeze({
  run(input: DecisionInput = {}): EngineResult<DecisionResult> {
    return runDecisionEngine(input);
  },
});
