import type { BuilderBlueprint } from "../../types/blueprint";
import type { BuilderResponsiveDevice } from "../responsive";
import { createRenderContractSummary, type RenderNodeContractSummary } from "./renderContract";
import { resolveRenderStyle } from "./renderStyleResolver";

export type RenderParityIssue = Readonly<{
  code: string;
  message: string;
  nodeId?: string;
}>;

export type RenderParityValidationResult = Readonly<{
  valid: boolean;
  issues: RenderParityIssue[];
}>;

export function buildRenderContractSnapshot(
  blueprint: BuilderBlueprint,
  device: BuilderResponsiveDevice
): RenderNodeContractSummary[] {
  return Object.values(blueprint.nodes)
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((node) => ({
      ...createRenderContractSummary(node),
      styleKeys: Object.keys(resolveRenderStyle(node, blueprint, { device })).sort(),
    }));
}

export function validateRenderParity(
  canvasSnapshot: readonly RenderNodeContractSummary[],
  runtimeSnapshot: readonly RenderNodeContractSummary[]
): RenderParityValidationResult {
  const issues: RenderParityIssue[] = [];

  if (canvasSnapshot.length !== runtimeSnapshot.length) {
    issues.push({
      code: "node-count-mismatch",
      message: "Canvas and runtime render contracts resolve different node counts.",
    });
  }

  const runtimeById = new Map(runtimeSnapshot.map((node) => [node.id, node]));

  for (const canvasNode of canvasSnapshot) {
    const runtimeNode = runtimeById.get(canvasNode.id);
    if (!runtimeNode) {
      issues.push({
        code: "runtime-node-missing",
        message: "Runtime contract is missing a canvas node.",
        nodeId: canvasNode.id,
      });
      continue;
    }

    if (JSON.stringify(canvasNode) !== JSON.stringify(runtimeNode)) {
      issues.push({
        code: "node-contract-mismatch",
        message: "Canvas and runtime node contracts differ.",
        nodeId: canvasNode.id,
      });
    }
  }

  return Object.freeze({
    valid: issues.length === 0,
    issues,
  });
}
