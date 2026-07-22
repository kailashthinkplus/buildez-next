"use client";

import {
  GripVertical,
  ArrowUp,
  ArrowDown,
  Settings2,
  Copy,
  Sparkles,
  Trash2,
} from "lucide-react";

interface FloatingToolbarProps {
  onMoveUp?(): void;
  onMoveDown?(): void;
  onDuplicate?(): void;
  onDelete?(): void;
  onSettings?(): void;
  onAI?(): void;
}

function ToolButton({
  children,
  onClick,
  title,
}: {
  children: React.ReactNode;
  title: string;
  onClick?(): void;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className="
        flex
        h-8
        w-8
        items-center
        justify-center
        rounded-lg
        text-white/70
        transition-all
        hover:bg-white/10
        hover:text-white
      "
    >
      {children}
    </button>
  );
}

export default function FloatingToolbar({
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
  onSettings,
  onAI,
}: FloatingToolbarProps) {
  return (
    <div
      className="
        flex
        items-center
        gap-1
        rounded-xl
        border
        border-white/10
        bg-[#0F172A]
        px-2
        py-1.5
        shadow-2xl
        backdrop-blur-xl
      "
    >
      <ToolButton title="Drag">
        <GripVertical size={16} />
      </ToolButton>

      <ToolButton
        title="Move Up"
        onClick={onMoveUp}
      >
        <ArrowUp size={16} />
      </ToolButton>

      <ToolButton
        title="Move Down"
        onClick={onMoveDown}
      >
        <ArrowDown size={16} />
      </ToolButton>

      <div className="mx-1 h-5 w-px bg-white/10" />

      <ToolButton
        title="Settings"
        onClick={onSettings}
      >
        <Settings2 size={16} />
      </ToolButton>

      <ToolButton
        title="Duplicate"
        onClick={onDuplicate}
      >
        <Copy size={16} />
      </ToolButton>

      <ToolButton
        title="AI"
        onClick={onAI}
      >
        <Sparkles size={16} />
      </ToolButton>

      <ToolButton
        title="Delete"
        onClick={onDelete}
      >
        <Trash2 size={16} />
      </ToolButton>
    </div>
  );
}