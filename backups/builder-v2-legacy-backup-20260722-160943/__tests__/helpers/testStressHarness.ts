import type { BuilderBlueprint } from "../../types/blueprint";
import type { BuilderCommand } from "../../core/commands/BuilderCommand";
import type { BuilderStressMetrics } from "./testPerformanceBudget";

export type StressScenarioSpec = {
  id: string;
  title: string;
  bugIds: string[];
  status: "compile-safe" | "pending-runner" | "expected-failing";
  metrics: BuilderStressMetrics;
  assertions: {
    name: string;
    passed: boolean;
    message?: string;
  }[];
  runnerRequirement?: string;
};

export function createStressScenarioSpec(spec: StressScenarioSpec): StressScenarioSpec {
  return spec;
}

export function collectStressMetrics(
  blueprint: BuilderBlueprint,
  options: Partial<Pick<BuilderStressMetrics, "commandCount" | "historyDepth">> = {}
): BuilderStressMetrics {
  return {
    nodeCount: Object.keys(blueprint.nodes).length,
    sectionCount: Object.values(blueprint.nodes).filter((node) => node.type === "section").length,
    maxDepth: calculateMaxDepth(blueprint),
    serializedBytes: measureSerializedBytes(blueprint),
    commandCount: options.commandCount ?? 0,
    historyDepth: options.historyDepth ?? 0,
    imageCount: Object.values(blueprint.nodes).filter((node) => node.type === "image").length,
  };
}

export function measureSerializedBytes(value: unknown): number {
  return new TextEncoder().encode(JSON.stringify(value)).length;
}

export function estimateHistoryDepth(commands: BuilderCommand[]): number {
  return commands.length;
}

export function createRepeatedDeviceSwitches(iterations: number): Array<"desktop" | "tablet" | "mobile"> {
  const devices: Array<"desktop" | "tablet" | "mobile"> = ["desktop", "tablet", "mobile"];
  return Array.from({ length: iterations }, (_, index) => devices[index % devices.length]);
}

function calculateMaxDepth(blueprint: BuilderBlueprint): number {
  const visit = (nodeId: string, depth: number): number => {
    const node = blueprint.nodes[nodeId];
    if (!node || node.children.length === 0) return depth;
    return Math.max(...node.children.map((childId) => visit(childId, depth + 1)));
  };

  return visit(blueprint.root, 1);
}
