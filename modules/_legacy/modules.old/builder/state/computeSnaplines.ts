import { getNodeEdges } from "./getNodeEdges";
import { snapPixel } from "./snapEngine";
import { useSnaplineStore } from "@/modules/builder/state/useSnaplineStore";

const SNAP_THRESHOLD = 6; // px

export function computeSnaplines(activeRect, allRects) {
  const { showSnapline, clearSnapline } = useSnaplineStore.getState();

  let vLine: number | null = null;
  let hLine: number | null = null;

  const ax = activeRect;
  const edgesA = getNodeEdges(ax);

  for (const rect of allRects) {
    const edgesB = getNodeEdges(rect);

    // Horizontal snaps (top, mid, bottom)
    ["top", "midY", "bottom"].forEach((key) => {
      const dist = Math.abs(edgesA[key] - edgesB[key]);
      if (dist <= SNAP_THRESHOLD) {
        hLine = edgesB[key]; // show line
      }
    });

    // Vertical snaps (left, mid, right)
    ["left", "midX", "right"].forEach((key) => {
      const dist = Math.abs(edgesA[key] - edgesB[key]);
      if (dist <= SNAP_THRESHOLD) {
        vLine = edgesB[key];
      }
    });
  }

  if (vLine !== null || hLine !== null) {
    showSnapline({ vertical: vLine, horizontal: hLine });
  } else {
    clearSnapline();
  }

  return { vLine, hLine };
}
