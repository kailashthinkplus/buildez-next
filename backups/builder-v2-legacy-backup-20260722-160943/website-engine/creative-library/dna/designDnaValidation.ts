import { DESIGN_DNA_AXES, type DesignDNA } from "./designDna";

export type DesignDnaValidationResult = Readonly<{ valid: boolean; issues: string[] }>;

/**
 * Validates Design DNA axis coverage and deterministic seed metadata.
 *
 * @example
 * const validation = validateDesignDNA(dna);
 */
export function validateDesignDNA(dna: DesignDNA): DesignDnaValidationResult {
  const issues: string[] = [];
  if (!dna.id) issues.push("DesignDNA id required.");
  if (!dna.version) issues.push("DesignDNA version required.");
  if (!/^dna-[a-f0-9]{8}$/.test(dna.diversitySeed)) issues.push("DesignDNA diversity seed must be deterministic hash format.");
  if (dna.uniquenessScore < 0 || dna.uniquenessScore > 1) issues.push("DesignDNA uniqueness score must be normalized.");
  for (const axis of DESIGN_DNA_AXES) {
    if (!dna.traits.some((trait) => trait.axis === axis)) issues.push(`DesignDNA axis missing: ${axis}.`);
  }
  return Object.freeze({ valid: issues.length === 0, issues });
}
