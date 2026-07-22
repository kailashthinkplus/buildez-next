import { createEngineResult, type EngineResult } from "../sdk";
import { REPOSITORY_RECORDS, type RepositoryQuery, type RepositoryRecord } from "./records";

/**
 * Queries local repository records deterministically.
 *
 * @example
 * const result = queryRepository({ industry: "healthcare", category: "pattern" });
 */
export function queryRepository(query: RepositoryQuery = {}): EngineResult<RepositoryRecord[]> {
  const records = REPOSITORY_RECORDS.filter((record) => {
    if (query.category && record.category !== query.category) return false;
    if (query.status && record.status !== query.status) return false;
    if (query.industry && !record.compatibleIndustries.includes(query.industry)) return false;
    if (query.archetype && !record.compatibleArchetypes.includes(query.archetype)) return false;
    if (query.tag && !record.tags.includes(query.tag)) return false;
    return true;
  });

  return createEngineResult({
    module: "repository",
    stage: "query",
    data: records,
    metadata: {
      resultCount: records.length,
      category: query.category ?? null,
      industry: query.industry ?? null,
      archetype: query.archetype ?? null,
      tag: query.tag ?? null,
      status: query.status ?? null,
    },
  });
}

