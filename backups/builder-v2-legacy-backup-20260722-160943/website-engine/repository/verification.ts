import { createEngineResult, createEngineWarning, type EngineResult } from "../sdk";
import {
  REPOSITORY_RECORDS,
  STARTER_INDUSTRIES,
  type RepositoryRecordCategory,
} from "./records";
import { validateRepositoryRecords } from "./validation";

/**
 * Compile-safe repository verification report used when no test framework exists.
 *
 * @example
 * const report = runRepositoryVerification().data;
 */
export type RepositoryVerificationReport = Readonly<{
  passed: boolean;
  recordCount: number;
  categoriesChecked: readonly RepositoryRecordCategory[];
  starterIndustriesChecked: readonly string[];
  notes: readonly string[];
}>;

/**
 * Runs local repository self-verification without external calls, database access, or Builder wiring.
 *
 * @example
 * const result = runRepositoryVerification();
 */
export function runRepositoryVerification(): EngineResult<RepositoryVerificationReport> {
  const validation = validateRepositoryRecords(REPOSITORY_RECORDS, STARTER_INDUSTRIES);
  const categoriesChecked = Array.from(
    new Set(REPOSITORY_RECORDS.map((record) => record.category))
  ).sort() as RepositoryRecordCategory[];
  const warnings = validation.valid
    ? []
    : [
        createEngineWarning(
          "REPOSITORY_VERIFICATION_FAILED",
          "One or more repository records failed validation.",
          "repository",
          "major",
          { issueCount: validation.issues.length }
        ),
      ];

  return createEngineResult({
    module: "repository",
    stage: "verification",
    status: validation.valid ? "ok" : "warning",
    warnings,
    data: {
      passed: validation.valid,
      recordCount: REPOSITORY_RECORDS.length,
      categoriesChecked,
      starterIndustriesChecked: STARTER_INDUSTRIES,
      notes: [
        "Repository verification is deterministic and local-only.",
        "No Planner, Resolver, Compiler, Mapper, Renderer, Critic, Repair, AI generation, database, or production route is used.",
        "Real estate is validated as one starter fixture and is not treated as the engine foundation.",
      ],
    },
    metadata: {
      issueCount: validation.issues.length,
      issues: validation.issues.map((issue) => `${issue.path}:${issue.code}`),
    },
  });
}
