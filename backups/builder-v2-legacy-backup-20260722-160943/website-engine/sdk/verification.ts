import {
  createEngineResult,
  createEngineTrace,
  createEngineWarning,
} from "./trace";
import type { EngineResult } from "./types";
import {
  validateBusinessContext,
  validateBusinessIntelligenceProfile,
  validateEngineTrace,
  validateWebsiteSpec,
} from "./validation";
import { ENGINE_VERSIONS } from "./version";

/**
 * Compile-safe SDK verification report used when no test framework exists.
 *
 * @example
 * const report = runSdkVerification().data;
 */
export type SdkVerificationReport = Readonly<{
  validatorsChecked: string[];
  passed: boolean;
  notes: string[];
}>;

/**
 * Runs lightweight SDK self-verification without touching application state.
 *
 * @example
 * const result = runSdkVerification();
 */
export function runSdkVerification(): EngineResult<SdkVerificationReport> {
  const trace = createEngineTrace({ module: "sdk", stage: "verification" });
  const validatorResults = [
    validateEngineTrace(trace),
    validateBusinessContext({
      family: "unknown",
      audience: [],
      knownFacts: {},
      missingFacts: [],
    }),
    validateBusinessIntelligenceProfile({
      id: "business_profile_verification",
      version: ENGINE_VERSIONS.sdk,
      identity: { summary: "Verification profile" },
      businessFamily: "unknown",
      businessModel: "unknown",
      revenueModel: "unknown",
      offerModel: [],
      customerTypes: [],
      buyerJourney: [],
      differentiation: [],
      trustSignals: [],
      objections: [],
      localityNeeds: [],
      complianceNeeds: [],
      proofNeeds: [],
      conversionGoals: [],
      missingBusinessFacts: [],
      confidence: 0,
    }),
    validateWebsiteSpec({
      id: "website_spec_verification",
      version: ENGINE_VERSIONS.specification,
      business: {
        family: "unknown",
        audience: [],
        knownFacts: {},
        missingFacts: [],
      },
      goals: {
        primaryGoal: "unknown",
        secondaryGoals: [],
        conversionGoals: [],
      },
      archetype: "unknown",
      sections: [],
      factsUsed: [],
      missingFacts: [],
      confidence: 0,
    }),
  ];
  const passed = validatorResults.every((result) => result.valid);
  const warnings = passed
    ? []
    : [createEngineWarning("SDK_VERIFICATION_FAILED", "One or more SDK validators failed.", "sdk", "major")];

  return createEngineResult({
    module: "sdk",
    stage: "verification",
    status: passed ? "ok" : "warning",
    warnings,
    data: {
      validatorsChecked: [
        "EngineTrace",
        "BusinessContext",
        "BusinessIntelligenceProfile",
        "WebsiteSpec",
      ],
      passed,
      notes: ["No application state, builder behavior, AI calls, or repository logic are used."],
    },
  });
}

