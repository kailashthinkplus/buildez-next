import { createEngineResult, type EngineResult, type EngineVersionString, type JsonValue } from "../sdk";
import { queryRepository, type RepositoryRecord } from "../repository";
import { findConstraints, indexRepositoryRecords } from "../graph";
import {
  STARTER_CONSTRAINT_RULES,
  type ConstraintEvaluationContext,
  type ConstraintEvaluationInput,
  type ConstraintEvaluationResult,
  type ConstraintRule,
  type ConstraintViolation,
} from "./rules";
import { CONSTRAINT_ENGINE_VERSION_STRING } from "./version";

function normalizeContext(input: Partial<ConstraintEvaluationContext> = {}): ConstraintEvaluationContext {
  return Object.freeze({
    businessFamily: input.businessFamily,
    industry: input.industry,
    archetype: input.archetype,
    knownFacts: input.knownFacts ?? {},
    missingFacts: input.missingFacts ?? [],
    claims: input.claims ?? [],
    sections: input.sections ?? [],
    assets: input.assets ?? [],
    conversionFocused: input.conversionFocused ?? ["lead_generation", "booking", "appointment"].includes(String(input.archetype)),
    rendererParityPreserved: input.rendererParityPreserved,
    accessibilityReady: input.accessibilityReady,
    seoReady: input.seoReady,
    metadata: input.metadata ?? {},
  });
}

function appliesToContext(rule: ConstraintRule, context: ConstraintEvaluationContext) {
  if (rule.appliesTo.length === 0) return true;
  return rule.appliesTo.some((target) =>
    target === context.businessFamily ||
    target === context.industry ||
    target === context.archetype
  );
}

function hasKnownFact(context: ConstraintEvaluationContext, key: string) {
  const value = context.knownFacts[key];
  return value !== undefined && value !== null && value !== "";
}

function textContains(text: string, term: string) {
  return text.toLowerCase().includes(term.toLowerCase());
}

function violation(rule: ConstraintRule, message: string, targetId?: string): ConstraintViolation {
  return Object.freeze({
    ruleId: String(rule.id),
    severity: rule.severity,
    scope: rule.scope,
    targetId,
    message,
    repairHint: rule.repairHint,
    category: rule.category,
    suggestion: rule.repairHint,
  });
}

function evaluateForbiddenTerms(rule: ConstraintRule, context: ConstraintEvaluationContext) {
  const forbiddenTerms = rule.condition.forbiddenTerms ?? [];
  return context.claims.flatMap((claim, index) =>
    forbiddenTerms
      .filter((term) => textContains(claim, term) && !hasKnownFact(context, term))
      .map((term) => violation(rule, `Claim contains unsupported term "${term}".`, `claims.${index}`))
  );
}

function evaluateMissingFactsRemainMissing(rule: ConstraintRule, context: ConstraintEvaluationContext) {
  return context.missingFacts.flatMap((fact) =>
    context.claims.some((claim) => textContains(claim, fact))
      ? [violation(rule, `Missing fact "${fact}" appears to have been converted into a claim.`, fact)]
      : []
  );
}

function evaluatePlaceholderContent(rule: ConstraintRule, context: ConstraintEvaluationContext) {
  const placeholderTerms = ["lorem ipsum", "placeholder", "your text here", "coming soon", "sample content"];
  return context.sections.flatMap((section) =>
    placeholderTerms.some((term) => textContains(section.content ?? "", term))
      ? [violation(rule, "Section contains placeholder content.", section.id)]
      : []
  );
}

function evaluateRequiredBoolean(rule: ConstraintRule, context: ConstraintEvaluationContext) {
  if (rule.condition.requiredField === "sections" && rule.condition.target === "editable") {
    return context.sections
      .filter((section) => section.editable === false)
      .map((section) => violation(rule, "Section is not marked editable.", section.id));
  }
  const field = rule.condition.requiredField;
  if (!field) return [];
  return context[field] !== rule.condition.expectedValue
    ? [violation(rule, `${String(field)} does not satisfy required value.`, String(field))]
    : [];
}

function evaluateRequiredCta(rule: ConstraintRule, context: ConstraintEvaluationContext) {
  if (!context.conversionFocused) return [];
  return context.sections.some((section) => section.hasPrimaryCta)
    ? []
    : [violation(rule, "Conversion-focused context is missing a primary CTA.", "primaryCta")];
}

function evaluateMobileCtaEarly(rule: ConstraintRule, context: ConstraintEvaluationContext) {
  if (!context.conversionFocused) return [];
  const maxOrder = rule.condition.maxCount ?? 2;
  return context.sections.some((section) => section.hasPrimaryCta && (section.mobileOrder ?? Number.MAX_SAFE_INTEGER) <= maxOrder)
    ? []
    : [violation(rule, `Primary CTA must appear within the first ${maxOrder} mobile sections.`, "mobileCta")];
}

function evaluateMaxConsecutiveSectionKind(rule: ConstraintRule, context: ConstraintEvaluationContext) {
  const kind = rule.condition.sectionKind;
  const maxCount = rule.condition.maxCount ?? 2;
  if (!kind) return [];
  let count = 0;
  for (const section of context.sections) {
    count = section.kind === kind ? count + 1 : 0;
    if (count > maxCount) {
      return [violation(rule, `Too many consecutive ${kind} sections.`, section.id)];
    }
  }
  return [];
}

function evaluateRequiredAssetsDeclared(rule: ConstraintRule, context: ConstraintEvaluationContext) {
  return context.assets
    .filter((asset) => asset.substituted && !asset.declared)
    .map((asset) => violation(rule, "Asset substitution occurred before the required asset was declared.", asset.id));
}

function evaluateRendererParity(rule: ConstraintRule, context: ConstraintEvaluationContext) {
  return context.rendererParityPreserved === false
    ? [violation(rule, "Preview and published output parity is not preserved.", "renderer")]
    : [];
}

/**
 * Evaluates one local constraint rule against a typed context.
 *
 * @example
 * const result = evaluateConstraintRule(rule, context);
 */
export function evaluateConstraintRule(rule: ConstraintRule, context: ConstraintEvaluationContext): ConstraintViolation[] {
  if (!appliesToContext(rule, context)) return [];
  switch (rule.condition.type) {
    case "forbidden_terms":
      return evaluateForbiddenTerms(rule, context);
    case "missing_facts_remain_missing":
      return evaluateMissingFactsRemainMissing(rule, context);
    case "placeholder_content":
      return evaluatePlaceholderContent(rule, context);
    case "required_boolean":
      return evaluateRequiredBoolean(rule, context);
    case "required_cta":
      return evaluateRequiredCta(rule, context);
    case "mobile_cta_early":
      return evaluateMobileCtaEarly(rule, context);
    case "max_consecutive_section_kind":
      return evaluateMaxConsecutiveSectionKind(rule, context);
    case "required_assets_declared":
      return evaluateRequiredAssetsDeclared(rule, context);
    case "renderer_parity":
      return evaluateRendererParity(rule, context);
    default:
      return [];
  }
}

function repositoryRecordToRule(record: RepositoryRecord): ConstraintRule {
  const industry = record.compatibleIndustries[0];
  return Object.freeze({
    id: `repository.${record.id}`,
    version: record.version as EngineVersionString,
    category: "unsupported-claim",
    scope: "industry",
    severity: "blocker",
    description: record.description,
    appliesTo: record.compatibleIndustries,
    condition: {
      type: "forbidden_terms" as const,
      forbiddenTerms: [industry, String(record.payload.rule ?? "unsupported claim")],
    },
    repairHint: {
      action: String(record.payload.repairAction ?? "remove_or_request_fact"),
      target: String(record.id),
      message: record.title,
    },
    source: "repository",
  });
}

/**
 * Collects local constraint rules from repository constraint records.
 *
 * @example
 * const rules = collectConstraintRulesFromRepository();
 */
export function collectConstraintRulesFromRepository(): ConstraintRule[] {
  return queryRepository({ category: "constraint" }).data.map(repositoryRecordToRule);
}

/**
 * Collects local constraint rules reachable from the graph for starter industries.
 *
 * @example
 * const rules = collectConstraintRulesFromGraph();
 */
export function collectConstraintRulesFromGraph(): ConstraintRule[] {
  const graph = indexRepositoryRecords().data;
  const industryNodes = graph.nodes.filter((node) => node.type === "business-family");
  const constraintIds = new Set<string>();
  for (const node of industryNodes) {
    for (const constraint of findConstraints(String(node.id)).data) {
      if (constraint.repositoryRecordId) constraintIds.add(constraint.repositoryRecordId);
    }
  }
  const repositoryRules = collectConstraintRulesFromRepository();
  return repositoryRules
    .filter((rule) => constraintIds.has(String(rule.id).replace(/^repository\./, "")))
    .map((rule) => Object.freeze({ ...rule, id: `graph.${rule.id}`, source: "graph" as const }));
}

/**
 * Evaluates multiple constraint rules against a typed context.
 *
 * @example
 * const result = evaluateConstraintRules(rules, context);
 */
export function evaluateConstraintRules(rules: readonly ConstraintRule[], context: ConstraintEvaluationContext): ConstraintEvaluationResult {
  const evaluatedRuleIds = rules.filter((rule) => appliesToContext(rule, context)).map((rule) => String(rule.id));
  const allIssues = rules.flatMap((rule) => evaluateConstraintRule(rule, context));
  const violations = allIssues.filter((item) => item.severity === "blocker" || item.severity === "major");
  const warnings = allIssues.filter((item) => item.severity === "minor" || item.severity === "info");
  const suggestions = allIssues.flatMap((item) => (item.suggestion ? [item.suggestion] : []));
  const confidence = rules.length === 0 ? 0 : Math.max(0.5, Math.min(1, evaluatedRuleIds.length / rules.length));

  return Object.freeze({
    passed: violations.every((item) => item.severity !== "blocker"),
    evaluatedRuleIds,
    violations,
    warnings,
    suggestions,
    confidence,
    ruleCount: rules.length,
  });
}

/**
 * Runs local deterministic constraint evaluation.
 *
 * @example
 * const result = runConstraints({ context: { claims: [], knownFacts: {}, missingFacts: [], sections: [], assets: [] } });
 */
export function runConstraints(input: ConstraintEvaluationInput = {}): EngineResult<ConstraintEvaluationResult> {
  const context = normalizeContext(input.context);
  const rules = [
    ...STARTER_CONSTRAINT_RULES,
    ...(input.includeRepositoryRules === false ? [] : collectConstraintRulesFromRepository()),
    ...(input.includeGraphRules ? collectConstraintRulesFromGraph() : []),
    ...(input.rules ?? []),
  ];
  const result = evaluateConstraintRules(rules, context);

  return createEngineResult({
    module: "constraints",
    stage: "evaluate",
    status: result.passed ? (result.warnings.length ? "warning" : "ok") : "blocked",
    data: result,
    metadata: {
      localOnly: true,
      engineVersion: CONSTRAINT_ENGINE_VERSION_STRING,
      ruleCount: result.ruleCount,
      evaluatedRuleCount: result.evaluatedRuleIds.length,
      violationCount: result.violations.length,
      warningCount: result.warnings.length,
    } satisfies Record<string, JsonValue>,
  });
}
