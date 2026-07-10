import type { InspirationInput, InspirationMatch, InspirationRisk, InspirationSource } from "./inspirationProfile";

export function detectInspirationRisks(
  input: InspirationInput,
  sources: readonly InspirationSource[],
  matches: readonly InspirationMatch[]
): InspirationRisk[] {
  const matched = new Set(matches.filter((match) => match.score.overall >= 0.55).map((match) => match.sourceId));
  const sourceRisks = sources
    .filter((source) => matched.has(source.id))
    .flatMap((source) => source.risks.map((risk) => ({ code: "SOURCE_RISK", message: risk, severity: "minor" as const })));
  const missingRisk = input.missingFacts?.length || input.missingAssets?.length
    ? [{ code: "MISSING_FACTS_OR_ASSETS", message: "Missing facts/assets must remain explicit and cannot become inspiration claims.", severity: "major" as const }]
    : [];
  const copyRisk = [{ code: "DO_NOT_COPY", message: "Inspiration is metadata only; do not copy websites, layouts, assets, or brand expression.", severity: "major" as const }];
  const byMessage = new Map<string, InspirationRisk>();
  for (const risk of [...copyRisk, ...missingRisk, ...sourceRisks]) byMessage.set(risk.message, Object.freeze(risk));
  return [...byMessage.values()];
}
