import type { BusinessFamily, EngineId, JsonValue, WebsiteArchetypeId } from "../sdk";
import { WEBSITE_REPOSITORY_VERSION } from "./version";

/**
 * Repository record category.
 *
 * @example
 * const category: RepositoryRecordCategory = "pattern";
 */
export type RepositoryRecordCategory =
  | "business-family"
  | "industry"
  | "subindustry"
  | "archetype"
  | "pattern"
  | "component"
  | "design-language"
  | "tokens"
  | "composition-rule"
  | "constraint"
  | "asset-rule"
  | "qa-rule"
  | "repair-rule"
  | "fixture"
  | "example"
  | "anti-pattern";

/**
 * Repository record lifecycle status.
 *
 * @example
 * const status: RepositoryRecordStatus = "active";
 */
export type RepositoryRecordStatus = "draft" | "active" | "deprecated";

/**
 * Versioned local repository record.
 *
 * @example
 * const id = record.id;
 */
export type RepositoryRecord<TPayload extends Record<string, JsonValue> = Record<string, JsonValue>> = Readonly<{
  id: EngineId | string;
  category: RepositoryRecordCategory;
  kind: RepositoryRecordCategory;
  version: string;
  status: RepositoryRecordStatus;
  title: string;
  description: string;
  compatibleIndustries: string[];
  compatibleArchetypes: WebsiteArchetypeId[];
  tags: string[];
  payload: TPayload;
  provenance: {
    source: "buildez" | "fixture" | "learned" | "imported";
    notes?: string;
  };
  quality: {
    confidence: number;
    fixtureCoverage: string[];
  };
}>;

/**
 * Query options for local repository reads.
 *
 * @example
 * const results = queryRepository({ category: "pattern" });
 */
export type RepositoryQuery = Readonly<{
  category?: RepositoryRecordCategory;
  industry?: string;
  archetype?: WebsiteArchetypeId;
  tag?: string;
  status?: RepositoryRecordStatus;
}>;

const record = <TPayload extends Record<string, JsonValue>>(
  input: Omit<RepositoryRecord<TPayload>, "version" | "kind" | "provenance" | "quality"> & {
    version?: string;
    provenance?: RepositoryRecord["provenance"];
    quality?: RepositoryRecord["quality"];
  }
): RepositoryRecord<TPayload> =>
  Object.freeze({
    ...input,
    kind: input.category,
    version: input.version ?? WEBSITE_REPOSITORY_VERSION,
    provenance: input.provenance ?? { source: "buildez" as const },
    quality: input.quality ?? {
      confidence: 0.7,
      fixtureCoverage: input.compatibleIndustries,
    },
  });

const starterIndustries: BusinessFamily[] = [
  "real_estate",
  "healthcare",
  "food_and_beverage",
  "automotive",
  "education",
];

export const BUSINESS_FAMILY_RECORDS = starterIndustries.map((family) =>
  record({
    id: `business-family.${family}`,
    category: "business-family",
    status: "active",
    title: family.replaceAll("_", " "),
    description: "Reusable business family classification record.",
    compatibleIndustries: [family],
    compatibleArchetypes: ["lead_generation", "brochure"],
    tags: ["business-family", family],
    payload: {
      businessFamily: family,
      role: "classification-parent",
    },
  })
);

const industrySeeds: Array<[string, BusinessFamily, string]> = [
  ["industry.real_estate.developer", "real_estate", "Real estate developer"],
  ["industry.healthcare.clinic", "healthcare", "Healthcare clinic"],
  ["industry.food_and_beverage.restaurant", "food_and_beverage", "Restaurant"],
  ["industry.automotive.dealer_or_service", "automotive", "Automotive dealer or service"],
  ["industry.education.school_or_course", "education", "School or course provider"],
];

export const INDUSTRY_RECORDS = industrySeeds.map(([id, family, title]) =>
  record({
    id,
    category: "industry",
    status: "active",
    title,
    description: "Reusable industry classification record with no business-specific facts.",
    compatibleIndustries: [family],
    compatibleArchetypes: ["lead_generation", "brochure", "catalogue", "booking", "appointment", "restaurant_menu"],
    tags: ["industry", family],
    payload: { businessFamily: family, source: "starter-record" },
  })
);

const subindustrySeeds: Array<[string, BusinessFamily, string]> = [
  ["subindustry.real_estate.project", "real_estate", "Property project"],
  ["subindustry.healthcare.appointment_clinic", "healthcare", "Appointment clinic"],
  ["subindustry.restaurant.reservation_menu", "food_and_beverage", "Reservation and menu restaurant"],
  ["subindustry.automotive.inventory_service", "automotive", "Inventory and service business"],
  ["subindustry.education.admissions_catalogue", "education", "Admissions and course catalogue"],
];

export const SUBINDUSTRY_RECORDS = subindustrySeeds.map(([id, industry, title]) =>
  record({
    id,
    category: "subindustry",
    status: "active",
    title,
    description: "Reusable subindustry shape. It does not include customer-specific claims.",
    compatibleIndustries: [industry],
    compatibleArchetypes: ["lead_generation", "brochure", "catalogue", "booking", "appointment", "restaurant_menu", "property_showcase"],
    tags: ["subindustry", industry],
    payload: { industry, role: "fixture-scope" },
  })
);

const archetypeSeeds: Array<[string, WebsiteArchetypeId, string, BusinessFamily[]]> = [
  ["archetype.lead_generation", "lead_generation", "Lead generation", starterIndustries],
  ["archetype.appointment", "appointment", "Appointment", ["healthcare"]],
  ["archetype.restaurant_menu", "restaurant_menu", "Restaurant menu", ["food_and_beverage"]],
  ["archetype.catalogue", "catalogue", "Catalogue", ["automotive", "education", "real_estate"]],
  ["archetype.property_showcase", "property_showcase", "Property showcase", ["real_estate"]],
  ["archetype.brochure", "brochure", "Brochure", starterIndustries],
];

export const ARCHETYPE_RECORDS = archetypeSeeds.map(([id, archetype, title, industries]) =>
  record({
    id,
    category: "archetype",
    status: "active",
    title,
    description: "Universal website strategy record. Industry behavior emerges from compatibility and constraints.",
    compatibleIndustries: [...industries],
    compatibleArchetypes: [archetype as WebsiteArchetypeId],
    tags: ["archetype", archetype as string],
    payload: {
      archetype,
      requiredPatternFamilies: ["hero", "trust", "conversion"],
    },
  })
);

const patternSeeds: Array<[string, string, BusinessFamily[], WebsiteArchetypeId[]]> = [
  ["pattern.editorial_hero", "Editorial Hero", starterIndustries, ["lead_generation", "brochure", "property_showcase"]],
  ["pattern.trust_band", "Trust Band", starterIndustries, ["lead_generation", "brochure", "appointment"]],
  ["pattern.booking_path", "Booking Path", ["healthcare", "food_and_beverage", "automotive", "education", "real_estate"], ["booking", "appointment", "lead_generation"]],
  ["pattern.menu_preview", "Menu Preview", ["food_and_beverage"], ["restaurant_menu"]],
  ["pattern.project_showcase", "Project Showcase", ["real_estate"], ["property_showcase", "lead_generation"]],
  ["pattern.service_matrix", "Service Matrix", ["healthcare", "automotive", "education"], ["brochure", "appointment", "catalogue"]],
  ["pattern.outcome_proof", "Outcome Proof", ["education", "healthcare", "automotive"], ["brochure", "lead_generation"]],
  ["pattern.locality_map", "Locality Map", starterIndustries, ["lead_generation", "appointment", "restaurant_menu", "property_showcase"]],
  ["pattern.faq_objection_handling", "FAQ Objection Handling", starterIndustries, ["lead_generation", "appointment", "booking", "catalogue"]],
  ["pattern.final_conversion_block", "Final Conversion Block", starterIndustries, ["lead_generation", "booking", "appointment"]],
];

export const PATTERN_RECORDS = patternSeeds.map(([id, title, industries, archetypes]) =>
  record({
    id,
    category: "pattern",
    status: "active",
    title,
    description: "Semantic website pattern. This is not a template or generated section.",
    compatibleIndustries: [...industries],
    compatibleArchetypes: archetypes as WebsiteArchetypeId[],
    tags: ["pattern", String(id).split(".")[1]],
    payload: {
      patternRole: String(id).split(".")[1],
      requiresFacts: [],
      forbiddenUses: [],
    },
  })
);

const componentSeeds: Array<[string, string, BusinessFamily[], WebsiteArchetypeId[]]> = [
  ["component.editable_hero", "Editable Hero Component Pattern", starterIndustries, ["lead_generation", "brochure", "property_showcase"]],
  ["component.editable_card_grid", "Editable Card Grid Component Pattern", starterIndustries, ["catalogue", "brochure", "lead_generation"]],
  ["component.editable_faq", "Editable FAQ Component Pattern", starterIndustries, ["lead_generation", "appointment", "booking"]],
  ["component.editable_cta", "Editable CTA Component Pattern", starterIndustries, ["lead_generation", "booking", "appointment"]],
];

export const COMPONENT_RECORDS = componentSeeds.map(([id, title, industries, archetypes]) =>
  record({
    id,
    category: "component",
    status: "draft",
    title,
    description: "Component metadata placeholder that requires native builder-node mapping later.",
    compatibleIndustries: [...industries],
    compatibleArchetypes: archetypes as WebsiteArchetypeId[],
    tags: ["component", "editable"],
    payload: {
      editableNodeMappingRequired: true,
      productionComponent: false,
    },
  })
);

const designLanguageSeeds: Array<[string, string, BusinessFamily[]]> = [
  ["design-language.trustworthy", "Trustworthy", ["healthcare", "education", "automotive"]],
  ["design-language.editorial", "Editorial", ["real_estate", "food_and_beverage", "education"]],
  ["design-language.clear_service", "Clear Service", ["healthcare", "automotive", "education"]],
];

export const DESIGN_LANGUAGE_RECORDS = designLanguageSeeds.map(([id, title, industries]) =>
  record({
    id,
    category: "design-language",
    status: "active",
    title,
    description: "Design language metadata only. Does not emit tokens or UI.",
    compatibleIndustries: [...industries],
    compatibleArchetypes: ["lead_generation", "brochure", "appointment", "catalogue", "restaurant_menu", "property_showcase"],
    tags: ["design-language"],
    payload: { visualIntent: title },
  })
);

export const TOKEN_RECORDS = [
  record({
    id: "tokens.accessibility.baseline",
    category: "tokens",
    status: "active",
    title: "Accessibility Token Requirements",
    description: "Token requirements for contrast, readable type, and responsive spacing.",
    compatibleIndustries: [...starterIndustries],
    compatibleArchetypes: ["lead_generation", "brochure", "appointment", "catalogue", "restaurant_menu", "property_showcase"],
    tags: ["tokens", "accessibility"],
    payload: {
      requirements: ["contrast-aa", "responsive-spacing", "readable-body-type"],
    },
  }),
];

export const COMPOSITION_RULE_RECORDS = [
  record({
    id: "composition-rule.avoid_three_card_grids",
    category: "composition-rule",
    status: "active",
    title: "Avoid Three Consecutive Card Grids",
    description: "Prevents monotonous generic layouts across industries.",
    compatibleIndustries: [...starterIndustries],
    compatibleArchetypes: ["lead_generation", "brochure", "catalogue", "appointment", "restaurant_menu", "property_showcase"],
    tags: ["composition", "density"],
    payload: {
      rule: "avoid-three-consecutive-card-grids",
      severity: "major",
    },
  }),
  record({
    id: "composition-rule.mobile_cta_early",
    category: "composition-rule",
    status: "active",
    title: "Mobile CTA Early",
    description: "Conversion-focused pages need a reachable primary CTA early on mobile.",
    compatibleIndustries: [...starterIndustries],
    compatibleArchetypes: ["lead_generation", "booking", "appointment"],
    tags: ["composition", "mobile", "conversion"],
    payload: {
      rule: "mobile-primary-cta-within-first-two-screens",
      severity: "major",
    },
  }),
];

const constraintSeeds: Array<[string, string, BusinessFamily[]]> = [
  ["constraint.real_estate.no_fake_prices_or_availability", "No fabricated real estate prices or availability", ["real_estate"]],
  ["constraint.healthcare.no_fake_credentials_or_outcomes", "No fabricated healthcare credentials or outcomes", ["healthcare"]],
  ["constraint.restaurant.no_invented_menu_prices_or_hours", "No invented menu prices or hours", ["food_and_beverage"]],
  ["constraint.automotive.no_false_authorization_or_inventory", "No false authorization or inventory claims", ["automotive"]],
  ["constraint.education.no_fake_accreditation_or_outcomes", "No fake accreditation or outcome claims", ["education"]],
];

export const CONSTRAINT_RECORDS = constraintSeeds.map(([id, title, industries]) =>
  record({
    id,
    category: "constraint",
    status: "active",
    title,
    description: "Truth constraint. Requires provided facts before claims can appear.",
    compatibleIndustries: [...industries],
    compatibleArchetypes: ["lead_generation", "brochure", "catalogue", "booking", "appointment", "restaurant_menu", "property_showcase"],
    tags: ["constraint", "truth"],
    payload: {
      scope: "industry",
      severity: "blocker",
      rule: "unsupported-claim-block",
      repairAction: "remove-or-request-fact",
    },
  })
);

export const ASSET_RULE_RECORDS = [
  record({
    id: "asset-rule.required_real_media_when_inspection_matters",
    category: "asset-rule",
    status: "active",
    title: "Require Real Media For Inspectable Offerings",
    description: "When the user needs to inspect a place, product, vehicle, menu, or campus, irrelevant stock-like assets are not acceptable.",
    compatibleIndustries: [...starterIndustries],
    compatibleArchetypes: ["property_showcase", "catalogue", "restaurant_menu", "appointment", "brochure"],
    tags: ["asset", "truth"],
    payload: {
      fallbackPolicy: "request_asset",
      stockLikeFallbackAllowed: false,
    },
  }),
];

export const QA_RULE_RECORDS = [
  record({
    id: "qa-rule.preview_ready.minimum_truth_and_editability",
    category: "qa-rule",
    status: "active",
    title: "Preview Ready Truth And Editability",
    description: "Preview-ready output must remain editable and avoid unsupported claims.",
    compatibleIndustries: [...starterIndustries],
    compatibleArchetypes: ["lead_generation", "brochure", "catalogue", "booking", "appointment", "restaurant_menu", "property_showcase"],
    tags: ["qa", "truth", "editability"],
    payload: {
      minimumScore: 85,
      hardFailures: ["unsupported-claim", "non-editable-section"],
    },
  }),
];

export const REPAIR_RULE_RECORDS = [
  record({
    id: "repair-rule.replace_invalid_section_pattern",
    category: "repair-rule",
    status: "draft",
    title: "Replace Invalid Section Pattern",
    description: "Future repair rule for replacing a structurally invalid section pattern.",
    compatibleIndustries: [...starterIndustries],
    compatibleArchetypes: ["lead_generation", "brochure", "catalogue", "booking", "appointment", "restaurant_menu", "property_showcase"],
    tags: ["repair", "structural"],
    payload: {
      productionRepair: false,
      operation: "replace-section-pattern",
    },
  }),
];

export const ANTI_PATTERN_RECORDS = [
  record({
    id: "anti-pattern.generic_saas_for_non_saas",
    category: "anti-pattern",
    status: "active",
    title: "Generic SaaS Layout For Non-SaaS Businesses",
    description: "Avoid SaaS pricing, badge, and feature-card patterns when the business model does not support them.",
    compatibleIndustries: [...starterIndustries],
    compatibleArchetypes: ["lead_generation", "brochure", "catalogue", "booking", "appointment", "restaurant_menu", "property_showcase"],
    tags: ["anti-pattern", "generic-saas"],
    payload: {
      forbiddenPatternFamily: "generic-saas",
    },
  }),
];

export const EXAMPLE_RECORDS = [
  record({
    id: "example.fixture_contract_only",
    category: "example",
    status: "draft",
    title: "Fixture Contract Only Example",
    description: "Demonstrates repository shape without generated website content.",
    compatibleIndustries: [...starterIndustries],
    compatibleArchetypes: ["lead_generation", "brochure"],
    tags: ["example", "contract-only"],
    payload: {
      generatedWebsite: false,
    },
  }),
];

const fixtureSeeds: Array<[string, BusinessFamily, WebsiteArchetypeId[]]> = [
  ["fixture.real_estate.contract", "real_estate", ["property_showcase", "lead_generation"]],
  ["fixture.healthcare.contract", "healthcare", ["appointment", "brochure"]],
  ["fixture.restaurant.contract", "food_and_beverage", ["restaurant_menu", "booking"]],
  ["fixture.automotive.contract", "automotive", ["catalogue", "booking", "lead_generation"]],
  ["fixture.education.contract", "education", ["brochure", "lead_generation", "catalogue"]],
  ["fixture.d2c.contract", "ecommerce_d2c", ["ecommerce", "catalogue", "product_launch"]],
  ["fixture.hospitality.contract", "hospitality", ["hotel_resort", "booking", "brochure"]],
  ["fixture.interior_design.contract", "architecture_interiors", ["portfolio", "lead_generation", "brochure"]],
];

export const FIXTURE_RECORDS = fixtureSeeds.map(([id, industry, archetypes]) =>
  record({
    id,
    category: "fixture",
    status: "draft",
    title: `${String(industry).replaceAll("_", " ")} fixture contract`,
    description: "Contract-only fixture metadata. Does not include generated website output.",
    compatibleIndustries: [industry as string],
    compatibleArchetypes: archetypes as WebsiteArchetypeId[],
    tags: ["fixture", "contract-only"],
    payload: {
      generatedWebsite: false,
      fixtureContractOnly: true,
    },
    provenance: { source: "fixture" },
  })
);

export const REPOSITORY_RECORDS: readonly RepositoryRecord[] = Object.freeze([
  ...BUSINESS_FAMILY_RECORDS,
  ...INDUSTRY_RECORDS,
  ...SUBINDUSTRY_RECORDS,
  ...ARCHETYPE_RECORDS,
  ...PATTERN_RECORDS,
  ...COMPONENT_RECORDS,
  ...DESIGN_LANGUAGE_RECORDS,
  ...TOKEN_RECORDS,
  ...COMPOSITION_RULE_RECORDS,
  ...CONSTRAINT_RECORDS,
  ...ASSET_RULE_RECORDS,
  ...QA_RULE_RECORDS,
  ...REPAIR_RULE_RECORDS,
  ...FIXTURE_RECORDS,
  ...ANTI_PATTERN_RECORDS,
  ...EXAMPLE_RECORDS,
]);

export const STARTER_INDUSTRIES: readonly BusinessFamily[] = Object.freeze([...starterIndustries]);
