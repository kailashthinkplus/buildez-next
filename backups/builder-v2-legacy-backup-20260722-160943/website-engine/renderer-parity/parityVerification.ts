import { runBuilderBlueprintEngine } from "../builder-blueprint";
import { runComponentEngine } from "../components";
import { runCompositionEngine } from "../composition";
import { runNativeBuilderMapper } from "../mapper";
import { runWebsiteSpecBuilder } from "../specification";
import { createEngineResult, createEngineWarning, type BusinessContext, type EngineResult } from "../sdk";
import { runRendererParityEngine } from "./RendererParityEngine";

export type RendererParityVerificationReport = Readonly<{
  passed: boolean;
  targetCount: number;
  snapshotCount: number;
  issueCount: number;
  rendered: false;
  screenshotCaptured: false;
  sideEffects: false;
  notes: readonly string[];
}>;

const verificationBusiness: BusinessContext = Object.freeze({
  businessName: "Parity Auto Studio",
  family: "automotive",
  industryId: "automotive-service",
  audience: ["vehicle owners"],
  offerings: ["service booking"],
  differentiators: [],
  proofPoints: [],
  knownFacts: { city: "provided" },
  missingFacts: ["brand authorization"],
});

/**
 * Runs compile-safe renderer parity contract verification without rendering.
 *
 * @example
 * const report = runRendererParityVerification().data;
 */
export function runRendererParityVerification(): EngineResult<RendererParityVerificationReport> {
  const componentResult = runComponentEngine().data;
  const compositionResult = runCompositionEngine({ componentResult }).data;
  const specResult = runWebsiteSpecBuilder({ businessContext: verificationBusiness, componentResult, compositionResult }).data;
  const blueprintResult = runBuilderBlueprintEngine({ websiteSpec: specResult.websiteSpec, websiteDNA: specResult.websiteDNA, componentResult, compositionResult }).data;
  const mapperResult = runNativeBuilderMapper({ builderBlueprintResult: blueprintResult }).data;
  const parityResult = runRendererParityEngine({ mappingPlan: mapperResult.mappingPlan, sourceId: "renderer-parity.verification" });
  const passed =
    parityResult.data.targetMatrix.length === 4 &&
    parityResult.data.snapshots.length === 4 &&
    parityResult.data.rendered === false &&
    parityResult.data.screenshotCaptured === false &&
    parityResult.data.sideEffects === false;
  const warning = passed
    ? undefined
    : createEngineWarning("RENDERER_PARITY_VERIFICATION_FAILED", "Renderer parity verification failed.", "renderer", "major", {
        issueCount: parityResult.data.issues.length,
      });
  return createEngineResult({
    module: "renderer",
    stage: "renderer-parity-verification",
    status: passed ? "ok" : "warning",
    warnings: warning ? [warning] : [],
    data: {
      passed,
      targetCount: parityResult.data.metrics.targetCount,
      snapshotCount: parityResult.data.metrics.snapshotCount,
      issueCount: parityResult.data.metrics.issueCount,
      rendered: false as const,
      screenshotCaptured: false as const,
      sideEffects: false as const,
      notes: [
        "Renderer parity verification is metadata-only.",
        "No screenshot capture, canvas render, preview render, published render, export render, route wiring, Builder store write, or mapper execution occurs.",
        "Known parity issues are reported as metadata issues for future Simulation and Renderer phases.",
      ],
    },
    metadata: {
      parityReady: parityResult.data.parityReady,
      targetCount: parityResult.data.metrics.targetCount,
    },
  });
}
