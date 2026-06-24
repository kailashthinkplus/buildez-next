"use client";

import { useEffect, useMemo, useState } from "react";
import Icon from "../components/Icon";

type ToolbarPosition = {
  top: number;
  left: number;
  placement: "top" | "bottom";
};

interface SelectionToolbarProps {
  selectedId: string | null;
  isRoot: boolean;
  onAdd(type: string): void;
  onDuplicate(): void;
  onDelete(): void;
  onMoveUp(): void;
  onMoveDown(): void;
  onWrap?(): void;
  onCopyStyle?(): void;
  onPasteStyle?(): void;
  canPasteStyle?: boolean;
}

const TOOLBAR_HEIGHT = 48;
const TOOLBAR_WIDTH = 420;
const GAP = 16;

export default function SelectionToolbar({
  selectedId,
  isRoot,
  onAdd,
  onDuplicate,
  onDelete,
  onMoveUp,
  onMoveDown,
  onWrap,
  onCopyStyle,
  onPasteStyle,
  canPasteStyle,
}: SelectionToolbarProps) {
  const [position, setPosition] = useState<ToolbarPosition | null>(null);
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  const quickAddItems = useMemo(
    () => [
      { type: "container", label: "Container", icon: "wrap" as const },
      { type: "column", label: "Column", icon: "layout-vertical" as const },
      { type: "heading", label: "Heading", icon: "type" as const },
      { type: "text", label: "Text", icon: "type" as const },
      { type: "button", label: "Button", icon: "settings" as const },
      { type: "image", label: "Image", icon: "image" as const },
      { type: "video", label: "Video", icon: "video" as const },
      { type: "icon", label: "Icon", icon: "icon" as const },
      { type: "divider", label: "Divider", icon: "layout-horizontal" as const },
      { type: "spacer", label: "Spacer", icon: "layout-vertical" as const },
    ],
    []
  );

  useEffect(() => {
    const computePosition = () => {
      if (!selectedId || isRoot) {
        setPosition(null);
        return;
      }

      const el = document.querySelector(
        `[data-node-id="${selectedId}"]`
      ) as HTMLElement | null;

      if (!el) {
        setPosition(null);
        return;
      }

      const rect = el.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // Center horizontally on the element
      const left = Math.max(
        12,
        Math.min(
          window.innerWidth - TOOLBAR_WIDTH - 12,
          rect.left + rect.width / 2 - TOOLBAR_WIDTH / 2
        )
      );

      // Smart vertical positioning: prefer top, fallback to bottom
      let top: number;
      let placement: "top" | "bottom" = "top";

      const spaceAbove = rect.top - GAP - TOOLBAR_HEIGHT;
      const spaceBelow = viewportHeight - (rect.bottom + GAP + TOOLBAR_HEIGHT);

      if (spaceAbove > 0) {
        // Enough space above - show above
        top = rect.top - GAP - TOOLBAR_HEIGHT;
        placement = "top";
      } else if (spaceBelow > 0) {
        // Enough space below - show below
        top = rect.bottom + GAP;
        placement = "bottom";
      } else {
        // Not enough space anywhere, show above anyway
        top = Math.max(12, rect.top - GAP - TOOLBAR_HEIGHT);
        placement = "top";
      }

      setPosition({ top, left, placement });
    };

    computePosition();

    window.addEventListener("resize", computePosition);
    window.addEventListener("scroll", computePosition, true);
    window.addEventListener("mousemove", computePosition, true);

    return () => {
      window.removeEventListener("resize", computePosition);
      window.removeEventListener("scroll", computePosition, true);
      window.removeEventListener("mousemove", computePosition, true);
    };
  }, [selectedId, isRoot]);

  useEffect(() => {
    setShowQuickAdd(false);
  }, [selectedId]);

  if (!selectedId || isRoot || !position) {
    return null;
  }

  return (
    <div
      className="fixed z-[10020]"
      style={{ top: position.top, left: position.left }}
    >
      <div className="relative flex items-center gap-2 rounded-xl bg-black/95 text-white border border-white/15 backdrop-blur-md p-2 shadow-2xl">
        {/* Add */}
        <button
          type="button"
          onClick={() => setShowQuickAdd((v) => !v)}
          className="p-2 rounded-md bg-blue-500/20 hover:bg-blue-500/30 transition flex items-center gap-1 text-sm"
          title="Add nested element"
        >
          <Icon name="add" size={16} />
          <span>Add</span>
        </button>

        <div className="w-px h-6 bg-white/20" />

        {/* Move Controls */}
        <button
          type="button"
          onClick={onMoveUp}
          className="p-2 rounded-md hover:bg-white/10 transition"
          title="Move up"
        >
          <Icon name="up" size={16} />
        </button>

        <button
          type="button"
          onClick={onMoveDown}
          className="p-2 rounded-md hover:bg-white/10 transition"
          title="Move down"
        >
          <Icon name="down" size={16} />
        </button>

        <div className="w-px h-6 bg-white/20" />

        {/* Duplicate */}
        <button
          type="button"
          onClick={onDuplicate}
          className="p-2 rounded-md hover:bg-white/10 transition"
          title="Duplicate"
        >
          <Icon name="duplicate" size={16} />
        </button>

        {/* Wrap */}
        {onWrap && (
          <button
            type="button"
            onClick={onWrap}
            className="p-2 rounded-md hover:bg-white/10 transition"
            title="Wrap in container"
          >
            <Icon name="wrap" size={16} />
          </button>
        )}

        {/* Copy Style */}
        {onCopyStyle && (
          <button
            type="button"
            onClick={onCopyStyle}
            className="p-2 rounded-md hover:bg-white/10 transition"
            title="Copy style"
          >
            <Icon name="copy" size={16} />
          </button>
        )}

        {/* Paste Style */}
        {onPasteStyle && (
          <button
            type="button"
            onClick={onPasteStyle}
            disabled={!canPasteStyle}
            className={`p-2 rounded-md transition ${
              canPasteStyle
                ? "hover:bg-white/10"
                : "opacity-50 cursor-not-allowed"
            }`}
            title="Paste style"
          >
            <Icon name="paste" size={16} />
          </button>
        )}

        {/* Delete */}
        <div className="w-px h-6 bg-white/20" />

        <button
          type="button"
          onClick={onDelete}
          className="p-2 rounded-md bg-red-500/20 hover:bg-red-500/30 text-red-200 transition"
          title="Delete element"
        >
          <Icon name="delete" size={16} />
        </button>

        {/* Quick Add Menu */}
        {showQuickAdd && (
          <div
            className={`absolute ${
              position.placement === "top" ? "bottom-full mb-2" : "top-full mt-2"
            } left-0 min-w-56 rounded-lg border border-white/10 bg-black/95 p-2 shadow-2xl`}
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
                  className="px-2 py-2 text-xs rounded-md text-left bg-white/5 hover:bg-white/15 transition flex items-center gap-2"
                >
                  <Icon name={item.icon} size={14} />
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
