import type { EngineVersionString, EngineVersions } from "./version";

/**
 * Branded string identifier used by all Website Engine contracts.
 *
 * @example
 * const id = "website_spec_001" as EngineId;
 */
export type EngineId = string & { readonly __engineIdBrand?: unique symbol };

/**
 * ISO-8601 timestamp string.
 *
 * @example
 * const now: IsoTimestamp = new Date().toISOString();
 */
export type IsoTimestamp = string & { readonly __isoTimestampBrand?: unique symbol };

/**
 * JSON-safe primitive value.
 *
 * @example
 * const value: JsonPrimitive = "lead_generation";
 */
export type JsonPrimitive = string | number | boolean | null;

/**
 * JSON-safe value used for trace metadata and known facts.
 *
 * @example
 * const metadata: JsonValue = { source: "fixture" };
 */
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

/**
 * Normalized execution status returned by all engine modules.
 *
 * @example
 * const status: EngineStatus = "warning";
 */
export type EngineStatus = "ok" | "warning" | "blocked" | "unsupported" | "error";

/**
 * Severity shared by warnings, errors, constraints, and evaluation issues.
 *
 * @example
 * const severity: EngineSeverity = "blocker";
 */
export type EngineSeverity = "info" | "minor" | "major" | "blocker";

/**
 * Website Engine module identifier used in traces and errors.
 *
 * @example
 * const module: EngineModuleName = "sdk";
 */
export type EngineModuleName =
  | "sdk"
  | "planner"
  | "business-intelligence"
  | "brand-intelligence"
  | "content-intelligence"
  | "experience"
  | "pattern-intelligence"
  | "knowledge"
  | "graph"
  | "repository"
  | "reasoning"
  | "specification"
  | "constraints"
  | "resolver"
  | "compiler"
  | "design"
  | "composition"
  | "assets"
  | "components"
  | "mapper"
  | "renderer"
  | "simulation"
  | "critic"
  | "repair"
  | "learning"
  | "analytics"
  | "ai-v10.orchestrator"
  | string;

/**
 * Warning emitted by an engine module without necessarily failing execution.
 *
 * @example
 * const warning: EngineWarning = { code: "MISSING_FACT", message: "Location missing" };
 */
export type EngineWarning = Readonly<{
  code: string;
  message: string;
  module?: EngineModuleName;
  severity: Exclude<EngineSeverity, "blocker">;
  targetId?: EngineId | string;
  metadata?: Record<string, JsonValue>;
}>;

/**
 * Normalized engine error object suitable for traces and API boundaries.
 *
 * @example
 * const error: EngineError = { code: "INVALID_SCHEMA", message: "Bad spec", recoverable: true, severity: "blocker" };
 */
export type EngineError = Readonly<{
  code: string;
  message: string;
  module?: EngineModuleName;
  recoverable: boolean;
  severity: EngineSeverity;
  targetId?: EngineId | string;
  cause?: string;
  metadata?: Record<string, JsonValue>;
}>;

/**
 * Lightweight timing and count metrics for module execution.
 *
 * @example
 * const metrics: EngineMetrics = { durationMs: 12, startedAt: "...", completedAt: "..." };
 */
export type EngineMetrics = Readonly<{
  startedAt: IsoTimestamp | string;
  completedAt?: IsoTimestamp | string;
  durationMs?: number;
  inputCount?: number;
  outputCount?: number;
  metadata?: Record<string, JsonValue>;
}>;

/**
 * Explainable decision made by any engine stage.
 *
 * @example
 * const decision: GenerationDecision = { id: "decision_1", stage: "resolver", selected: ["booking"], rejected: [], rationale: "Appointment goal", inputs: [], outputs: [], confidence: 0.8, warnings: [] };
 */
export type GenerationDecision = Readonly<{
  id: EngineId | string;
  stage: EngineModuleName | string;
  selected: string[];
  rejected: string[];
  rationale: string;
  inputs: string[];
  outputs: string[];
  confidence: number;
  warnings: string[];
}>;

/**
 * First-class trace for a Website Engine execution or module execution.
 *
 * @example
 * const trace = createEngineTrace({ module: "sdk", stage: "validation" });
 */
export type EngineTrace = Readonly<{
  traceId: EngineId | string;
  module: EngineModuleName;
  stage: string;
  startedAt: IsoTimestamp | string;
  completedAt?: IsoTimestamp | string;
  versions: EngineVersions;
  /** Backward-compatible alias for older skeleton code. */
  version: EngineVersions;
  warnings: EngineWarning[];
  errors: EngineError[];
  decisions: GenerationDecision[];
  metrics: EngineMetrics;
  repositoryRecordsUsed: string[];
  constraintsApplied: string[];
  confidence?: number;
  metadata: Record<string, JsonValue>;
}>;

/**
 * Standard module result wrapper used by every Website Engine module.
 *
 * @example
 * const result: EngineResult<string> = createEngineResult({ module: "sdk", stage: "example", data: "ok" });
 */
export type EngineResult<T> = Readonly<{
  status: EngineStatus;
  ok: boolean;
  data: T;
  warnings: EngineWarning[];
  errors: EngineError[];
  trace: EngineTrace;
  metrics: EngineMetrics;
  metadata: Record<string, JsonValue>;
}>;

/**
 * Universal business family taxonomy.
 *
 * @example
 * const family: BusinessFamily = "healthcare";
 */
export type BusinessFamily =
  | "healthcare"
  | "real_estate"
  | "hospitality"
  | "food_and_beverage"
  | "education"
  | "beauty_wellness"
  | "fitness"
  | "automotive"
  | "construction"
  | "architecture_interiors"
  | "professional_services"
  | "legal_finance"
  | "ecommerce_d2c"
  | "manufacturing_industrial"
  | "logistics"
  | "travel"
  | "creative_portfolio"
  | "ngo_community"
  | "entertainment_events"
  | "technology_saas"
  | "personal_brand"
  | "unknown";

/**
 * Universal website archetype identifiers.
 *
 * @example
 * const archetype: WebsiteArchetypeId = "lead_generation";
 */
export type WebsiteArchetypeId =
  | "lead_generation"
  | "brochure"
  | "corporate"
  | "portfolio"
  | "ecommerce"
  | "catalogue"
  | "booking"
  | "appointment"
  | "marketplace"
  | "directory"
  | "event"
  | "community"
  | "ngo"
  | "saas"
  | "documentation"
  | "knowledge_base"
  | "blog_media"
  | "landing_page"
  | "restaurant_menu"
  | "hotel_resort"
  | "property_showcase"
  | "product_launch"
  | "recruitment"
  | "investor_relations"
  | "unknown";

/**
 * Stable industry identifier.
 *
 * @example
 * const industry: IndustryId = "clinic";
 */
export type IndustryId = string;

/**
 * Stable subindustry identifier.
 *
 * @example
 * const subIndustry: SubIndustryId = "dental_clinic";
 */
export type SubIndustryId = string;

/**
 * Fact required by the engine but not yet known.
 *
 * @example
 * const missing: MissingFact = { id: "location", label: "Location", required: true, reason: "Needed for locality content" };
 */
export type MissingFact = Readonly<{
  id: EngineId | string;
  label: string;
  required: boolean;
  reason: string;
  severity?: EngineSeverity;
}>;

/**
 * Initial intent classification. This is a hypothesis, not a generation plan.
 *
 * @example
 * const classification: WebsiteIntentClassification = { version: "1.0.0", businessFamily: "restaurant", archetypeHints: ["restaurant_menu"], confidence: 0.7, missingFacts: [] };
 */
export type WebsiteIntentClassification = Readonly<{
  version: EngineVersionString;
  businessFamily: BusinessFamily;
  industryId?: IndustryId;
  subIndustryId?: SubIndustryId;
  businessType?: string;
  primaryGoal?: string;
  audience?: string[];
  requestedDeliverable?: "single_page" | "multi_page" | "section" | "unknown";
  archetypeHints: WebsiteArchetypeId[];
  confidence: number;
  missingFacts: MissingFact[];
}>;

/**
 * Known business facts and missing facts before intelligence resolution.
 *
 * @example
 * const context: BusinessContext = { family: "education", audience: ["parents"], knownFacts: {}, missingFacts: [] };
 */
export type BusinessContext = Readonly<{
  businessName?: string;
  family: BusinessFamily;
  industryId?: IndustryId;
  subIndustryId?: SubIndustryId;
  location?: string;
  audience: string[];
  offerings?: string[];
  differentiators?: string[];
  proofPoints?: string[];
  knownFacts: Record<string, JsonValue>;
  missingFacts: MissingFact[];
  sourceNotes?: string[];
}>;

/**
 * Business intelligence profile generated before WebsiteSpec.
 *
 * @example
 * const profile: BusinessIntelligenceProfile = createEmptyBusinessIntelligenceProfile("healthcare");
 */
export type BusinessIntelligenceProfile = Readonly<{
  id: EngineId | string;
  version: EngineVersionString;
  identity: { name?: string; summary: string };
  businessFamily: BusinessFamily;
  industryId?: IndustryId;
  subIndustryId?: SubIndustryId;
  businessModel: string;
  revenueModel: string;
  offerModel: string[];
  customerTypes: string[];
  buyerJourney: string[];
  differentiation: string[];
  trustSignals: string[];
  objections: string[];
  competitivePositioning?: string;
  localityNeeds: string[];
  complianceNeeds: string[];
  proofNeeds: string[];
  conversionGoals: string[];
  missingBusinessFacts: MissingFact[];
  confidence: number;
}>;

/**
 * Brand profile generated before Design Engine.
 *
 * @example
 * const brand: BrandIntelligenceProfile = { id: "brand_1", version: "0.1.0", personality: [], voice: "clear", tone: "calm", emotionalPositioning: [], audiencePerception: [], trustPosture: "evidence-led", storyAngle: "", differentiation: [], premiumLevel: "accessible", energyLevel: "balanced", localityPositioning: "local", brandRisks: [], brandConstraints: [], existingBrandAssets: [], missingBrandFacts: [] };
 */
export type BrandIntelligenceProfile = Readonly<{
  id: EngineId | string;
  version: EngineVersionString;
  personality: string[];
  voice: string;
  tone: string;
  emotionalPositioning: string[];
  audiencePerception: string[];
  trustPosture: string;
  storyAngle: string;
  differentiation: string[];
  premiumLevel: "budget" | "accessible" | "premium" | "luxury";
  energyLevel: "calm" | "balanced" | "dynamic";
  localityPositioning: "local" | "regional" | "global";
  brandRisks: string[];
  brandConstraints: string[];
  existingBrandAssets: string[];
  missingBrandFacts: string[];
}>;

/**
 * Content strategy before copywriting.
 *
 * @example
 * const content: ContentStrategy = { id: "content_1", version: "0.1.0", messageHierarchy: [], headlineStrategy: "", sectionMessagingRoles: {}, ctaStrategy: [], proofStrategy: [], faqStrategy: [], seoContentStrategy: [], trustCopyRules: [], objectionHandling: [], localityContent: [], complianceCopyRules: [], missingContentFacts: [], truthPolicy: [] };
 */
export type ContentStrategy = Readonly<{
  id: EngineId | string;
  version: EngineVersionString;
  messageHierarchy: string[];
  headlineStrategy: string;
  sectionMessagingRoles: Record<string, string>;
  ctaStrategy: string[];
  proofStrategy: string[];
  faqStrategy: string[];
  seoContentStrategy: string[];
  trustCopyRules: string[];
  objectionHandling: string[];
  localityContent: string[];
  complianceCopyRules: string[];
  missingContentFacts: string[];
  truthPolicy: string[];
}>;

/**
 * Experience strategy before composition.
 *
 * @example
 * const experience: ExperienceStrategy = { id: "experience_1", version: "0.1.0", journeyStages: [], attentionCurve: [], trustCurve: [], ctaCadence: [], proofPlacement: [], contentDensityCurve: [], mediaRhythm: [], interactionRhythm: [], scrollNarrative: [], mobileJourney: [], conversionFrictionPoints: [] };
 */
export type ExperienceStrategy = Readonly<{
  id: EngineId | string;
  version: EngineVersionString;
  journeyStages: string[];
  attentionCurve: string[];
  trustCurve: string[];
  ctaCadence: string[];
  proofPlacement: string[];
  contentDensityCurve: string[];
  mediaRhythm: string[];
  interactionRhythm: string[];
  scrollNarrative: string[];
  mobileJourney: string[];
  conversionFrictionPoints: string[];
}>;

/**
 * Semantic pattern intelligence before component selection.
 *
 * @example
 * const patterns: PatternIntelligenceResult = { id: "patterns_1", version: "0.1.0", selectedPatterns: [], rejectedPatterns: [], conflicts: [], overuseWarnings: [], journeyRationale: [], confidence: 0 };
 */
export type PatternIntelligenceResult = Readonly<{
  id: EngineId | string;
  version: EngineVersionString;
  selectedPatterns: PatternDecision[];
  rejectedPatterns: PatternDecision[];
  conflicts: string[];
  overuseWarnings: string[];
  journeyRationale: string[];
  confidence: number;
}>;

/**
 * Semantic pattern selection or rejection decision.
 *
 * @example
 * const decision: PatternDecision = { patternId: "booking_path", reason: "Primary conversion", satisfies: ["conversion"], risks: [] };
 */
export type PatternDecision = Readonly<{
  patternId: string;
  reason: string;
  satisfies: string[];
  risks: string[];
}>;

/**
 * Website goals used by WebsiteSpec.
 *
 * @example
 * const goals: WebsiteGoalPlan = { primaryGoal: "book appointment", secondaryGoals: [], conversionGoals: ["appointment"] };
 */
export type WebsiteGoalPlan = Readonly<{
  primaryGoal: string;
  secondaryGoals: string[];
  conversionGoals: string[];
}>;

/**
 * Coherent identity for generated website continuity.
 *
 * @example
 * const dna: WebsiteDNA = { version: "0.1.0", visualIdentity: [], contentIdentity: [], conversionIdentity: [], interactionIdentity: [], trustIdentity: [], localityIdentity: [], assetIdentity: [], seoIdentity: [] };
 */
export type WebsiteDNA = Readonly<{
  id?: EngineId | string;
  version: EngineVersionString;
  businessProfileRef?: string;
  brandProfileRef?: string;
  contentStrategyRef?: string;
  experienceStrategyRef?: string;
  visualIdentity: string[];
  contentIdentity: string[];
  conversionIdentity: string[];
  interactionIdentity: string[];
  trustIdentity: string[];
  localityIdentity: string[];
  assetIdentity: string[];
  seoIdentity: string[];
}>;

/**
 * Section-level planning contract inside WebsiteSpec and compiled plans.
 *
 * @example
 * const section: SectionSpec = { id: "hero", type: "hero", purpose: "Establish value", requiredContentFields: [], requiredAssetIds: [], editable: true };
 */
export type SectionSpec = Readonly<{
  id: EngineId | string;
  type: string;
  purpose: string;
  requiredContentFields: string[];
  requiredAssetIds: string[];
  editable: boolean;
  patternRefs?: string[];
  componentVariantRef?: string;
}>;

/**
 * Central contract between intelligence and downstream engine modules.
 *
 * @example
 * const spec: WebsiteSpec = { id: "spec_1", version: "0.1.0", business, goals, archetype: "brochure", sections: [], factsUsed: [], missingFacts: [], confidence: 0.8 };
 */
export type WebsiteSpec = Readonly<{
  id: EngineId | string;
  version: EngineVersionString;
  business: BusinessContext;
  businessIntelligenceRef?: string;
  brandIntelligenceRef?: string;
  contentStrategyRef?: string;
  experienceStrategyRef?: string;
  patternIntelligenceRef?: string;
  goals: WebsiteGoalPlan;
  archetype: WebsiteArchetypeId;
  dna?: WebsiteDNA;
  sections: SectionSpec[];
  contentRequirements?: string[];
  componentPreferences?: string[];
  forbiddenComponents?: string[];
  designRules?: string[];
  assetRequirements?: AssetRequirement[];
  seoRequirements?: string[];
  accessibilityRequirements?: string[];
  conversionRules?: string[];
  responsiveRules?: string[];
  factsUsed: string[];
  missingFacts: MissingFact[];
  confidence: number;
  fallbackStrategy?: string;
}>;

/**
 * Deterministic design token contract.
 *
 * @example
 * const tokens: DesignTokens = { id: "tokens_1", version: "0.1.0", color: {}, typography: {}, spacing: {}, radius: {} };
 */
export type DesignTokens = Readonly<{
  id: EngineId | string;
  version: EngineVersionString;
  color: Record<string, string>;
  typography: Record<string, string>;
  spacing: Record<string, string | number>;
  radius: Record<string, string | number>;
  shadow?: Record<string, string>;
}>;

/**
 * Required asset contract.
 *
 * @example
 * const asset: AssetRequirement = { id: "hero_image", kind: "image", required: true, reason: "Needed for product inspection", fallbackPolicy: "request_asset" };
 */
export type AssetRequirement = Readonly<{
  id: EngineId | string;
  sectionId?: string;
  kind: string;
  required: boolean;
  reason: string;
  fallbackPolicy: "none" | "request_asset" | "neutral_placeholder" | "user_upload_needed";
}>;

/**
 * Constraint scope taxonomy.
 *
 * @example
 * const scope: ConstraintScope = "industry";
 */
export type ConstraintScope = "global" | "industry" | "archetype" | "section" | "component" | "asset" | "renderer";

/**
 * Versioned constraint rule.
 *
 * @example
 * const rule: ConstraintRule = { id: "no_fake_claims", version: "0.1.0", scope: "global", severity: "blocker", description: "No fake facts", appliesTo: [], condition: { type: "truth" }, repairHint: { action: "remove_claim", message: "Remove unsupported claim" } };
 */
export type ConstraintRule = Readonly<{
  id: EngineId | string;
  version: EngineVersionString;
  scope: ConstraintScope;
  severity: EngineSeverity;
  description: string;
  appliesTo: string[];
  condition: Record<string, JsonValue>;
  repairHint: ConstraintRepairHint;
}>;

/**
 * Constraint repair hint.
 *
 * @example
 * const hint: ConstraintRepairHint = { action: "request_fact", message: "Ask for registration number" };
 */
export type ConstraintRepairHint = Readonly<{
  action: string;
  target?: string;
  message: string;
}>;

/**
 * Constraint violation emitted by validation or constraint modules.
 *
 * @example
 * const violation: ConstraintViolation = { ruleId: "no_fake_claims", severity: "blocker", scope: "global", message: "Unsupported claim" };
 */
export type ConstraintViolation = Readonly<{
  ruleId: string;
  severity: EngineSeverity;
  scope?: ConstraintScope | string;
  targetId?: EngineId | string;
  message: string;
  repairHint?: ConstraintRepairHint | string;
}>;

/**
 * Constraint evaluation result.
 *
 * @example
 * const constraints: ConstraintResult = { passed: true, evaluatedRuleIds: [], violations: [], warnings: [], confidence: 1 };
 */
export type ConstraintResult = Readonly<{
  passed: boolean;
  evaluatedRuleIds: string[];
  violations: ConstraintViolation[];
  warnings: ConstraintViolation[];
  confidence: number;
}>;

/**
 * Resolver input boundary.
 *
 * @example
 * const input: ResolverInput = { websiteSpec: spec, repositoryRecords: [], constraintResults: [], availableAssets: [], engineVersion: "0.1.0" };
 */
export type ResolverInput = Readonly<{
  websiteSpec?: WebsiteSpec;
  spec?: WebsiteSpec;
  websiteDNA?: WebsiteDNA;
  dna?: WebsiteDNA;
  patternIntelligence?: PatternIntelligenceResult;
  experienceStrategy?: ExperienceStrategy;
  repositoryRecords?: unknown[];
  constraintResults?: ConstraintResult[];
  availableAssets?: AssetRequirement[];
  constraints?: ConstraintRule[];
  brandContext?: Record<string, JsonValue>;
  engineVersion?: EngineVersionString;
}>;

/**
 * Resolver selection report.
 *
 * @example
 * const result: ResolverResult = { selectedArchetype: "appointment", selectedSectionPatterns: [], selectedSectionPatternIds: [], selectedComponentVariants: [], selectedComponentVariantIds: [], confidence: 0.8, explanations: [], conflicts: [], fallbacks: [] };
 */
export type ResolverResult = Readonly<{
  id?: EngineId | string;
  selectedArchetype: WebsiteArchetypeId;
  selectedSectionPatterns: string[];
  selectedSectionPatternIds: string[];
  selectedComponentVariants: string[];
  selectedComponentVariantIds: string[];
  selectedDesignLanguage?: string;
  selectedDesignTokens?: string;
  compositionRules?: string[];
  assetStrategy?: string[];
  ctaStrategy?: string[];
  seoRequirements?: string[];
  qaRules?: string[];
  repairRules?: string[];
  conflicts: ResolverConflict[];
  fallbacks: ResolverFallback[];
  confidence: number;
  explanations: string[];
}>;

/**
 * Resolver conflict record.
 *
 * @example
 * const conflict: ResolverConflict = { id: "conflict_1", message: "Pattern conflict", candidates: [] };
 */
export type ResolverConflict = Readonly<{
  id: EngineId | string;
  message: string;
  candidates: string[];
  resolution?: string;
}>;

/**
 * Resolver fallback record.
 *
 * @example
 * const fallback: ResolverFallback = { id: "fallback_1", reason: "Missing image", selectedFallback: "request_asset", risk: "medium" };
 */
export type ResolverFallback = Readonly<{
  id: EngineId | string;
  reason: string;
  selectedFallback: string;
  risk: string;
}>;

/**
 * Compiler output consumed by mapper.
 *
 * @example
 * const plan: CompiledWebsitePlan = { id: "plan_1", engineVersion: "0.1.0", specVersion: "0.1.0", sections: [], design: { tokensId: "tokens", responsiveProfile: "default", densityProfile: "medium" }, assets: [], assetRequirements: [], seo: [], accessibility: [], ctaCadence: [], mapperTargets: [], qualityGates: [], trace: [], editable: true };
 */
export type CompiledWebsitePlan = Readonly<{
  id: EngineId | string;
  engineVersion?: EngineVersionString;
  specVersion?: EngineVersionString;
  resolverResultId?: string;
  specId?: string;
  sections: CompiledSection[];
  design?: { tokensId: string; responsiveProfile: string; densityProfile: string };
  designTokens?: DesignTokens;
  assets: CompiledAssetRequirement[];
  assetRequirements: AssetRequirement[];
  seo: string[];
  accessibility: string[];
  ctaCadence: string[];
  mapperTargets: string[];
  qualityGates: string[];
  trace: string[];
  editable: boolean;
}>;

/**
 * Compiled section contract.
 *
 * @example
 * const section: CompiledSection = { id: "hero", sectionPatternId: "hero", componentVariantId: "Hero01", requiredProps: {}, responsiveBehavior: "stack", editable: true };
 */
export type CompiledSection = SectionSpec & Readonly<{
  sectionPatternId?: string;
  componentVariantId?: string;
  requiredProps?: Record<string, JsonValue>;
  responsiveBehavior?: string;
}>;

/**
 * Compiled asset requirement.
 *
 * @example
 * const asset: CompiledAssetRequirement = { id: "hero_image", required: true, strategy: "request" };
 */
export type CompiledAssetRequirement = Readonly<{
  id: EngineId | string;
  required: boolean;
  strategy: string;
}>;

/**
 * Simulation result before preview.
 *
 * @example
 * const simulation: SimulationResult = { passed: true, score: 90, breakpoints: [], issues: [], assetReadiness: 1, editabilityRisk: 0, rendererParityRisk: 0, repairHints: [], breakpointRisks: {} };
 */
export type SimulationResult = Readonly<{
  passed: boolean;
  score: number;
  breakpoints: BreakpointSimulation[];
  issues: SimulationIssue[];
  assetReadiness: number;
  editabilityRisk: number;
  rendererParityRisk: number;
  repairHints: string[];
  breakpointRisks: Record<string, number>;
}>;

/**
 * Breakpoint simulation score.
 *
 * @example
 * const breakpoint: BreakpointSimulation = { breakpoint: "mobile", structureScore: 80, ctaReachable: true, overflowRisk: 0 };
 */
export type BreakpointSimulation = Readonly<{
  breakpoint: "desktop" | "tablet" | "mobile";
  structureScore: number;
  ctaReachable: boolean;
  overflowRisk: number;
}>;

/**
 * Simulation issue.
 *
 * @example
 * const issue: SimulationIssue = { severity: "major", category: "layout", message: "CTA too low" };
 */
export type SimulationIssue = Readonly<{
  severity: Exclude<EngineSeverity, "info">;
  category: "layout" | "asset" | "accessibility" | "seo" | "performance" | "parity" | "editability";
  message: string;
  targetId?: EngineId | string;
}>;

/**
 * Website evaluation summary.
 *
 * @example
 * const evaluation: WebsiteEvaluation = { passed: false, score: 70, warnings: [], hardFailures: [] };
 */
export type WebsiteEvaluation = Readonly<{
  passed: boolean;
  score: number;
  warnings: string[];
  hardFailures: string[];
}>;

/**
 * Structural repair plan.
 *
 * @example
 * const plan: RepairPlan = { id: "repair_1", reason: "Missing CTA", actions: ["replace hero"] };
 */
export type RepairPlan = Readonly<{
  id: EngineId | string;
  reason: string;
  actions: string[];
}>;

/**
 * Replay contract for reproducing a generation from trace.
 *
 * @example
 * const replay: GenerationReplay = { replayId: "replay_1", sourceTraceId: "trace_1", requiredEngineVersions: {}, requiredRepositoryRecords: [], inputRefs: [], expectedDecisionIds: [], expectedOutputRefs: [], replayStatus: "ready" };
 */
export type GenerationReplay = Readonly<{
  replayId: EngineId | string;
  sourceTraceId: string;
  requiredEngineVersions: Partial<Record<keyof EngineVersions, EngineVersionString>>;
  requiredRepositoryRecords: string[];
  inputRefs: string[];
  expectedDecisionIds: string[];
  expectedOutputRefs: string[];
  replayStatus: "ready" | "blocked" | "completed" | "failed";
}>;

/**
 * Persistable generation history envelope.
 *
 * @example
 * const history: GenerationHistory = { id: "history_1", engineVersion: ENGINE_VERSIONS, specId: "spec_1", traceIds: [], createdAt: new Date().toISOString() };
 */
export type GenerationHistory = Readonly<{
  id: EngineId | string;
  engineVersion: EngineVersions;
  specId?: string;
  traceIds: string[];
  decisionIds?: string[];
  replayId?: string;
  createdAt: IsoTimestamp | string;
}>;

/**
 * Validation issue emitted by lightweight SDK validators.
 *
 * @example
 * const issue: ValidationIssue = { path: "confidence", message: "Must be between 0 and 1", code: "OUT_OF_RANGE" };
 */
export type ValidationIssue = Readonly<{
  path: string;
  message: string;
  code: string;
}>;

/**
 * Validation result for a typed object.
 *
 * @example
 * const result: ValidationResult<string> = { valid: true, value: "ok", issues: [] };
 */
export type ValidationResult<T> = Readonly<{
  valid: boolean;
  value?: T;
  issues: ValidationIssue[];
}>;
