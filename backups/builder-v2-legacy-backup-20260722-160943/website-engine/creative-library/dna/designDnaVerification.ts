import { createEngineResult, createEngineWarning, type EngineResult } from "../../sdk";
import { buildCreativeRecipeCatalog } from "../recipeCatalog";
import { generateDesignDNA } from "./designDnaGenerator";
import { validateDesignDNA } from "./designDnaValidation";

export type DesignDnaVerificationReport = Readonly<{ passed: boolean; axisCount: number; uniquenessScore: number; diversitySeed: string; issueCount: number; notes: readonly string[] }>;

/**
 * Runs compile-safe Design DNA verification.
 *
 * @example
 * const report = runDesignDnaVerification().data;
 */
export function runDesignDnaVerification(): EngineResult<DesignDnaVerificationReport> {
  const selectedRecipes = buildCreativeRecipeCatalog().slice(0, 8);
  const result = generateDesignDNA({ selectedRecipes, businessFamily: "education", industry: "education" });
  const validation = validateDesignDNA(result.designDna);
  const warning = validation.valid ? undefined : createEngineWarning("DESIGN_DNA_VERIFICATION_FAILED", "Design DNA verification failed.", "creative-library", "major", { issueCount: validation.issues.length });
  return createEngineResult({
    module: "creative-library",
    stage: "design-dna-verification",
    status: validation.valid ? "ok" : "warning",
    warnings: warning ? [warning] : [],
    data: {
      passed: validation.valid,
      axisCount: result.metrics.axisCount,
      uniquenessScore: result.designDna.uniquenessScore,
      diversitySeed: result.designDna.diversitySeed,
      issueCount: validation.issues.length,
      notes: ["Design DNA is deterministic and metadata-only.", "No rendering, Builder nodes, provider calls, or generated code are used."],
    },
    metadata: { issues: validation.issues },
  });
}
