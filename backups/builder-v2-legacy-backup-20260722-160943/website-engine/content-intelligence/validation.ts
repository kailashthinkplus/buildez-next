import type { ContentStrategy, EngineError } from "../sdk";

/**
 * Validation issue for ContentStrategy.
 *
 * @example
 * const issue: ContentStrategyValidationIssue = { path: "truthPolicy", code: "MISSING_TRUTH_POLICY", message: "Truth policy is required." };
 */
export type ContentStrategyValidationIssue = Readonly<{
  path: string;
  code: string;
  message: string;
}>;

/**
 * Validation result for ContentStrategy.
 *
 * @example
 * const result: ContentStrategyValidationResult = { valid: true, issues: [] };
 */
export type ContentStrategyValidationResult = Readonly<{
  valid: boolean;
  issues: ContentStrategyValidationIssue[];
}>;

function issue(path: string, code: string, message: string): ContentStrategyValidationIssue {
  return Object.freeze({ path, code, message });
}

/**
 * Validates ContentStrategy without external dependencies.
 *
 * @example
 * const validation = validateContentStrategy(strategy);
 */
export function validateContentStrategy(strategy: ContentStrategy): ContentStrategyValidationResult {
  const issues: ContentStrategyValidationIssue[] = [];
  if (!strategy.id) issues.push(issue("id", "MISSING_ID", "Content strategy id is required."));
  if (!strategy.version) issues.push(issue("version", "MISSING_VERSION", "Content strategy version is required."));
  if (!strategy.messageHierarchy.length) issues.push(issue("messageHierarchy", "MISSING_MESSAGE_HIERARCHY", "Message hierarchy is required."));
  if (!strategy.headlineStrategy) issues.push(issue("headlineStrategy", "MISSING_HEADLINE_STRATEGY", "Headline strategy is required."));
  if (!Object.keys(strategy.sectionMessagingRoles).length) issues.push(issue("sectionMessagingRoles", "MISSING_SECTION_ROLES", "Section messaging roles are required."));
  if (!strategy.ctaStrategy.length) issues.push(issue("ctaStrategy", "MISSING_CTA", "CTA strategy is required."));
  if (!strategy.proofStrategy.length) issues.push(issue("proofStrategy", "MISSING_PROOF", "Proof strategy is required."));
  if (!strategy.truthPolicy.length) issues.push(issue("truthPolicy", "MISSING_TRUTH_POLICY", "Truth policy is required."));
  if (!strategy.missingContentFacts.length) issues.push(issue("missingContentFacts", "MISSING_MISSING_FACTS", "Missing content facts must be explicit."));
  return Object.freeze({ valid: issues.length === 0, issues });
}

/**
 * Converts validation issues into SDK-compatible engine errors.
 *
 * @example
 * const errors = validationIssuesToContentErrors(validation.issues);
 */
export function validationIssuesToContentErrors(issues: readonly ContentStrategyValidationIssue[]): EngineError[] {
  return issues.map((validationIssue) =>
    Object.freeze({
      code: validationIssue.code,
      message: validationIssue.message,
      module: "content-intelligence" as const,
      recoverable: true,
      severity: "major" as const,
      targetId: validationIssue.path,
    })
  );
}
