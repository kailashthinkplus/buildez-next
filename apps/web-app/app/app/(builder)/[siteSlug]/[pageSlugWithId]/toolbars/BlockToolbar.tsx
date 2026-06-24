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
   BLOCK TOOLBAR — CANONICAL (V4)
   ------------------------------------------------------------
   • UI unchanged
   • Drag emits builder:start-drag with correct payload
   • No side-channel globals
   • Deterministic command buttons
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

  return (
    <div
      className="
        absolute
        left-1/2 -translate-x-1/2
        -top-9
        flex items-center gap-2
        bg-neutral-900 text-white
        px-3 py-1.5
        rounded-full
        shadow-xl
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
         (Starts global drag directly)
      ===================================================== */}
      <button
        type="button"
        className="p-1 cursor-grab text-neutral-300 hover:text-white"
        title="Drag"
        aria-label="Drag"
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();

          window.dispatchEvent(
            new CustomEvent("builder:start-drag", {
              detail: {
                id,              // ✅ CORRECT: blueprint node id
                type: "block",   // structural type for DnD engine
                source: "canvas",
                x: e.clientX,
                y: e.clientY,
              },
            })
          );

          document.body.classList.add("builder-dragging");
        }}
      >
        <GripVertical size={14} />
      </button>

      {/* =====================================================
         MOVE UP
      ===================================================== */}
      {onMoveUp && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onMoveUp();
          }}
          className="p-1 text-neutral-300 hover:text-white"
          title="Move up"
          aria-label="Move up"
        >
          <ArrowUp size={14} />
        </button>
      )}

      {/* =====================================================
         MOVE DOWN
      ===================================================== */}
      {onMoveDown && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onMoveDown();
          }}
          className="p-1 text-neutral-300 hover:text-white"
          title="Move down"
          aria-label="Move down"
        >
          <ArrowDown size={14} />
        </button>
      )}

      {/* =====================================================
         SETTINGS (INSPECTOR)
      ===================================================== */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onSettings();
        }}
        className="p-1 text-neutral-300 hover:text-white"
        title="Settings"
        aria-label="Settings"
      >
        <Settings size={14} />
      </button>

      {/* =====================================================
         DUPLICATE
      ===================================================== */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDuplicate();
        }}
        className="p-1 text-neutral-300 hover:text-white"
        title={`Duplicate ${label}`}
        aria-label={`Duplicate ${label}`}
      >
        <Copy size={14} />
      </button>

      {/* =====================================================
         AI
      ===================================================== */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onAI();
        }}
        className="p-1 text-neutral-300 hover:text-white"
        title="AI"
        aria-label="AI"
      >
        <Sparkles size={14} />
      </button>

      {/* =====================================================
         DELETE
      ===================================================== */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="p-1 text-neutral-300 hover:text-red-400"
        title={`Delete ${label}`}
        aria-label={`Delete ${label}`}
      >
        <Trash size={14} />
      </button>
    </div>
  );
}
