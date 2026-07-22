export type VisualCriticSeverity = "low" | "medium" | "high" | "critical";
export type VisualCriticCategory = "layout" | "typography" | "conversion" | "media" | "responsive";

export type VisualCriticIssue = Readonly<{
  id: string;
  ruleId: string;
  category: VisualCriticCategory;
  severity: VisualCriticSeverity;
  message: string;
  recommendation: string;
  violation?: string;
  designPrinciple?: string;
  affectedSections: readonly string[];
  affectedNodeIds: readonly string[];
}>;

export type AffectedSectionDiagnosis = Readonly<{
  sectionId: string;
  componentVariantId?: string;
  issue: string;
  severity: VisualCriticSeverity;
  confidence: number;
  violation: string;
  designPrinciple: string;
}>;

export type VisualRepairRecommendation = Readonly<{
  id: string;
  issueId: string;
  action: "replace_component_variant" | "change_layout_pattern" | "adjust_spacing_tokens" | "adjust_typography_tokens" | "adjust_cta_cadence" | "add_media_slot" | "adjust_responsive_intent" | "increase_section_spacing" | "increase_heading_scale" | "reduce_content_density";
  sectionId?: string;
  from?: string;
  to?: string;
  suggestedPattern?: string;
  token?: string;
  delta?: string;
  reason?: readonly string[];
  instruction: string;
  confidence: number;
  automatic: false;
}>;

export type VisualRepairPlan = Readonly<{
  recommendations: readonly VisualRepairRecommendation[];
  affectedSections: readonly AffectedSectionDiagnosis[];
  repairPriority: "none" | "low" | "medium" | "high" | "critical";
  deterministic: true;
  recommendationOnly: true;
  blueprintMutated: false;
}>;

export type VisualCriticResult = Readonly<{
  score: number;
  issues: readonly VisualCriticIssue[];
  recommendations: readonly VisualRepairRecommendation[];
  affectedSections: readonly AffectedSectionDiagnosis[];
  repairPlan: VisualRepairPlan;
  repairPriority: "none" | "low" | "medium" | "high" | "critical";
  metadataOnly: true;
  blueprintMutated: false;
}>;
