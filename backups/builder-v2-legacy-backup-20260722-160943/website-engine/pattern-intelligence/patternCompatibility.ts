import type { PatternCandidate, PatternCompatibility, PatternFamilyContext, PatternIntelligenceInput } from "./patternIntelligence";

function intersects(left: readonly string[], right: readonly string[]) {
  return left.some((value) => right.includes(value));
}

/**
 * Detects deterministic pattern compatibility notes.
 *
 * @example
 * const notes = detectPatternCompatibility(input, familyContext, candidates);
 */
export function detectPatternCompatibility(
  input: PatternIntelligenceInput,
  familyContext: PatternFamilyContext,
  candidates: readonly PatternCandidate[]
): PatternCompatibility[] {
  const archetypes = familyContext.archetypes.map(String);
  return candidates.map((candidate) => {
    const familyCompatible = candidate.definition.compatibleFamilies.includes(familyContext.family);
    const archetypeCompatible = intersects(candidate.definition.compatibleArchetypes, archetypes);
    const missingFacts = candidate.definition.requiredFacts.filter((fact) =>
      [...(input.missingFacts ?? []), ...(input.businessProfile?.missingBusinessFacts ?? [])].some((missing) =>
        missing.label.toLowerCase().includes(fact.toLowerCase()) || String(missing.id).toLowerCase().includes(fact.toLowerCase())
      )
    );
    return Object.freeze({
      patternId: candidate.definition.id,
      compatible: familyCompatible || archetypeCompatible || candidate.score.overall >= 0.55,
      notes: [
        ...(familyCompatible ? [`compatible family: ${familyContext.family}`] : []),
        ...(archetypeCompatible ? [`compatible archetype: ${archetypes.join(", ")}`] : []),
        ...(missingFacts.length ? [`requires missing facts: ${missingFacts.join(", ")}`] : []),
      ],
    });
  });
}
