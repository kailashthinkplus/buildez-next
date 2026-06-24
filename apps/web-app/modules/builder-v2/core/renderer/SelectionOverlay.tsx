"use client";

import FloatingToolbar from "../../selection/FloatingToolbar";
import { useSelectionRect } from "../../selection/useSelectionRect";

export default function SelectionOverlay() {
  const rect = useSelectionRect();

  if (!rect) {
    return null;
  }

  return (
    <>
      {/* Selection Border */}

      <div
        className="
          pointer-events-none
          fixed
          z-[9998]
          rounded-lg
          border-2
          border-blue-500
          shadow-[0_0_0_1px_rgba(59,130,246,0.25)]
        "
        style={{
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
        }}
      />

      {/* Floating Toolbar */}

      <div
        className="fixed z-[9999]"
        style={{
          left: rect.left + rect.width / 2,
          top: rect.top - 58,
          transform: "translateX(-50%)",
        }}
      >
        <FloatingToolbar
          onMoveUp={() => {
            console.log("Move Up");
          }}
          onMoveDown={() => {
            console.log("Move Down");
          }}
          onDuplicate={() => {
            console.log("Duplicate");
          }}
          onSettings={() => {
            console.log("Settings");
          }}
          onAI={() => {
            console.log("AI");
          }}
          onDelete={() => {
            console.log("Delete");
          }}
        />
      </div>
    </>
  );
}