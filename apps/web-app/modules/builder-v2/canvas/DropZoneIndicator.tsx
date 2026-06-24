"use client";

import { useEffect, useState } from "react";

type DropZonePosition = {
  x: number;
  y: number;
  width: number;
  height: number;
  type: "inside" | "before" | "after";
};

export default function DropZoneIndicator() {
  const [dropZone, setDropZone] = useState<DropZonePosition | null>(null);

  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      const el = (e.target as HTMLElement).closest(
        "[data-drop-target='true']"
      ) as HTMLElement | null;

      if (!el) {
        setDropZone(null);
        return;
      }

      const rect = el.getBoundingClientRect();
      const canvastartY =
        document.querySelector(".builder-canvas-sandbox")?.getBoundingClientRect()
          .top || 0;

      const relativeY = e.clientY - rect.top;
      const quarter = rect.height / 4;

      let type: "inside" | "before" | "after" = "inside";

      if (relativeY < quarter) {
        type = "before";
      } else if (relativeY > rect.height - quarter) {
        type = "after";
      }

      setDropZone({
        x: rect.left - canvastartY,
        y:
          type === "before"
            ? rect.top - canvastartY
            : type === "after"
            ? rect.bottom - canvastartY
            : rect.top - canvastartY,
        width: rect.width,
        height: type === "inside" ? rect.height : 2,
        type,
      });
    };

    const handleDragLeave = () => {
      setDropZone(null);
    };

    const handleDrop = () => {
      setDropZone(null);
    };

    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("drop", handleDrop);

    return () => {
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("drop", handleDrop);
    };
  }, []);

  if (!dropZone) return null;

  return (
    <div
      className="fixed z-[10001] pointer-events-none transition-all"
      style={{
        left: dropZone.x,
        top: dropZone.y,
        width: dropZone.width,
        height: dropZone.height,
        background:
          dropZone.type === "inside"
            ? "rgba(59, 130, 246, 0.1)"
            : "rgba(59, 130, 246, 0.5)",
        border:
          dropZone.type === "inside"
            ? "2px dashed rgb(59, 130, 246)"
            : "2px solid rgb(59, 130, 246)",
        borderRadius: "4px",
      }}
    />
  );
}
