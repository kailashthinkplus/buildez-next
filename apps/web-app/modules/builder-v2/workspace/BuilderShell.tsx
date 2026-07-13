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
import { buildNativeInsertionPlan } from "../core/commands/nativeHierarchyInsertion";
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
import { Copy, Maximize2, Minimize2, Package, Palette, Sparkles, Trash2 } from "lucide-react";
import { applyColumnStructureToBlueprint } from "../layout/columnStructure";
import { setResponsiveOverride } from "../core/responsive";
import { RESPONSIVE_BREAKPOINTS } from "../core/responsive/responsiveBreakpoints";
import ColumnStructurePicker from "../layout/ColumnStructurePicker";
import {
  buildFullscreenBuilderState,
  readFullscreenPreference,
  writeFullscreenPreference,
} from "./fullscreenBuilder";
import { canCommitDrop } from "../core/dnd/dropCommitSafety";

import type { BuilderBlueprint } from "../types/blueprint";
import type { SiteThemeLayout } from "../theme/siteLayout";

import { resolveNonOverlappingDropEdge } from "../core/dnd/dropIntentGeometry";
const HEADER_HEIGHT = 56;
const LEFT_TOOLBAR_WIDTH = 60;
const LEFT_PANEL_WIDTH = 360;
const INSPECTOR_WIDTH = 280;
const CANVAS_EDGE_GUTTER = 24;

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

function isBuilderBlueprint(value: unknown): value is BuilderBlueprint {
  const blueprint = value as BuilderBlueprint | null;
  return (
    !!blueprint &&
    typeof blueprint === "object" &&
    typeof blueprint.root === "string" &&
    !!blueprint.nodes &&
    typeof blueprint.nodes === "object"
  );
}

function normalizeLegacyNode(
  node: any,
  parentId: string | null,
  nodes: Record<string, BuilderNode>
): string {
  const id =
    typeof node?.id === "string" && node.id
      ? node.id
      : crypto.randomUUID();
  const rawChildren = Array.isArray(node?.children) ? node.children : [];
  const childIds: string[] = [];

  nodes[id] = {
    id,
    type: node?.type ?? "container",
    name: node?.name,
    parentId,
    children: childIds,
    props: node?.props ?? {},
    style: node?.style ?? {},
    locked: !!node?.locked,
    hidden: !!node?.hidden,
  } as BuilderNode;

  for (const child of rawChildren) {
    childIds.push(normalizeLegacyNode(child, id, nodes));
  }

  return id;
}

function normalizeBlueprintForBuilder(
  value: unknown,
  title: string
): BuilderBlueprint | null {
  if (isBuilderBlueprint(value)) return value;

  const raw = value as any;
  const page =
    raw?.type === "page" && Array.isArray(raw.children)
      ? raw
      : raw?.page && Array.isArray(raw.page.children)
        ? {
            id: raw.page.id,
            type: "page",
            props: raw.page.props ?? {},
            children: raw.page.children,
          }
        : null;

  if (!page) return null;

  const nodes: Record<string, BuilderNode> = {};
  const root = normalizeLegacyNode(page, null, nodes);

  return {
    metadata: {
      version: 2,
      title,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    theme: {
      id: "default",
      name: "Default",
      preset: "default",
      tokens: {},
    },
    root,
    nodes,
  };
}

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
        data-canvas-placeholder="empty-page"
        className={`
          mb-6 w-20 h-20 rounded-2xl
          flex items-center justify-center text-5xl
          backdrop-blur-sm border shadow-[0_24px_70px_rgba(15,23,42,0.16)]
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
          text-2xl font-bold mb-3 tracking-tight
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
        Drag blocks from the sidebar or use the add controls to start composing native Builder sections.
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
  const shellRef = useRef<HTMLDivElement | null>(null);
const canvasViewportRef = useRef<HTMLDivElement | null>(null);
  const [currentSiteLayout, setCurrentSiteLayout] = useState(siteLayout ?? null);

  useEffect(() => {
    setCurrentSiteLayout(siteLayout ?? null);
  }, [siteLayout]);

  useEffect(() => {
    const refreshBrandLayout = async () => {
      const response = await fetch(`/api/sites/${siteId}/layout`, { credentials: "include" });
      const payload = await response.json().catch(() => null);
      if (response.ok && payload?.data) {
        setCurrentSiteLayout(payload.data);
      }
    };
    window.addEventListener("brand:updated", refreshBrandLayout);
    return () => window.removeEventListener("brand:updated", refreshBrandLayout);
  }, [siteId]);
  /* Call all hooks at the top, before any conditionals */
  const [isInspectorCollapsed, setIsInspectorCollapsed] = useState(false);
  const [isFullscreenBuilder, setIsFullscreenBuilder] = useState(false);
  const [canvasContentWidth, setCanvasContentWidth] = useState(0);
  const [canvasContentHeight, setCanvasContentHeight] = useState(0);
  const [leftChromeWidth, setLeftChromeWidth] = useState(LEFT_TOOLBAR_WIDTH + LEFT_PANEL_WIDTH);
  const [pendingColumnTargetId, setPendingColumnTargetId] = useState<string | null>(null);
  const [dragGhost, setDragGhost] = useState<{
    id: string;
    type: string;
    x: number;
    y: number;
    source?: string;
  } | null>(null);
  const [dndObservation, setDndObservation] = useState({
    activeId: "",
    overId: "",
    intent: "",
    valid: false,
  });
  const [canPasteStyle, setCanPasteStyle] = useState(false);
  const [canPasteElement, setCanPasteElement] = useState(false);
  const dragRafRef = useRef<number | null>(null);
  const canvasSandboxRef = useRef<HTMLDivElement | null>(null);
  const dragPosRef = useRef<{ x: number; y: number } | null>(null);
  const pendingDropRef = useRef<{
    overId: string;
    pointerX: number;
    pointerY: number;
    targetParentId: string;
    targetIndex?: number;
    referenceNodeId?: string;
    intent: "before" | "after" | "inside";
  } | null>(null);
  const dragSessionRef = useRef({ activeId: null as string | null, cancelled: true, committed: false });

  const isDarkMode = useCanvasStore((s) => s.isDarkMode);
  const zoom = useCanvasStore((s) => s.zoom);
  const device = useCanvasStore((s) => s.device);

  /* Builder V2 */
  const blueprint = useBuilderStore((s) => s.blueprint);
  const initializeBuilder = useBuilderStore((s) => s.initialize);
  const selectedId = useSelectionStore((s) => s.selectedNodeId);
  const select = useSelectionStore((s) => s.select);
  const fullscreenState = buildFullscreenBuilderState(
    isFullscreenBuilder,
    typeof document !== "undefined" && Boolean(document.fullscreenEnabled)
  );

const [canUndo, setCanUndo] = useState(false);
const [canRedo, setCanRedo] = useState(false);

const onUndo = () => commandBus.undo();


const onRedo = () => commandBus.redo();
useEffect(() => {
  if (!blueprint) {
    select(null);
    return;
  }

  if (selectedId && !blueprint.nodes[selectedId]) {
    select(null);
  }
}, [blueprint, selectedId, select]);

/* Wire command bus state to local component state */
useEffect(() => {
  const unsubscribe = commandBus.subscribe(() => {
    setCanUndo(commandBus.canUndo());
    setCanRedo(commandBus.canRedo());
  });

  return () => unsubscribe();
}, []);

useEffect(() => {
  setIsFullscreenBuilder(readFullscreenPreference(window.localStorage));
}, []);

useEffect(() => {
  writeFullscreenPreference(window.localStorage, isFullscreenBuilder);
}, [isFullscreenBuilder]);

useEffect(() => {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape" && isFullscreenBuilder) {
      setIsFullscreenBuilder(false);
      if (document.fullscreenElement) {
        void document.exitFullscreen().catch(() => {});
      }
    }
  };

  const handleFullscreenChange = () => {
    if (!document.fullscreenElement && isFullscreenBuilder) {
      setIsFullscreenBuilder(false);
    }
  };

  window.addEventListener("keydown", handleKeyDown);
  document.addEventListener("fullscreenchange", handleFullscreenChange);
  return () => {
    window.removeEventListener("keydown", handleKeyDown);
    document.removeEventListener("fullscreenchange", handleFullscreenChange);
  };
}, [isFullscreenBuilder]);

const toggleFullscreenBuilder = () => {
  const next = !isFullscreenBuilder;
  setIsFullscreenBuilder(next);

  if (next && shellRef.current?.requestFullscreen) {
    void shellRef.current.requestFullscreen().catch(() => {});
  }

  if (!next && document.fullscreenElement) {
    void document.exitFullscreen().catch(() => {});
  }
};

const onSave = () => {};

const onPublish = () => {};

const isNodeLocked = (id: string): boolean => {
  if (!blueprint) return false;
  return !!blueprint.nodes[id]?.locked;
};

const onUpdateNode = (id: string, patch: Record<string, unknown>) => {
  const isUnlockOnly =
    patch.locked === false && Object.keys(patch).every((key) => key === "locked");
  if (isNodeLocked(id) && !isUnlockOnly) {
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

  const command = new DuplicateNodeCommand(id);
  commandBus.execute(command);
  const createdNodeId = command.getCreatedNodeId();
  if (createdNodeId) select(createdNodeId);
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
      return applyColumnStructureToBlueprint(
        currentBlueprint,
        targetId,
        widths,
        (parentId) => BlueprintFactory.createNode("column", parentId)
      );
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

  const command = new PasteElementCommand(id);
  commandBus.execute(command);
  const createdNodeId = command.getCreatedNodeId();
  if (createdNodeId) select(createdNodeId);
};

useEffect(() => {
  const onOperationShortcut = (event: KeyboardEvent) => {
    const target = event.target as HTMLElement | null;
    const isEditable = Boolean(
      target?.closest("input, textarea, select, [contenteditable='true'], [role='textbox']"),
    );
    if (isEditable) return;

    const modifier = event.metaKey || event.ctrlKey;
    const key = event.key.toLowerCase();
    if (modifier && key === "z") {
      event.preventDefault();
      event.shiftKey ? onRedo() : onUndo();
      return;
    }
    if (!selectedId) return;
    if (event.key === "Delete" || event.key === "Backspace") {
      event.preventDefault();
      onDeleteNode(selectedId);
    } else if (modifier && key === "d") {
      event.preventDefault();
      onDuplicateNode(selectedId);
    } else if (modifier && key === "c") {
      event.preventDefault();
      onCopyNode(selectedId);
    } else if (modifier && key === "v") {
      event.preventDefault();
      onPasteNode(selectedId);
    }
  };

  window.addEventListener("keydown", onOperationShortcut);
  return () => window.removeEventListener("keydown", onOperationShortcut);
}, [selectedId]);

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
  if (type === "section") {
    insertSectionStructure(blueprint.root, undefined, "BuilderShell add section");
    return;
  }
  const plan = buildNativeInsertionPlan(
    blueprint,
    type as any,
    parent,
    (nodeType, nodeParentId) => BlueprintFactory.createNode(nodeType, nodeParentId)
  );

  if (!plan) return;

  executeInsertionPlan("BuilderShell -> InsertNodeCommand", plan);
select(plan.selectNodeId);

if (type === "column") {
  setPendingColumnTargetId(plan.selectNodeId);
}
};

const insertSectionStructure = (
  pageId: string,
  index: number | undefined,
  commandName: string
) => {
  if (!blueprint || blueprint.nodes[pageId]?.type !== "page") return;
  const section = BlueprintFactory.createNode("section", pageId);
  const container = BlueprintFactory.createNode("container", section.id);
  const plan = {
    steps: [
      { parentId: pageId, node: section, index },
      { parentId: section.id, node: container },
    ],
    selectNodeId: container.id,
  };
  executeInsertionPlan(commandName, plan);
  select(container.id);
  setPendingColumnTargetId(container.id);
};

const onAddSectionAtPageBottom = () => {
  if (!blueprint) return;
  insertSectionStructure(
    blueprint.root,
    blueprint.nodes[blueprint.root]?.children.length,
    "BuilderShell bottom add section"
  );
};

const insertBlockAtDrop = (
  type: string,
  parentId: string,
  insertIndex?: number
) => {
  if (!blueprint || !blueprint.nodes[parentId] || isNodeLocked(parentId)) {
    return;
  }

  const plan = buildNativeInsertionPlan(
    blueprint,
    type as any,
    parentId,
    (nodeType, nodeParentId) => BlueprintFactory.createNode(nodeType, nodeParentId),
    insertIndex
  );

  if (!plan) return;

  executeInsertionPlan("BuilderShell drop -> InsertNodeCommand", plan);
select(plan.selectNodeId);

if (type === "column") {
  setPendingColumnTargetId(plan.selectNodeId);
}
};

const executeInsertionPlan = (
  name: string,
  plan: ReturnType<typeof buildNativeInsertionPlan>
) => {
  if (!plan) return;

  if (plan.steps.length === 1) {
    const step = plan.steps[0];
    commandBus.execute(new InsertNodeCommand(step.parentId, step.node, step.index));
    return;
  }

  commandBus.transaction(name, () => {
    for (const step of plan.steps) {
      commandBus.execute(new InsertNodeCommand(step.parentId, step.node, step.index));
    }
  });
};

const onRunAI = async (prompt: string, context?: Record<string, unknown> | null) => {
  if (!blueprint) {
    throw new Error("Builder is still loading. Please wait for the canvas before generating.");
  }
  try {
    await AiConversation.run({ pageId, prompt, context });

    const res = await fetch(`/api/builder-v2/blueprints/${pageId}`, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("AI generated the page, but the refreshed blueprint could not be loaded.");
    }

    const payload = await res.json();
    const nextBlueprint = normalizeBlueprintForBuilder(
      payload?.data?.blueprint,
      pageTitle || "Untitled"
    );

    if (!nextBlueprint) {
      throw new Error("AI generated the page, but no builder blueprint was returned.");
    }

    initializeBuilder(nextBlueprint);
    setCurrentSiteLayout(payload?.data?.siteLayout ?? payload?.siteLayout ?? currentSiteLayout);
    select(null);
  } catch (err) {
    console.error("[BuilderShell] AI run failed:", err);
    throw err;
  }
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
  message: useAiStore((s) => s.errorMessage) || undefined,
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
      dragSessionRef.current = { activeId: detail.id, cancelled: false, committed: false };
      setDndObservation({ activeId: detail.id, overId: "", intent: "", valid: false });
      document.body.classList.add("builder-dragging");
      setDragGhost(detail);
    };

    const onEnd = () => {
      setDndObservation({ activeId: "", overId: "", intent: "", valid: false });
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
    window.addEventListener("blur", onEnd);
    return () => {
      window.removeEventListener("builder:start-drag", onStart);
      window.removeEventListener("builder:end-drag", onEnd);
      window.removeEventListener("builder:reparent", onReparent);
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
        if (hit.closest(".builder-chrome")) return null;
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
      const edge = resolveNonOverlappingDropEdge(span);

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
        setDndObservation((current) => ({ ...current, overId: "", intent: "", valid: false }));
        window.dispatchEvent(new CustomEvent("builder:drop-clear"));
        return;
      }

      const computed = computeDrop(targetEl, e.clientX, e.clientY, dragType);
      if (!computed) {
        pendingDropRef.current = null;
        setDndObservation((current) => ({ ...current, overId: "", intent: "", valid: false }));
        window.dispatchEvent(new CustomEvent("builder:drop-clear"));
        return;
      }

      const overId = targetEl.getAttribute("data-node-id") ?? "";
      pendingDropRef.current = computed.drop
        ? { ...computed.drop, overId, pointerX: e.clientX, pointerY: e.clientY }
        : null;
      setDndObservation((current) => {
        const next = {
          activeId: dragId,
          overId,
          intent: computed.indicator.type,
          valid: Boolean(computed.drop),
        };
        return current.activeId === next.activeId &&
          current.overId === next.overId &&
          current.intent === next.intent &&
          current.valid === next.valid
          ? current
          : next;
      });
      window.dispatchEvent(
        new CustomEvent("builder:drop-intent", {
          detail: { ...computed.indicator, targetId: overId, valid: Boolean(computed.drop) },
        })
      );
      window.dispatchEvent(
        new CustomEvent("builder:drag-move", {
          detail: { x: e.clientX, y: e.clientY },
        })
      );
    };

    const onDropCapture = (e: DragEvent) => {
      e.preventDefault();

      const session = dragSessionRef.current;
      if (session.cancelled || session.committed || !session.activeId) {
        pendingDropRef.current = null;
        return;
      }

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

      const dragId = session.activeId;
      const dragType =
        payloadType ?? (((window as any).__builderDragType as string | null) ?? null);
      const dragSource =
        payloadSource ?? (((window as any).__builderDragSource as string | null) ?? null);
      if (payloadId && payloadId !== dragId) return;

      const drop = pendingDropRef.current;
      pendingDropRef.current = null;

      const eventTarget = e.target as HTMLElement | null;
      const draggedElement = document.querySelector(`[data-node-id='${dragId}']`);
      const overDraggedSubtree = Boolean(
        draggedElement &&
        document.elementsFromPoint(e.clientX, e.clientY).some((hit) =>
          hit === draggedElement || draggedElement.contains(hit)
        )
      );
      const currentTarget = findTargetNodeElement(e.clientX, e.clientY, dragId);
      const currentOverId = currentTarget?.getAttribute("data-node-id") ?? null;
      const currentComputed = currentTarget
        ? computeDrop(currentTarget, e.clientX, e.clientY, dragType)
        : null;
      const finalValid = canCommitDrop({
        activeId: session.activeId,
        payloadId,
        cancelled: session.cancelled,
        committed: session.committed,
        overChrome: Boolean(eventTarget?.closest(".builder-chrome")),
        overDraggedSubtree,
        pendingOverId: drop?.overId ?? null,
        currentOverId,
        pendingIntent: drop?.intent ?? null,
        currentIntent: currentComputed?.drop?.intent ?? null,
        pendingParentId: drop?.targetParentId ?? null,
        currentParentId: currentComputed?.drop?.targetParentId ?? null,
      });

      window.dispatchEvent(new CustomEvent("builder:drop-clear"));
      window.dispatchEvent(new CustomEvent("builder:end-drag"));

      if (!drop || !finalValid) return;
      dragSessionRef.current.committed = true;

      window.dispatchEvent(new CustomEvent("builder:drop-commit", {
        detail: {
          dragId,
          targetParentId: drop.targetParentId,
          targetIndex: drop.targetIndex,
          referenceNodeId: drop.referenceNodeId,
          intent: drop.intent,
        },
      }));

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
      if (!dragSessionRef.current.committed) dragSessionRef.current.cancelled = true;
      dragSessionRef.current.activeId = null;
      pendingDropRef.current = null;
      window.dispatchEvent(new CustomEvent("builder:drop-clear"));
    };

    const onNativeStartCapture = () => {
      dragSessionRef.current = {
        activeId: ((window as any).__builderDragId as string | null) ?? null,
        cancelled: false,
        committed: false,
      };
    };

    const onCancelCapture = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      dragSessionRef.current.cancelled = true;
      dragSessionRef.current.activeId = null;
      pendingDropRef.current = null;
      (window as any).__builderDragId = null;
      (window as any).__builderDragType = null;
      (window as any).__builderDragSource = null;
      window.dispatchEvent(new CustomEvent("builder:drop-clear"));
      window.dispatchEvent(new CustomEvent("builder:end-drag"));
    };

    window.addEventListener("dragstart", onNativeStartCapture, true);
    window.addEventListener("dragover", onDragOverCapture, true);
    window.addEventListener("drop", onDropCapture, true);
    window.addEventListener("dragend", onEndCapture, true);
    window.addEventListener("keydown", onCancelCapture, true);

    return () => {
      window.removeEventListener("dragstart", onNativeStartCapture, true);
      window.removeEventListener("dragover", onDragOverCapture, true);
      window.removeEventListener("drop", onDropCapture, true);
      window.removeEventListener("dragend", onEndCapture, true);
      window.removeEventListener("keydown", onCancelCapture, true);
    };
  }, [blueprint]);

const fixedDeviceWidth =
  device === "mobile"
    ? RESPONSIVE_BREAKPOINTS.mobile
    : device === "tablet"
      ? RESPONSIVE_BREAKPOINTS.tablet
      : null;

const canvasScale = zoom / 100;
const canvasWidth = fixedDeviceWidth ?? RESPONSIVE_BREAKPOINTS.desktop;
const rightChromeWidth =
  fullscreenState.sidebarsCollapsed || isInspectorCollapsed
    ? 0
    : INSPECTOR_WIDTH;
const canvasChromeLeftInset =
  fullscreenState.sidebarsCollapsed ? 0 : leftChromeWidth;
const canvasChromeRightInset =
  fullscreenState.sidebarsCollapsed ? 0 : rightChromeWidth;
const measuredCanvasWidth = Math.max(canvasWidth, canvasContentWidth);
const scaledCanvasWidth = measuredCanvasWidth * canvasScale;
const scaledCanvasHeight = canvasContentHeight * canvasScale;
const canvasScrollWidth =
  canvasChromeLeftInset + scaledCanvasWidth + canvasChromeRightInset + CANVAS_EDGE_GUTTER * 2;
const canvasScrollHeight = Math.max(scaledCanvasHeight + CANVAS_EDGE_GUTTER * 2, 0);
const canvasVisibleLaneOffset =
  canvasChromeLeftInset + canvasChromeRightInset;

useEffect(() => {
  const canvas = canvasSandboxRef.current;
  if (!canvas) return;

  const measure = () => {
    setCanvasContentWidth(canvas.scrollWidth);
    setCanvasContentHeight(canvas.scrollHeight);
  };
  measure();
  const frame = window.requestAnimationFrame(measure);
  const observer = new ResizeObserver(measure);
  observer.observe(canvas);
  return () => {
    window.cancelAnimationFrame(frame);
    observer.disconnect();
  };
}, [blueprint, device]);

useEffect(() => {
  const viewport = canvasViewportRef.current;
  if (!viewport) return;
  const onWheel = (event: WheelEvent) => {
    if (!event.shiftKey || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
    event.preventDefault();
    viewport.scrollLeft += event.deltaY;
  };
  viewport.addEventListener("wheel", onWheel, { passive: false });
  return () => {
    viewport.removeEventListener("wheel", onWheel);
  };
}, []);

  /* ============================================================
     GUARD CHECKS (AFTER ALL HOOKS)
  ============================================================ */
  if (!isBuilderBlueprint(blueprint) || !blueprint.nodes[blueprint.root]) {
    return null;
  }
  const selectedNode = selectedId ? blueprint.nodes[selectedId] : null;
  const responsiveVisibility =
    selectedNode?.props?.__responsiveVisibility as
      | Partial<Record<"desktop" | "tablet" | "mobile", boolean>>
      | undefined;
  const isVisibleOnCurrentDevice = responsiveVisibility?.[device] !== false;

  return (
    <>
    <div
      ref={shellRef}
      data-testid="builder-shell"
      data-dnd-active-id={dndObservation.activeId}
      data-dnd-over-id={dndObservation.overId}
      data-dnd-intent={dndObservation.intent}
      data-dnd-valid={dndObservation.valid ? "true" : "false"}
      data-builder-fullscreen={fullscreenState.enabled ? "true" : "false"}
      data-builder-focus-mode={fullscreenState.focusMode ? "true" : "false"}
      className="builder-shell h-screen w-full bg-[var(--dashboard-bg)] text-[var(--dashboard-text)] dark:bg-[#0F1118] dark:text-white overflow-hidden"
    >
      {/* HEADER */}
      {!fullscreenState.focusMode && (
        <div
          className="fixed top-0 left-0 right-0 z-[10000]"
          style={{ height: HEADER_HEIGHT }}
        >
          <BuilderHeader
            pageId={pageId}
            pageStatus={pageStatus}
            pageTitle={pageTitle}
            isFullscreenBuilder={isFullscreenBuilder}
onToggleFullscreenBuilder={toggleFullscreenBuilder}
          />
        </div>
      )}

      {/* BODY */}
        <div
  className="relative w-full overflow-hidden"
  style={{
    marginTop: fullscreenState.focusMode ? 0 : HEADER_HEIGHT,
    height: fullscreenState.focusMode
      ? "100vh"
      : `calc(100vh - ${HEADER_HEIGHT}px)`,
  }}
>
        {!fullscreenState.sidebarsCollapsed && (
  <div className="absolute inset-y-0 left-0 z-[100]">
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
      onChromeWidthChange={setLeftChromeWidth}
    />
  </div>
)}

        {/* CANVAS */}
<main
  className={`builder-canvas-main absolute inset-0 ${
    isDarkMode ? "bg-[#1E1F22]" : "bg-[#0F1118]"
  }`}
>
  <div
    ref={canvasViewportRef}
    className="relative h-full w-full overflow-scroll overscroll-contain"
    style={{ scrollbarGutter: "stable" }}
    data-builder-canvas-scroll="true"
  >
    <div
      className="relative min-h-full p-6"
      style={{
        minWidth: `max(100%, ${canvasScrollWidth}px)`,
        minHeight: `${canvasScrollHeight}px`,
      }}
    >
      <div
        className="relative flex shrink-0 justify-center"
        style={{
          marginLeft: `${canvasChromeLeftInset}px`,
          marginRight: `${canvasChromeRightInset}px`,
          width: `calc(100% - ${canvasVisibleLaneOffset}px)`,
          minWidth: `${scaledCanvasWidth}px`,
          height: canvasContentHeight ? `${scaledCanvasHeight}px` : undefined,
        }}
      >
        <div
          className="relative shrink-0"
          style={{
            width: `${scaledCanvasWidth}px`,
            height: canvasContentHeight ? `${scaledCanvasHeight}px` : undefined,
          }}
        >
          <div
            ref={canvasSandboxRef}
            className="relative builder-canvas-sandbox"
            style={{
              width: `${canvasWidth}px`,
              minWidth: `${canvasWidth}px`,
              maxWidth: `${canvasWidth}px`,
              transform: `scale(${canvasScale})`,
              transformOrigin: "top left",
            }}
          >
            <BuilderCanvas
              blueprint={blueprint}
              siteLayout={currentSiteLayout}
              onCanvasClick={onCanvasClick}
              onAddSection={onAddSectionAtPageBottom}
              onResizeNode={(nodeId, width, height) => {
                const target = blueprint.nodes[nodeId];

                if (
                  !target ||
                  target.type === "page" ||
                  isNodeLocked(nodeId)
                ) {
                  return;
                }

                onUpdateNode(nodeId, {
                  style: {
                    ...target.style,
                    width: setResponsiveOverride(
                      target.style?.width,
                      device,
                      `${width}px`
                    ),
                    height: setResponsiveOverride(
                      target.style?.height,
                      device,
                      `${height}px`
                    ),
                  },
                });
              }}
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
                onToggleVisibility: () => selectedId && onToggleNodeVisibility(selectedId),
                onToggleLock: () => selectedId && onToggleNodeLock(selectedId),
                onOpenNavigator,
                onOpenSettings,
                onAI: () => window.dispatchEvent(new CustomEvent("builder:open-panel", { detail: { panel: "ai" } })),
                onToggleResponsiveVisibility: () => selectedId && onToggleResponsiveVisibility(selectedId),
                isHidden: !!selectedNode?.hidden,
                isLocked: !!selectedNode?.locked,
                isResponsiveVisible: isVisibleOnCurrentDevice,
                currentDevice: device,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</main>

        {/* INSPECTOR */}
{!fullscreenState.sidebarsCollapsed && (
  <aside
    className="absolute inset-y-0 right-0 z-[110] overflow-visible border-l border-white/10 bg-[rgb(15_17_24/82%)] backdrop-blur-2xl shadow-2xl shadow-black/50"
    style={{
      width: isInspectorCollapsed ? 0 : INSPECTOR_WIDTH,
      pointerEvents: isInspectorCollapsed ? "none" : "auto",
    }}
  >
    {!isInspectorCollapsed && (
      <div className="h-full overflow-hidden backdrop-blur-2xl">
        <InspectorPanel
          selectedId={selectedId}
          blueprint={blueprint}
          onUpdateNode={onUpdateNode}
          onApplyColumnStructure={onApplyColumnStructure}
          siteId={siteId}
        />
      </div>
    )}

    <div
      className="pointer-events-auto"
      style={{
        position: "absolute",
        top: "50%",
        left: isInspectorCollapsed ? -24 : -12,
        transform: "translateY(-50%)",
      }}
    >
      <CollapseButton
        isCollapsed={isInspectorCollapsed}
        onClick={() => setIsInspectorCollapsed((current) => !current)}
      />
    </div>
  </aside>
)}
      </div>

      {dragGhost && <DragGhost drag={dragGhost} />}
      <DropZoneIndicator />

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
          text-decoration: none;
        }

        .builder-canvas-sandbox button,
        .builder-canvas-sandbox input,
        .builder-canvas-sandbox textarea,
        .builder-canvas-sandbox select {
          font: inherit;
        }

        .builder-canvas-sandbox button {
          cursor: pointer;
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

        @keyframes builder-rotate-in {
          from { opacity: 0; transform: rotate(-4deg) scale(.98); }
          to { opacity: 1; transform: rotate(0) scale(1); }
        }

        @keyframes builder-blur-in {
          from { opacity: 0; filter: blur(14px); }
          to { opacity: 1; filter: blur(0); }
        }

        @keyframes builder-soft-reveal {
          from { opacity: 0; clip-path: inset(0 0 100% 0); transform: translateY(12px); }
          to { opacity: 1; clip-path: inset(0); transform: translateY(0); }
        }

        @keyframes builder-zoom-in {
          from { opacity: 0; transform: scale(.9); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes builder-luxury-in {
          from { opacity: 0; transform: translateY(32px); filter: blur(8px); }
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }

        @media (prefers-reduced-motion: reduce) {
          .builder-node { animation: none !important; transition: none !important; }
        }
      `}</style>
    </div>
    <ColumnStructurePicker
      open={Boolean(pendingColumnTargetId)}
      onClose={() => setPendingColumnTargetId(null)}
      onSelect={(columns) => {
        if (!pendingColumnTargetId) return;

        const widths = Array.isArray(columns)
          ? columns
          : Array.from({ length: columns }, () => 100 / columns);

        onApplyColumnStructure(pendingColumnTargetId, widths);
        setPendingColumnTargetId(null);
      }}
    />
    </>
  );
}
