import type { DesignProvenance } from "../../design-graph/schema";
export type LossStage =
  | "parser loss"
  | "static-evaluator loss"
  | "Tailwind interpretation loss"
  | "Design Graph normalization loss"
  | "responsive inheritance/reset loss"
  | "Blueprint hierarchy lowering loss"
  | "native BuilderStyle lowering loss"
  | "residual CSS lowering loss"
  | "renderer capability limitation"
  | "trusted-reference mismatch"
  | "browser/font rasterization noise";
export type VisualLoss = Readonly<{
  fixture: string;
  viewport: string;
  region: string;
  observedLoss: string;
  stage: LossStage;
  sourceProperty: string;
  emittedProperty: string;
  recommendedFix: string;
  provenance: DesignProvenance;
}>;
export function classifyLoss(
  input: Omit<VisualLoss, "stage"> & { diagnosticCode?: string },
): VisualLoss {
  const code = input.diagnosticCode ?? "";
  const stage: LossStage = code.includes("TAILWIND")
    ? "Tailwind interpretation loss"
    : code.includes("RESPONSIVE")
      ? "responsive inheritance/reset loss"
      : code.includes("CSS")
        ? "residual CSS lowering loss"
        : code.includes("NATIVE_STYLE")
          ? "native BuilderStyle lowering loss"
          : "Blueprint hierarchy lowering loss";
  return Object.freeze({ ...input, stage });
}
export function rankRecurringLosses(losses: readonly VisualLoss[]) {
  const counts = new Map<string, number>();
  for (const loss of losses) {
    const key = `${loss.stage}:${loss.region}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts]
    .map(([classification, count]) => ({ classification, count }))
    .sort(
      (a, b) =>
        b.count - a.count || a.classification.localeCompare(b.classification),
    );
}
