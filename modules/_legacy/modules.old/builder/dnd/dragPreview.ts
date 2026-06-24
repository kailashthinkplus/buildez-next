// RFC-003 — Drag Preview Ghost UI Logic (non-DOM)
// This does NOT generate UI, only math + state.

export function computeDragPreviewPosition(
  pointerX: number,
  pointerY: number
): { x: number; y: number } {
  // TODO (RFC-003: ghost element follows pointer)
  return { x: pointerX, y: pointerY };
}
