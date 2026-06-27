import type { AIWorkflowContext } from "./types";

export async function runRepairAgent({
  workflow,
  currentCode,
  repair,
}: {
  workflow: AIWorkflowContext;
  currentCode: string;
  repair(input: {
    workflow: AIWorkflowContext;
    currentCode: string;
  }): Promise<string>;
}) {
  return repair({ workflow, currentCode });
}
