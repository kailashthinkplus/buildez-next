import type { ComponentFallback, ComponentSelection } from "./componentVariant";

const fallbackByCategory: Record<string, string> = {
  hero: "HeroEditorialSplit01",
  gallery: "GalleryLifestyleRail01",
  proof: "TrustBandInline01",
  testimonial: "ProofStackCards01",
  form: "FinalConversionBlock01",
};

/** Builds fallback metadata for selected components. */
export function buildComponentFallbacks(selections: readonly ComponentSelection[]): ComponentFallback[] {
  return selections
    .map((selection) => {
      const fallbackComponentId = fallbackByCategory[selection.variant.category];
      if (!fallbackComponentId || fallbackComponentId === selection.variant.id) return undefined;
      return Object.freeze({ componentId: selection.variant.id, fallbackComponentId, reason: "Fallback remains metadata-only if facts/assets are insufficient." }) as ComponentFallback;
    })
    .filter((item): item is ComponentFallback => item !== undefined);
}
