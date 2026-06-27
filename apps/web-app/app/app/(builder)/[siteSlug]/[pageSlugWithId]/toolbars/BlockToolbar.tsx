"use client";

import {
  GripVertical,
  Copy,
  Settings,
  Sparkles,
  Trash,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

interface BlockToolbarProps {
  /** Stable blueprint node id */
  id: string;

  /** Display label */
  label: string;

  /** Render toolbar only when selected */
  isSelected: boolean;

  /** Core actions */
  onDuplicate(): void;
  onDelete(): void;
  onSettings(): void;
  onAI(): void;

  /** Reorder inside same parent */
  onMoveUp?(): void;
  onMoveDown?(): void;
}

/* ============================================================
   BLOCK TOOLBAR — CANONICAL (V5)
   ------------------------------------------------------------
   ✓ Functionality unchanged
   ✓ Modern floating glass UI
   ✓ Same drag behaviour
   ✓ Same callbacks
============================================================ */

export function BlockToolbar({
  id,
  label,
  isSelected,
  onDuplicate,
  onDelete,
  onSettings,
  onAI,
  onMoveUp,
  onMoveDown,
}: BlockToolbarProps) {
  if (!isSelected) return null;

  const iconButton =
    "flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-all duration-150 hover:bg-white/10 hover:text-white active:scale-95";

  return (
    <div
      className="
        absolute
        left-1/2
        -top-12
        -translate-x-1/2
        inline-flex
        items-center
        gap-1
        rounded-[22px]
        border
        border-white/10
        bg-neutral-950/95
        backdrop-blur-xl
        px-2
        py-1
        shadow-[0_12px_40px_rgba(0,0,0,.45)]
        z-[1000]
        pointer-events-auto
        select-none
      "
      role="toolbar"
      aria-label={`${label} toolbar`}
      data-bez-block-toolbar
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {/* =====================================================
         DRAG HANDLE
      ===================================================== */}

      <button
        type="button"
        title="Drag"
        aria-label="Drag"
        className={`${iconButton} cursor-grab active:cursor-grabbing`}
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();

          window.dispatchEvent(
            new CustomEvent("builder:start-drag", {
              detail: {
                id,
                type: "block",
                source: "canvas",
                x: e.clientX,
                y: e.clientY,
              },
            })
          );

          document.body.classList.add("builder-dragging");
        }}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      {/* =====================================================
         MOVE UP
      ===================================================== */}

      {onMoveUp && (
        <button
          type="button"
          title="Move up"
          aria-label="Move up"
          className={iconButton}
          onClick={(e) => {
            e.stopPropagation();
            onMoveUp();
          }}
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      )}

      {/* =====================================================
         MOVE DOWN
      ===================================================== */}

      {onMoveDown && (
        <button
          type="button"
          title="Move down"
          aria-label="Move down"
          className={iconButton}
          onClick={(e) => {
            e.stopPropagation();
            onMoveDown();
          }}
        >
          <ArrowDown className="h-4 w-4" />
        </button>
      )}

      {/* Divider */}

      <div className="mx-1 h-5 w-px bg-white/10" />

      {/* =====================================================
         SETTINGS
      ===================================================== */}

      <button
        type="button"
        title="Settings"
        aria-label="Settings"
        className={iconButton}
        onClick={(e) => {
          e.stopPropagation();
          onSettings();
        }}
      >
        <Settings className="h-4 w-4" />
      </button>

      {/* =====================================================
         DUPLICATE
      ===================================================== */}

      <button
        type="button"
        title={`Duplicate ${label}`}
        aria-label={`Duplicate ${label}`}
        className={iconButton}
        onClick={(e) => {
          e.stopPropagation();
          onDuplicate();
        }}
      >
        <Copy className="h-4 w-4" />
      </button>

      {/* Divider */}

      <div className="mx-1 h-5 w-px bg-white/10" />

      {/* =====================================================
         AI
      ===================================================== */}

      <button
        type="button"
        title="AI"
        aria-label="AI"
        className={iconButton}
        onClick={(e) => {
          e.stopPropagation();
          onAI();
        }}
      >
        <Sparkles className="h-4 w-4" />
      </button>

      {/* =====================================================
         DELETE
      ===================================================== */}

      <button
        type="button"
        title={`Delete ${label}`}
        aria-label={`Delete ${label}`}
        className={`${iconButton} hover:text-red-400`}
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        <Trash className="h-4 w-4" />
      </button>
    </div>
  );
}