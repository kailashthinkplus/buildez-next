import type { ValidationIssue, ValidationResult } from "../sdk";
import { validateConstraintRule as validateSdkConstraintRule } from "../sdk";
import { STARTER_INDUSTRIES } from "../repository";
import { findConstraints } from "../graph";
import { STARTER_CONSTRAINT_RULES, type ConstraintRule } from "./rules";

const categories = [
  "fact-truth",
  "missing-fact",
  "placeholder-content",
  "compliance",
  "unsupported-claim",
  "asset-readiness",
  "editability",
  "mobile-conversion",
  "composition",
  "renderer-parity",
  "accessibility",
  "seo",
  "industry-fit",
];

const fakeClaimTerms = ["award-winning business", "guaranteed results for clients", "officially authorized partner", "number one provider"];

function issue(path: string, message: string, code = "INVALID_CONSTRAINT_RULE"): ValidationIssue {
  return Object.freeze({ path, message, code });
}

function containsFakeBusinessFact(rule: ConstraintRule) {
  const searchable = JSON.stringify({
    id: rule.id,
    description: rule.description,
    appliesTo: rule.appliesTo,
  }).toLowerCase();
  return fakeClaimTerms.some((term) => searchable.includes(term));
}

/**
 * Validates one local Constraint Engine rule.
 *
 * @example
 * const result = validateLocalConstraintRule(rule);
 */
export function validateLocalConstraintRule(rule: unknown): ValidationResult<ConstraintRule> {
  const base = validateSdkConstraintRule(rule);
  const issues = [...base.issues];
  const candidate = rule as Partial<ConstraintRule>;

  if (!candidate.category) issues.push(issue("category", "Constraint category is required.", "REQUIRED"));
  if (candidate.category && !categories.includes(candidate.category)) {
    issues.push(issue("category", "Constraint category is invalid.", "INVALID_CATEGORY"));
  }
  if (!candidate.condition?.type) {
    issues.push(issue("condition.type", "Constraint condition type is required.", "REQUIRED"));
  }
  if (candidate.severity === "blocker" && !candidate.repairHint?.message) {
    issues.push(issue("repairHint", "Blocker constraints require actionable repair hints.", "REQUIRED_REPAIR_HINT"));
  }
  if (candidate.scope === "industry" && (!candidate.appliesTo || candidate.appliesTo.length === 0)) {
    issues.push(issue("appliesTo", "Industry-scoped constraints must declare appliesTo.", "REQUIRED_SCOPE_TARGET"));
  }
  if (candidate.id === "business-family.real_estate" || candidate.id === "industry.real_estate") {
    issues.push(issue("id", "Real estate must not be treated as a constraint root.", "REAL_ESTATE_ROOT_RISK"));
  }
  if (candidate as ConstraintRule && containsFakeBusinessFact(candidate as ConstraintRule)) {
    issues.push(issue("description", "Constraint appears to contain fake business fact language.", "FAKE_BUSINESS_FACT"));
  }

  return Object.freeze({
    valid: issues.length === 0,
    value: issues.length === 0 ? (rule as ConstraintRule) : undefined,
    issues,
  });
}

/**
 * Validates all local Constraint Engine rules and starter graph coverage.
 *
 * @example
 * const result = validateConstraintRules(rules);
 */
export function validateConstraintRules(rules: readonly ConstraintRule[] = STARTER_CONSTRAINT_RULES): ValidationResult<readonly ConstraintRule[]> {
  const issues = rules.flatMap((rule, index) =>
    validateLocalConstraintRule(rule).issues.map((ruleIssue) =>
      issue(`${index}.${ruleIssue.path}`, ruleIssue.message, ruleIssue.code)
    )
  );

  for (const industry of STARTER_INDUSTRIES) {
    const hasLocalRule = rules.some((rule) => rule.appliesTo.includes(industry));
    const graphConstraintCount = findConstraints(`business-family.${industry}`).data.length;
    if (!hasLocalRule) {
      issues.push(issue(String(industry), "Starter industry must have at least one local constraint rule.", "MISSING_STARTER_RULE"));
    }
    if (graphConstraintCount === 0) {
      issues.push(issue(String(industry), "Starter industry must have at least one graph/repository constraint path.", "MISSING_CONSTRAINT_PATH"));
    }
  }

  return Object.freeze({
    valid: issues.length === 0,
    value: issues.length === 0 ? rules : undefined,
    issues,
  });
}
