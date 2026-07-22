import type { BuilderBlueprint, BuilderNode } from "../../../types/blueprint";
import type { BuilderCommand } from "../../../core/commands/BuilderCommand";
import { descendants, sectionNode, updated } from "./repairCommandUtils";

export class ReplaceComponentVariantCommand implements BuilderCommand {
  readonly id: string;
  readonly name = "Replace Component Variant";
  readonly description: string;

  constructor(private readonly sectionId: string, private readonly from: string | undefined, private readonly to: string, private readonly replacementNodes: readonly BuilderNode[], commandId?: string) {
    this.id = commandId ?? `repair.replace.${sectionId}.${to}`;
    this.description = `Replace ${from ?? "current variant"} with ${to} in ${sectionId}`;
  }

  canExecute(blueprint: BuilderBlueprint): boolean {
    const current = sectionNode(blueprint, this.sectionId);
    const root = this.replacementNodes.find((node) => node.type === "section");
    return Boolean(current && root && root.id === current.id && root.parentId === current.parentId && (!this.from || current?.props.componentVariant === this.from));
  }

  execute(blueprint: BuilderBlueprint): BuilderBlueprint {
    const current = sectionNode(blueprint, this.sectionId);
    if (!current || !this.canExecute(blueprint)) return blueprint;
    const remove = new Set(descendants(blueprint, current.id));
    const nodes = Object.fromEntries(Object.entries(blueprint.nodes).filter(([id]) => !remove.has(id))) as Record<string, BuilderNode>;
    for (const replacement of this.replacementNodes) nodes[replacement.id] = structuredClone(replacement);
    return updated(blueprint, nodes);
  }
}
