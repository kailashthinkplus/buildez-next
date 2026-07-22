import type { InspirationFamilyContext, InspirationInput, InspirationMatch, InspirationSource } from "./inspirationProfile";

function textCorpus(input: InspirationInput) {
  return [
    input.brandProfile?.personality.join(" "),
    input.brandProfile?.tone,
    input.brandProfile?.premiumLevel,
    input.designResult?.designLanguage.name,
    input.patternIntelligence?.selectedPatterns.map((pattern) => pattern.patternId).join(" "),
    input.contentStrategy?.messageHierarchy.join(" "),
  ].filter(Boolean).join(" ").toLowerCase();
}

export function matchInspirationProfiles(
  input: InspirationInput,
  familyContext: InspirationFamilyContext,
  sources: readonly InspirationSource[]
): InspirationMatch[] {
  const corpus = textCorpus(input);
  return sources.map((source) => {
    const familyFit = source.suitableIndustries.includes(familyContext.family) ? 0.9 : source.unsuitableIndustries.includes(familyContext.family) ? 0.15 : 0.45;
    const themeHits = source.themes.filter((theme) => corpus.includes(theme.toLowerCase())).length;
    const designFit = input.designResult?.designLanguage.name && source.themes.some((theme) => theme.toLowerCase().includes(input.designResult!.designLanguage.name.toLowerCase()))
      ? 0.85
      : 0.55;
    const brandFit = Math.min(0.9, 0.45 + themeHits * 0.12 + (input.brandProfile ? 0.12 : 0));
    const overall = Number(((familyFit * 0.45) + (brandFit * 0.3) + (designFit * 0.25)).toFixed(2));
    return Object.freeze({
      sourceId: source.id,
      score: Object.freeze({ familyFit, brandFit, designFit, overall }),
      reasons: [`familyFit=${familyFit.toFixed(2)}`, `brandFit=${brandFit.toFixed(2)}`, `designFit=${designFit.toFixed(2)}`],
    });
  });
}
