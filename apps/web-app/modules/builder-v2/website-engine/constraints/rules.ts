import type {
  ConstraintRepairHint,
  ConstraintRule as SdkConstraintRule,
  ConstraintScope,
  ConstraintViolation as SdkConstraintViolation,
  EngineVersionString,
  EngineSeverity,
  JsonValue,
  WebsiteArchetypeId,
} from "../sdk";
import { CONSTRAINT_ENGINE_VERSION_STRING } from "./version";

/**
 * Constraint severity reuses SDK severity.
 *
 * @example
 * const severity: ConstraintSeverity = "blocker";
 */
export type ConstraintSeverity = EngineSeverity;

/**
 * Constraint scope reuses SDK scope.
 *
 * @example
 * const scope: ConstraintScope = "industry";
 */
export type { ConstraintScope };

/**
 * Constraint category taxonomy used by the local evaluator.
 *
 * @example
 * const category: ConstraintCategory = "fact-truth";
 */
export type ConstraintCategory =
  | "fact-truth"
  | "missing-fact"
  | "placeholder-content"
  | "compliance"
  | "unsupported-claim"
  | "asset-readiness"
  | "editability"
  | "mobile-conversion"
  | "composition"
  | "renderer-parity"
  | "accessibility"
  | "seo"
  | "industry-fit";

/**
 * Machine-evaluable local constraint condition.
 *
 * @example
 * const condition: ConstraintCondition = { type: "forbidden_terms", forbiddenTerms: ["fake"] };
 */
export type ConstraintCondition = Readonly<{
  type:
    | "forbidden_terms"
    | "missing_facts_remain_missing"
    | "placeholder_content"
    | "required_boolean"
    | "required_cta"
    | "mobile_cta_early"
    | "max_consecutive_section_kind"
    | "required_assets_declared"
    | "renderer_parity";
  forbiddenTerms?: string[];
  requiredField?: keyof ConstraintEvaluationContext;
  expectedValue?: JsonValue;
  maxCount?: number;
  sectionKind?: string;
  target?: string;
}>;

/**
 * Constraint rule owned by the local Constraint Engine.
 *
 * @example
 * const id = rule.id;
 */
export type ConstraintRule = SdkConstraintRule & Readonly<{
  category: ConstraintCategory;
  condition: ConstraintCondition;
  source: "starter" | "repository" | "graph";
}>;

/**
 * Repair suggestion emitted by the local evaluator.
 *
 * @example
 * const suggestion: ConstraintSuggestion = { action: "request_fact", message: "Ask for the missing fact." };
 */
export type ConstraintSuggestion = ConstraintRepairHint;

/**
 * Constraint violation emitted by the local evaluator.
 *
 * @example
 * const violation: ConstraintViolation = { ruleId: "global.no_fake_facts", severity: "blocker", message: "Unsupported claim." };
 */
export type ConstraintViolation = SdkConstraintViolation & Readonly<{
  category: ConstraintCategory;
  suggestion?: ConstraintSuggestion;
}>;

/**
 * Section summary used by local constraint evaluation.
 *
 * @example
 * const section: ConstraintSection = { id: "hero", kind: "hero", editable: true };
 */
export type ConstraintSection = Readonly<{
  id: string;
  kind: string;
  content?: string;
  editable?: boolean;
  hasPrimaryCta?: boolean;
  mobileOrder?: number;
}>;

/**
 * Asset summary used by local constraint evaluation.
 *
 * @example
 * const asset: ConstraintAsset = { id: "hero-image", kind: "image", declared: true };
 */
export type ConstraintAsset = Readonly<{
  id: string;
  kind: string;
  declared: boolean;
  ready?: boolean;
  substituted?: boolean;
}>;

/**
 * Local deterministic evaluation context.
 *
 * @example
 * const context: ConstraintEvaluationContext = { knownFacts: {}, missingFacts: [], claims: [], sections: [], assets: [] };
 */
export type ConstraintEvaluationContext = Readonly<{
  businessFamily?: string;
  industry?: string;
  archetype?: WebsiteArchetypeId | string;
  knownFacts: Record<string, JsonValue>;
  missingFacts: string[];
  claims: string[];
  sections: ConstraintSection[];
  assets: ConstraintAsset[];
  conversionFocused?: boolean;
  rendererParityPreserved?: boolean;
  accessibilityReady?: boolean;
  seoReady?: boolean;
  metadata?: Record<string, JsonValue>;
}>;

/**
 * Input accepted by `runConstraints`.
 *
 * @example
 * const input: ConstraintEvaluationInput = { context };
 */
export type ConstraintEvaluationInput = Readonly<{
  context?: Partial<ConstraintEvaluationContext>;
  rules?: ConstraintRule[];
  includeRepositoryRules?: boolean;
  includeGraphRules?: boolean;
}>;

/**
 * Local evaluation result extends the SDK result with suggestions and counts.
 *
 * @example
 * const passed = result.passed;
 */
export type ConstraintEvaluationResult = Readonly<{
  passed: boolean;
  evaluatedRuleIds: string[];
  violations: ConstraintViolation[];
  warnings: ConstraintViolation[];
  suggestions: ConstraintSuggestion[];
  confidence: number;
  ruleCount: number;
}>;

const defaultRepairHint = (message: string, target?: string): ConstraintRepairHint => ({
  action: "remove_or_request_fact",
  target,
  message,
});

const rule = (
  id: string,
  category: ConstraintCategory,
  scope: ConstraintScope,
  severity: ConstraintSeverity,
  description: string,
  appliesTo: string[],
  condition: ConstraintCondition,
  repairHint: ConstraintRepairHint
): ConstraintRule =>
  Object.freeze({
    id,
    version: CONSTRAINT_ENGINE_VERSION_STRING as EngineVersionString,
    category,
    scope,
    severity,
    description,
    appliesTo,
    condition,
    repairHint,
    source: "starter" as const,
  });

/**
 * Local starter rules that are safe across all industries.
 *
 * @example
 * const rules = STARTER_CONSTRAINT_RULES;
 */
export const STARTER_CONSTRAINT_RULES: readonly ConstraintRule[] = Object.freeze([
  rule("global.no_fake_facts", "fact-truth", "global", "blocker", "Do not introduce claims that are not supported by provided facts.", [], { type: "forbidden_terms", forbiddenTerms: ["guaranteed", "#1", "number one", "award-winning"] }, defaultRepairHint("Remove unsupported claims or request the missing fact.")),
  rule("global.missing_facts_remain_missing", "missing-fact", "global", "blocker", "Missing facts must remain explicit and must not be converted into claims.", [], { type: "missing_facts_remain_missing" }, defaultRepairHint("Keep the fact missing or ask the user for it.")),
  rule("global.no_placeholder_content", "placeholder-content", "global", "major", "Do not emit placeholder or lorem ipsum content.", [], { type: "placeholder_content" }, defaultRepairHint("Replace placeholder content with provided facts or omit the section.")),
  rule("global.no_unsupported_claims", "unsupported-claim", "global", "blocker", "Unsupported claims must be removed or backed by known facts.", [], { type: "forbidden_terms", forbiddenTerms: ["certified by", "officially authorized", "guaranteed results"] }, defaultRepairHint("Remove unsupported claims or request evidence.")),
  rule("global.sections_editable", "editability", "section", "blocker", "Generated sections must remain editable as native builder structures.", [], { type: "required_boolean", requiredField: "sections", expectedValue: true, target: "editable" }, defaultRepairHint("Use editable section/component structures.", "sections")),
  rule("global.renderer_parity", "renderer-parity", "renderer", "blocker", "Preview and published output must preserve renderer parity.", [], { type: "renderer_parity" }, defaultRepairHint("Keep preview and publish rendering contracts aligned.", "renderer")),
  rule("global.primary_cta_required", "mobile-conversion", "archetype", "major", "Conversion-focused archetypes require a primary CTA.", ["lead_generation", "booking", "appointment"], { type: "required_cta" }, defaultRepairHint("Add a primary CTA or change the archetype goal.", "primaryCta")),
  rule("global.mobile_cta_early", "mobile-conversion", "archetype", "major", "Conversion-focused sites need a primary CTA early on mobile.", ["lead_generation", "booking", "appointment"], { type: "mobile_cta_early", maxCount: 2 }, defaultRepairHint("Move the primary CTA into the first two mobile sections.", "mobileCta")),
  rule("global.avoid_three_card_grids", "composition", "section", "major", "Avoid three consecutive card-grid sections.", [], { type: "max_consecutive_section_kind", sectionKind: "card-grid", maxCount: 2 }, defaultRepairHint("Replace or vary one repeated card-grid section.", "sections")),
  rule("global.required_assets_declared", "asset-readiness", "asset", "major", "Required assets must be declared before substitution.", [], { type: "required_assets_declared" }, defaultRepairHint("Declare required assets before selecting substitutes.", "assets")),
  rule("global.accessibility_baseline", "accessibility", "global", "major", "Accessibility readiness should be explicit before preview.", [], { type: "required_boolean", requiredField: "accessibilityReady", expectedValue: true }, defaultRepairHint("Declare accessibility checks or keep readiness false.", "accessibility")),
  rule("global.seo_baseline", "seo", "global", "minor", "SEO readiness should be explicit before preview.", [], { type: "required_boolean", requiredField: "seoReady", expectedValue: true }, defaultRepairHint("Declare SEO checks or keep readiness false.", "seo")),
  rule("healthcare.no_fabricated_medical_claims", "compliance", "industry", "blocker", "Healthcare must not fabricate doctors, credentials, cure guarantees, privacy claims, or certifications.", ["healthcare"], { type: "forbidden_terms", forbiddenTerms: ["doctor", "credential", "cure guarantee", "privacy certified", "certification"] }, defaultRepairHint("Use provided healthcare facts only or omit the claim.", "healthcareClaims")),
  rule("real_estate.no_fabricated_property_claims", "compliance", "industry", "blocker", "Real estate must not fabricate registration numbers, prices, availability, launch status, or awards.", ["real_estate"], { type: "forbidden_terms", forbiddenTerms: ["registration number", "price", "available now", "launched", "award"] }, defaultRepairHint("Use provided real estate facts only or omit the claim.", "realEstateClaims")),
  rule("restaurant.no_invented_operations_claims", "compliance", "industry", "blocker", "Restaurant sites must not invent menu prices, hours, reservation availability, or delivery availability.", ["food_and_beverage"], { type: "forbidden_terms", forbiddenTerms: ["menu price", "open 24", "reservation available", "delivery available"] }, defaultRepairHint("Use provided restaurant facts only or omit the claim.", "restaurantClaims")),
  rule("automotive.no_unsupported_vehicle_claims", "compliance", "industry", "blocker", "Automotive sites must not claim brand authorization, warranty terms, financing terms, inventory, or discounts unless provided.", ["automotive"], { type: "forbidden_terms", forbiddenTerms: ["authorized dealer", "warranty", "financing", "in stock", "discount"] }, defaultRepairHint("Use provided automotive facts only or omit the claim.", "automotiveClaims")),
  rule("education.no_fabricated_education_claims", "compliance", "industry", "blocker", "Education sites must not fabricate accreditation, exam results, placement numbers, faculty credentials, or admission guarantees.", ["education"], { type: "forbidden_terms", forbiddenTerms: ["accredited", "exam result", "placement", "faculty credential", "admission guaranteed"] }, defaultRepairHint("Use provided education facts only or omit the claim.", "educationClaims")),
]);
