import { computeSnaplines } from "../snap/computeSnaplines";
import { useDragGhostStore } from "../state/useDragGhostStore";

const THRESHOLD = 8;

export function computeResizeSnap(
  activeRect,
  allRects,
  axis, // "x" or "y"
  delta
) {
  const ghost = useDragGhostStore.getState();

  // Compute alignment snaps (Batch 11)
  const { vLine, hLine } = computeSnaplines(activeRect, allRects);

  // Determine final snapped deltas
  let snappedDeltaX = delta.x;
  let snappedDeltaY = delta.y;

  if (axis === "x" && vLine !== null) {
    const target = vLine - activeRect.left;
    if (Math.abs(target - activeRect.width) <= THRESHOLD) {
      snappedDeltaX = target - activeRect.width;
    }
  }

  if (axis === "y" && hLine !== null) {
    const target = hLine - activeRect.top;
    if (Math.abs(target - activeRect.height) <= THRESHOLD) {
      snappedDeltaY = target - activeRect.height;
    }
  }

  // Update floating ghost box
  ghost.updateGhost({
    width: activeRect.width + snappedDeltaX,
    height: activeRect.height + snappedDeltaY,
  });

  return {
    deltaX: snappedDeltaX,
    deltaY: snappedDeltaY,
  };
}
