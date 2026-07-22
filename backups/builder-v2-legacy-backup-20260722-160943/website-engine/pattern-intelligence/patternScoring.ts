import type { PatternCandidate, PatternDefinition, PatternFamilyContext, PatternIntelligenceInput, PatternScore } from "./patternIntelligence";

function bounded(value: number) {
  return Math.max(0, Math.min(1, Number(value.toFixed(2))));
}

function textCorpus(input: PatternIntelligenceInput) {
  return [
    input.businessProfile?.businessModel,
    input.businessProfile?.revenueModel,
    input.businessProfile?.conversionGoals.join(" "),
    input.brandProfile?.personality.join(" "),
    input.contentStrategy?.messageHierarchy.join(" "),
    input.contentStrategy?.ctaStrategy.join(" "),
    input.contentStrategy?.proofStrategy.join(" "),
    input.experienceStrategy?.journeyStages.join(" "),
    input.experienceStrategy?.ctaCadence.join(" "),
    input.experienceStrategy?.mobileJourney.join(" "),
  ].filter(Boolean).join(" ").toLowerCase();
}

function scoreOne(definition: PatternDefinition, input: PatternIntelligenceInput, familyContext: PatternFamilyContext): PatternCandidate {
  const corpus = textCorpus(input);
  const businessFit = definition.compatibleFamilies.includes(familyContext.family) ? 0.9 : familyContext.family === "unknown" ? 0.35 : 0.48;
  const archetypeFit = definition.compatibleArchetypes.some((archetype) => familyContext.archetypes.includes(archetype)) ? 0.78 : 0.45;
  const tagHits = definition.tags.filter((tag) => corpus.includes(tag.toLowerCase())).length;
  const contentFit = bounded(0.45 + Math.min(0.35, tagHits * 0.1) + (input.contentStrategy ? 0.12 : 0));
  const experienceFit = bounded(0.45 + (input.experienceStrategy ? 0.18 : 0) + (corpus.includes(definition.role.replace("-", " ")) ? 0.12 : 0));
  const constraintFit = input.constraintResult?.violations?.length ? 0.72 : 0.92;
  const brandFit = bounded(0.5 + (input.brandProfile ? 0.18 : 0) + (definition.tags.some((tag) => input.brandProfile?.personality.includes(tag)) ? 0.1 : 0));
  const overall = bounded((businessFit * 0.28) + (archetypeFit * 0.12) + (contentFit * 0.2) + (experienceFit * 0.2) + (brandFit * 0.1) + (constraintFit * 0.1));
  const score: PatternScore = Object.freeze({ businessFit, brandFit, contentFit, experienceFit, constraintFit, overall });
  return Object.freeze({
    definition,
    score,
    reasons: [
      `businessFit=${businessFit.toFixed(2)}`,
      `contentFit=${contentFit.toFixed(2)}`,
      `experienceFit=${experienceFit.toFixed(2)}`,
      `constraintFit=${constraintFit.toFixed(2)}`,
    ],
    risks: definition.risks,
  });
}

/**
 * Scores local pattern candidates deterministically.
 *
 * @example
 * const scored = scorePatternCandidates(definitions, input, familyContext);
 */
export function scorePatternCandidates(
  definitions: readonly PatternDefinition[],
  input: PatternIntelligenceInput,
  familyContext: PatternFamilyContext
): PatternCandidate[] {
  return definitions.map((definition) => scoreOne(definition, input, familyContext));
}
