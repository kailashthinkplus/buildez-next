import type { CompositionFamilyContext, CompositionSection, TrustPlacement } from "./compositionPlan";

export function inferTrustPlacement(sections: readonly CompositionSection[], context: CompositionFamilyContext): TrustPlacement {
  const trustSectionIds = sections.filter((section) => ["trust-band", "proof", "testimonial"].includes(section.category)).map((section) => section.id);
  return Object.freeze({
    beforePrimaryCta: context.family === "healthcare" ? true : trustSectionIds.length > 0,
    trustSectionIds,
    notes: [context.family === "healthcare" ? "Healthcare must introduce trust before appointment CTA." : "Trust should precede high-commitment conversion."],
  });
}
