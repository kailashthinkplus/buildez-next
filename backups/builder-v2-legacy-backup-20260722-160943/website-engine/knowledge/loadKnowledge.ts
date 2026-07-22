import { createSkeletonResult, type EngineResult } from "../sdk";

export type LoadKnowledgeInput = {
  family?: string;
  industryId?: string;
};

export type KnowledgeLoadResult = {
  records: unknown[];
};

export function loadKnowledge(_input: LoadKnowledgeInput = {}): EngineResult<KnowledgeLoadResult> {
  return createSkeletonResult("knowledge", { records: [] });
}

