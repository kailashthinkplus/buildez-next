"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type DropZonePosition = {
  left: number;
  top: number;
  width: number;
  height: number;
  type: "inside" | "before" | "after";
  isEmpty?: boolean;
};

export default function DropZoneIndicator() {
  const [dropZone, setDropZone] = useState<DropZonePosition | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleIntent = (e: Event) => {
      const detail = (e as CustomEvent<DropZonePosition>).detail;
      setDropZone(detail ?? null);
    };

    const clear = () => setDropZone(null);

    const handleAutoScroll = (e: DragEvent) => {
      const scroller = document.querySelector(
        "[data-builder-canvas-scroll='true']"
      ) as HTMLElement | null;
      if (!scroller) return;
      const rect = scroller.getBoundingClientRect();
      const edge = 80;
      const speed = 18;
      if (e.clientY < rect.top + edge) scroller.scrollBy({ top: -speed });
      else if (e.clientY > rect.bottom - edge) scroller.scrollBy({ top: speed });
      if (e.clientX < rect.left + edge) scroller.scrollBy({ left: -speed });
      else if (e.clientX > rect.right - edge) scroller.scrollBy({ left: speed });
    };

    window.addEventListener("builder:drop-intent", handleIntent);
    window.addEventListener("builder:drop-clear", clear);
    window.addEventListener("builder:end-drag", clear);
    window.addEventListener("dragend", clear);
    window.addEventListener("drop", clear);
    window.addEventListener("dragover", handleAutoScroll);

    return () => {
      window.removeEventListener("builder:drop-intent", handleIntent);
      window.removeEventListener("builder:drop-clear", clear);
      window.removeEventListener("builder:end-drag", clear);
      window.removeEventListener("dragend", clear);
      window.removeEventListener("drop", clear);
      window.removeEventListener("dragover", handleAutoScroll);
    };
  }, []);

  if (!mounted || !dropZone) return null;

  const { left, top, width, height, type, isEmpty } = dropZone;

  /* ── Insertion bar (before / after) ─────────────────────────────────── */
  if (type === "before" || type === "after") {
    const isVertical = height > width; // vertical bar = horizontal container
    return createPortal(
      <div
        className="fixed pointer-events-none"
        style={{
          zIndex: 10050,
          left,
          top,
          width,
          height,
        }}
      >
        {/* The line */}
        <div
          style={{
            position: "absolute",
            ...(isVertical
              ? { top: 0, bottom: 0, left: "50%", width: 3, transform: "translateX(-50%)" }
              : { left: 0, right: 0, top: "50%", height: 3, transform: "translateY(-50%)" }),
            background: "#2563eb",
            borderRadius: 2,
            boxShadow: "0 0 8px rgba(37,99,235,0.4)",
          }}
        />
      </div>,
      document.body
    );
  }

  /* ── Inside indicator ─────────────────────────────────────────────────── */
  if (isEmpty) {
    // Empty container: fill with dashed border + label
    return createPortal(
      <div
        className="fixed pointer-events-none flex items-center justify-center"
        style={{
          zIndex: 10050,
          left: left + 3,
          top: top + 3,
          width: width - 6,
          height: height - 6,
          border: "2px dashed #2563eb",
          borderRadius: 6,
          background: "rgba(37,99,235,0.06)",
        }}
      >
        <span
          style={{
            color: "#2563eb",
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.03em",
            userSelect: "none",
          }}
        >
          Drop here
        </span>
      </div>,
      document.body
    );
  }

  // Non-empty container: left-edge accent bar (Elementor "inside" style)
  return createPortal(
    <div
      className="fixed pointer-events-none"
      style={{
        zIndex: 10050,
        left,
        top,
        width,
        height,
        border: "2px solid rgba(37,99,235,0.55)",
        borderRadius: 4,
        boxShadow: "0 0 0 3px rgba(37,99,235,0.12), inset 0 0 0 1px rgba(37,99,235,0.08)",
      }}
    />,
    document.body
  );
}
