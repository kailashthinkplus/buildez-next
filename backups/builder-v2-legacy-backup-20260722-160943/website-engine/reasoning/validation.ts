import type { ValidationIssue, ValidationResult } from "../sdk";
import { REPOSITORY_RECORDS, STARTER_INDUSTRIES } from "../repository";
import { indexRepositoryRecords } from "../graph";
import type { ReasoningCandidate, ReasoningResult } from "./reasoning";

function issue(path: string, message: string, code = "INVALID_REASONING"): ValidationIssue {
  return Object.freeze({ path, message, code });
}

function normalized(value: number) {
  return Number.isFinite(value) && value >= 0 && value <= 1;
}

/**
 * Validates a ranked reasoning candidate.
 *
 * @example
 * const validation = validateReasoningCandidate(candidate);
 */
export function validateReasoningCandidate(candidate: ReasoningCandidate): ValidationResult<ReasoningCandidate> {
  const issues: ValidationIssue[] = [];
  if (!candidate.id) issues.push(issue("id", "Candidate id is required.", "REQUIRED"));
  if (!candidate.category) issues.push(issue("category", "Candidate category is required.", "REQUIRED"));
  if (!candidate.label) issues.push(issue("label", "Candidate label is required.", "REQUIRED"));
  for (const [key, value] of Object.entries(candidate.score)) {
    if (!normalized(value)) issues.push(issue(`score.${key}`, "Candidate scores must be normalized from 0 to 1.", "INVALID_SCORE"));
  }
  const repositoryIds = new Set(REPOSITORY_RECORDS.map((record) => String(record.id)));
  if (candidate.repositoryRecordId && !repositoryIds.has(candidate.repositoryRecordId)) {
    issues.push(issue("repositoryRecordId", "Candidate repository reference is invalid.", "INVALID_REPOSITORY_REFERENCE"));
  }
  const graphIds = new Set(indexRepositoryRecords().data.nodes.map((node) => String(node.id)));
  if (candidate.graphNodeId && !graphIds.has(candidate.graphNodeId)) {
    issues.push(issue("graphNodeId", "Candidate graph reference is invalid.", "INVALID_GRAPH_REFERENCE"));
  }
  const supportedIndustries = new Set(STARTER_INDUSTRIES);
  for (const industry of candidate.compatibleIndustries) {
    if (!supportedIndustries.has(industry as never) && candidate.source === "repository") {
      issues.push(issue("compatibleIndustries", "Repository candidate references unsupported starter industry.", "UNSUPPORTED_INDUSTRY"));
    }
  }
  return Object.freeze({
    valid: issues.length === 0,
    value: issues.length === 0 ? candidate : undefined,
    issues,
  });
}

/**
 * Validates a reasoning result.
 *
 * @example
 * const validation = validateReasoningResult(result);
 */
export function validateReasoningResult(result: ReasoningResult): ValidationResult<ReasoningResult> {
  const issues: ValidationIssue[] = [];
  const ids = new Set<string>();
  result.rankedCandidates.forEach((candidate, index) => {
    const id = String(candidate.id);
    if (ids.has(id)) issues.push(issue(`rankedCandidates.${index}.id`, "Duplicate candidate id.", "DUPLICATE_CANDIDATE"));
    ids.add(id);
    issues.push(...validateReasoningCandidate(candidate).issues.map((candidateIssue) =>
      issue(`rankedCandidates.${index}.${candidateIssue.path}`, candidateIssue.message, candidateIssue.code)
    ));
  });
  return Object.freeze({
    valid: issues.length === 0,
    value: issues.length === 0 ? result : undefined,
    issues,
  });
}
