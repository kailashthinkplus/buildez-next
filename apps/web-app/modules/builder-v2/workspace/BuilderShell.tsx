"use client";

import { useEffect, useRef, useState } from "react";
import BuilderHeader from "./BuilderHeader";
import IntegratedLeftSidebar from "../sidebar/PanelContainer";
import InspectorPanel from "../inspector/InspectorPanel";
import BuilderCanvas from "../canvas/BuilderCanvas";
import DragGhost from "../canvas/DragGhost";
import ContextMenu from "../canvas/ContextMenu";
import DropZoneIndicator from "../canvas/DropZoneIndicator";
import { useCanvasStore } from "../store/useCanvasStore";
import type { BuilderNode } from "../types/blueprint";
import { useBuilderStore } from "../store/useBuilderStore";
import { useSelectionStore } from "../store/useSelectionStore";
import { commandBus } from "../core/commands/CommandBus";
import { InsertNodeCommand } from "../core/commands/InsertNodeCommand";
import { UpdateNodeCommand } from "../core/commands/MoveNodeCommand";
import { DeleteNodeCommand } from "../core/commands/DeleteNodeCommand";
import { DuplicateNodeCommand } from "../core/commands/DuplicateNodeCommand";
import { ReorderNodeCommand } from "../core/commands/ReorderNodeCommand";
import { WrapInContainerCommand } from "../core/commands/WrapInContainerCommand";
import { CopyStyleCommand, PasteStyleCommand } from "../core/commands/StyleCommands";
import { CopyElementCommand, PasteElementCommand } from "../core/commands/ElementClipboardCommands";
import {
  ToggleNodeHiddenCommand,
  ToggleNodeLockCommand,
  ToggleResponsiveVisibilityCommand,
} from "../core/commands/NodeStateCommands";
import { ReparentNodeCommand } from "../core/commands/ReparentNodeCommand";
import { BlueprintFactory } from "../core/engine/BlueprintFactory";
import { AiConversation } from "../ai/services/AiConversation";
import { useAiStore } from "../ai/store/useAiStore";
import { WidgetRegistry } from "../core/registry/WidgetRegistry";
import { Copy, Package, Palette, Sparkles, Trash2 } from "lucide-react";

import type { BuilderBlueprint } from "../types/blueprint";
import type { SiteThemeLayout } from "../theme/siteLayout";

const HEADER_HEIGHT = 56;

/* ============================================================
   TYPES
============================================================ */

interface BuilderShellProps {
  pageId: string;
  pageStatus: "DRAFT" | "PUBLISHED";
  pageTitle: string;
  siteId: string;
  siteLayout?: SiteThemeLayout | null;
}

type DragGhostDetail = {
  id: string;
  type: string;
  x: number;
  y: number;
  source?: string;
};

/* ============================================================
   EMPTY CANVAS MESSAGE (BRANDED)
============================================================ */

function EmptyCanvasMessage() {
  const isDarkMode = useCanvasStore((s) => s.isDarkMode);

  return (
    <div
      className={`
        absolute inset-0 z-10 flex flex-col items-center justify-center
        pointer-events-none
        ${
          isDarkMode
            ? "bg-gradient-to-br from-[#0F1118] via-[#121522] to-[#0B0D14]"
            : "bg-[#f8fafc]"
        }
      `}
    >
      <div
        className={`
          mb-6 w-20 h-20 rounded-2xl
          flex items-center justify-center text-5xl
          backdrop-blur-sm border
          ${
            isDarkMode
              ? "bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-white/10"
              : "bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-black/10"
          }
        `}
      >
        <Sparkles size={34} aria-hidden />
      </div>

      <div
        className={`
          text-2xl font-bold mb-3
          ${isDarkMode ? "text-white/90" : "text-slate-800"}
        `}
      >
        Start Building
      </div>

      <div
        className={`
          text-base text-center max-w-md px-6 leading-relaxed
          ${isDarkMode ? "text-white/60" : "text-slate-500"}
        `}
      >
        Use the AI panel to generate your website, or drag blocks from the sidebar
        to start designing.
      </div>
    </div>
  );
}

/* ============================================================
   COLLAPSIBLE PANEL BUTTON
============================================================ */

function CollapseButton({
  isCollapsed,
  onClick,
}: {
  isCollapsed: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="absolute top-1/2 -translate-y-1/2 left-[-12px] z-50 w-6 h-16 bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/5 transition-all duration-200 flex items-center justify-center group rounded-l-lg"
      title={isCollapsed ? "Show inspector" : "Hide inspector"}
    >
      <svg
        className="w-4 h-4 text-white/40 group-hover:text-white/70 transition-colors"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        style={{
          transform: isCollapsed ? "rotate(0deg)" : "rotate(180deg)",
        }}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 19l-7-7 7-7"
        />
      </svg>
    </button>
  );
}

/* ============================================================
   BUILDER SHELL
============================================================ */

export default function BuilderShell(
  { pageId, pageStatus, pageTitle, siteId, siteLayout }: BuilderShellProps
) {
  /* Call all hooks at the top, before any conditionals */
  const [isInspectorCollapsed, setIsInspectorCollapsed] = useState(false);
  const [dragGhost, setDragGhost] = useState<{
    id: string;
    type: string;
    x: number;
    y: number;
    source?: string;
  } | null>(null);
  const [canPasteStyle, setCanPasteStyle] = useState(false);
  const [canPasteElement, setCanPasteElement] = useState(false);
  const dragRafRef = useRef<number | null>(null);
  const dragPosRef = useRef<{ x: number; y: number } | null>(null);
  const pendingDropRef = useRef<{
    targetParentId: string;
    targetIndex?: number;
    referenceNodeId?: string;
    intent: "before" | "after" | "inside";
  } | null>(null);

  const isDarkMode = useCanvasStore((s) => s.isDarkMode);
  const zoom = useCanvasStore((s) => s.zoom);
  const device = useCanvasStore((s) => s.device);

  /* Builder V2 */
  const blueprint = useBuilderStore((s) => s.blueprint);
  const selectedId = useSelectionStore((s) => s.selectedNodeId);
  const select = useSelectionStore((s) => s.select);

const [canUndo, setCanUndo] = useState(false);
const [canRedo, setCanRedo] = useState(false);

const onUndo = () => commandBus.undo();

const onRedo = () => commandBus.redo();

/* Wire command bus state to local component state */
useEffect(() => {
  const unsubscribe = commandBus.subscribe(() => {
    setCanUndo(commandBus.canUndo());
    setCanRedo(commandBus.canRedo());
  });

  return () => unsubscribe();
}, []);

const onSave = () => {};

const onPublish = () => {};

const isNodeLocked = (id: string): boolean => {
  if (!blueprint) return false;
  return !!blueprint.nodes[id]?.locked;
};

const onUpdateNode = (id: string, patch: Record<string, unknown>) => {
  if (isNodeLocked(id)) {
    return;
  }

  commandBus.execute(new UpdateNodeCommand(id, patch as any));
};

const onDeleteNode = (id: string) => {
  if (isNodeLocked(id)) {
    return;
  }

  commandBus.execute(new DeleteNodeCommand(id));
  // Clear selection after deletion
  if (selectedId === id) {
    select(null);
  }
};

const onDuplicateNode = (id: string) => {
  if (isNodeLocked(id)) {
    return;
  }

  commandBus.execute(new DuplicateNodeCommand(id));
};

const onMoveNodeUp = (id: string) => {
  if (isNodeLocked(id)) {
    return;
  }

  commandBus.execute(new ReorderNodeCommand(id, "up"));
};

const onMoveNodeDown = (id: string) => {
  if (isNodeLocked(id)) {
    return;
  }

  commandBus.execute(new ReorderNodeCommand(id, "down"));
};

const onWrapNode = (id: string) => {
  if (isNodeLocked(id)) {
    return;
  }

  commandBus.execute(new WrapInContainerCommand(id));
};

const onApplyColumnStructure = (targetId: string, widths: number[]) => {
  if (!blueprint || isNodeLocked(targetId) || widths.length === 0) {
    return;
  }

  commandBus.execute({
    id: crypto.randomUUID(),
    name: "Apply Column Structure",
    execute(currentBlueprint) {
      const target = currentBlueprint.nodes[targetId];
      if (!target || !["page", "section", "container", "column"].includes(target.type)) {
        return currentBlueprint;
      }

      const nodes = { ...currentBlueprint.nodes };
      const existingChildren = [...target.children];
      const contentChildren: string[] = [];

      for (const childId of existingChildren) {
        const child = nodes[childId];
        if (!child) continue;

        if (child.type === "column") {
          contentChildren.push(...child.children);
          delete nodes[childId];
        } else {
          contentChildren.push(childId);
        }
      }

      const columnIds = widths.map((width) => {
        const column = BlueprintFactory.createNode("column", targetId);
        const widthValue = `${Math.round(width * 1000) / 1000}%`;

        nodes[column.id] = {
          ...column,
          props: {
            ...column.props,
            layout: "vertical",
          },
          style: {
            ...column.style,
            width: widthValue,
            flex: `0 0 ${widthValue}`,
            maxWidth: widthValue,
            minHeight: column.style?.minHeight ?? 120,
            minWidth: 0,
          },
        };

        return column.id;
      });

      const firstColumn = nodes[columnIds[0]];
      if (firstColumn) {
        nodes[firstColumn.id] = {
          ...firstColumn,
          children: contentChildren,
        };

        for (const childId of contentChildren) {
          const child = nodes[childId];
          if (child) {
            nodes[childId] = {
              ...child,
              parentId: firstColumn.id,
            };
          }
        }
      }

      nodes[target.id] = {
        ...target,
        children: columnIds,
        props: {
          ...target.props,
          layout: "flex",
          direction: "row",
        },
        style: {
          ...target.style,
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          alignItems: target.style?.alignItems ?? "stretch",
          gap: target.style?.gap ?? 16,
        },
      };

      return {
        ...currentBlueprint,
        metadata: {
          ...currentBlueprint.metadata,
          updatedAt: new Date().toISOString(),
        },
        nodes,
      };
    },
  });
};

const onCopyNodeStyle = (id: string) => {
  if (isNodeLocked(id)) {
    return;
  }

  commandBus.execute(new CopyStyleCommand(id));
  setCanPasteStyle(true);
};

const onPasteNodeStyle = (id: string) => {
  if (isNodeLocked(id)) {
    return;
  }

  commandBus.execute(new PasteStyleCommand(id));
};

const onCopyNode = (id: string) => {
  if (isNodeLocked(id)) {
    return;
  }

  commandBus.execute(new CopyElementCommand(id));
  setCanPasteElement(true);
};

const onPasteNode = (id: string) => {
  if (isNodeLocked(id)) {
    return;
  }

  commandBus.execute(new PasteElementCommand(id));
};

const onToggleNodeVisibility = (id: string) => {
  commandBus.execute(new ToggleNodeHiddenCommand(id));
};

const onToggleNodeLock = (id: string) => {
  commandBus.execute(new ToggleNodeLockCommand(id));
};

const onToggleResponsiveVisibility = (id: string) => {
  commandBus.execute(new ToggleResponsiveVisibilityCommand(id, device));
};

const onOpenNavigator = () => {
  window.dispatchEvent(
    new CustomEvent("builder:open-panel", {
      detail: { panel: "layers" },
    })
  );
};

const onOpenSettings = () => {
  setIsInspectorCollapsed(false);
};

const onReparentNode = (nodeId: string, newParentId: string, insertIndex?: number) => {
  if (isNodeLocked(nodeId) || isNodeLocked(newParentId)) {
    return;
  }

  commandBus.execute(new ReparentNodeCommand(nodeId, newParentId, insertIndex));
};

const canContainChildren = (type: string): boolean => {
  if (WidgetRegistry.has(type as any)) {
    return WidgetRegistry.get(type as any).canHaveChildren;
  }

  // Safety for legacy/non-registered container-like node types.
  return [
    "page",
    "section",
    "container",
    "column",
    "grid",
    "hero",
    "features",
    "pricing",
    "gallery",
    "faq",
    "cta",
    "footer",
    "custom",
  ].includes(type);
};

const resolveInsertParentId = (type: string, parentId?: string): string => {
  if (!blueprint) {
    return "";
  }

  if (parentId && blueprint.nodes[parentId]) {
    return parentId;
  }

  if (selectedId) {
    const selectedNode = blueprint.nodes[selectedId];

    if (selectedNode) {

  // If adding a COLUMN while another COLUMN is selected,
  // insert it into the same parent (container), not inside the selected column.
  if (
    type === "column" &&
    selectedNode.type === "column"
  ) {
    return selectedNode.parentId ?? blueprint.root;
  }

  if (canContainChildren(selectedNode.type)) {
    return selectedNode.id;
  }

  if (
    selectedNode.parentId &&
    blueprint.nodes[selectedNode.parentId]
  ) {
    return selectedNode.parentId;
  }

}
  }

  return blueprint.root;
};

const onAddBlock = (type: string, parentId?: string) => {
  if (!blueprint) return;

  const parent = resolveInsertParentId(type, parentId);

  // Elementor-like behavior: when adding a column to non-container area,
  // inject a container first and place the column inside it.
  if (type === "column") {
    const parentNode = blueprint.nodes[parent];
    if (!parentNode) return;

    if (parentNode.type === "container") {
      const columnNode = BlueprintFactory.createNode("column", parentNode.id);
      commandBus.execute(new InsertNodeCommand(parentNode.id, columnNode));
      select(columnNode.id);
      return;
    }

    const containerNode = BlueprintFactory.createNode("container", parentNode.id);
    const columnNode = BlueprintFactory.createNode("column", containerNode.id);

    commandBus.execute(new InsertNodeCommand(parentNode.id, containerNode));
    commandBus.execute(new InsertNodeCommand(containerNode.id, columnNode));
    select(columnNode.id);
    return;
  }

  const node = BlueprintFactory.createNode(type as any, parent);
  commandBus.execute(new InsertNodeCommand(parent, node));

  // Quick start nested layout: adding a container seeds one column so users
  // can immediately place elements.
  if (type === "container") {
    const columnNode = BlueprintFactory.createNode("column", node.id);
    commandBus.execute(new InsertNodeCommand(node.id, columnNode));
  }

  select(node.id);
};

const insertBlockAtDrop = (
  type: string,
  parentId: string,
  insertIndex?: number
) => {
  if (!blueprint || !blueprint.nodes[parentId] || isNodeLocked(parentId)) {
    return;
  }

  if (type === "column") {
    const parentNode = blueprint.nodes[parentId];
    if (!parentNode) return;

    if (parentNode.type === "container") {
      const columnNode = BlueprintFactory.createNode("column", parentNode.id);
      commandBus.execute(new InsertNodeCommand(parentNode.id, columnNode, insertIndex));
      select(columnNode.id);
      return;
    }

    const containerNode = BlueprintFactory.createNode("container", parentNode.id);
    const columnNode = BlueprintFactory.createNode("column", containerNode.id);

    commandBus.execute(new InsertNodeCommand(parentNode.id, containerNode, insertIndex));
    commandBus.execute(new InsertNodeCommand(containerNode.id, columnNode));
    select(columnNode.id);
    return;
  }

  const node = BlueprintFactory.createNode(type as any, parentId);
  commandBus.execute(new InsertNodeCommand(parentId, node, insertIndex));

  if (type === "container") {
    const columnNode = BlueprintFactory.createNode("column", node.id);
    commandBus.execute(new InsertNodeCommand(node.id, columnNode));
  }

  select(node.id);
};

const onRunAI = (prompt: string) => {
  if (!blueprint) return;
  AiConversation.run({ pageId, prompt }).catch((err) =>
    console.error("[BuilderShell] AI run failed:", err)
  );
};

const onAbortAI = () => {
  AiConversation.abort();
};

const onRequestLogoUpload = () => {
  window.dispatchEvent(new CustomEvent("ai:open-logo-upload"));
};

const onCapturePrompt = (prompt: string) => {
  try {
    useAiStore.getState().setLastPrompt(prompt);
    useAiStore.getState().setInput(prompt);
  } catch (err) {
    /* ignore */
  }
};

const aiChatRuntime = {
  status: useAiStore((s) => s.status) as "idle" | "running" | "success" | "error",
};

const reactCode: string | null = null;

const onCanvasClick = () => {
  select(null);
};

  /* AUTO-OPEN INSPECTOR ON SELECTION */
  useEffect(() => {
    if (!blueprint) return;
    // When user selects an element on canvas, auto-open inspector
    if (selectedId && selectedId !== blueprint.root) {
      setIsInspectorCollapsed(false);
    }
  }, [selectedId, blueprint]);

  /* CHECK IF STYLE CAN BE PASTED */
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("__builder_copied_style");
      setCanPasteStyle(!!raw);
    } catch (e) {
      setCanPasteStyle(false);
    }
  }, []);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("__builder_copied_node");
      setCanPasteElement(!!raw);
    } catch (e) {
      setCanPasteElement(false);
    }
  }, []);

  /* ============================================================
     DRAG EVENTS
  ============================================================ */
  useEffect(() => {
    const onStart = (e: Event) => {
      const detail = (e as CustomEvent<DragGhostDetail>).detail;
      if (!detail) return;
      document.body.classList.add("builder-dragging");
      setDragGhost(detail);
    };

    const onEnd = () => {
      document.body.classList.remove("builder-dragging");
      (window as any).__builderDragId = null;
      (window as any).__builderDragType = null;
      (window as any).__builderDragSource = null;
      setDragGhost(null);
    };

    const onReparent = (e: Event) => {
      const detail = (e as CustomEvent).detail ?? {};
      const {
        nodeId,
        targetParentId,
        targetIndex,
        referenceNodeId,
        intent,
        animate,
      } = detail;

      if (!nodeId || !blueprint) return;

      let parentId = targetParentId as string | undefined;
      let insertIndex: number | undefined =
        typeof targetIndex === "number" ? targetIndex : undefined;

      if ((intent === "before" || intent === "after") && referenceNodeId) {
        const refNode = blueprint.nodes[referenceNodeId];
        const refParent = refNode?.parentId ? blueprint.nodes[refNode.parentId] : null;
        if (!refNode || !refParent) return;

        parentId = refParent.id;
        const refIdx = refParent.children.indexOf(referenceNodeId);
        if (refIdx < 0) return;
        insertIndex = intent === "before" ? refIdx : refIdx + 1;
      }

      if (!parentId) return;
      onReparentNode(nodeId, parentId, insertIndex);

      if (animate) {
        requestAnimationFrame(() => {
          const el = document.querySelector(
            `[data-node-id='${nodeId}']`
          ) as HTMLElement | null;
          if (!el) return;
          el.classList.add("builder-drop-pulse");
          window.setTimeout(() => el.classList.remove("builder-drop-pulse"), 260);
        });
      }
    };

    window.addEventListener("builder:start-drag", onStart);
    window.addEventListener("builder:end-drag", onEnd);
    window.addEventListener("builder:reparent", onReparent);
    window.addEventListener("pointerup", onEnd);
    window.addEventListener("blur", onEnd);
    return () => {
      window.removeEventListener("builder:start-drag", onStart);
      window.removeEventListener("builder:end-drag", onEnd);
      window.removeEventListener("builder:reparent", onReparent);
      window.removeEventListener("pointerup", onEnd);
      window.removeEventListener("blur", onEnd);
    };
  }, [blueprint]);

  useEffect(() => {
    if (!dragGhost) return;

    function updatePosition(x: number, y: number) {
      dragPosRef.current = { x, y };
      if (dragRafRef.current !== null) return;

      dragRafRef.current = window.requestAnimationFrame(() => {
        dragRafRef.current = null;
        const pos = dragPosRef.current;
        if (!pos) return;
        setDragGhost((prev) => (prev ? { ...prev, x: pos.x, y: pos.y } : prev));
      });
    }

    function onDragOver(e: DragEvent) {
      updatePosition(e.clientX, e.clientY);
    }

    function onDragMove(e: Event) {
      const detail = (e as CustomEvent<{ x: number; y: number }>).detail;
      if (!detail) return;
      updatePosition(detail.x, detail.y);
    }

    function onStop() {
      document.body.classList.remove("builder-dragging");
      (window as any).__builderDragId = null;
      (window as any).__builderDragType = null;
      (window as any).__builderDragSource = null;
      if (dragRafRef.current !== null) {
        window.cancelAnimationFrame(dragRafRef.current);
        dragRafRef.current = null;
      }
      dragPosRef.current = null;
      setDragGhost(null);
    }

    window.addEventListener("dragover", onDragOver);
    window.addEventListener("builder:drag-move", onDragMove);
    window.addEventListener("dragend", onStop);
    window.addEventListener("drop", onStop);

    return () => {
      window.removeEventListener("dragover", onDragOver);
      window.removeEventListener("builder:drag-move", onDragMove);
      window.removeEventListener("dragend", onStop);
      window.removeEventListener("drop", onStop);
    };
  }, [dragGhost]);

  useEffect(() => {
    if (!blueprint) return;

    const findTargetNodeElement = (x: number, y: number, dragId: string | null) => {
      const draggedEl = dragId
        ? (document.querySelector(`[data-node-id='${dragId}']`) as HTMLElement | null)
        : null;
      const stack = document.elementsFromPoint(x, y);
      for (const hit of stack) {
        if (!(hit instanceof HTMLElement)) continue;
        const nodeEl = hit.closest("[data-node-id]") as HTMLElement | null;
        if (!nodeEl) continue;
        const nodeId = nodeEl.getAttribute("data-node-id");
        if (!nodeId) continue;
        if (dragId && nodeId === dragId) continue;
        if (draggedEl?.contains(nodeEl)) continue;
        return nodeEl;
      }
      return null;
    };

    const computeDrop = (
      targetEl: HTMLElement,
      x: number,
      y: number,
      dragType: string | null
    ) => {
      const nodeId = targetEl.getAttribute("data-node-id");
      if (!nodeId) return null;
      const node = blueprint.nodes[nodeId];
      if (!node) return null;

      const rect = targetEl.getBoundingClientRect();
      const isGrid =
        node.type === "container" &&
        (node.props?.layout ?? "flex") === "grid";
      const isHorizontal =
        node.type === "container" &&
        !isGrid &&
        (node.props?.direction ?? "row") === "row";
      const isContainer = ["page", "section", "container", "column"].includes(node.type);
      const isLayoutDrag = dragType === "container" || dragType === "column";
      const canDropInsideLayoutTarget = node.type === "container" || node.type === "column";
      const canDropInside =
        node.parentId === null ||
        (isLayoutDrag ? canDropInsideLayoutTarget : isContainer);
      const lead = isHorizontal ? x - rect.left : y - rect.top;
      const span = isHorizontal ? rect.width : rect.height;
      const edge = Math.max(12, Math.min(28, span * 0.2));

      let intent: "before" | "after" | "inside" = "before";
      if (isGrid && canDropInside) {
        intent = "inside";
      } else if (canDropInside) {
        // Center zone inside, edges before/after.
        if (lead <= edge) {
          intent = "before";
        } else if (lead >= span - edge) {
          intent = "after";
        } else {
          intent = "inside";
        }
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
              isEmpty: (node.children?.length ?? 0) === 0,
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

      const drop =
        intent === "inside"
          ? {
              targetParentId: node.id,
              targetIndex: node.children.length,
              intent,
            }
          : node.parentId
            ? {
                targetParentId: node.parentId,
                referenceNodeId: node.id,
                intent,
              }
            : null;

      return { indicator, drop };
    };

    const onDragOverCapture = (e: DragEvent) => {
      const dragId = ((window as any).__builderDragId as string | null) ?? null;
      const dragType = ((window as any).__builderDragType as string | null) ?? null;
      if (!dragId) return;

      e.preventDefault();
      const targetEl = findTargetNodeElement(e.clientX, e.clientY, dragId);
      if (!targetEl) {
        pendingDropRef.current = null;
        window.dispatchEvent(new CustomEvent("builder:drop-clear"));
        return;
      }

      const computed = computeDrop(targetEl, e.clientX, e.clientY, dragType);
      if (!computed) {
        pendingDropRef.current = null;
        window.dispatchEvent(new CustomEvent("builder:drop-clear"));
        return;
      }

      pendingDropRef.current = computed.drop;
      window.dispatchEvent(
        new CustomEvent("builder:drop-intent", { detail: computed.indicator })
      );
      window.dispatchEvent(
        new CustomEvent("builder:drag-move", {
          detail: { x: e.clientX, y: e.clientY },
        })
      );
    };

    const onDropCapture = (e: DragEvent) => {
      e.preventDefault();

      const payload = e.dataTransfer?.getData("application/json");
      let payloadId: string | null = null;
      let payloadType: string | null = null;
      let payloadSource: string | null = null;
      if (payload) {
        try {
          const parsed = JSON.parse(payload);
          payloadId = parsed?.nodeId ?? parsed?.id ?? null;
          payloadType = parsed?.type ?? null;
          payloadSource = parsed?.source ?? null;
        } catch {
          payloadId = null;
        }
      }

      const dragId = payloadId ?? (((window as any).__builderDragId as string | null) ?? null);
      const dragType =
        payloadType ?? (((window as any).__builderDragType as string | null) ?? null);
      const dragSource =
        payloadSource ?? (((window as any).__builderDragSource as string | null) ?? null);
      if (!dragId) return;

      const drop = pendingDropRef.current;
      pendingDropRef.current = null;

      window.dispatchEvent(new CustomEvent("builder:drop-clear"));
      window.dispatchEvent(new CustomEvent("builder:end-drag"));

      if (!drop) return;

      const isNewBlockDrag = dragSource === "block-menu" || dragId.startsWith("new:");
      if (isNewBlockDrag) {
        if (!dragType) return;

        if (drop.intent === "inside") {
          insertBlockAtDrop(dragType, drop.targetParentId, drop.targetIndex);
          return;
        }

        if (!drop.referenceNodeId) {
          insertBlockAtDrop(dragType, drop.targetParentId, drop.targetIndex);
          return;
        }

        const refNode = blueprint.nodes[drop.referenceNodeId];
        const refParent = refNode?.parentId ? blueprint.nodes[refNode.parentId] : null;
        if (!refNode || !refParent) return;

        const refIdx = refParent.children.indexOf(refNode.id);
        if (refIdx < 0) return;

        const insertIndex = drop.intent === "before" ? refIdx : refIdx + 1;
        insertBlockAtDrop(dragType, refParent.id, insertIndex);
        return;
      }

      if (drop.intent === "inside") {
        onReparentNode(dragId, drop.targetParentId, drop.targetIndex);
        return;
      }

      if (!drop.referenceNodeId) {
        onReparentNode(dragId, drop.targetParentId, drop.targetIndex);
        return;
      }

      const refNode = blueprint.nodes[drop.referenceNodeId];
      const refParent = refNode?.parentId ? blueprint.nodes[refNode.parentId] : null;
      if (!refNode || !refParent) {
        return;
      }

      const refIdx = refParent.children.indexOf(refNode.id);
      if (refIdx < 0) {
        return;
      }

      const insertIndex = drop.intent === "before" ? refIdx : refIdx + 1;
      onReparentNode(dragId, refParent.id, insertIndex);
    };

    const onEndCapture = () => {
      pendingDropRef.current = null;
      window.dispatchEvent(new CustomEvent("builder:drop-clear"));
    };

    window.addEventListener("dragover", onDragOverCapture, true);
    window.addEventListener("drop", onDropCapture, true);
    window.addEventListener("dragend", onEndCapture, true);

    return () => {
      window.removeEventListener("dragover", onDragOverCapture, true);
      window.removeEventListener("drop", onDropCapture, true);
      window.removeEventListener("dragend", onEndCapture, true);
    };
  }, [blueprint]);

  /* ============================================================
     GUARD CHECKS (AFTER ALL HOOKS)
  ============================================================ */
  if (!blueprint) {
    return null;
  }

  const rootNode = blueprint.nodes[blueprint.root];
  if (!rootNode) {
    return null;
  }

  const inspectorWidth = isInspectorCollapsed ? 0 : 280;
  const canvasWidth =
    device === "mobile" ? 390 : device === "tablet" ? 768 : 1200;
  const selectedNode = selectedId ? blueprint.nodes[selectedId] : null;
  const responsiveVisibility =
    selectedNode?.props?.__responsiveVisibility as
      | Partial<Record<"desktop" | "tablet" | "mobile", boolean>>
      | undefined;
  const isVisibleOnCurrentDevice = responsiveVisibility?.[device] !== false;

  return (
    <div className="builder-shell h-screen w-full bg-[var(--dashboard-bg)] text-[var(--dashboard-text)] dark:bg-[#0F1118] dark:text-white overflow-hidden">
      {/* HEADER */}
      <div
        className="fixed top-0 left-0 right-0 z-[10000]"
        style={{ height: HEADER_HEIGHT }}
      >
        <BuilderHeader
          pageId={pageId}
          pageStatus={pageStatus}
          pageTitle={pageTitle}
        />
      </div>

      {/* BODY */}
      <div
        className="flex w-full relative"
        style={{
          marginTop: HEADER_HEIGHT,
          height: `calc(100vh - ${HEADER_HEIGHT}px)`,
        }}
      >
        <IntegratedLeftSidebar
          blueprint={blueprint}
          selectedId={selectedId}
          onSelect={select}
          onUpdateNode={onUpdateNode}
          onAddBlock={onAddBlock}
          onRunAI={onRunAI}
          onAbortAI={onAbortAI}
          pageId={pageId}
          siteId={siteId}
          aiChatRuntime={aiChatRuntime}
          onRequestLogoUpload={onRequestLogoUpload}
          onCapturePrompt={onCapturePrompt}
        />

        {/* CANVAS */}
        <main
          className={`builder-canvas-main flex-1 relative overflow-hidden ${
            isDarkMode ? "bg-[#1E1F22]" : "bg-[#0F1118]"
          }`}
        >
          <div className="w-full h-full overflow-auto relative" data-builder-canvas-scroll="true">
            <div
              className="min-h-full relative builder-canvas-sandbox mx-auto"
              style={{
                width: `${canvasWidth}px`,
                minWidth: `${canvasWidth}px`,
                maxWidth: `${canvasWidth}px`,
                transform: `scale(${zoom / 100})`,
                transformOrigin: "top center",
              }}
            >
              <BuilderCanvas
                blueprint={blueprint}
                siteLayout={siteLayout}
                onCanvasClick={onCanvasClick}
                selectionToolbarProps={{
                  selectedId,
                  selectedType: selectedNode?.type,
                  isRoot: selectedId === blueprint.root,
                  onAdd: (type) => onAddBlock(type),
                  onDuplicate: () => selectedId && onDuplicateNode(selectedId),
                  onDelete: () => selectedId && onDeleteNode(selectedId),
                  onMoveUp: () => selectedId && onMoveNodeUp(selectedId),
                  onMoveDown: () => selectedId && onMoveNodeDown(selectedId),
                  onWrap: () => selectedId && onWrapNode(selectedId),
                  onCopy: () => selectedId && onCopyNode(selectedId),
                  onPaste: () => selectedId && onPasteNode(selectedId),
                  canPaste: canPasteElement,
                  onToggleVisibility: () =>
                    selectedId && onToggleNodeVisibility(selectedId),
                  onToggleLock: () => selectedId && onToggleNodeLock(selectedId),
                  onOpenNavigator,
                  onOpenSettings,
                  onToggleResponsiveVisibility: () =>
                    selectedId && onToggleResponsiveVisibility(selectedId),
                  isHidden: !!selectedNode?.hidden,
                  isLocked: !!selectedNode?.locked,
                  isResponsiveVisible: isVisibleOnCurrentDevice,
                  currentDevice: device,
                }}
              />

              <ContextMenu
                actions={[
                  {
                    label: "Duplicate",
                    icon: <Copy size={14} aria-hidden />,
                    action: () => selectedId && onDuplicateNode(selectedId),
                  },
                  {
                    label: "Wrap in Container",
                    icon: <Package size={14} aria-hidden />,
                    action: () => selectedId && onWrapNode(selectedId),
                  },
                  {
                    label: "Copy Style",
                    icon: <Palette size={14} aria-hidden />,
                    action: () => selectedId && onCopyNodeStyle(selectedId),
                  },
                  {
                    label: "Paste Style",
                    icon: <Palette size={14} aria-hidden />,
                    action: () => selectedId && onPasteNodeStyle(selectedId),
                    disabled: !canPasteStyle,
                  },
                  {
                    label: "Delete",
                    icon: <Trash2 size={14} aria-hidden />,
                    action: () => selectedId && onDeleteNode(selectedId),
                    isDanger: true,
                  },
                ]}
              />

              <DropZoneIndicator />

              {(
                blueprint.nodes[blueprint.root]?.children?.length ?? 0
              ) === 0 && <EmptyCanvasMessage />}
            </div>
          </div>
        </main>

        {/* INSPECTOR */}
        <aside
          className="builder-chrome relative shrink-0 overflow-visible border-l backdrop-blur-xl"
          style={{ width: inspectorWidth }}
        >
          <div className="h-full overflow-hidden">
            {!isInspectorCollapsed && (
              <InspectorPanel
                selectedId={selectedId}
                blueprint={blueprint}
                onUpdateNode={onUpdateNode}
                onApplyColumnStructure={onApplyColumnStructure}
                siteId={siteId}
              />
            )}
          </div>
          <CollapseButton
            isCollapsed={isInspectorCollapsed}
            onClick={() => setIsInspectorCollapsed(!isInspectorCollapsed)}
          />
        </aside>
      </div>

      {dragGhost && <DragGhost drag={dragGhost} />}

      <style>{`
        .builder-canvas-sandbox {
          isolation: isolate;
          background: ${isDarkMode ? "#0f1118" : "#ffffff"};
          color: ${isDarkMode ? "#e5e7eb" : "#0f172a"};
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
            Roboto, "Helvetica Neue", sans-serif;
          line-height: 1.5;
          text-align: initial;
        }

        .builder-canvas-sandbox,
        .builder-canvas-sandbox * {
          box-sizing: border-box;
        }

        .builder-canvas-sandbox a {
          color: inherit;
        }

        .builder-dragging .builder-canvas-sandbox [data-node-id]:hover {
          outline: none !important;
          box-shadow: none !important;
        }

        .builder-canvas-sandbox img,
        .builder-canvas-sandbox svg,
        .builder-canvas-sandbox video,
        .builder-canvas-sandbox canvas {
          display: block;
          max-width: 100%;
        }

        .builder-drop-pulse {
          animation: builder-drop-pulse 220ms ease-out;
        }

        @keyframes builder-drop-pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.45);
            transform: translateY(0);
          }
          100% {
            box-shadow: 0 0 0 12px rgba(59, 130, 246, 0);
            transform: translateY(0);
          }
        }

        @keyframes builder-fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes builder-slide-up {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes builder-scale-in {
          from {
            opacity: 0;
            transform: scale(0.96);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
