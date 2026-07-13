"use client";

import { useRef } from "react";

import type {
  BuilderBlueprint,
  BuilderNode,
} from "../types/blueprint";

import NodeRenderer from "./NodeRenderer";
import SelectionOverlay from "./SelectionOverlay";
import HoverOverlay from "./HoverOverlay";
import type { SelectionToolbarProps } from "./SelectionToolbar";
import { defaultThemeTokens } from "../theme/defaultTheme";
import { SiteThemeFrame } from "../theme/SiteThemeFrame";
import type { SiteThemeLayout } from "../theme/siteLayout";
import type { BuilderThemeTokens } from "../theme/theme.types";
import { Plus } from "lucide-react";

import { resolveNonOverlappingDropEdge } from "../core/dnd/dropIntentGeometry";
const CONTAINER_TYPES = new Set(["page", "section", "container", "column"]);

type DropIntent = "before" | "after" | "inside";

type PendingDrop = {
  targetParentId: string;
  targetIndex?: number;
  referenceNodeId?: string;
  intent: DropIntent;
};

function findTargetNodeElement(clientX: number, clientY: number, dragId: string | null): HTMLElement | null {
  const draggedEl = dragId
    ? (document.querySelector(`[data-node-id="${dragId}"]`) as HTMLElement | null)
    : null;

  const stack = document.elementsFromPoint(clientX, clientY);
  for (const hit of stack) {
    if (!(hit instanceof HTMLElement)) continue;
    const nodeEl = hit.closest("[data-node-id]") as HTMLElement | null;
    if (!nodeEl) continue;
    const targetId = nodeEl.getAttribute("data-node-id");
    if (!targetId) continue;
    if (dragId && targetId === dragId) continue;
    if (draggedEl?.contains(nodeEl)) continue;
    return nodeEl;
  }

  return null;
}

interface CanvasRootProps {
  blueprint: BuilderBlueprint;
  siteLayout?: SiteThemeLayout | null;
  selectionToolbarProps: SelectionToolbarProps;
  onCanvasClick?(): void;
  onAddSection?(): void;
  onResizeNode?(nodeId: string, width: number, height: number): void;
}

export default function CanvasRoot({
  blueprint,
  siteLayout,
  selectionToolbarProps,
  onCanvasClick,
  onAddSection,
  onResizeNode,
}: CanvasRootProps) {
  const pendingDropRef = useRef<PendingDrop | null>(null);
  const rootNode = blueprint.nodes[blueprint.root];

  if (!rootNode) {
    return (
      <div className="flex h-full items-center justify-center text-red-500">
        Root node not found.
      </div>
    );
  }

  const rootNodes: BuilderNode[] = [rootNode];
  const themeTokens =
    blueprint.theme?.tokens &&
    typeof blueprint.theme.tokens === "object" &&
    !Array.isArray(blueprint.theme.tokens)
      ? (blueprint.theme.tokens as unknown as BuilderThemeTokens)
      : defaultThemeTokens;

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    const dragId = ((window as any).__builderDragId as string | null) ?? null;
    if (!dragId) {
      pendingDropRef.current = null;
      window.dispatchEvent(new CustomEvent("builder:drop-clear"));
      return;
    }

    const targetEl = findTargetNodeElement(e.clientX, e.clientY, dragId);
    if (!targetEl) {
      pendingDropRef.current = null;
      window.dispatchEvent(new CustomEvent("builder:drop-clear"));
      return;
    }

    const targetId = targetEl.getAttribute("data-node-id");
    const targetNode = targetId ? blueprint.nodes[targetId] : null;
    if (!targetNode) {
      pendingDropRef.current = null;
      window.dispatchEvent(new CustomEvent("builder:drop-clear"));
      return;
    }

    const rect = targetEl.getBoundingClientRect();
    const isGrid =
      targetNode.type === "container" &&
      (targetNode.props?.layout ?? "flex") === "grid";
    const isHorizontal =
      targetNode.type === "container" &&
      !isGrid &&
      (targetNode.props?.direction ?? "row") === "row";
    const isContainer = CONTAINER_TYPES.has(targetNode.type);
    const hasChildren = (targetNode.children?.length ?? 0) > 0;

    const lead = isHorizontal ? e.clientX - rect.left : e.clientY - rect.top;
    const span = isHorizontal ? rect.width : rect.height;
    const edge = resolveNonOverlappingDropEdge(span);

    let intent: DropIntent = "before";
    if (targetNode.parentId === null || isGrid || (isContainer && !hasChildren)) {
      intent = "inside";
    } else if (lead <= edge) {
      intent = "before";
    } else if (lead >= span - edge) {
      intent = "after";
    } else {
      intent = lead < span / 2 ? "before" : "after";
    }

    const indicator =
      intent === "inside"
        ? {
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height: rect.height,
            type: "inside" as const,
            isEmpty: (targetNode.children?.length ?? 0) === 0,
          }
        : isHorizontal
          ? {
              left: intent === "before" ? rect.left - 2 : rect.right - 1,
              top: rect.top,
              width: 3,
              height: rect.height,
              type: intent,
            }
          : {
              left: rect.left,
              top: intent === "before" ? rect.top - 2 : rect.bottom - 1,
              width: rect.width,
              height: 3,
              type: intent,
            };

    pendingDropRef.current =
      intent === "inside"
        ? {
            targetParentId: targetNode.id,
            targetIndex: targetNode.children.length,
            intent,
          }
        : targetNode.parentId
          ? {
              targetParentId: targetNode.parentId,
              referenceNodeId: targetNode.id,
              intent,
            }
          : null;

    window.dispatchEvent(new CustomEvent("builder:drop-intent", { detail: indicator }));
    window.dispatchEvent(
      new CustomEvent("builder:drag-move", {
        detail: { x: e.clientX, y: e.clientY },
      })
    );
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    const dragId = ((window as any).__builderDragId as string | null) ?? null;
    const pending = pendingDropRef.current;
    pendingDropRef.current = null;

    window.dispatchEvent(new CustomEvent("builder:drop-clear"));
    window.dispatchEvent(new CustomEvent("builder:end-drag"));

    if (!dragId || !pending) {
      return;
    }

    window.dispatchEvent(
      new CustomEvent("builder:reparent", {
        detail: {
          nodeId: dragId,
          targetParentId: pending.targetParentId,
          targetIndex: pending.targetIndex,
          referenceNodeId: pending.referenceNodeId,
          intent: pending.intent,
          animate: true,
        },
      })
    );
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    const next = e.relatedTarget as Node | null;
    if (next && e.currentTarget.contains(next)) {
      return;
    }

    pendingDropRef.current = null;
    window.dispatchEvent(new CustomEvent("builder:drop-clear"));
  };

  return (
    <div
      className="relative min-h-screen w-full bg-transparent"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onCanvasClick?.();
        }
      }}
    >
      <SiteThemeFrame layout={siteLayout} tokens={themeTokens} mode="canvas">
        <NodeRenderer nodes={rootNodes} blueprint={blueprint} />
        <div
          data-canvas-add-section="true"
          className="builder-chrome px-6 py-8"
        >
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onAddSection?.();
            }}
            className="group flex min-h-24 w-full items-center justify-center gap-3 rounded-xl border-2 border-dashed border-blue-400/45 bg-blue-500/[0.06] text-sm font-semibold text-blue-600 transition hover:border-blue-400 hover:bg-blue-500/[0.12] hover:text-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            aria-label="Add a new section"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm transition group-hover:scale-105">
              <Plus size={20} aria-hidden />
            </span>
            Add section
          </button>
        </div>
      </SiteThemeFrame>

      <SelectionOverlay
        selectionToolbarProps={selectionToolbarProps}
        onResize={onResizeNode}
      />

      <HoverOverlay />
    </div>
  );
}
