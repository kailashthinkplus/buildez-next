import type { CreativeRecipe, CreativeRecipeFamily, CreativeRecipeStatus } from "../creativeRecipe";
import type { DesignDNA } from "../dna";

export type CreativeFragmentId = string;
export type CreativeFragmentFamily =
  | "layout" | "grid" | "spacing" | "typography" | "background" | "media" | "cta" | "motion" | "interaction"
  | "scroll" | "card" | "navigation" | "proof" | "form" | "footer" | "responsive" | "accessibility";
export type CreativeFragmentCategory = CreativeFragmentFamily;
export type FragmentWarning = Readonly<{ code: string; message: string; severity: "info" | "minor" | "major" }>;

export type CreativeFragmentCompatibility = Readonly<{
  supportedRecipeFamilies: CreativeRecipeFamily[];
  supportedDesignLanguages: string[];
  supportedVisualMoods: string[];
  supportedIndustries: string[];
  dnaAxes: string[];
}>;
export type CreativeFragmentRequirement = Readonly<{ requiredRecipeFields: string[]; requiredAssets: string[]; requiredFacts: string[] }>;
export type CreativeFragmentAssemblyRule = Readonly<{ rule: string; target: "recipe" | "metadata" | "fragments" | "composition"; effect: string; codeGenerated: false }>;
export type CreativeFragmentScore = Readonly<{ familyFit: number; designFit: number; industryFit: number; dnaFit: number; overall: number }>;
export type CreativeFragmentCandidate = Readonly<{ fragment: CreativeFragment; score: CreativeFragmentScore; reasons: string[]; risks: string[] }>;
export type CreativeFragmentSelection = Readonly<{ fragment: CreativeFragment; rationale: string[] }>;
export type FragmentMetrics = Readonly<{ catalogCount: number; candidateCount: number; selectedCount: number; warningCount: number; familyCoverage: Record<string, number> }>;

export type CreativeFragment = Readonly<{
  id: CreativeFragmentId;
  family: CreativeFragmentFamily;
  category: CreativeFragmentCategory;
  purpose: string;
  compatibility: CreativeFragmentCompatibility;
  requirements: CreativeFragmentRequirement;
  assemblyRules: CreativeFragmentAssemblyRule[];
  editabilityImpact: string[];
  inspectorHints: string[];
  responsiveBehavior: string[];
  accessibilityNotes: string[];
  conflicts: string[];
  fallbacks: string[];
  version: string;
  status: CreativeRecipeStatus;
}>;

export type FragmentInput = Readonly<{ baseRecipe?: CreativeRecipe; designDna?: DesignDNA; industries?: readonly string[]; designLanguages?: readonly string[]; limit?: number }>;
export type RecipeAssemblyPlan = Readonly<{ id: string; baseRecipeId: string; designDnaId?: string; fragmentIds: string[]; assemblyRules: CreativeFragmentAssemblyRule[]; metadataOnly: true; builderNodeOutput: false }>;
export type RecipeAssemblyResult = Readonly<{ baseRecipe: CreativeRecipe; designDna?: DesignDNA; selections: CreativeFragmentSelection[]; plan: RecipeAssemblyPlan; warnings: FragmentWarning[]; metrics: FragmentMetrics; trace: string[] }>;
