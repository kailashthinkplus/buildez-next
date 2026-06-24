"use client";

import { useEffect, useState } from "react";
import BuilderHeader from "./BuilderHeader";
import IntegratedLeftSidebar from "../sidebar/PanelContainer";
import InspectorPanel from "../inspector/InspectorPanel";
import BuilderCanvas from "../canvas/BuilderCanvas";
import DragGhost from "../canvas/DragGhost";
import SelectionToolbar from "../canvas/SelectionToolbar";
import ContextMenu from "../canvas/ContextMenu";
import DropZoneIndicator from "../canvas/DropZoneIndicator";
import MiniHandles from "../canvas/MiniHandles";
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
import { ReparentNodeCommand } from "../core/commands/ReparentNodeCommand";
import { BlueprintFactory } from "../core/engine/BlueprintFactory";
import { AiConversation } from "../ai/services/AiConversation";
import { useAiStore } from "../ai/store/useAiStore";
import { WidgetRegistry } from "../core/registry/WidgetRegistry";

import type { BuilderBlueprint } from "../types/blueprint";

const HEADER_HEIGHT = 56;

/* ============================================================
   TYPES
============================================================ */

interface BuilderShellProps {}

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
        ✨
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
  {}: BuilderShellProps
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

  const isDarkMode = useCanvasStore((s) => s.isDarkMode);
  const zoom = useCanvasStore((s) => s.zoom);

  /* Builder V2 */
  const blueprint = useBuilderStore((s) => s.blueprint);
  const selectedId = useSelectionStore((s) => s.selectedNodeId);
  const select = useSelectionStore((s) => s.select);

const onUndo = () => commandBus.undo();

const onRedo = () => commandBus.redo();

/*
Temporary placeholders until we migrate
each subsystem.
*/

const canUndo = true;
const canRedo = true;

const onSave = () => {};

const onPublish = () => {};

const onUpdateNode = (id: string, patch: Record<string, unknown>) => {
  commandBus.execute(new UpdateNodeCommand(id, patch as any));
};

const onDeleteNode = (id: string) => {
  commandBus.execute(new DeleteNodeCommand(id));
  // Clear selection after deletion
  if (selectedId === id) {
    select(null);
  }
};

const onDuplicateNode = (id: string) => {
  commandBus.execute(new DuplicateNodeCommand(id));
};

const onMoveNodeUp = (id: string) => {
  commandBus.execute(new ReorderNodeCommand(id, "up"));
};

const onMoveNodeDown = (id: string) => {
  commandBus.execute(new ReorderNodeCommand(id, "down"));
};

const onWrapNode = (id: string) => {
  commandBus.execute(new WrapInContainerCommand(id));
};

const onCopyNodeStyle = (id: string) => {
  commandBus.execute(new CopyStyleCommand(id));
  setCanPasteStyle(true);
};

const onPasteNodeStyle = (id: string) => {
  commandBus.execute(new PasteStyleCommand(id));
};

const onReparentNode = (nodeId: string, newParentId: string, insertIndex?: number) => {
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

  // ⭐ If adding a COLUMN while another COLUMN is selected,
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

const onRunAI = (prompt: string) => {
  if (!blueprint) return;
  AiConversation.run({ pageId: blueprint.root, prompt }).catch((err) =>
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

    const onReparent = (e: Event) => {
      const { nodeId, targetParentId } = (e as CustomEvent).detail;
      if (!nodeId || !targetParentId) return;
      onReparentNode(nodeId, targetParentId);
    };

    window.addEventListener("builder:start-drag", onStart);
    window.addEventListener("builder:reparent", onReparent);
    return () => {
      window.removeEventListener("builder:start-drag", onStart);
      window.removeEventListener("builder:reparent", onReparent);
    };
  }, []);

  useEffect(() => {
    if (!dragGhost) return;

    function onMove(e: MouseEvent) {
      setDragGhost((prev) =>
        prev ? { ...prev, x: e.clientX, y: e.clientY } : prev
      );
    }

    function onUp() {
      document.body.classList.remove("builder-dragging");
      setDragGhost(null);
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragGhost]);

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

  return (
    <div className="builder-shell h-screen w-full bg-[#0F1118] text-white overflow-hidden">
      {/* HEADER */}
      <div
        className="fixed top-0 left-0 right-0 z-[10000]"
        style={{ height: HEADER_HEIGHT }}
      >
        <BuilderHeader />
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
          pageId={blueprint.root}
          aiChatRuntime={aiChatRuntime}
          onRequestLogoUpload={onRequestLogoUpload}
          onCapturePrompt={onCapturePrompt}
        />

        {/* CANVAS */}
        <main
          className={`flex-1 relative overflow-hidden ${
            isDarkMode ? "bg-[#1E1F22]" : "bg-[#0F1118]"
          }`}
        >
          <div className="w-full h-full overflow-auto relative">
            <div
              className="w-full min-h-full relative builder-canvas-sandbox"
              style={{
                transform: `scale(${zoom / 100})`,
                transformOrigin: "top center",
              }}
            >
              <BuilderCanvas
                blueprint={blueprint}
                onCanvasClick={onCanvasClick}
              />

              <SelectionToolbar
                selectedId={selectedId}
                isRoot={selectedId === blueprint.root}
                onAdd={(type) => onAddBlock(type)}
                onDuplicate={() => selectedId && onDuplicateNode(selectedId)}
                onDelete={() => selectedId && onDeleteNode(selectedId)}
                onMoveUp={() => selectedId && onMoveNodeUp(selectedId)}
                onMoveDown={() => selectedId && onMoveNodeDown(selectedId)}
                onWrap={() => selectedId && onWrapNode(selectedId)}
                onCopyStyle={() => selectedId && onCopyNodeStyle(selectedId)}
                onPasteStyle={() => selectedId && onPasteNodeStyle(selectedId)}
                canPasteStyle={canPasteStyle}
              />

              <ContextMenu
                actions={[
                  {
                    label: "Duplicate",
                    icon: "📋",
                    action: () => selectedId && onDuplicateNode(selectedId),
                  },
                  {
                    label: "Wrap in Container",
                    icon: "📦",
                    action: () => selectedId && onWrapNode(selectedId),
                  },
                  {
                    label: "Copy Style",
                    icon: "🎨",
                    action: () => selectedId && onCopyNodeStyle(selectedId),
                  },
                  {
                    label: "Paste Style",
                    icon: "🎨",
                    action: () => selectedId && onPasteNodeStyle(selectedId),
                    disabled: !canPasteStyle,
                  },
                  {
                    label: "Delete",
                    icon: "🗑️",
                    action: () => selectedId && onDeleteNode(selectedId),
                    isDanger: true,
                  },
                ]}
              />

              <DropZoneIndicator />

              <MiniHandles
                onDuplicate={(id) => onDuplicateNode(id)}
                onDelete={(id) => onDeleteNode(id)}
                onWrap={(id) => onWrapNode(id)}
              />

              {(
                blueprint.nodes[blueprint.root]?.children?.length ?? 0
              ) === 0 && <EmptyCanvasMessage />}
            </div>
          </div>
        </main>

        {/* INSPECTOR */}
        <aside
          className="border-l border-white/10 bg-[#0F1118]/95 backdrop-blur-xl relative overflow-hidden"
          style={{ width: inspectorWidth }}
        >
          {!isInspectorCollapsed && (
            <InspectorPanel
              selectedId={selectedId}
              blueprint={blueprint}
              onUpdateNode={onUpdateNode}
            />
          )}
          <CollapseButton
            isCollapsed={isInspectorCollapsed}
            onClick={() => setIsInspectorCollapsed(!isInspectorCollapsed)}
          />
        </aside>
      </div>

      {dragGhost && <DragGhost drag={dragGhost} />}

      <style jsx global>{`
        .builder-canvas-sandbox {
          isolation: isolate;
          background: #ffffff;
          color: #0f172a;
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

        .builder-canvas-sandbox img,
        .builder-canvas-sandbox svg,
        .builder-canvas-sandbox video,
        .builder-canvas-sandbox canvas {
          display: block;
          max-width: 100%;
        }
      `}</style>
    </div>
  );
}
