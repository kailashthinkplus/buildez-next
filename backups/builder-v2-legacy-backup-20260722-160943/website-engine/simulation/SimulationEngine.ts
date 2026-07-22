import { createEngineResult, createEngineWarning, type EngineResult } from "../sdk";
import { runSimulation } from "./simulation";
import type { SimulationInput } from "./simulationInput";
import type { SimulationResult } from "./simulationResult";
import { validateSimulationInput, validateSimulationResult } from "./simulationValidation";

/**
 * Engine entry point for deterministic metadata-only simulation.
 *
 * @example
 * const result = runSimulationEngine({ mappingPlan, rendererParityResult });
 */
export function runSimulationEngine(input: SimulationInput = {}): EngineResult<SimulationResult> {
  const inputValidation = validateSimulationInput(input);
  const result = runSimulation(input);
  const resultValidation = validateSimulationResult(result);
  const validationWarnings = [...inputValidation.issues, ...resultValidation.issues].map((item) =>
    createEngineWarning(item.code, `${item.path}: ${item.message}`, "simulation", item.code === "REFERENCE_REQUIRED" ? "major" : "minor")
  );
  return createEngineResult({
    module: "simulation",
    stage: "metadata-risk-simulation",
    status: inputValidation.valid && resultValidation.valid && result.overallScore.grade !== "blocked" ? (result.warnings.length ? "warning" : "ok") : "warning",
    warnings: [...result.warnings, ...validationWarnings],
    data: result,
    metadata: {
      score: result.overallScore.score,
      grade: result.overallScore.grade,
      issueCount: result.metrics.issueCount,
      rendered: false,
      screenshotCaptured: false,
      sideEffects: false,
    },
  });
}
