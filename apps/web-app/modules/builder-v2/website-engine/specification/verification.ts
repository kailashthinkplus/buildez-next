import { createEngineResult, createEngineWarning, type BusinessContext, type EngineResult } from "../sdk";
import { runComponentEngine } from "../components";
import { runCompositionEngine } from "../composition";
import { runWebsiteSpecBuilder } from "./WebsiteSpecBuilder";
import { validateWebsiteSpecBuilderResult } from "./validation";

export type WebsiteSpecBuilderVerificationReport = Readonly<{
  passed: boolean;
  sectionCount: number;
  missingFactCount: number;
  issueCount: number;
  warningCount: number;
  notes: readonly string[];
}>;

const verificationBusiness: BusinessContext = Object.freeze({
  businessName: "Local Clinic",
  family: "healthcare",
  industryId: "clinic",
  audience: ["patients"],
  offerings: ["consultation"],
  differentiators: [],
  proofPoints: [],
  knownFacts: { location: "provided" },
  missingFacts: [],
});

/**
 * Runs compile-safe local WebsiteSpec Builder verification.
 *
 * @example
 * const verification = runWebsiteSpecBuilderVerification();
 */
export function runWebsiteSpecBuilderVerification(): EngineResult<WebsiteSpecBuilderVerificationReport> {
  const componentResult = runComponentEngine({ businessProfile: undefined }).data;
  const compositionResult = runCompositionEngine({ componentResult }).data;
  const built = runWebsiteSpecBuilder({ businessContext: verificationBusiness, componentResult, compositionResult });
  const validation = validateWebsiteSpecBuilderResult(built.data);
  const passed = validation.valid;
  const warnings = passed
    ? []
    : [createEngineWarning("WEBSITE_SPEC_BUILDER_VERIFICATION_FAILED", "WebsiteSpec Builder verification found issues.", "specification", "major", { issueCount: validation.issues.length })];
  return createEngineResult({
    module: "specification",
    stage: "verification",
    status: passed ? "ok" : "warning",
    warnings,
    data: {
      passed,
      sectionCount: built.data.metrics.sectionCount,
      missingFactCount: built.data.metrics.missingFactCount,
      issueCount: validation.issues.length,
      warningCount: built.data.metrics.warningCount,
      notes: [
        "WebsiteSpec Builder verification is deterministic and local-only.",
        "WebsiteSpec and WebsiteDNA are canonical metadata contracts before Compiler.",
        "No Builder nodes, Mapper, Renderer, React, CSS, HTML, JS, AI, database, network, MCP, provider call, or production route is used.",
      ],
    },
    metadata: {
      issues: validation.issues.map((item) => `${item.path}:${item.code}`),
    },
  });
}
