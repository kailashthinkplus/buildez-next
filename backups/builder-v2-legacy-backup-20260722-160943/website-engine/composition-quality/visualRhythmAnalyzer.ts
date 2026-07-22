import { COMPOSITION_QUALITY_RULES, clampQualityScore } from "./CompositionQualityRules";

export type QualitySection = Readonly<{
  id: string;
  componentVariantId: string;
  category: string;
  purpose: string;
}>;

export type DensityTransition = Readonly<{ fromSectionId: string; toSectionId: string; transition: "open-to-dense" | "dense-to-open" | "steady" | "visual-break" }>;

export type VisualRhythmAnalysis = Readonly<{
  densityTransitions: readonly DensityTransition[];
  repeatedPatterns: readonly string[];
  visualBreakScore: number;
  consecutiveCardMaximum: number;
}>;

function text(section: QualitySection): string {
  return `${section.componentVariantId} ${section.category} ${section.purpose}`.toLowerCase();
}

export function sectionLayoutPattern(section: QualitySection): "hero" | "cards" | "media" | "editorial" | "timeline" | "conversion" | "content" {
  const value = text(section);
  if (/hero/.test(value)) return "hero";
  if (/gallery|masonry|rail|media|showcase|portfolio|project/.test(value)) return "media";
  if (/editorial|split|story|profile/.test(value)) return "editorial";
  if (/timeline|process|steps/.test(value)) return "timeline";
  if (/cta|conversion|booking|appointment|reservation|enquiry|contact/.test(value)) return "conversion";
  if (/card|grid|matrix|catalogue|catalog|pricing|feature|service|menu|course/.test(value)) return "cards";
  return "content";
}

export function analyzeVisualRhythm(sections: readonly QualitySection[]): VisualRhythmAnalysis {
  const patterns = sections.map(sectionLayoutPattern);
  const repeatedPatterns: string[] = [];
  let consecutiveCards = 0;
  let consecutiveCardMaximum = 0;
  patterns.forEach((pattern, index) => {
    consecutiveCards = pattern === "cards" ? consecutiveCards + 1 : 0;
    consecutiveCardMaximum = Math.max(consecutiveCardMaximum, consecutiveCards);
    if (index >= 2 && pattern === patterns[index - 1] && pattern === patterns[index - 2]) repeatedPatterns.push(`${pattern}:${sections[index - 2].id}:${sections[index].id}`);
  });

  const densityTransitions = sections.slice(1).map((section, index) => {
    const from = patterns[index];
    const to = patterns[index + 1];
    const transition = from === "cards" && ["media", "editorial", "timeline"].includes(to)
      ? "visual-break"
      : from !== "cards" && to === "cards"
        ? "open-to-dense"
        : from === "cards" && to !== "cards"
          ? "dense-to-open"
          : "steady";
    return Object.freeze({ fromSectionId: sections[index].id, toSectionId: section.id, transition });
  });
  const visualBreaks = densityTransitions.filter((transition) => transition.transition === "visual-break" || transition.transition === "dense-to-open").length;
  const repetitionPenalty = repeatedPatterns.length * 22;
  const fatiguePenalty = Math.max(0, consecutiveCardMaximum - COMPOSITION_QUALITY_RULES.maximumConsecutiveCardSections) * 18;
  const variationReward = sections.length > 2 ? Math.min(12, visualBreaks * 4) : 0;
  return Object.freeze({
    densityTransitions: Object.freeze(densityTransitions),
    repeatedPatterns: Object.freeze(repeatedPatterns),
    visualBreakScore: clampQualityScore(92 - repetitionPenalty - fatiguePenalty + variationReward),
    consecutiveCardMaximum,
  });
}
