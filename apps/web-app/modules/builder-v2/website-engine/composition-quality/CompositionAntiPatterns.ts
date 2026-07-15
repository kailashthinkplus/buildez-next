export type CompositionAntiPattern = Readonly<{
  id: "missing-trust" | "card-fatigue" | "cta-abuse" | "missing-visual-storytelling";
  description: string;
  suggestion: string;
}>;

export const COMPOSITION_ANTI_PATTERNS: readonly CompositionAntiPattern[] = Object.freeze([
  Object.freeze({ id: "missing-trust", description: "Conversion is requested before sufficient trust building.", suggestion: "Add credentials, proof, reviews, or testimonials before the primary conversion close." }),
  Object.freeze({ id: "card-fatigue", description: "Three consecutive card-driven sections reduce premium perception.", suggestion: "Insert an editorial, media, timeline, or proof-led visual break." }),
  Object.freeze({ id: "cta-abuse", description: "Too many primary conversion sections compete for attention.", suggestion: "Keep one contextual action and one decisive closing conversion block." }),
  Object.freeze({ id: "missing-visual-storytelling", description: "The page lacks visual storytelling required for this business family.", suggestion: "Add a gallery, project showcase, portfolio, or media-led experience section." }),
]);
