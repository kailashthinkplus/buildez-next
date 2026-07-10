import type { CompositionInput, CompositionSection, MediaContentAlternation } from "./compositionPlan";

export function inferMediaContentAlternation(sections: readonly CompositionSection[], input: CompositionInput): MediaContentAlternation {
  const mediaCount = sections.filter((section) => ["gallery", "portfolio", "media", "map"].includes(section.category)).length;
  if (input.mediaStrategy?.assetReadiness.missingRequiredCount) return Object.freeze({ pattern: "content-led", notes: ["required media is missing; avoid media-dependent rhythm"] });
  if (mediaCount >= 2) return Object.freeze({ pattern: "alternating", notes: ["alternate media and content sections to avoid fatigue"] });
  return Object.freeze({ pattern: "content-led", notes: ["content and proof carry the journey"] });
}
