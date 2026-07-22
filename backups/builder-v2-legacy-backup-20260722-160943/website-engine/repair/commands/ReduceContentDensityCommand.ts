import type { BuilderBlueprint, BuilderNode } from "../../../types/blueprint";
import type { BuilderCommand } from "../../../core/commands/BuilderCommand";
import { descendants, sectionNode, updated } from "./repairCommandUtils";

export class ReduceContentDensityCommand implements BuilderCommand {
  readonly id: string;
  readonly name = "Reduce Content Density";
  constructor(private readonly sectionId: string, commandId?: string) { this.id = commandId ?? `repair.density.${sectionId}`; }
  canExecute(blueprint: BuilderBlueprint): boolean { const section = sectionNode(blueprint, this.sectionId); return Boolean(section && descendants(blueprint, section.id).filter((id) => blueprint.nodes[id]?.type === "text").length > 1); }
  execute(blueprint: BuilderBlueprint): BuilderBlueprint {
    const section = sectionNode(blueprint, this.sectionId); if (!section) return blueprint;
    const textNodes = descendants(blueprint, section.id).map((id) => blueprint.nodes[id]).filter((node): node is BuilderNode => node?.type === "text");
    const removeRoot = textNodes.at(-1); if (!removeRoot || !removeRoot.parentId) return blueprint;
    const remove = new Set(descendants(blueprint, removeRoot.id));
    const nodes = Object.fromEntries(Object.entries(blueprint.nodes).filter(([id]) => !remove.has(id))) as Record<string, BuilderNode>;
    const parent = nodes[removeRoot.parentId]; nodes[parent.id] = { ...parent, children: parent.children.filter((id) => !remove.has(id)) };
    return updated(blueprint, nodes);
  }
}
