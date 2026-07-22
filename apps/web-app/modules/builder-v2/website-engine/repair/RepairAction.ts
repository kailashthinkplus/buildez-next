import type { VisualRepairRecommendation } from "../visual-critic";

export type BlueprintRepairActionType = "replace_component_variant" | "change_layout_pattern" | "adjust_design_token" | "reduce_content_density";
export type BlueprintRepairAction = Readonly<{ id: string; sourceRecommendationId: string; type: BlueprintRepairActionType; sectionId?: string; from?: string; to?: string; pattern?: string; token?: string; delta?: string; confidence: number; approved: boolean }>;

export function blueprintRepairActionFromRecommendation(recommendation: VisualRepairRecommendation, approved = false): BlueprintRepairAction | undefined {
  const shared = { id: `repair-action.${recommendation.id}`, sourceRecommendationId: recommendation.id, sectionId: recommendation.sectionId, confidence: recommendation.confidence, approved };
  if (recommendation.action === "replace_component_variant") return Object.freeze({ ...shared, type: "replace_component_variant", from: recommendation.from, to: recommendation.to });
  if (recommendation.action === "change_layout_pattern") return Object.freeze({ ...shared, type: "change_layout_pattern", from: recommendation.from, pattern: recommendation.suggestedPattern });
  if (["increase_section_spacing", "increase_heading_scale", "adjust_spacing_tokens", "adjust_typography_tokens"].includes(recommendation.action)) return Object.freeze({ ...shared, type: "adjust_design_token", token: recommendation.token ?? (recommendation.action.includes("spacing") ? "spacing.sectionY" : "typography.h2"), delta: recommendation.delta ?? "+12%" });
  if (recommendation.action === "reduce_content_density") return Object.freeze({ ...shared, type: "reduce_content_density" });
  return undefined;
}
