import type { DesignInput, VisualRhythm } from "./designIntent";

export function buildVisualRhythm(input: DesignInput): VisualRhythm {
  return Object.freeze({
    beats: input.experienceStrategy?.attentionCurve ?? ["clear opening", "trust reset", "conversion close"],
    emphasis: input.patternIntelligence?.selectedPatterns.slice(0, 5).map((pattern) => pattern.patternId) ?? ["hero", "trust", "cta"],
  });
}
