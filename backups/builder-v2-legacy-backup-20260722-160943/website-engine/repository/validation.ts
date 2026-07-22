import type { EngineResult, ValidationIssue, ValidationResult } from "../sdk";
import { createEngineResult, createEngineWarning } from "../sdk";
import type { RepositoryRecord } from "./records";

const fakeClaimTerms = [
  "award-winning",
  "guaranteed results",
  "certified by",
  "officially authorized",
  "100%",
  "number one",
  "#1",
];

function issue(path: string, message: string, code = "INVALID_REPOSITORY_RECORD"): ValidationIssue {
  return Object.freeze({ path, message, code });
}

function containsFakeClaimLanguage(record: RepositoryRecord) {
  const searchable = JSON.stringify({
    title: record.title,
    description: record.description,
    payload: record.payload,
  }).toLowerCase();
  return fakeClaimTerms.some((term) => searchable.includes(term));
}

/**
 * Validates one repository record.
 *
 * @example
 * const result = validateRepositoryRecord(record);
 */
export function validateRepositoryRecord(record: unknown): ValidationResult<RepositoryRecord> {
  const issues: ValidationIssue[] = [];
  const candidate = record as Partial<RepositoryRecord>;

  if (!candidate || typeof candidate !== "object") {
    return { valid: false, issues: [issue("$", "Record must be an object.", "INVALID_OBJECT")] };
  }
  if (!candidate.id) issues.push(issue("id", "Record id is required.", "REQUIRED"));
  if (!candidate.version) issues.push(issue("version", "Record version is required.", "REQUIRED"));
  if (!candidate.category) issues.push(issue("category", "Record category is required.", "REQUIRED"));
  if (!candidate.kind) issues.push(issue("kind", "Record kind is required.", "REQUIRED"));
  if (!candidate.title) issues.push(issue("title", "Record title is required.", "REQUIRED"));
  if (!candidate.description) issues.push(issue("description", "Record description is required.", "REQUIRED"));
  if (!Array.isArray(candidate.compatibleIndustries)) {
    issues.push(issue("compatibleIndustries", "compatibleIndustries must be an array.", "INVALID_TYPE"));
  }
  if (!Array.isArray(candidate.compatibleArchetypes)) {
    issues.push(issue("compatibleArchetypes", "compatibleArchetypes must be an array.", "INVALID_TYPE"));
  }
  if (!candidate.payload || typeof candidate.payload !== "object") {
    issues.push(issue("payload", "Record payload is required.", "REQUIRED"));
  }
  if (candidate.id && candidate.category && !String(candidate.id).startsWith(`${candidate.category}.`)) {
    issues.push(issue("id", "Record id should be namespaced by category.", "INVALID_ID"));
  }
  if (candidate as RepositoryRecord && containsFakeClaimLanguage(candidate as RepositoryRecord)) {
    issues.push(issue("payload", "Record appears to contain fake-claim language.", "FAKE_CLAIM_LANGUAGE"));
  }

  return Object.freeze({
    valid: issues.length === 0,
    value: issues.length === 0 ? (record as RepositoryRecord) : undefined,
    issues,
  });
}

/**
 * Validates all repository records and starter-industry coverage.
 *
 * @example
 * const result = validateRepositoryRecords(records, ["healthcare"]);
 */
export function validateRepositoryRecords(
  records: readonly RepositoryRecord[],
  starterIndustries: readonly string[]
): ValidationResult<readonly RepositoryRecord[]> {
  const issues = records.flatMap((record, index) =>
    validateRepositoryRecord(record).issues.map((recordIssue) =>
      issue(`${index}.${recordIssue.path}`, recordIssue.message, recordIssue.code)
    )
  );

  const realEstateFamily = records.find((record) => record.id === "business-family.real_estate");
  if (realEstateFamily?.payload.role !== "classification-parent") {
    issues.push(issue("business-family.real_estate", "Real estate must not be treated as repository root.", "REAL_ESTATE_ROOT_RISK"));
  }

  for (const industry of starterIndustries) {
    const hasArchetype = records.some((record) => record.category === "archetype" && record.compatibleIndustries.includes(industry));
    const hasPattern = records.some((record) => record.category === "pattern" && record.compatibleIndustries.includes(industry));
    const hasConstraint = records.some((record) => record.category === "constraint" && record.compatibleIndustries.includes(industry));
    const hasFixture = records.some((record) => record.category === "fixture" && record.compatibleIndustries.includes(industry));
    if (!hasArchetype) issues.push(issue(industry, "Starter industry needs at least one archetype record.", "MISSING_ARCHETYPE"));
    if (!hasPattern) issues.push(issue(industry, "Starter industry needs at least one pattern record.", "MISSING_PATTERN"));
    if (!hasConstraint) issues.push(issue(industry, "Starter industry needs at least one constraint record.", "MISSING_CONSTRAINT"));
    if (!hasFixture) issues.push(issue(industry, "Starter industry needs at least one fixture contract record.", "MISSING_FIXTURE"));
  }

  return Object.freeze({
    valid: issues.length === 0,
    value: issues.length === 0 ? records : undefined,
    issues,
  });
}

/**
 * EngineResult wrapper for repository verification.
 *
 * @example
 * const report = createRepositoryValidationResult(records, starterIndustries);
 */
export function createRepositoryValidationResult(
  records: readonly RepositoryRecord[],
  starterIndustries: readonly string[]
): EngineResult<{ valid: boolean; recordCount: number; issueCount: number }> {
  const result = validateRepositoryRecords(records, starterIndustries);
  const warnings = result.valid
    ? []
    : [
        createEngineWarning(
          "REPOSITORY_VALIDATION_FAILED",
          "Repository validation found issues.",
          "repository",
          "major",
          { issueCount: result.issues.length }
        ),
      ];

  return createEngineResult({
    module: "repository",
    stage: "validation",
    status: result.valid ? "ok" : "warning",
    warnings,
    data: {
      valid: result.valid,
      recordCount: records.length,
      issueCount: result.issues.length,
    },
  });
}
