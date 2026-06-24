// apps/web-app/modules/builder/dnd/pointerEngine.ts
"use client";

/**
 * --------------------------------------------------------------
 * pointerEngine.ts — BuildEZ V3
 * --------------------------------------------------------------
 * Central global pointer handler for:
 *  ✔ ResizeEngine
 *  ✔ DragEngine
 *  ✔ FreeformPositioningEngine
 *  ✔ Selection / Hover
 *
 * Features:
 *  - Global pointer capture
 *  - 16ms throttled pointermove loop
 *  - Artboard-relative coordinates
 *  - Zoom + scroll aware
 *  - Automatic cleanup
 *
 *  This engine does NOT mutate state directly.
 *  It dispatches events into:
 *    • ResizeEngine.onMove / onUp
 *    • DragEngine.onMove / onUp
 *    • FreeformEngine.onMove / onUp
 *    • useDnDStore (pointer positions)
 */

import { useCanvasStore } from "@/modules/builder/state/useCanvasStore";
import { useDnDStore } from "./useDnDStore";

// Engines injected dynamically
let resizeEngine: any = null;
let dragEngine: any = null;
let freeformEngine: any = null;

export function registerPointerEngines({
  resize,
  drag,
  freeform,
}: {
  resize?: any;
  drag?: any;
  freeform?: any;
}) {
  if (resize) resizeEngine = resize;
  if (drag) dragEngine = drag;
  if (freeform) freeformEngine = freeform;
}

/* --------------------------------------------------------------
   STATE
-------------------------------------------------------------- */

let isPointerCaptured = false;
let lastMoveTs = 0;

/* --------------------------------------------------------------
   INIT — called once in BuilderShell / CanvasProviders
-------------------------------------------------------------- */
export function initPointerEngine() {
  if (typeof window === "undefined") return;

  window.addEventListener("pointermove", handleGlobalMove, { passive: true });
  window.addEventListener("pointerup", handleGlobalUp, { passive: true });

  isPointerCaptured = true;
}

/* --------------------------------------------------------------
   DESTROY — clean up (hot reload safe)
-------------------------------------------------------------- */
export function destroyPointerEngine() {
  if (typeof window === "undefined") return;

  window.removeEventListener("pointermove", handleGlobalMove);
  window.removeEventListener("pointerup", handleGlobalUp);

  isPointerCaptured = false;
}

/* --------------------------------------------------------------
   16ms throttled pointer move
-------------------------------------------------------------- */
function handleGlobalMove(e: PointerEvent) {
  if (!isPointerCaptured) return;

  const now = performance.now();
  if (now - lastMoveTs < 16) return; // 60fps throttle
  lastMoveTs = now;

  const pos = computeArtboardCoords(e.clientX, e.clientY);

  // update global pointer position (DnD store)
  useDnDStore.getState().setPointer(pos.x, pos.y);

  // Route event → engines
  if (resizeEngine?.isResizing) resizeEngine.onMove(e);
  else if (dragEngine?.isDragging) dragEngine.onMove(e);
  else if (freeformEngine?.isActive) freeformEngine.onMove(e);
}

/* --------------------------------------------------------------
   pointerup = end drag / resize / freeform
-------------------------------------------------------------- */
function handleGlobalUp(e: PointerEvent) {
  if (!isPointerCaptured) return;

  // Resize
  if (resizeEngine?.isResizing) resizeEngine.onUp(e);

  // Drag
  if (dragEngine?.isDragging) {
    dragEngine.onUp(e);
    useDnDStore.getState().performDrop();
  }

  // Freeform
  if (freeformEngine?.isActive) freeformEngine.onUp(e);

  // Reset DnD flags
  useDnDStore.getState().reset();
}

/* --------------------------------------------------------------
   Artboard-relative coordinate system (zoom + scroll aware)
-------------------------------------------------------------- */
export function computeArtboardCoords(clientX: number, clientY: number) {
  const canvas = useCanvasStore.getState();
  const frame = canvas.canvasRef;

  if (!frame) {
    return { x: clientX, y: clientY };
  }

  const rect = frame.getBoundingClientRect();

  const x = (clientX - rect.left + frame.scrollLeft) / canvas.zoom;
  const y = (clientY - rect.top + frame.scrollTop) / canvas.zoom;

  return { x, y };
}

/* --------------------------------------------------------------
   Global pointer capture for engines
-------------------------------------------------------------- */
export const pointerEngine = {
  /**
   * Called by:
   * - ResizeEngine.start()
   * - DragEngine.start()
   * - FreeformEngine.start()
   *
   * Registers callbacks for pointermove/pointerup
   */
  startGlobalPointerCapture({
    onMove,
    onUp,
  }: {
    onMove: (e: PointerEvent) => void;
    onUp: (e: PointerEvent) => void;
  }) {
    resizeEngine = resizeEngine || {};
    dragEngine = dragEngine || {};
    freeformEngine = freeformEngine || {};

    if (onMove) resizeEngine.onMove = onMove;
    if (onUp) resizeEngine.onUp = onUp;

    isPointerCaptured = true;
  },

  stop() {
    isPointerCaptured = false;
  },
};
