import type { MediaFamilyContext, MediaInput, ThreeDNeed } from "./mediaStrategy";

function threeD(id: string, label: string, purpose: string, truthLevel: ThreeDNeed["truthLevel"], required = false, suitableForAiGeneration = false): ThreeDNeed {
  return Object.freeze({ id, label, purpose, truthLevel, required, suitableForAiGeneration, notes: ["Optional interactive media need; no 3D asset is generated here."] });
}

/**
 * Infers optional 3D or interactive asset needs.
 *
 * @example
 * const needs = inferThreeDNeeds(input, context);
 */
export function inferThreeDNeeds(input: MediaInput, context: MediaFamilyContext): ThreeDNeed[] {
  void input;
  if (context.family === "real_estate") return [threeD("3d.floor_plan", "Interactive floor plan", "Spatial exploration", "provided_only")];
  if (context.family === "automotive") return [threeD("3d.vehicle_view", "Vehicle/service visualization", "Technical exploration", "provided_only")];
  if (context.family === "architecture_interiors") return [threeD("3d.material_board", "Interactive material board", "Material exploration", "can_be_generated_or_substituted", false, true)];
  if (context.family === "ecommerce_d2c") return [threeD("3d.product_view", "Product 3D view", "Product confidence", "provided_only")];
  return [];
}
