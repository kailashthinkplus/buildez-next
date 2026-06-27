"use client";

import { useMemo } from "react";
import type { CSSProperties } from "react";

import { useBuilderStore } from "../../store/useBuilderStore";
import { useSelectionStore } from "../../store/useSelectionStore";
import { useCanvasStore } from "../../store/useCanvasStore";

import type {
  BuilderNode,
} from "../../types/blueprint";

type ResolvedWidgetStyle = CSSProperties &
  Record<string, string | number | undefined>;

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

  style: ResolvedWidgetStyle;

  children: BuilderNode[];

  isSelected: boolean;

  isHovered: boolean;
}

function getThemeValue(tokens: unknown, path: string) {
  if (!tokens || typeof tokens !== "object" || Array.isArray(tokens)) {
    return undefined;
  }

  return path.split(".").reduce<unknown>((current, key) => {
    if (!current || typeof current !== "object" || Array.isArray(current)) {
      return undefined;
    }

    return (current as Record<string, unknown>)[key];
  }, tokens);
}

function resolveThemeToken(value: unknown, tokens: unknown): unknown {
  if (typeof value !== "string") return value;

  const exact = value.match(/^\{theme\.([a-zA-Z0-9_.-]+)\}$/);
  if (exact) {
    return getThemeValue(tokens, exact[1]) ?? value;
  }

  return value.replace(/\{theme\.([a-zA-Z0-9_.-]+)\}/g, (match, path) => {
    const resolved = getThemeValue(tokens, path);
    return typeof resolved === "string" || typeof resolved === "number"
      ? String(resolved)
      : match;
  });
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
    const resolved: Record<string, unknown> = {};
    const tokens = blueprint?.theme?.tokens;

    for (const [key, value] of Object.entries(node.style ?? {})) {
      if (value && typeof value === "object" && !Array.isArray(value)) {
        const responsive = value as Record<string, unknown>;
        resolved[key] = resolveThemeToken(
          responsive[device] ??
          responsive.desktop ??
          responsive.laptop ??
          responsive.tablet ??
          responsive.mobile,
          tokens
        );
      } else {
        resolved[key] = resolveThemeToken(value, tokens);
      }
    }

    return resolved as ResolvedWidgetStyle;
  }, [blueprint?.theme?.tokens, device, node.style]);

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
