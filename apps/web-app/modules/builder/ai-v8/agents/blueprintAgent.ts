import type { AIWorkflowContext } from "./types";

export async function runBlueprintAgent({
  workflow,
  generate,
}: {
  workflow: AIWorkflowContext;
  generate(input: { workflow: AIWorkflowContext }): Promise<string>;
}) {
  return generate({ workflow });
}
