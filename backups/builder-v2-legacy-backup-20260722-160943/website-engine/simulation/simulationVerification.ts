import { runBuilderBlueprintEngine } from "../builder-blueprint";
import { runComponentEngine } from "../components";
import { runCompositionEngine } from "../composition";
import { runNativeBuilderMapper } from "../mapper";
import { runRendererParityEngine } from "../renderer-parity";
import { runWebsiteSpecBuilder } from "../specification";
import { createEngineResult, createEngineWarning, type BusinessContext, type EngineResult } from "../sdk";
import { runSimulationEngine } from "./SimulationEngine";

export type SimulationVerificationReport = Readonly<{
  passed: boolean;
  score: number;
  grade: string;
  viewportCount: number;
  issueCount: number;
  rendered: false;
  screenshotCaptured: false;
  sideEffects: false;
  notes: readonly string[];
}>;

const verificationBusiness: BusinessContext = Object.freeze({
  businessName: "Simulation Learning Center",
  family: "education",
  industryId: "education",
  audience: ["parents", "students"],
  offerings: ["course counselling"],
  differentiators: [],
  proofPoints: [],
  knownFacts: { city: "provided" },
  missingFacts: [],
});

/**
 * Runs compile-safe Simulation Engine verification without rendering or screenshots.
 *
 * @example
 * const report = runSimulationVerification().data;
 */
export function runSimulationVerification(): EngineResult<SimulationVerificationReport> {
  const componentResult = runComponentEngine().data;
  const compositionResult = runCompositionEngine({ componentResult }).data;
  const specResult = runWebsiteSpecBuilder({ businessContext: verificationBusiness, componentResult, compositionResult }).data;
  const blueprintResult = runBuilderBlueprintEngine({ websiteSpec: specResult.websiteSpec, websiteDNA: specResult.websiteDNA, componentResult, compositionResult }).data;
  const mapperResult = runNativeBuilderMapper({ builderBlueprintResult: blueprintResult }).data;
  const parityResult = runRendererParityEngine({ mappingPlan: mapperResult.mappingPlan }).data;
  const simulationResult = runSimulationEngine({
    websiteSpec: specResult.websiteSpec,
    websiteDNA: specResult.websiteDNA,
    builderBlueprintResult: blueprintResult,
    mappingPlan: mapperResult.mappingPlan,
    rendererParityResult: parityResult,
  });
  const passed =
    simulationResult.data.viewportResults.length === 3 &&
    simulationResult.data.rendered === false &&
    simulationResult.data.screenshotCaptured === false &&
    simulationResult.data.sideEffects === false &&
    simulationResult.data.overallScore.score >= 0 &&
    simulationResult.data.overallScore.score <= 100;
  const warning = passed
    ? undefined
    : createEngineWarning("SIMULATION_VERIFICATION_FAILED", "Simulation verification failed.", "simulation", "major", {
        issueCount: simulationResult.data.issues.length,
      });
  return createEngineResult({
    module: "simulation",
    stage: "verification",
    status: passed ? "ok" : "warning",
    warnings: warning ? [warning] : [],
    data: {
      passed,
      score: simulationResult.data.overallScore.score,
      grade: simulationResult.data.overallScore.grade,
      viewportCount: simulationResult.data.viewportResults.length,
      issueCount: simulationResult.data.issues.length,
      rendered: false as const,
      screenshotCaptured: false as const,
      sideEffects: false as const,
      notes: [
        "Simulation verification is deterministic and metadata-only.",
        "No rendering, screenshot capture, browser automation, Builder store write, route wiring, DB/network/LLM/MCP/provider calls, or automatic Mapper execution occurs.",
      ],
    },
    metadata: {
      score: simulationResult.data.overallScore.score,
      grade: simulationResult.data.overallScore.grade,
    },
  });
}
