import { computeResizeSnap } from "./computeResizeSnap";
import { updateSize } from "./updateSize";
import { useBlueprintStore } from "../state/useBlueprintStore";
import { useDragGhostStore } from "../state/useDragGhostStore";

export function performResize(resizing, clientX, clientY) {
  const { nodeId, direction, startX, startY } = resizing;

  const el = document.querySelector(`[data-node-id="${nodeId}"]`);
  if (!el) return;

  const rect = el.getBoundingClientRect();

  const delta = {
    x: clientX - startX,
    y: clientY - startY,
  };

  const snap = computeResizeSnap(rect, getAllRects(nodeId), direction, delta);

  const newWidth =
    rect.width +
    (direction.includes("e") ? snap.deltaX : direction.includes("w") ? -snap.deltaX : 0);

  const newHeight =
    rect.height +
    (direction.includes("s") ? snap.deltaY : direction.includes("n") ? -snap.deltaY : 0);

  // Update ghost
  useDragGhostStore.getState().updateGhost({
    width: newWidth,
    height: newHeight,
  });

  // Apply new size to blueprint
  updateSize(nodeId, newWidth, newHeight, "px");
}

function getAllRects(excludeNodeId) {
  const nodes = document.querySelectorAll("[data-node-id]");
  const list = [];
  nodes.forEach((el) => {
    if (el.getAttribute("data-node-id") !== excludeNodeId) {
      const r = el.getBoundingClientRect();
      list.push(r);
    }
  });
  return list;
}
