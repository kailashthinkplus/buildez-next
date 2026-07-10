import { createSkeletonResult, type EngineResult, type ResolverInput, type ResolverResult } from "../sdk";

export function runResolver(_input: ResolverInput = {}): EngineResult<ResolverResult> {
  return createSkeletonResult("resolver", {
    selectedArchetype: "unknown",
    selectedSectionPatterns: [],
    selectedSectionPatternIds: [],
    selectedComponentVariants: [],
    selectedComponentVariantIds: [],
    conflicts: [],
    fallbacks: [],
    confidence: 0,
    explanations: [],
  });
}
