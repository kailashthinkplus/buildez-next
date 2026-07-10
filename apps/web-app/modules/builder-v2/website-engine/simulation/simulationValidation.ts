import type { SimulationInput } from "./simulationInput";
import type { SimulationResult } from "./simulationResult";

export type SimulationValidationIssue = Readonly<{ path: string; code: string; message: string }>;
export type SimulationValidationResult = Readonly<{ valid: boolean; issues: SimulationValidationIssue[] }>;

function issue(path: string, code: string, message: string): SimulationValidationIssue {
  return Object.freeze({ path, code, message });
}

/**
 * Validates metadata-only simulation input.
 *
 * @example
 * const validation = validateSimulationInput({ mappingPlan });
 */
export function validateSimulationInput(input: SimulationInput): SimulationValidationResult {
  const issues: SimulationValidationIssue[] = [];
  if (!input.websiteSpec && !input.compiledPlan && !input.builderBlueprintResult && !input.mappingPlan && !input.rendererParityResult) {
    issues.push(issue("input", "REFERENCE_REQUIRED", "Simulation requires at least one WebsiteSpec, compiled plan, Builder Blueprint, mapping plan, or renderer parity result."));
  }
  if (input.mappingPlan && input.mappingPlan.executed !== false) {
    issues.push(issue("mappingPlan.executed", "EXECUTION_FORBIDDEN", "Simulation must consume inert mapping plans only."));
  }
  if (input.mappingPlan && !input.mappingPlan.validation.valid) {
    issues.push(issue("mappingPlan.validation", "MAPPER_VALIDATION_WARNING", "Mapping plan validation issues will increase simulation risk."));
  }
  return Object.freeze({ valid: issues.filter((item) => item.code !== "MAPPER_VALIDATION_WARNING").length === 0, issues });
}

/**
 * Validates simulation output shape and side-effect safety.
 *
 * @example
 * const validation = validateSimulationResult(result);
 */
export function validateSimulationResult(result: SimulationResult): SimulationValidationResult {
  const issues: SimulationValidationIssue[] = [];
  if (!result.id) issues.push(issue("id", "REQUIRED", "Simulation id is required."));
  if (!result.version) issues.push(issue("version", "REQUIRED", "Simulation version is required."));
  if (result.overallScore.score < 0 || result.overallScore.score > 100) issues.push(issue("overallScore.score", "NORMALIZATION", "Simulation score must be normalized between 0 and 100."));
  for (const viewport of ["desktop", "tablet", "mobile"]) {
    if (!result.viewportResults.some((item) => item.viewport === viewport)) {
      issues.push(issue(`viewportResults.${viewport}`, "VIEWPORT_REQUIRED", "Simulation must include desktop, tablet, and mobile viewport checks."));
    }
  }
  if (!result.accessibilityResult) issues.push(issue("accessibilityResult", "REQUIRED", "Accessibility simulation is required."));
  if (!result.seoResult) issues.push(issue("seoResult", "REQUIRED", "SEO simulation is required."));
  if (!result.performanceResult) issues.push(issue("performanceResult", "REQUIRED", "Performance simulation is required."));
  if (!result.conversionResult) issues.push(issue("conversionResult", "REQUIRED", "Conversion simulation is required."));
  if (!result.assetResult) issues.push(issue("assetResult", "REQUIRED", "Asset simulation is required."));
  if (!result.editabilityResult) issues.push(issue("editabilityResult", "REQUIRED", "Editability simulation is required."));
  if (!result.parityResult) issues.push(issue("parityResult", "REQUIRED", "Parity simulation is required."));
  if (result.issues.some((item) => !item.severity)) issues.push(issue("issues", "SEVERITY_REQUIRED", "Every simulation issue must include severity."));
  if (result.rendered !== false || result.screenshotCaptured !== false || result.sideEffects !== false) {
    issues.push(issue("sideEffects", "SIDE_EFFECTS_FORBIDDEN", "Simulation must not render, capture screenshots, or create side effects."));
  }
  if (!result.trace.length) issues.push(issue("trace", "TRACE_REQUIRED", "Simulation trace metadata is required."));
  return Object.freeze({ valid: issues.length === 0, issues });
}
