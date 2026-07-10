import { createEngineResult, type EngineResult } from "../sdk";
import { runConstraints } from "../constraints";
import { indexRepositoryRecords } from "../graph";
import { buildCandidateSet, flattenCandidateSets, getReasoningGraphEvidence } from "./candidateSets";
import { rankCandidates } from "./ranking";
import type { ReasoningInput, ReasoningMetrics, ReasoningResult, ReasoningConfidence } from "./reasoning";
import { REASONING_RESULT_VERSION } from "./reasoning";

function missingFactLabels(facts: readonly { label?: string; id?: string }[] = []) {
  return facts.map((fact) => fact.label ?? String(fact.id ?? "missing_fact"));
}

/**
 * Collects deterministic metrics for a reasoning run.
 *
 * @example
 * const metrics = collectReasoningMetrics(input, ranked.length);
 */
export function collectReasoningMetrics(input: ReasoningInput, candidateCount: number, rankedCandidateCount: number): ReasoningMetrics {
  const graph = getReasoningGraphEvidence(input);
  const categories = new Set(buildCandidateSet(input).map((set) => set.category));
  return Object.freeze({
    candidateCount,
    rankedCandidateCount,
    categoryCount: categories.size,
    repositoryRecordCount: input.repositoryRecords?.length ?? 0,
    graphNodeCount: graph.nodes.length,
    graphEdgeCount: graph.edges.length,
    constraintRuleCount: input.constraintResult?.evaluatedRuleIds.length ?? 0,
  });
}

function confidenceFrom(score: number): ReasoningConfidence {
  if (score >= 0.75) return "high";
  if (score >= 0.45) return "medium";
  return "low";
}

/**
 * Runs deterministic reasoning over repository, graph, constraints, and intelligence inputs.
 *
 * @example
 * const result = runReasoning({ businessIntelligence });
 */
export function runReasoning(input: ReasoningInput = {}): EngineResult<ReasoningResult> {
  const graph = indexRepositoryRecords().data;
  const constraintResult = input.constraintResult ?? runConstraints({
    context: {
      businessFamily: input.businessIntelligence?.businessFamily,
      industry: input.businessIntelligence?.businessFamily,
      archetype: input.websiteSpec?.archetype,
      knownFacts: input.websiteSpec?.business.knownFacts ?? {},
      missingFacts: [
        ...missingFactLabels(input.businessIntelligence?.missingBusinessFacts),
        ...missingFactLabels(input.websiteSpec?.missingFacts),
      ],
      claims: [],
      sections: [],
      assets: [],
      rendererParityPreserved: true,
      accessibilityReady: true,
      seoReady: true,
    },
  }).data;
  const normalizedInput: ReasoningInput = {
    ...input,
    constraintResult,
    graphNodes: input.graphNodes ?? graph.nodes,
    graphEdges: input.graphEdges ?? graph.edges,
  };
  const candidateSets = buildCandidateSet(normalizedInput);
  const allCandidates = flattenCandidateSets(candidateSets);
  const rankedCandidates = rankCandidates(allCandidates, normalizedInput);
  const limit = input.maxCandidatesPerCategory ?? 5;
  const limitedSets = candidateSets.map((set) =>
    Object.freeze({
      category: set.category,
      candidates: rankCandidates(set.candidates, normalizedInput).slice(0, limit),
    })
  );
  const topScore = rankedCandidates[0]?.score.overallScore ?? 0;
  const metrics = collectReasoningMetrics(normalizedInput, allCandidates.length, rankedCandidates.length);
  const result: ReasoningResult = Object.freeze({
    version: REASONING_RESULT_VERSION,
    candidateSets: limitedSets,
    rankedCandidates,
    metrics,
    confidence: confidenceFrom(topScore),
    notes: [
      "Reasoning is deterministic and local-only.",
      "Output is ranked candidates only; no resolver selection, compiler plan, or website generation is produced.",
    ],
  });

  return createEngineResult({
    module: "reasoning",
    stage: "rank-candidates",
    data: result,
    confidence: topScore,
    metadata: {
      localOnly: true,
      candidateCount: rankedCandidates.length,
      topScore,
    },
  });
}
