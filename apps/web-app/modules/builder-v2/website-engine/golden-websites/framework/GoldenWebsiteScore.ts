export type GoldenWebsiteScore = Readonly<{
  structureScore: number;
  compositionScore: number;
  designScore: number;
  editabilityScore: number;
  responsiveScore: number;
  overallScore: number;
}>;

export function calculateGoldenWebsiteScore(scores: Omit<GoldenWebsiteScore, "overallScore">): GoldenWebsiteScore {
  const overallScore = Math.round((scores.structureScore + scores.compositionScore + scores.designScore + scores.editabilityScore + scores.responsiveScore) / 5);
  return Object.freeze({ ...scores, overallScore });
}
