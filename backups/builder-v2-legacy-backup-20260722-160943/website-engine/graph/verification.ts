import { createEngineResult, createEngineWarning, type EngineResult } from "../sdk";
import { indexRepositoryRecords } from "./indexer";
import { validateKnowledgeGraph } from "./validation";

/**
 * Compile-safe graph verification report used when no test framework exists.
 *
 * @example
 * const report = runGraphVerification().data;
 */
export type GraphVerificationReport = Readonly<{
  passed: boolean;
  nodeCount: number;
  edgeCount: number;
  issueCount: number;
  notes: readonly string[];
}>;

/**
 * Runs local Knowledge Graph verification without DB, network, AI, Builder, or production route access.
 *
 * @example
 * const result = runGraphVerification();
 */
export function runGraphVerification(): EngineResult<GraphVerificationReport> {
  const graph = indexRepositoryRecords().data;
  const validation = validateKnowledgeGraph(graph);
  const warnings = validation.valid
    ? []
    : [
        createEngineWarning(
          "GRAPH_VERIFICATION_FAILED",
          "Repository-backed Knowledge Graph validation found issues.",
          "graph",
          "major",
          { issueCount: validation.issues.length }
        ),
      ];

  return createEngineResult({
    module: "graph",
    stage: "verification",
    status: validation.valid ? "ok" : "warning",
    warnings,
    data: {
      passed: validation.valid,
      nodeCount: graph.nodes.length,
      edgeCount: graph.edges.length,
      issueCount: validation.issues.length,
      notes: [
        "Graph is built only from local repository records.",
        "No Planner, Resolver, Compiler, Mapper, Renderer, Critic, Repair, AI generation, database, external service, Builder behavior, or production route is used.",
        "Real estate is one starter fixture path, not the graph root.",
      ],
    },
    metadata: {
      issues: validation.issues.map((issue) => `${issue.path}:${issue.code}`),
    },
  });
}
