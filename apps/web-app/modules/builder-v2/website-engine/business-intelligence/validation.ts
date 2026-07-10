import type { BusinessIntelligenceProfile, EngineError, MissingFact } from "../sdk";

/**
 * Validation issue for Business Intelligence profiles.
 *
 * @example
 * const issue: BusinessIntelligenceValidationIssue = { path: "confidence", code: "OUT_OF_RANGE", message: "Confidence must be 0-1." };
 */
export type BusinessIntelligenceValidationIssue = Readonly<{
  path: string;
  code: string;
  message: string;
}>;

/**
 * Validation result for the deterministic Business Intelligence Engine.
 *
 * @example
 * const result: BusinessIntelligenceValidationResult = { valid: true, issues: [] };
 */
export type BusinessIntelligenceValidationResult = Readonly<{
  valid: boolean;
  issues: BusinessIntelligenceValidationIssue[];
}>;

function issue(path: string, code: string, message: string): BusinessIntelligenceValidationIssue {
  return Object.freeze({ path, code, message });
}

function isMissingFactValid(fact: MissingFact) {
  return Boolean(fact.id && fact.label && fact.reason && typeof fact.required === "boolean");
}

/**
 * Validates a BusinessIntelligenceProfile without external dependencies.
 *
 * @example
 * const validation = validateBusinessIntelligenceProfile(profile);
 */
export function validateBusinessIntelligenceProfile(
  profile: BusinessIntelligenceProfile
): BusinessIntelligenceValidationResult {
  const issues: BusinessIntelligenceValidationIssue[] = [];
  if (!profile.id) issues.push(issue("id", "MISSING_ID", "Profile id is required."));
  if (!profile.version) issues.push(issue("version", "MISSING_VERSION", "Profile version is required."));
  if (!profile.identity?.summary) issues.push(issue("identity.summary", "MISSING_SUMMARY", "Identity summary is required."));
  if (!profile.businessFamily) issues.push(issue("businessFamily", "MISSING_FAMILY", "Business family is required."));
  if (!profile.businessModel) issues.push(issue("businessModel", "MISSING_MODEL", "Business model is required."));
  if (!profile.revenueModel) issues.push(issue("revenueModel", "MISSING_REVENUE", "Revenue model is required."));
  if (!profile.offerModel.length) issues.push(issue("offerModel", "EMPTY_OFFERS", "At least one offer model entry is required."));
  if (!profile.customerTypes.length) issues.push(issue("customerTypes", "EMPTY_CUSTOMERS", "At least one customer type is required."));
  if (!profile.buyerJourney.length) issues.push(issue("buyerJourney", "EMPTY_JOURNEY", "Buyer journey is required."));
  if (!profile.conversionGoals.length) issues.push(issue("conversionGoals", "EMPTY_GOALS", "At least one conversion goal is required."));
  if (profile.confidence < 0 || profile.confidence > 1) {
    issues.push(issue("confidence", "OUT_OF_RANGE", "Confidence must be normalized from 0 to 1."));
  }
  for (const [index, fact] of profile.missingBusinessFacts.entries()) {
    if (!isMissingFactValid(fact)) {
      issues.push(issue(`missingBusinessFacts.${index}`, "INVALID_MISSING_FACT", "Missing facts need id, label, required, and reason."));
    }
  }

  return Object.freeze({ valid: issues.length === 0, issues });
}

/**
 * Converts validation issues into SDK-compatible engine errors.
 *
 * @example
 * const errors = validationIssuesToErrors(validation.issues);
 */
export function validationIssuesToErrors(issues: readonly BusinessIntelligenceValidationIssue[]): EngineError[] {
  return issues.map((validationIssue) =>
    Object.freeze({
      code: validationIssue.code,
      message: validationIssue.message,
      module: "business-intelligence" as const,
      recoverable: true,
      severity: "major" as const,
      targetId: validationIssue.path,
    })
  );
}
