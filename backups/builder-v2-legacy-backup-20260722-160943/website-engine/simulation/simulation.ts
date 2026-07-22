import { runAccessibilitySimulation } from "./accessibilitySimulation";
import { runAssetSimulation } from "./assetSimulation";
import { runConversionSimulation } from "./conversionSimulation";
import { runEditabilitySimulation } from "./editabilitySimulation";
import { runParitySimulation } from "./paritySimulation";
import { runPerformanceSimulation } from "./performanceSimulation";
import { runResponsiveSimulation } from "./responsiveSimulation";
import { scoreSimulation } from "./simulationScoring";
import { collectSimulationMissingAssets, collectSimulationMissingFacts, countSimulationNodes, type SimulationInput } from "./simulationInput";
import { createSimulationIssue, type SimulationIssue, type SimulationMetrics, type SimulationResult, type SimulationWarning } from "./simulationResult";
import { runSEOSimulation } from "./seoSimulation";
import { runViewportSimulation } from "./viewportSimulation";
import { SIMULATION_ENGINE_VERSION_STRING } from "./version";

function collectIssues(input: SimulationInput, partial: Pick<SimulationResult, "viewportResults" | "responsiveResult" | "accessibilityResult" | "seoResult" | "performanceResult" | "conversionResult" | "assetResult" | "editabilityResult" | "parityResult">): SimulationIssue[] {
  const issues: SimulationIssue[] = [];
  if (partial.viewportResults.some((result) => result.structureScore < 70)) {
    issues.push(createSimulationIssue({ category: "viewport", severity: "major", message: "One or more viewport structures have elevated metadata risk.", recommendation: "Review section count, node density, and CTA placement before preview." }));
  }
  if (partial.viewportResults.some((result) => !result.ctaReachable)) {
    issues.push(createSimulationIssue({ category: "conversion", severity: "major", message: "CTA reachability is not proven for all viewports.", recommendation: "Ensure a primary CTA exists early in the page plan." }));
  }
  if (partial.responsiveResult.stackingRisk > 0) {
    issues.push(createSimulationIssue({ category: "responsive", severity: partial.responsiveResult.stackingRisk >= 0.67 ? "major" : "minor", message: "Responsive breakpoint metadata is incomplete.", recommendation: "Add desktop, tablet, and mobile responsive rules before rendering." }));
  }
  if (partial.accessibilityResult.score < 80) {
    issues.push(createSimulationIssue({ category: "accessibility", severity: "major", message: "Accessibility metadata has unresolved risk.", recommendation: "Add image alt text, interactive labels, and reduced-motion metadata." }));
  }
  if (partial.seoResult.score < 80) {
    issues.push(createSimulationIssue({ category: "seo", severity: "minor", message: "SEO basics are incomplete.", recommendation: "Confirm title, heading, and description metadata." }));
  }
  if (partial.performanceResult.score < 70) {
    issues.push(createSimulationIssue({ category: "performance", severity: "major", message: "Performance metadata indicates elevated asset, motion, or node-count risk.", recommendation: "Reduce heavy asset usage and keep motion budget explicit." }));
  }
  if (partial.conversionResult.score < 70) {
    issues.push(createSimulationIssue({ category: "conversion", severity: "major", message: "Conversion friction risk is elevated.", recommendation: "Place the primary CTA earlier and resolve missing conversion facts." }));
  }
  if (partial.assetResult.missingAssetCount > 0) {
    issues.push(createSimulationIssue({ category: "asset", severity: partial.assetResult.readiness < 0.5 ? "major" : "minor", message: "Missing assets remain explicit.", recommendation: "Request required real assets instead of silently substituting media." }));
  }
  if (partial.editabilityResult.score < 75) {
    issues.push(createSimulationIssue({ category: "editability", severity: "major", message: "Editability metadata is incomplete.", recommendation: "Ensure every mapped widget has editable node and inspector binding intent." }));
  }
  if (!partial.parityResult.parityReady || partial.parityResult.parityIssueCount > 0) {
    issues.push(createSimulationIssue({ category: "parity", severity: partial.parityResult.unsupportedWidgetTypeCount ? "blocker" : "major", message: "Renderer parity metadata has unresolved risk.", recommendation: "Resolve renderer parity issues before preview." }));
  }
  if (collectSimulationMissingFacts(input).length > 0) {
    issues.push(createSimulationIssue({ category: "conversion", severity: "minor", message: "Missing facts remain explicit in the simulation input.", recommendation: "Keep missing facts visible to critic and repair phases." }));
  }
  return issues;
}

function collectRecommendations(issues: SimulationIssue[]): string[] {
  return [...new Set(issues.map((issue) => issue.recommendation).filter((value): value is string => Boolean(value)))];
}

function collectMetrics(input: SimulationInput, result: Omit<SimulationResult, "metrics">): SimulationMetrics {
  return Object.freeze({
    issueCount: result.issues.length,
    warningCount: result.warnings.length,
    recommendationCount: result.recommendations.length,
    viewportCount: result.viewportResults.length,
    missingFactCount: collectSimulationMissingFacts(input).length,
    missingAssetCount: collectSimulationMissingAssets(input).length,
    nodeCount: countSimulationNodes(input),
    rendered: false as const,
    screenshotCaptured: false as const,
    sideEffects: false as const,
  });
}

/**
 * Runs deterministic metadata-only simulation without rendering or screenshots.
 *
 * @example
 * const simulation = runSimulation({ mappingPlan, rendererParityResult });
 */
export function runSimulation(input: SimulationInput = {}): SimulationResult {
  const viewportResults = runViewportSimulation(input);
  const responsiveResult = runResponsiveSimulation(input);
  const accessibilityResult = runAccessibilitySimulation(input);
  const seoResult = runSEOSimulation(input);
  const performanceResult = runPerformanceSimulation(input);
  const conversionResult = runConversionSimulation(input);
  const assetResult = runAssetSimulation(input);
  const editabilityResult = runEditabilitySimulation(input);
  const parityResult = runParitySimulation(input);
  const simulationParts = { viewportResults, responsiveResult, accessibilityResult, seoResult, performanceResult, conversionResult, assetResult, editabilityResult, parityResult };
  const issues = collectIssues(input, simulationParts);
  const overallScore = scoreSimulation({ ...simulationParts, issues });
  const warnings: SimulationWarning[] = issues.map((issue) => Object.freeze({
    code: issue.id.toUpperCase().replace(/[^A-Z0-9]+/g, "_"),
    message: issue.message,
    module: "simulation",
    severity: issue.severity === "blocker" ? "major" as const : issue.severity === "info" ? "info" as const : issue.severity,
    targetId: issue.targetId,
    metadata: { category: issue.category },
  }));
  const partial = Object.freeze({
    id: `simulation.${input.mappingPlan?.id ?? input.builderBlueprintResult?.blueprint.id ?? input.compiledPlan?.id ?? "local"}`,
    version: SIMULATION_ENGINE_VERSION_STRING,
    overallScore,
    ...simulationParts,
    issues,
    warnings,
    recommendations: collectRecommendations(issues),
    trace: [
      "simulation.metadata-only",
      "no-rendering",
      "no-screenshot-capture",
      "no-browser-automation",
      "no-builder-store-write",
      "no-production-wiring",
      "no-db-network-llm-mcp-provider-calls",
    ],
    metadata: {
      sourceCompiledPlanId: input.compiledPlan ? String(input.compiledPlan.id) : undefined,
      sourceMappingPlanId: input.mappingPlan?.id,
      rendererParityId: input.rendererParityResult?.id,
      featureFlags: input.featureFlags ?? {},
    },
    rendered: false as const,
    screenshotCaptured: false as const,
    sideEffects: false as const,
  });
  return Object.freeze({ ...partial, metrics: collectMetrics(input, partial) });
}
