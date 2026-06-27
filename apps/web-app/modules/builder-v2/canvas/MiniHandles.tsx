"use client";

import { useEffect, useState } from "react";
import { Copy, Package, Trash2 } from "lucide-react";

type MiniHandlePosition = {
  x: number;
  y: number;
  nodeId: string;
};

interface MiniHandlesProps {
  onDuplicate(nodeId: string): void;
  onDelete(nodeId: string): void;
  onWrap(nodeId: string): void;
}

export default function MiniHandles({ onDuplicate, onDelete, onWrap }: MiniHandlesProps) {
  const [handles, setHandles] = useState<MiniHandlePosition | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest("[data-node-id]") as HTMLElement | null;
      if (!el) {
        setHandles(null);
        return;
      }

      const nodeId = el.getAttribute("data-node-id");
      if (!nodeId) {
        setHandles(null);
        return;
      }

      const rect = el.getBoundingClientRect();
      setHandles({
        x: rect.right + 8,
        y: rect.top,
        nodeId,
      });
    };

    const handleMouseLeave = () => {
      setHandles(null);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  if (!handles) return null;

  return (
    <div
      className="fixed z-[10010] flex gap-1 pointer-events-auto"
      style={{
        left: handles.x,
        top: handles.y,
      }}
    >
      <button
        type="button"
        onClick={() => onDuplicate(handles.nodeId)}
        className="w-6 h-6 rounded bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-xs text-white/60 hover:text-white transition"
        title="Duplicate"
      >
        <Copy size={13} aria-hidden />
      </button>
      <button
        type="button"
        onClick={() => onWrap(handles.nodeId)}
        className="w-6 h-6 rounded bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-xs text-white/60 hover:text-white transition"
        title="Wrap"
      >
        <Package size={13} aria-hidden />
      </button>
      <button
        type="button"
        onClick={() => onDelete(handles.nodeId)}
        className="w-6 h-6 rounded bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 flex items-center justify-center text-xs text-red-200 hover:text-red-100 transition"
        title="Delete"
      >
        <Trash2 size={13} aria-hidden />
      </button>
    </div>
  );
}
