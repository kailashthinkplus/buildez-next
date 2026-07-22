import type { InspirationMatch, InspirationSource, InspirationTrait } from "./inspirationProfile";

export function extractInspirationTraits(sources: readonly InspirationSource[], matches: readonly InspirationMatch[]): InspirationTrait[] {
  const matchedIds = new Set(matches.map((match) => match.sourceId));
  const traits = sources.filter((source) => matchedIds.has(source.id)).flatMap((source) => source.traits);
  const seen = new Set<string>();
  return traits.filter((trait) => {
    const key = `${trait.kind}:${trait.value}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function traitsByKind(traits: readonly InspirationTrait[], kind: InspirationTrait["kind"]): string[] {
  return traits.filter((trait) => trait.kind === kind).map((trait) => trait.value);
}
