import type { EngineResult } from "../sdk";
import { runLearningEngine } from "./LearningEngine";
import type { GenerationHistory, LearningResult } from "./learningResult";

export type RecordGenerationInput = {
  traceIds?: string[];
  specId?: string;
};

export function recordGeneration(input: RecordGenerationInput = {}): EngineResult<GenerationHistory> {
  const result: EngineResult<LearningResult> = runLearningEngine({});
  return {
    ...result,
    data: {
      ...result.data.generationHistory,
      id: "generation-history.local",
      specId: input.specId,
      traceIds: input.traceIds ?? result.data.generationHistory.traceIds,
    },
  };
}
