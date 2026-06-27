import type { AIV8BrandContext } from "../types";
import type { ResolvedDesignPlan } from "../lib/designPlan";
import type { ExperienceStrategy } from "../lib/experienceIntelligence";

export type AIWorkflowStage =
  | "intent"
  | "site-plan"
  | "design-direction"
  | "content"
  | "section-recipes"
  | "assets"
  | "blueprint"
  | "validation"
  | "qa"
  | "repair"
  | "finalize";

export interface AgentRunLog {
  agent: string;
  stage: AIWorkflowStage;
  summary: string;
  ok: boolean;
  warnings?: string[];
}

export type BrandContextWithName = AIV8BrandContext & {
  siteName?: string | null;
};

export interface IntentAgentOutput {
  plan: ResolvedDesignPlan;
  strategy: ExperienceStrategy;
}

export interface SitePlannerOutput {
  pageType: "single-page-website";
  narrativeArc: string[];
  conversionGoal: string;
  sections: Array<{
    id: string;
    objective: string;
    requiredElements: string[];
  }>;
}

export interface DesignDirectionOutput {
  styleDirection: string[];
  colorGuidance: Record<string, string>;
  layoutPrinciples: string[];
}

export interface ContentAgentOutput {
  audience: string;
  primaryOffer: string;
  proofPoints: string[];
  copyRules: string[];
}

export interface SectionRecipeOutput {
  requiredSectionIds: string[];
  approvedComponents: string[];
}

export interface AssetAgentOutput {
  imageRules: string[];
  contextPrompt: string;
  minimumImages: number;
}

export interface ValidationAgentOutput {
  valid: boolean;
  missingSectionIds: string[];
  forbiddenWarnings: string[];
}

export interface QAAgentOutput {
  score: number;
  warnings: string[];
}

export interface AIWorkflowContext {
  userPrompt: string;
  siteId: string;
  pageId?: string;
  brandContext: BrandContextWithName | null;
  intent?: IntentAgentOutput;
  sitePlan?: SitePlannerOutput;
  designDirection?: DesignDirectionOutput;
  content?: ContentAgentOutput;
  sectionRecipes?: SectionRecipeOutput;
  assets?: AssetAgentOutput;
  generatedCode?: string;
  validation?: ValidationAgentOutput;
  qa?: QAAgentOutput;
  repaired?: boolean;
  logs: AgentRunLog[];
}
