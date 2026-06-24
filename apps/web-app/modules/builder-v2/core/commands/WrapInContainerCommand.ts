import type { BuilderBlueprint } from "../../types/blueprint";
import type { BuilderCommand } from "./BuilderCommand";

export class WrapInContainerCommand implements BuilderCommand {
  readonly id = crypto.randomUUID();
  readonly name = "Wrap in Container";

  constructor(private readonly nodeId: string) {}

  canExecute(blueprint: BuilderBlueprint): boolean {
    return (
      this.nodeId !== blueprint.root &&
      this.nodeId in blueprint.nodes
    );
  }

  execute(blueprint: BuilderBlueprint): BuilderBlueprint {
    const node = blueprint.nodes[this.nodeId];

    if (!node || !node.parentId) {
      return blueprint;
    }

    const parent = blueprint.nodes[node.parentId];

    if (!parent) {
      return blueprint;
    }

    const containerId = crypto.randomUUID();
    const container = {
      id: containerId,
      type: "container" as const,
      name: "Container",
      parentId: parent.id,
      children: [this.nodeId],
      props: {
        layout: "flex",
        direction: "column",
        justify: "flex-start",
        align: "stretch",
        wrap: false,
      },
      style: {
        width: "100%",
        gap: 24,
        padding: 0,
        margin: 0,
        borderRadius: 0,
        backgroundColor: "transparent",
      },
      locked: false,
      hidden: false,
    };

    const updatedNode = {
      ...node,
      parentId: containerId,
    };

    const nodeIndex = parent.children.indexOf(this.nodeId);
    const nextChildren = [...parent.children];
    nextChildren.splice(nodeIndex, 1, containerId);

    return {
      ...blueprint,
      metadata: {
        ...blueprint.metadata,
        updatedAt: new Date().toISOString(),
      },
      nodes: {
        ...blueprint.nodes,
        [containerId]: container,
        [this.nodeId]: updatedNode,
        [parent.id]: {
          ...parent,
          children: nextChildren,
        },
      },
    };
  }
}
