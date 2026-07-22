import type { EngineResult } from "../sdk";
import { runRepairEngine } from "./RepairEngine";
import type { RepairInput } from "./repairInput";
import type { RepairResult } from "./repairPlan";

export type RunRepairInput = RepairInput;

/**
 * Backward-compatible Repair Engine entry point.
 *
 * @example
 * const result = runRepair({ criticResult });
 */
export function runRepair(input: RunRepairInput = {}): EngineResult<RepairResult> {
  return runRepairEngine(input);
}
