import type { BuilderBlueprint as NativeBuilderBlueprint } from "../../types/blueprint";
import type { WebsiteSpec } from "../sdk";
import { runCriticEngine } from "./CriticEngine";
import type { WebsiteEvaluation } from "./types";

/**
 * Backward-compatible evaluation wrapper for older imports.
 *
 * @example
 * const evaluation = evaluateWebsite({ spec, blueprint });
 */
export function evaluateWebsite(input: {
  spec: WebsiteSpec;
  blueprint?: NativeBuilderBlueprint;
}): WebsiteEvaluation {
  const result = runCriticEngine({
    websiteSpec: input.spec,
    featureFlags: {},
  });
  return result.data.evaluation;
}
