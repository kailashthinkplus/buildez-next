import type {
  BrandIntelligenceProfile,
  BusinessContext,
  BusinessIntelligenceProfile,
  CompiledWebsitePlan,
  ConstraintRule,
  ContentStrategy,
  EngineTrace,
  ExperienceStrategy,
  GenerationDecision,
  GenerationHistory,
  GenerationReplay,
  PatternIntelligenceResult,
  RepairPlan,
  ResolverResult,
  SimulationResult,
  ValidationIssue,
  ValidationResult,
  WebsiteDNA,
  WebsiteIntentClassification,
  WebsiteSpec,
} from "./types";
import { isRecord } from "./utils";

type ShapeRule = {
  path: string;
  type: "string" | "number" | "boolean" | "array" | "object";
  required?: boolean;
  min?: number;
  max?: number;
};

function issue(path: string, message: string, code = "INVALID_FIELD"): ValidationIssue {
  return Object.freeze({ path, message, code });
}

function getPath(value: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((current, key) => {
    if (!isRecord(current)) return undefined;
    return current[key];
  }, value);
}

function validateShape<T>(value: unknown, rules: ShapeRule[]): ValidationResult<T> {
  const issues: ValidationIssue[] = [];
  if (!isRecord(value)) {
    return { valid: false, issues: [issue("$", "Expected an object.", "INVALID_OBJECT")] };
  }

  for (const rule of rules) {
    const field = getPath(value, rule.path);
    if (field === undefined || field === null) {
      if (rule.required !== false) {
        issues.push(issue(rule.path, "Field is required.", "REQUIRED"));
      }
      continue;
    }

    const matches =
      rule.type === "array"
        ? Array.isArray(field)
        : rule.type === "object"
          ? isRecord(field)
          : typeof field === rule.type;

    if (!matches) {
      issues.push(issue(rule.path, `Expected ${rule.type}.`, "INVALID_TYPE"));
      continue;
    }

    if (typeof field === "number" && rule.min !== undefined && field < rule.min) {
      issues.push(issue(rule.path, `Must be at least ${rule.min}.`, "OUT_OF_RANGE"));
    }
    if (typeof field === "number" && rule.max !== undefined && field > rule.max) {
      issues.push(issue(rule.path, `Must be at most ${rule.max}.`, "OUT_OF_RANGE"));
    }
  }

  return Object.freeze({
    valid: issues.length === 0,
    value: issues.length === 0 ? (value as T) : undefined,
    issues,
  });
}

/**
 * Validates BusinessContext.
 *
 * @example
 * const result = validateBusinessContext(context);
 */
export function validateBusinessContext(value: unknown): ValidationResult<BusinessContext> {
  return validateShape(value, [
    { path: "family", type: "string" },
    { path: "audience", type: "array" },
    { path: "knownFacts", type: "object" },
    { path: "missingFacts", type: "array" },
  ]);
}

/**
 * Validates WebsiteIntentClassification.
 *
 * @example
 * const result = validateWebsiteIntentClassification(intent);
 */
export function validateWebsiteIntentClassification(value: unknown): ValidationResult<WebsiteIntentClassification> {
  return validateShape(value, [
    { path: "version", type: "string" },
    { path: "businessFamily", type: "string" },
    { path: "archetypeHints", type: "array" },
    { path: "confidence", type: "number", min: 0, max: 1 },
    { path: "missingFacts", type: "array" },
  ]);
}

/**
 * Validates BusinessIntelligenceProfile.
 *
 * @example
 * const result = validateBusinessIntelligenceProfile(profile);
 */
export function validateBusinessIntelligenceProfile(value: unknown): ValidationResult<BusinessIntelligenceProfile> {
  return validateShape(value, [
    { path: "id", type: "string" },
    { path: "version", type: "string" },
    { path: "identity", type: "object" },
    { path: "identity.summary", type: "string" },
    { path: "businessFamily", type: "string" },
    { path: "businessModel", type: "string" },
    { path: "revenueModel", type: "string" },
    { path: "offerModel", type: "array" },
    { path: "conversionGoals", type: "array" },
    { path: "missingBusinessFacts", type: "array" },
    { path: "confidence", type: "number", min: 0, max: 1 },
  ]);
}

/**
 * Validates BrandIntelligenceProfile.
 *
 * @example
 * const result = validateBrandIntelligenceProfile(profile);
 */
export function validateBrandIntelligenceProfile(value: unknown): ValidationResult<BrandIntelligenceProfile> {
  return validateShape(value, [
    { path: "id", type: "string" },
    { path: "version", type: "string" },
    { path: "personality", type: "array" },
    { path: "voice", type: "string" },
    { path: "tone", type: "string" },
    { path: "trustPosture", type: "string" },
    { path: "premiumLevel", type: "string" },
    { path: "energyLevel", type: "string" },
    { path: "brandRisks", type: "array" },
    { path: "brandConstraints", type: "array" },
    { path: "missingBrandFacts", type: "array" },
  ]);
}

/**
 * Validates ContentStrategy.
 *
 * @example
 * const result = validateContentStrategy(strategy);
 */
export function validateContentStrategy(value: unknown): ValidationResult<ContentStrategy> {
  return validateShape(value, [
    { path: "id", type: "string" },
    { path: "version", type: "string" },
    { path: "messageHierarchy", type: "array" },
    { path: "headlineStrategy", type: "string" },
    { path: "sectionMessagingRoles", type: "object" },
    { path: "ctaStrategy", type: "array" },
    { path: "missingContentFacts", type: "array" },
    { path: "truthPolicy", type: "array" },
  ]);
}

/**
 * Validates ExperienceStrategy.
 *
 * @example
 * const result = validateExperienceStrategy(strategy);
 */
export function validateExperienceStrategy(value: unknown): ValidationResult<ExperienceStrategy> {
  return validateShape(value, [
    { path: "id", type: "string" },
    { path: "version", type: "string" },
    { path: "journeyStages", type: "array" },
    { path: "ctaCadence", type: "array" },
    { path: "proofPlacement", type: "array" },
    { path: "mobileJourney", type: "array" },
    { path: "conversionFrictionPoints", type: "array" },
  ]);
}

/**
 * Validates PatternIntelligenceResult.
 *
 * @example
 * const result = validatePatternIntelligenceResult(patterns);
 */
export function validatePatternIntelligenceResult(value: unknown): ValidationResult<PatternIntelligenceResult> {
  return validateShape(value, [
    { path: "id", type: "string" },
    { path: "version", type: "string" },
    { path: "selectedPatterns", type: "array" },
    { path: "rejectedPatterns", type: "array" },
    { path: "conflicts", type: "array" },
    { path: "overuseWarnings", type: "array" },
    { path: "journeyRationale", type: "array" },
    { path: "confidence", type: "number", min: 0, max: 1 },
  ]);
}

/**
 * Validates WebsiteDNA.
 *
 * @example
 * const result = validateWebsiteDNA(dna);
 */
export function validateWebsiteDNA(value: unknown): ValidationResult<WebsiteDNA> {
  return validateShape(value, [
    { path: "version", type: "string" },
    { path: "visualIdentity", type: "array" },
    { path: "contentIdentity", type: "array" },
    { path: "conversionIdentity", type: "array" },
    { path: "interactionIdentity", type: "array" },
    { path: "trustIdentity", type: "array" },
    { path: "localityIdentity", type: "array" },
    { path: "assetIdentity", type: "array" },
    { path: "seoIdentity", type: "array" },
  ]);
}

/**
 * Validates WebsiteSpec.
 *
 * @example
 * const result = validateWebsiteSpec(spec);
 */
export function validateWebsiteSpec(value: unknown): ValidationResult<WebsiteSpec> {
  return validateShape(value, [
    { path: "id", type: "string" },
    { path: "version", type: "string" },
    { path: "business", type: "object" },
    { path: "goals", type: "object" },
    { path: "archetype", type: "string" },
    { path: "sections", type: "array" },
    { path: "factsUsed", type: "array" },
    { path: "missingFacts", type: "array" },
    { path: "confidence", type: "number", min: 0, max: 1 },
  ]);
}

/**
 * Validates ConstraintRule.
 *
 * @example
 * const result = validateConstraintRule(rule);
 */
export function validateConstraintRule(value: unknown): ValidationResult<ConstraintRule> {
  return validateShape(value, [
    { path: "id", type: "string" },
    { path: "version", type: "string" },
    { path: "scope", type: "string" },
    { path: "severity", type: "string" },
    { path: "description", type: "string" },
    { path: "appliesTo", type: "array" },
    { path: "condition", type: "object" },
    { path: "repairHint", type: "object" },
  ]);
}

/**
 * Validates ResolverResult.
 *
 * @example
 * const result = validateResolverResult(resolverResult);
 */
export function validateResolverResult(value: unknown): ValidationResult<ResolverResult> {
  return validateShape(value, [
    { path: "selectedArchetype", type: "string" },
    { path: "selectedSectionPatternIds", type: "array" },
    { path: "selectedComponentVariantIds", type: "array" },
    { path: "conflicts", type: "array" },
    { path: "fallbacks", type: "array" },
    { path: "confidence", type: "number", min: 0, max: 1 },
    { path: "explanations", type: "array" },
  ]);
}

/**
 * Validates CompiledWebsitePlan.
 *
 * @example
 * const result = validateCompiledWebsitePlan(plan);
 */
export function validateCompiledWebsitePlan(value: unknown): ValidationResult<CompiledWebsitePlan> {
  return validateShape(value, [
    { path: "id", type: "string" },
    { path: "sections", type: "array" },
    { path: "assetRequirements", type: "array" },
    { path: "qualityGates", type: "array" },
    { path: "editable", type: "boolean" },
  ]);
}

/**
 * Validates SimulationResult.
 *
 * @example
 * const result = validateSimulationResult(simulation);
 */
export function validateSimulationResult(value: unknown): ValidationResult<SimulationResult> {
  return validateShape(value, [
    { path: "passed", type: "boolean" },
    { path: "score", type: "number", min: 0, max: 100 },
    { path: "issues", type: "array" },
    { path: "assetReadiness", type: "number", min: 0, max: 1 },
    { path: "editabilityRisk", type: "number", min: 0, max: 1 },
    { path: "rendererParityRisk", type: "number", min: 0, max: 1 },
    { path: "repairHints", type: "array" },
  ]);
}

/**
 * Validates GenerationDecision.
 *
 * @example
 * const result = validateGenerationDecision(decision);
 */
export function validateGenerationDecision(value: unknown): ValidationResult<GenerationDecision> {
  return validateShape(value, [
    { path: "id", type: "string" },
    { path: "stage", type: "string" },
    { path: "selected", type: "array" },
    { path: "rejected", type: "array" },
    { path: "rationale", type: "string" },
    { path: "inputs", type: "array" },
    { path: "outputs", type: "array" },
    { path: "confidence", type: "number", min: 0, max: 1 },
    { path: "warnings", type: "array" },
  ]);
}

/**
 * Validates EngineTrace.
 *
 * @example
 * const result = validateEngineTrace(trace);
 */
export function validateEngineTrace(value: unknown): ValidationResult<EngineTrace> {
  return validateShape(value, [
    { path: "traceId", type: "string" },
    { path: "module", type: "string" },
    { path: "stage", type: "string" },
    { path: "startedAt", type: "string" },
    { path: "versions", type: "object" },
    { path: "warnings", type: "array" },
    { path: "errors", type: "array" },
    { path: "decisions", type: "array" },
    { path: "metrics", type: "object" },
    { path: "repositoryRecordsUsed", type: "array" },
    { path: "constraintsApplied", type: "array" },
    { path: "metadata", type: "object" },
  ]);
}

/**
 * Validates GenerationReplay.
 *
 * @example
 * const result = validateGenerationReplay(replay);
 */
export function validateGenerationReplay(value: unknown): ValidationResult<GenerationReplay> {
  return validateShape(value, [
    { path: "replayId", type: "string" },
    { path: "sourceTraceId", type: "string" },
    { path: "requiredEngineVersions", type: "object" },
    { path: "requiredRepositoryRecords", type: "array" },
    { path: "inputRefs", type: "array" },
    { path: "expectedDecisionIds", type: "array" },
    { path: "expectedOutputRefs", type: "array" },
    { path: "replayStatus", type: "string" },
  ]);
}

/**
 * Validates RepairPlan.
 *
 * @example
 * const result = validateRepairPlan(plan);
 */
export function validateRepairPlan(value: unknown): ValidationResult<RepairPlan> {
  return validateShape(value, [
    { path: "id", type: "string" },
    { path: "reason", type: "string" },
    { path: "actions", type: "array" },
  ]);
}

/**
 * Validates GenerationHistory.
 *
 * @example
 * const result = validateGenerationHistory(history);
 */
export function validateGenerationHistory(value: unknown): ValidationResult<GenerationHistory> {
  return validateShape(value, [
    { path: "id", type: "string" },
    { path: "engineVersion", type: "object" },
    { path: "traceIds", type: "array" },
    { path: "createdAt", type: "string" },
  ]);
}

/**
 * Backward-compatible placeholder validation used by early skeleton modules.
 *
 * @example
 * const result = validateEngineInput({ ok: true });
 */
export function validateEngineInput(input: unknown) {
  return {
    valid: input !== null && input !== undefined,
    value: input,
    issues: input === null || input === undefined ? [issue("$", "Input is required.", "REQUIRED")] : [],
  };
}
