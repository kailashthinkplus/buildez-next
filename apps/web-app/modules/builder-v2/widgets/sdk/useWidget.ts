"use client";

import { useMemo } from "react";

import { useBuilderStore } from "../../store/useBuilderStore";
import { useSelectionStore } from "../../store/useSelectionStore";
import { useCanvasStore } from "../../store/useCanvasStore";

import type {
  BuilderNode,
  BuilderStyle,
} from "../../types/blueprint";

/* ==========================================================
   Widget Hook Return Type
========================================================== */

export interface WidgetHookResult<
  TProps = Record<string, unknown>
> {
  blueprint: ReturnType<
    typeof useBuilderStore.getState
  >["blueprint"];

  node: BuilderNode;

  props: TProps;

  style: Record<string, any>;

  children: BuilderNode[];

  isSelected: boolean;

  isHovered: boolean;
}

/* ==========================================================
   Widget Hook
========================================================== */

export function useWidget<
  TProps = Record<string, unknown>
>(
  node: BuilderNode
): WidgetHookResult<TProps> {

  /* --------------------------------------------------------
     Builder
  -------------------------------------------------------- */

  const blueprint = useBuilderStore(
    (s) => s.blueprint
  );

  /* --------------------------------------------------------
     Selection
  -------------------------------------------------------- */

  const selectedNodeId = useSelectionStore(
    (s) => s.selectedNodeId
  );

  const hoveredNodeId = useSelectionStore(
    (s) => s.hoveredNodeId
  );

  const device = useCanvasStore((s) => s.device);

  const style = useMemo(() => {
    const resolved: Record<string, any> = {};

    for (const [key, value] of Object.entries(node.style ?? {})) {
      if (value && typeof value === "object" && !Array.isArray(value)) {
        const responsive = value as Record<string, unknown>;
        resolved[key] =
          responsive[device] ??
          responsive.desktop ??
          responsive.laptop ??
          responsive.tablet ??
          responsive.mobile;
      } else {
        resolved[key] = value;
      }
    }

    return resolved;
  }, [device, node.style]);

  /* --------------------------------------------------------
     Resolve Children
  -------------------------------------------------------- */

  const children = useMemo(() => {

    if (!blueprint) {
      return [];
    }

    return node.children
      .map((id) => blueprint.nodes[id])
      .filter(
        (child): child is BuilderNode =>
          child !== undefined
      );

  }, [blueprint, node.children]);

  /* --------------------------------------------------------
     Return
  -------------------------------------------------------- */

  return {

    blueprint,

    node,

    props:
      (node.props ??
        {}) as TProps,

    style,

    children,

    isSelected:
      selectedNodeId === node.id,

    isHovered:
      hoveredNodeId === node.id,

  };
}
