"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Box,
  ClipboardPaste,
  Columns,
  Copy,
  Eye,
  EyeOff,
  GripVertical,
  Heading,
  Image as LucideImage,
  Layers,
  Lock,
  MoreHorizontal,
  Minus,
  Monitor,
  Plus,
  Smartphone,
  Square,
  Star,
  Tablet,
  Text,
  Trash2,
  Unlock,
  Video,
} from "lucide-react";
import type { Device } from "../store/useCanvasStore";

type ToolbarPosition = {
  top: number;
  left: number;
  placement: "top" | "bottom";
};

export interface SelectionToolbarProps {
  selectedId: string | null;
  selectedType?: string;
  isRoot: boolean;
  onAdd(type: string): void;
  onDuplicate(): void;
  onDelete(): void;
  onMoveUp(): void;
  onMoveDown(): void;
  onWrap?(): void;
  onCopy?(): void;
  onPaste?(): void;
  canPaste?: boolean;
  onToggleVisibility?(): void;
  onToggleLock?(): void;
  onOpenNavigator?(): void;
  onOpenSettings?(): void;
  onToggleResponsiveVisibility?(): void;
  isHidden?: boolean;
  isLocked?: boolean;
  isResponsiveVisible?: boolean;
  currentDevice?: Device;
}

const TOOLBAR_HEIGHT = 48;
const DEFAULT_TOOLBAR_WIDTH = 360;
const GAP = 16;

function getTransparentDragImage(): HTMLImageElement {
  const key = "__builder_drag_image__";
  const existing = (window as any)[key] as HTMLImageElement | undefined;
  if (existing) {
    return existing;
  }

  const img = new Image();
  img.src =
    "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
  (window as any)[key] = img;
  return img;
}

export default function SelectionToolbar({
  selectedId,
  selectedType,
  isRoot,
  onAdd,
  onDuplicate,
  onDelete,
  onMoveUp,
  onMoveDown,
  onWrap,
  onCopy,
  onPaste,
  canPaste,
  onToggleVisibility,
  onToggleLock,
  onOpenNavigator,
  onToggleResponsiveVisibility,
  isHidden,
  isLocked,
  isResponsiveVisible,
  currentDevice,
}: SelectionToolbarProps) {
  const [position, setPosition] = useState<ToolbarPosition | null>(null);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [toolbarWidth, setToolbarWidth] = useState(DEFAULT_TOOLBAR_WIDTH);
  const [canvasWidth, setCanvasWidth] = useState(0);
  const [quickAddOffsetLeft, setQuickAddOffsetLeft] = useState(0);
  const [ready, setReady] = useState(false);
  const toolbarRef = useRef<HTMLDivElement | null>(null);
  const quickAddRef = useRef<HTMLDivElement | null>(null);
  const moreMenuRef = useRef<HTMLDivElement | null>(null);

  const quickAddItems = useMemo(
    () => [
      { type: "container", label: "Container", icon: Box },
      { type: "column", label: "Column", icon: Columns },
      { type: "heading", label: "Heading", icon: Heading },
      { type: "text", label: "Text", icon: Text },
      { type: "button", label: "Button", icon: Square },
      { type: "image", label: "Image", icon: LucideImage },
      { type: "video", label: "Video", icon: Video },
      { type: "icon", label: "Icon", icon: Star },
      { type: "divider", label: "Divider", icon: Minus },
      { type: "spacer", label: "Spacer", icon: Columns },
    ],
    []
  );

  useEffect(() => {
    const measure = () => {
      const nextWidth = toolbarRef.current?.offsetWidth ?? DEFAULT_TOOLBAR_WIDTH;
      setToolbarWidth(nextWidth);
    };

    measure();
    const rafId = window.requestAnimationFrame(measure);
    window.addEventListener("resize", measure);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", measure);
    };
  }, [selectedId, showQuickAdd]);

  useEffect(() => {
    if (!position) {
      setReady(false);
      return;
    }

    setReady(false);
    const id = window.requestAnimationFrame(() => {
      setReady(true);
    });

    return () => window.cancelAnimationFrame(id);
  }, [position?.top, position?.left, position?.placement]);

  useEffect(() => {
    if (!showQuickAdd || !position) {
      setQuickAddOffsetLeft(0);
      return;
    }

    const menuWidth = quickAddRef.current?.offsetWidth ?? 224;
    const SAFE_MARGIN = 12;
    const width = Math.max(canvasWidth, toolbarWidth + SAFE_MARGIN * 2);

    const desiredCanvasLeft =
      position.left + toolbarWidth / 2 - menuWidth / 2;
    const clampedCanvasLeft = Math.max(
      SAFE_MARGIN,
      Math.min(width - menuWidth - SAFE_MARGIN, desiredCanvasLeft)
    );

    setQuickAddOffsetLeft(clampedCanvasLeft - position.left);
  }, [showQuickAdd, position, toolbarWidth, canvasWidth]);

  useEffect(() => {
    const computePosition = () => {
      if (!selectedId || isRoot) {
        setPosition(null);
        return;
      }

      const canvasRoot = document.querySelector(
        ".builder-canvas-sandbox"
      ) as HTMLElement | null;

      const el = canvasRoot?.querySelector(
        `[data-node-id="${selectedId}"]`
      ) as HTMLElement | null;

      if (!el) {
        setPosition(null);
        return;
      }

      const canvasRect = canvasRoot?.getBoundingClientRect();
      const SAFE_MARGIN = 12;
      const canvasWidth = canvasRect?.width ?? window.innerWidth;
      const canvasHeight = canvasRect?.height ?? window.innerHeight;
      setCanvasWidth(canvasWidth);
      const leftBoundary = SAFE_MARGIN;
      const rightBoundary = canvasWidth - SAFE_MARGIN;
      const topBoundary = SAFE_MARGIN;
      const bottomBoundary = canvasHeight - SAFE_MARGIN;
      const rect = el.getBoundingClientRect();

      // Center toolbar over element
      let left =
        rect.left - (canvasRect?.left ?? 0) + rect.width / 2 - toolbarWidth / 2;
      const maxLeft = Math.max(leftBoundary, rightBoundary - toolbarWidth);
      left = Math.max(
        leftBoundary,
        Math.min(maxLeft, left)
      );

      // Prefer above the element
      let top = rect.top - (canvasRect?.top ?? 0) - TOOLBAR_HEIGHT - GAP;
      let placement: "top" | "bottom" = "top";

      // If it would go under the header, show below instead
      if (top < topBoundary) {
        top = rect.bottom - (canvasRect?.top ?? 0) + GAP;
        placement = "bottom";
      }

      // Prevent it from leaving the canvas at the bottom
      const maxTop = Math.max(topBoundary, bottomBoundary - TOOLBAR_HEIGHT);
      top = Math.max(topBoundary, Math.min(maxTop, top));

      setPosition({
        top,
        left,
        placement,
      });

    };

    computePosition();
    const rafId = window.requestAnimationFrame(computePosition);

    const recomputeAfterDrop = () => {
      window.requestAnimationFrame(() => {
        computePosition();
        // Recompute again after layout settles from command updates.
        window.setTimeout(computePosition, 0);
      });
    };

    window.addEventListener("resize", computePosition);
    window.addEventListener("scroll", computePosition, true);
    window.addEventListener("builder:end-drag", recomputeAfterDrop);
    window.addEventListener("builder:reparent", recomputeAfterDrop);
    window.addEventListener("drop", recomputeAfterDrop);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", computePosition);
      window.removeEventListener("scroll", computePosition, true);
      window.removeEventListener("builder:end-drag", recomputeAfterDrop);
      window.removeEventListener("builder:reparent", recomputeAfterDrop);
      window.removeEventListener("drop", recomputeAfterDrop);
    };
  }, [selectedId, isRoot, toolbarWidth]);

  useEffect(() => {
    setShowQuickAdd(false);
    setShowMoreMenu(false);
  }, [selectedId]);

  useEffect(() => {
    if (!showMoreMenu) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (moreMenuRef.current?.contains(target ?? null)) {
        return;
      }

      setShowMoreMenu(false);
    };

    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [showMoreMenu]);

  useEffect(() => {
    const onStart = () => {
      setIsDragging(true);
      setShowQuickAdd(false);
      setShowMoreMenu(false);
    };
    const onEnd = () => {
      setIsDragging(false);
    };
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onEnd();
      }
    };
    const onVisibility = () => {
      if (document.visibilityState !== "visible") {
        onEnd();
      }
    };

    window.addEventListener("builder:start-drag", onStart);
    window.addEventListener("builder:end-drag", onEnd);
    window.addEventListener("mouseup", onEnd);
    window.addEventListener("pointerup", onEnd);
    window.addEventListener("dragend", onEnd);
    window.addEventListener("drop", onEnd);
    window.addEventListener("blur", onEnd);
    window.addEventListener("keydown", onEscape);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("builder:start-drag", onStart);
      window.removeEventListener("builder:end-drag", onEnd);
      window.removeEventListener("mouseup", onEnd);
      window.removeEventListener("pointerup", onEnd);
      window.removeEventListener("dragend", onEnd);
      window.removeEventListener("drop", onEnd);
      window.removeEventListener("blur", onEnd);
      window.removeEventListener("keydown", onEscape);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  useEffect(() => {
    setIsDragging(false);
  }, [selectedId]);

  if (!selectedId || isRoot || !position) {
    return null;
  }

  const elementLocked = !!isLocked;
  const VisibilityIcon = isHidden ? EyeOff : Eye;
  const LockIcon = elementLocked ? Lock : Unlock;
  const ResponsiveIcon =
    currentDevice === "mobile"
      ? Smartphone
      : currentDevice === "tablet"
        ? Tablet
        : Monitor;

  const actionClass = (disabled = false, danger = false) =>
    `h-8 w-8 rounded-full transition flex items-center justify-center ${
      disabled
        ? "opacity-50 cursor-not-allowed"
        : danger
          ? "bg-red-500/20 hover:bg-red-500/30 text-red-200"
          : "hover:bg-white/10"
    }`;

  return (
    <div
      className="absolute z-[10020] pointer-events-auto"
      style={{
        top: position.top,
        left: position.left,
        opacity: ready ? (isDragging ? 0.35 : 1) : 0,
        transform: `translateY(${ready ? 0 : position.placement === "top" ? -6 : 6}px) scale(${ready ? (isDragging ? 0.98 : 1) : 0.97})`,
        transition: "opacity 140ms ease, transform 140ms ease",
      }}
    >
      <div
        ref={toolbarRef}
        className="relative flex items-center gap-1 rounded-full bg-[#0A0B0F]/95 text-white border border-white/15 backdrop-blur-xl px-2 py-1.5 shadow-2xl"
      >
        {/* Primary 7 actions */}
        <button
          type="button"
          draggable={!elementLocked}
          onDragStart={(e) => {
            if (!selectedId || elementLocked) {
              e.preventDefault();
              return;
            }

            (window as any).__builderDragId = selectedId;
            (window as any).__builderDragType = selectedType ?? "block";
            e.stopPropagation();
            e.dataTransfer.effectAllowed = "move";
            e.dataTransfer.setDragImage(getTransparentDragImage(), 0, 0);
            e.dataTransfer.setData(
              "application/json",
              JSON.stringify({
                nodeId: selectedId,
                type: selectedType ?? "block",
              })
            );
            e.dataTransfer.setData("text/plain", selectedId);

            window.dispatchEvent(
              new CustomEvent("builder:start-drag", {
                detail: {
                  id: selectedId,
                  type: selectedType ?? "block",
                  source: "toolbar",
                  x: e.clientX,
                  y: e.clientY,
                },
              })
            );
          }}
          onDragEnd={() => {
            (window as any).__builderDragId = null;
            (window as any).__builderDragType = null;
            window.dispatchEvent(new CustomEvent("builder:drop-clear"));
            window.dispatchEvent(new CustomEvent("builder:end-drag"));
          }}
          className={actionClass(elementLocked)}
          title={elementLocked ? "Element is locked" : "Move handle"}
          disabled={elementLocked}
        >
          <GripVertical size={14} />
        </button>

        <button
          type="button"
          onClick={() => {
            setShowMoreMenu(false);
            setShowQuickAdd((v) => !v);
          }}
          className={actionClass(elementLocked)}
          title="Add element"
          disabled={elementLocked}
        >
          <Plus size={14} />
        </button>

        <button
          type="button"
          onClick={onMoveUp}
          disabled={elementLocked}
          className={actionClass(elementLocked)}
          title="Move up"
        >
          <ArrowUp size={14} />
        </button>

        <button
          type="button"
          onClick={onMoveDown}
          disabled={elementLocked}
          className={actionClass(elementLocked)}
          title="Move down"
        >
          <ArrowDown size={14} />
        </button>

        <button
          type="button"
          onClick={onDuplicate}
          className={actionClass(elementLocked)}
          title="Duplicate element"
          disabled={elementLocked}
        >
          <Copy size={14} />
        </button>

        <button
          type="button"
          onClick={onDelete}
          className={actionClass(elementLocked, true)}
          title="Delete element"
          disabled={elementLocked}
        >
          <Trash2 size={14} />
        </button>

        {/* Overflow menu */}
        <div ref={moreMenuRef} className="relative">
          <button
            type="button"
            onClick={() => {
              setShowQuickAdd(false);
              setShowMoreMenu((v) => !v);
            }}
            className={actionClass(false)}
            title="More actions"
          >
            <MoreHorizontal size={14} />
          </button>

          {showMoreMenu && (
            <div
              className="absolute top-full right-0 mt-2 min-w-52 rounded-xl border border-white/10 bg-black/95 p-2 shadow-2xl"
            >
              <div className="text-[10px] uppercase tracking-wide text-white/60 px-2 pb-2 font-semibold">
                More actions
              </div>

              <div className="grid grid-cols-1 gap-1">
                {onCopy && (
                  <button
                    type="button"
                    onClick={() => {
                      onCopy();
                      setShowMoreMenu(false);
                    }}
                    disabled={elementLocked}
                    className="px-2 py-2 text-xs rounded-md text-left bg-white/5 hover:bg-white/15 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Copy size={14} />
                    <span>Copy style</span>
                  </button>
                )}

                {onPaste && (
                  <button
                    type="button"
                    onClick={() => {
                      onPaste();
                      setShowMoreMenu(false);
                    }}
                    disabled={!canPaste || elementLocked}
                    className="px-2 py-2 text-xs rounded-md text-left bg-white/5 hover:bg-white/15 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ClipboardPaste size={14} />
                    <span>Paste style</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    onToggleVisibility?.();
                    setShowMoreMenu(false);
                  }}
                  className="px-2 py-2 text-xs rounded-md text-left bg-white/5 hover:bg-white/15 transition flex items-center gap-2"
                >
                  <VisibilityIcon size={14} />
                  <span>{isHidden ? "Show element" : "Hide element"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onToggleLock?.();
                    setShowMoreMenu(false);
                  }}
                  className="px-2 py-2 text-xs rounded-md text-left bg-white/5 hover:bg-white/15 transition flex items-center gap-2"
                >
                  <LockIcon size={14} />
                  <span>{elementLocked ? "Unlock" : "Lock"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onOpenNavigator?.();
                    setShowMoreMenu(false);
                  }}
                  className="px-2 py-2 text-xs rounded-md text-left bg-white/5 hover:bg-white/15 transition flex items-center gap-2"
                >
                  <Layers size={14} />
                  <span>Navigator</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onToggleResponsiveVisibility?.();
                    setShowMoreMenu(false);
                  }}
                  className="px-2 py-2 text-xs rounded-md text-left bg-white/5 hover:bg-white/15 transition flex items-center gap-2"
                >
                  <ResponsiveIcon
                    size={14}
                    className={isResponsiveVisible === false ? "text-red-300" : undefined}
                  />
                  <span>Responsive visibility ({currentDevice ?? "desktop"})</span>
                </button>

                {onWrap && (
                  <button
                    type="button"
                    onClick={() => {
                      onWrap();
                      setShowMoreMenu(false);
                    }}
                    disabled={elementLocked}
                    className="px-2 py-2 text-xs rounded-md text-left bg-white/5 hover:bg-white/15 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Box size={14} />
                    <span>Wrap in container</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Quick Add Menu */}
        {showQuickAdd && (
          <div
            ref={quickAddRef}
            className="absolute top-full mt-2 min-w-56 rounded-xl border border-white/10 bg-black/95 p-2 shadow-2xl"
            style={{ left: quickAddOffsetLeft }}
          >
            <div className="text-[10px] uppercase tracking-wide text-white/60 px-2 pb-2 font-semibold">
              Insert element
            </div>
            <div className="grid grid-cols-2 gap-1">
              {quickAddItems.map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => {
                    onAdd(item.type);
                    setShowQuickAdd(false);
                  }}
                  disabled={elementLocked}
                  className="px-2 py-2 text-xs rounded-md text-left bg-white/5 hover:bg-white/15 transition flex items-center gap-2"
                >
                  <item.icon size={14} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
