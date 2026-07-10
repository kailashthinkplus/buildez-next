export type StressRisk = "low" | "medium" | "high" | "critical";

export type BuilderPerformanceBudget = {
  name: string;
  maxNodeCount: number;
  maxSectionCount: number;
  maxDepth: number;
  maxSerializedBytes: number;
  maxCommandCount: number;
  maxHistoryDepth: number;
  maxImageCount: number;
  estimatedRenderRisk: StressRisk;
  estimatedInspectorRisk: StressRisk;
};

export type BuilderStressMetrics = {
  nodeCount: number;
  sectionCount: number;
  maxDepth: number;
  serializedBytes: number;
  commandCount: number;
  historyDepth: number;
  imageCount: number;
};

export type BudgetEvaluation = {
  budget: BuilderPerformanceBudget;
  metrics: BuilderStressMetrics;
  passed: boolean;
  failures: string[];
};

export const BUILDER_STRESS_BUDGETS = {
  baseline100: {
    name: "baseline-100",
    maxNodeCount: 100,
    maxSectionCount: 25,
    maxDepth: 8,
    maxSerializedBytes: 350_000,
    maxCommandCount: 100,
    maxHistoryDepth: 100,
    maxImageCount: 25,
    estimatedRenderRisk: "medium",
    estimatedInspectorRisk: "medium",
  },
  aiLarge500: {
    name: "ai-large-500",
    maxNodeCount: 500,
    maxSectionCount: 100,
    maxDepth: 12,
    maxSerializedBytes: 1_750_000,
    maxCommandCount: 250,
    maxHistoryDepth: 250,
    maxImageCount: 100,
    estimatedRenderRisk: "high",
    estimatedInspectorRisk: "high",
  },
  extreme1000: {
    name: "extreme-1000",
    maxNodeCount: 1000,
    maxSectionCount: 160,
    maxDepth: 20,
    maxSerializedBytes: 3_500_000,
    maxCommandCount: 500,
    maxHistoryDepth: 500,
    maxImageCount: 200,
    estimatedRenderRisk: "critical",
    estimatedInspectorRisk: "critical",
  },
} satisfies Record<string, BuilderPerformanceBudget>;

export function evaluatePerformanceBudget(
  metrics: BuilderStressMetrics,
  budget: BuilderPerformanceBudget
): BudgetEvaluation {
  const failures = [
    metrics.nodeCount > budget.maxNodeCount ? "node-count" : "",
    metrics.sectionCount > budget.maxSectionCount ? "section-count" : "",
    metrics.maxDepth > budget.maxDepth ? "depth" : "",
    metrics.serializedBytes > budget.maxSerializedBytes ? "serialized-payload" : "",
    metrics.commandCount > budget.maxCommandCount ? "command-count" : "",
    metrics.historyDepth > budget.maxHistoryDepth ? "history-depth" : "",
    metrics.imageCount > budget.maxImageCount ? "image-count" : "",
  ].filter(Boolean);

  return {
    budget,
    metrics,
    passed: failures.length === 0,
    failures,
  };
}
