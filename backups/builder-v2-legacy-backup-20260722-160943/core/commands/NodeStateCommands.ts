import type { BuilderBlueprint } from "../../types/blueprint";
import type { Device } from "../../store/useCanvasStore";
import type { BuilderCommand } from "./BuilderCommand";

const DEFAULT_RESPONSIVE_VISIBILITY: Record<Device, boolean> = {
  desktop: true,
  tablet: true,
  mobile: true,
};

export class ToggleNodeHiddenCommand implements BuilderCommand {
  readonly id = crypto.randomUUID();
  readonly name = "Toggle Node Hidden";

  constructor(private readonly nodeId: string) {}

  execute(blueprint: BuilderBlueprint): BuilderBlueprint {
    const node = blueprint.nodes[this.nodeId];
    if (!node) return blueprint;

    return {
      ...blueprint,
      metadata: {
        ...blueprint.metadata,
        updatedAt: new Date().toISOString(),
      },
      nodes: {
        ...blueprint.nodes,
        [this.nodeId]: {
          ...node,
          hidden: !node.hidden,
        },
      },
    };
  }
}

export class ToggleNodeLockCommand implements BuilderCommand {
  readonly id = crypto.randomUUID();
  readonly name = "Toggle Node Lock";

  constructor(private readonly nodeId: string) {}

  execute(blueprint: BuilderBlueprint): BuilderBlueprint {
    const node = blueprint.nodes[this.nodeId];
    if (!node) return blueprint;

    return {
      ...blueprint,
      metadata: {
        ...blueprint.metadata,
        updatedAt: new Date().toISOString(),
      },
      nodes: {
        ...blueprint.nodes,
        [this.nodeId]: {
          ...node,
          locked: !node.locked,
        },
      },
    };
  }
}

export class ToggleResponsiveVisibilityCommand implements BuilderCommand {
  readonly id = crypto.randomUUID();
  readonly name = "Toggle Responsive Visibility";

  constructor(
    private readonly nodeId: string,
    private readonly device: Device
  ) {}

  execute(blueprint: BuilderBlueprint): BuilderBlueprint {
    const node = blueprint.nodes[this.nodeId];
    if (!node) return blueprint;

    const current = node.props?.__responsiveVisibility as
      | Partial<Record<Device, boolean>>
      | undefined;

    const merged: Record<Device, boolean> = {
      ...DEFAULT_RESPONSIVE_VISIBILITY,
      ...(current ?? {}),
    };

    merged[this.device] = !merged[this.device];

    return {
      ...blueprint,
      metadata: {
        ...blueprint.metadata,
        updatedAt: new Date().toISOString(),
      },
      nodes: {
        ...blueprint.nodes,
        [this.nodeId]: {
          ...node,
          props: {
            ...node.props,
            __responsiveVisibility: merged,
          },
        },
      },
    };
  }
}
