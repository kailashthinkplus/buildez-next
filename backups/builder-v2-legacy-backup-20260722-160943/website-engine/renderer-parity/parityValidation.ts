import type { RendererParityInput, RendererParityResult } from "./rendererParity";
import { buildRenderTargetMatrix } from "./renderTargets";

export type RendererParityValidationIssue = Readonly<{ path: string; code: string; message: string }>;
export type RendererParityValidationResult = Readonly<{ valid: boolean; issues: RendererParityValidationIssue[] }>;

function issue(path: string, code: string, message: string): RendererParityValidationIssue {
  return Object.freeze({ path, code, message });
}

/**
 * Validates renderer parity input before metadata checks run.
 *
 * @example
 * const validation = validateRendererParityInput({ mappingPlan });
 */
export function validateRendererParityInput(input: RendererParityInput): RendererParityValidationResult {
  const issues: RendererParityValidationIssue[] = [];
  if (!input.mappingPlan && !input.blueprint) {
    issues.push(issue("input", "REFERENCE_REQUIRED", "Renderer parity requires a native mapping plan or Builder Blueprint reference."));
  }
  if (input.mappingPlan && !input.mappingPlan.id) {
    issues.push(issue("mappingPlan.id", "REQUIRED", "Mapping plan id is required."));
  }
  if (input.mappingPlan && !input.mappingPlan.version) {
    issues.push(issue("mappingPlan.version", "REQUIRED", "Mapping plan version is required."));
  }
  if (input.mappingPlan && input.mappingPlan.executed !== false) {
    issues.push(issue("mappingPlan.executed", "EXECUTION_FORBIDDEN", "Renderer parity must consume inert mapping plans only."));
  }
  if (input.blueprint && !input.blueprint.root) {
    issues.push(issue("blueprint.root", "REQUIRED", "Builder Blueprint root node is required."));
  }
  return Object.freeze({ valid: issues.length === 0, issues });
}

/**
 * Validates the metadata-only renderer parity result.
 *
 * @example
 * const validation = validateRendererParityResult(result);
 */
export function validateRendererParityResult(result: RendererParityResult): RendererParityValidationResult {
  const issues: RendererParityValidationIssue[] = [];
  const requiredTargets = buildRenderTargetMatrix().map((target) => target.id);
  const resultTargets = result.targetMatrix.map((target) => target.id);
  for (const target of requiredTargets) {
    if (!resultTargets.includes(target)) {
      issues.push(issue(`targetMatrix.${target}`, "TARGET_MISSING", "Target matrix must include canvas, preview, published, and export."));
    }
  }
  if (!result.issues) issues.push(issue("issues", "REQUIRED", "Parity result must include an issues array."));
  if (!result.warnings) issues.push(issue("warnings", "REQUIRED", "Parity result must include warnings."));
  if (!result.metrics) issues.push(issue("metrics", "REQUIRED", "Parity result must include metrics."));
  if (result.rendered !== false || result.screenshotCaptured !== false || result.sideEffects !== false) {
    issues.push(issue("sideEffects", "SIDE_EFFECTS_FORBIDDEN", "Phase 33 parity checks must not render, capture screenshots, or create side effects."));
  }
  return Object.freeze({ valid: issues.length === 0, issues });
}
