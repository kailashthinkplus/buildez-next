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
