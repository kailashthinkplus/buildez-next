import type { EngineWarning, WebsiteArchetypeId } from "../sdk";

export type CreativeRecipeId = string;
export type CreativeRecipeFamily =
  | "hero" | "gallery" | "cta" | "trust" | "proof" | "service" | "product" | "portfolio" | "process" | "faq"
  | "contact" | "footer" | "navigation" | "testimonial" | "pricing" | "comparison" | "timeline" | "blog"
  | "team" | "map" | "booking" | "sticky-action" | "feature" | "stats" | "logo-cloud" | "social-proof"
  | "newsletter" | "announcement" | "awards" | "integrations" | "ecommerce-category" | "ecommerce-product"
  | "location" | "amenities" | "floor-plan" | "menu" | "reservation" | "doctor-profile" | "course-list"
  | "vehicle-listing" | "case-study" | "before-after" | "lead-form" | "blog-media";
export type CreativeRecipeCategory = CreativeRecipeFamily;
export type CreativeRecipeVariant = string;
export type CreativeRecipeStatus = "starter" | "stable" | "experimental" | "deprecated";

export type CreativeRecipeMetadata = Readonly<{
  tags: string[];
  layoutPattern: string;
  gridSystem: string;
  visualHierarchy: string;
  whitespaceLevel: "compact" | "balanced" | "spacious" | "expansive";
  asymmetryLevel: "none" | "subtle" | "moderate" | "high";
  contentDensity: "low" | "medium" | "high";
  mediaRatio: "none" | "low" | "balanced" | "high" | "dominant";
  imageFraming: string;
  typographyRhythm: string;
  ctaProminence: "none" | "subtle" | "standard" | "strong" | "dominant";
  motionSuitability: "none" | "minimal" | "editorial" | "expressive";
  visualComplexity: "simple" | "layered" | "rich" | "cinematic";
  conversionIntensity: "low" | "medium" | "high";
  luxuryLevel: "low" | "medium" | "high";
  editorialLevel: "low" | "medium" | "high";
  trustLevel: "low" | "medium" | "high";
  mobilePriority: "normal" | "high" | "critical";
  uniquenessLevers: string[];
  visualDensity: "minimal" | "balanced" | "rich";
}>;
export type CreativeRecipeFragments = Readonly<{
  layoutFragments: string[];
  mediaFragments: string[];
  typographyFragments: string[];
  spacingFragments: string[];
  motionFragments: string[];
  ctaFragments: string[];
  backgroundFragments: string[];
  interactionFragments: string[];
}>;
export type CreativeRecipeRequirement = Readonly<{ requiredContentFields: string[]; optionalContentFields: string[]; requiredAssets: string[] }>;
export type CreativeRecipeCompatibility = Readonly<{ supportedPatterns: string[]; supportedArchetypes: WebsiteArchetypeId[]; supportedDesignLanguages: string[]; supportedIndustries: string[]; suitableVisualMoods: string[]; suitableMotionStrategies: string[] }>;
export type CreativeRecipeConflict = Readonly<{ code: string; reason: string; severity: "minor" | "major" }>;
export type CreativeRecipeResponsiveBehavior = Readonly<{ desktop: string[]; tablet: string[]; mobile: string[] }>;
export type CreativeRecipeEditability = Readonly<{ primitiveExpansionIntent: string[]; editableFields: string[]; inspectorGroups: string[]; aiEditableFields: string[] }>;
export type CreativeRecipeInspectorHint = Readonly<{ group: string; propertyPath: string; control: string; helpText: string }>;
export type CreativeRecipeCompositionIntent = Readonly<{ role: string; bestBefore: string[]; bestAfter: string[]; rhythm: "opening" | "support" | "proof" | "conversion" | "closure" }>;
export type CreativeRecipeFallback = Readonly<{ reason: string; fallbackRecipeId?: CreativeRecipeId; fallbackBehavior: string }>;
export type CreativeRecipeScore = Readonly<{ familyFit: number; archetypeFit: number; designFit: number; industryFit: number; motionFit: number; overall: number }>;
export type CreativeRecipeCandidate = Readonly<{ recipe: CreativeRecipe; score: CreativeRecipeScore; reasons: string[]; risks: string[] }>;
export type CreativeRecipeSelection = Readonly<{ recipe: CreativeRecipe; rationale: string[]; fallbacks: CreativeRecipeFallback[] }>;

export type CreativeRecipe = Readonly<{
  id: CreativeRecipeId;
  name: string;
  family: CreativeRecipeFamily;
  category: CreativeRecipeCategory;
  variant: CreativeRecipeVariant;
  purpose: string;
  compatibility: CreativeRecipeCompatibility;
  requirements: CreativeRecipeRequirement;
  editability: CreativeRecipeEditability;
  inspectorHints: CreativeRecipeInspectorHint[];
  responsiveBehavior: CreativeRecipeResponsiveBehavior;
  accessibilityNotes: string[];
  seoNotes: string[];
  conversionRole: string;
  compositionIntent: CreativeRecipeCompositionIntent;
  antiPatterns: string[];
  conflicts: CreativeRecipeConflict[];
  fallbacks: CreativeRecipeFallback[];
  metadata: CreativeRecipeMetadata;
  fragments: CreativeRecipeFragments;
  version: string;
  status: CreativeRecipeStatus;
}>;

export type CreativeLibraryInput = Readonly<{ families?: CreativeRecipeFamily[]; archetypes?: WebsiteArchetypeId[]; designLanguages?: string[]; industries?: string[]; visualMoods?: string[]; motionStrategies?: string[]; requiredPatterns?: string[]; limit?: number; diversity?: boolean }>;
export type CreativeLibraryWarning = EngineWarning;
export type CreativeLibraryMetrics = Readonly<{ catalogCount: number; candidateCount: number; selectedCount: number; warningCount: number; conflictCount: number; fallbackCount: number; diversityCoverage?: number; duplicateCount?: number; missingMetadataCount?: number }>;
export type CreativeLibraryResult = Readonly<{ catalog: CreativeRecipe[]; candidates: CreativeRecipeCandidate[]; selections: CreativeRecipeSelection[]; conflicts: CreativeRecipeConflict[]; fallbacks: CreativeRecipeFallback[]; warnings: CreativeLibraryWarning[]; metrics: CreativeLibraryMetrics; trace: string[] }>;

export const GENERIC_ARCHETYPES: WebsiteArchetypeId[] = ["lead_generation", "brochure", "portfolio", "ecommerce", "booking", "appointment", "landing_page", "restaurant_menu", "hotel_resort", "property_showcase", "saas"];
export const GENERIC_INDUSTRIES = ["healthcare", "real-estate", "restaurant", "education", "automotive", "hospitality", "interior-design", "d2c", "technology-saas", "professional-services"];
