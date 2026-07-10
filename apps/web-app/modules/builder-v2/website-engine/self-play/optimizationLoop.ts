import { buildQualityTarget } from "./qualityTarget";
import { evaluateStoppingCondition } from "./optimizationStopping";
import { runOptimizationIteration } from "./optimizationIteration";
import type { OptimizationIteration, OptimizationStoppingReason, SelfPlayInput } from "./selfPlayResult";

/**
 * Runs deterministic self-play iterations until a stopping rule fires.
 *
 * @example
 * const loop = runOptimizationLoop({ maxIterations: 3 });
 */
export function runOptimizationLoop(input: SelfPlayInput): { iterations: OptimizationIteration[]; stoppingReason: OptimizationStoppingReason } {
  const target = buildQualityTarget(input);
  const iterations: OptimizationIteration[] = [];
  let stoppingReason: OptimizationStoppingReason | null = null;

  while (!stoppingReason && iterations.length < target.maxIterations) {
    const iteration = runOptimizationIteration(input, iterations.length + 1, iterations[iterations.length - 1]);
    iterations.push(iteration);
    stoppingReason = evaluateStoppingCondition(iterations, target);
  }

  return Object.freeze({
    iterations,
    stoppingReason: stoppingReason ?? "max-iterations-reached",
  });
}
