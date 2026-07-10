import { createEngineResult, createEngineWarning, type EngineResult } from "../sdk";
import { validateRendererParityInput, validateRendererParityResult } from "./parityValidation";
import { runRendererParityCheck, type RendererParityInput, type RendererParityResult } from "./rendererParity";

/**
 * Engine entry point for metadata-only renderer parity checks.
 *
 * @example
 * const result = runRendererParityEngine({ mappingPlan });
 */
export function runRendererParityEngine(input: RendererParityInput = {}): EngineResult<RendererParityResult> {
  const inputValidation = validateRendererParityInput(input);
  const result = runRendererParityCheck(input);
  const resultValidation = validateRendererParityResult(result);
  const validationWarnings = [...inputValidation.issues, ...resultValidation.issues].map((item) =>
    createEngineWarning(item.code, `${item.path}: ${item.message}`, "renderer", "major")
  );
  return createEngineResult({
    module: "renderer",
    stage: "renderer-parity-contracts",
    status: inputValidation.valid && resultValidation.valid && result.parityReady ? "ok" : "warning",
    warnings: [...result.warnings, ...validationWarnings],
    data: result,
    metadata: {
      parityReady: result.parityReady,
      targetCount: result.metrics.targetCount,
      issueCount: result.metrics.issueCount,
      rendered: false,
      screenshotCaptured: false,
      sideEffects: false,
    },
  });
}
