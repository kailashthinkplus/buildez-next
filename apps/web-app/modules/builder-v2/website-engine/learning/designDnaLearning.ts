import type { DesignDnaLearningSignal, LearningInput } from "./learningResult";
import { createRankingSignal } from "./learningResult";

export function extractDesignDnaLearningSignals(input: LearningInput): DesignDnaLearningSignal[] {
  if (!input.designDNA) return [];
  return [createRankingSignal({
    id: `design-dna.signal.${input.designDNA.id}`,
    kind: "design-dna",
    targetId: input.designDNA.id,
    score: input.designDNA.uniquenessScore,
    weight: 1,
    reason: "Design DNA uniqueness score.",
    metadata: { traitCount: input.designDNA.traits.length, diversitySeed: input.designDNA.diversitySeed },
  }) as DesignDnaLearningSignal];
}
