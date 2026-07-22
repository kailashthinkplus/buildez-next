import type { BuilderBlueprint, BuilderNode } from "../../../types/blueprint";
import type { BuilderCommand } from "../../../core/commands/BuilderCommand";
import { sectionNode, updated } from "./repairCommandUtils";

export class ChangeLayoutPatternCommand implements BuilderCommand {
  readonly id: string;
  readonly name = "Change Layout Pattern";
  constructor(private readonly sectionId: string, private readonly pattern: string, commandId?: string) { this.id = commandId ?? `repair.layout.${sectionId}.${pattern}`; }
  canExecute(blueprint: BuilderBlueprint): boolean { return Boolean(sectionNode(blueprint, this.sectionId) && this.pattern); }
  execute(blueprint: BuilderBlueprint): BuilderBlueprint {
    const section = sectionNode(blueprint, this.sectionId); if (!section) return blueprint;
    const nodes = { ...blueprint.nodes } as Record<string, BuilderNode>;
    nodes[section.id] = { ...section, props: { ...section.props, repairLayoutPattern: this.pattern } };
    const container = section.children.map((id) => nodes[id]).find((node) => node?.type === "container");
    if (container) nodes[container.id] = { ...container, style: { ...container.style, display: "grid", gridTemplateColumns: { desktop: this.pattern === "editorial_split" ? "1.35fr .65fr" : "1fr", mobile: "1fr" } } };
    return updated(blueprint, nodes);
  }
}
