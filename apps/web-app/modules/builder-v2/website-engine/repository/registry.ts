import { createEngineResult, type EngineResult } from "../sdk";
import { REPOSITORY_RECORDS, STARTER_INDUSTRIES, type RepositoryRecord } from "./records";
import { validateRepositoryRecords } from "./validation";

const registry = new Map(REPOSITORY_RECORDS.map((record) => [record.id, record]));

/**
 * Lists all local repository records.
 *
 * @example
 * const records = listRepositoryRecords().data;
 */
export function listRepositoryRecords(): EngineResult<RepositoryRecord[]> {
  return createEngineResult({
    module: "repository",
    stage: "list",
    data: [...registry.values()],
  });
}

/**
 * Gets one repository record by id.
 *
 * @example
 * const record = getRepositoryRecord("pattern.trust_band").data;
 */
export function getRepositoryRecord(id: string): EngineResult<RepositoryRecord | null> {
  return createEngineResult({
    module: "repository",
    stage: "get",
    data: registry.get(id) ?? null,
    metadata: { id },
  });
}

/**
 * Verifies the local repository registry.
 *
 * @example
 * const result = verifyRepositoryRegistry();
 */
export function verifyRepositoryRegistry(): EngineResult<{
  valid: boolean;
  recordCount: number;
  starterIndustries: readonly string[];
  issueCount: number;
}> {
  const result = validateRepositoryRecords([...registry.values()], STARTER_INDUSTRIES);

  return createEngineResult({
    module: "repository",
    stage: "verify",
    status: result.valid ? "ok" : "warning",
    data: {
      valid: result.valid,
      recordCount: registry.size,
      starterIndustries: STARTER_INDUSTRIES,
      issueCount: result.issues.length,
    },
    metadata: {
      issues: result.issues.map((issue) => `${issue.path}:${issue.code}`),
    },
  });
}

