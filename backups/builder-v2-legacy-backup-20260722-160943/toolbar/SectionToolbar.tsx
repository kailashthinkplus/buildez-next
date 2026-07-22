"use client";

import {
  GripVertical,
  Copy,
  Sparkles,
  Trash,
  Plus,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

interface SectionToolbarProps {
  /** Stable blueprint node id */
  id: string;

  /** Structural node type (section | container | column) */
  nodeType: string;

  /** Display label */
  label: string;

  /** Render toolbar only when selected */
  isSelected: boolean;

  /** Core actions */
  onDuplicate(): void;
  onDelete(): void;
  onAddInside(): void;

  /** Reorder inside same parent */
  onMoveUp?(): void;
  onMoveDown?(): void;

  /** Optional AI hooks */
  onAIRewrite?(): void;
  onAIRegenerate?(): void;
}

/* ============================================================
   SECTION / CONTAINER / COLUMN TOOLBAR — CANONICAL
   ------------------------------------------------------------
   • UI unchanged
   • Drag initiation handled by PageRenderer (GLOBAL)
   • This toolbar ONLY exposes data-bez-section-toolbar
   • Deterministic command buttons
============================================================ */

export function SectionToolbar({
  id,
  nodeType,
  label,
  isSelected,
  onDuplicate,
  onDelete,
  onAddInside,
  onMoveUp,
  onMoveDown,
  onAIRewrite,
  onAIRegenerate,
}: SectionToolbarProps) {
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
      data-bez-section-toolbar
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {/* =====================================================
         DRAG HANDLE
         (Actual drag starts in PageRenderer.tsx)
      ===================================================== */}
      <button
        type="button"
        className="p-1 cursor-grab text-neutral-300 hover:text-white"
        title="Drag"
        aria-label="Drag"
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
         ADD INSIDE
      ===================================================== */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onAddInside();
        }}
        className="p-1 text-neutral-300 hover:text-white"
        title={`Add inside ${label}`}
        aria-label={`Add inside ${label}`}
      >
        <Plus size={14} />
      </button>

      {/* =====================================================
         AI (optional)
      ===================================================== */}
      {onAIRewrite && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAIRewrite();
          }}
          className="p-1 text-neutral-300 hover:text-white"
          title="AI rewrite"
          aria-label="AI rewrite"
        >
          <Sparkles size={14} />
        </button>
      )}

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
