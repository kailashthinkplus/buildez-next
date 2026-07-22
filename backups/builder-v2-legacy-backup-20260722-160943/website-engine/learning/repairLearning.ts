import type { LearningInput, RepairLearningSignal } from "./learningResult";
import { createRankingSignal } from "./learningResult";

export function extractRepairLearningSignals(input: LearningInput): RepairLearningSignal[] {
  if (!input.repairResult) return [];
  return [
    createRankingSignal({ id: `repair.signal.${input.repairResult.plan.id}`, kind: "repair", targetId: input.repairResult.plan.id, score: input.repairResult.plan.confidence, weight: 1, reason: "Repair plan confidence.", metadata: { actionCount: input.repairResult.plan.actions.length, expectedImpact: input.repairResult.plan.expectedImpact } }) as RepairLearningSignal,
    ...input.repairResult.plan.actions.map((action) => createRankingSignal({ id: `repair.signal.action.${action.id}`, kind: "repair", targetId: action.id, score: action.confidence, weight: action.priority.score / 100, reason: action.instruction, metadata: { category: action.category, type: action.type } }) as RepairLearningSignal),
  ];
}
