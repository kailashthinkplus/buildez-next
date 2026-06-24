import type { ComponentType } from "react";

import type { BuilderNode, NodeType } from "../../types/blueprint";
import type { WidgetProperty } from "../../types/property";
import { PropertyRegistry } from "../properties/PropertyRegistry";

/* ==========================================================
   Widget Contract
========================================================== */

export interface WidgetDefinition {
  /** Unique widget type */
  type: NodeType;

  /** Display name */
  name: string;

  /** Lucide icon name (optional) */
  icon?: string;

  /** Sidebar category */
  category:
    | "layout"
    | "basic"
    | "media"
    | "forms"
    | "marketing"
    | "commerce"
    | "dynamic";

  /** Can this widget contain children? */
  canHaveChildren: boolean;

  /** Blueprint defaults (id & parentId are injected) */
  defaultNode: Omit<BuilderNode, "id" | "parentId">;

  /** Inspector property schema */
  properties: WidgetProperty[];

  /** Canvas renderer */
  render: ComponentType<any>;

  /** Optional inspector tab */
  inspector?: ComponentType<any>;

  /** Optional floating toolbar */
  toolbar?: ComponentType<any>;

  /** AI generation prompt */
  aiPrompt?: string;
}

/* ==========================================================
   Widget Registry
========================================================== */

class Registry {
  private readonly widgets = new Map<NodeType, WidgetDefinition>();

  register(widget: WidgetDefinition): void {
    if (this.widgets.has(widget.type)) {
      const message = `[Builder] Widget "${widget.type}" already registered.`;

      if (process.env.NODE_ENV !== "production") {
        throw new Error(message);
      }

      console.warn(message);
      return;
    }

this.widgets.set(
  widget.type,
  Object.freeze(widget)
);

// Automatically register inspector properties
PropertyRegistry.register(
  widget.type,
  widget.properties
);  }

  unregister(type: NodeType): void {
    this.widgets.delete(type);
  }

  has(type: NodeType): boolean {
    return this.widgets.has(type);
  }

  get(type: NodeType): WidgetDefinition {
    const widget = this.widgets.get(type);

    if (!widget) {
      throw new Error(
        `[Builder] Widget "${type}" is not registered.`
      );
    }

    return widget;
  }

  getAll(): WidgetDefinition[] {
    return [...this.widgets.values()];
  }

  getDefaults(type: NodeType) {
    return this.get(type).defaultNode;
  }

  createNode(
    type: NodeType,
    id: string,
    parentId: string | null
  ): BuilderNode {
    const widget = this.get(type);

    return {
      ...widget.defaultNode,
      id,
      parentId,
    };
  }

  clear(): void {
    this.widgets.clear();
  }
}

export const WidgetRegistry = new Registry();