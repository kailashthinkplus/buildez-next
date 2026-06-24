// RFC-003 — Snap Engine (soft + hard snap lines)

import { SnapData } from "./dndTypes";

export function computeSnapLines(
  nodeRect: DOMRect,
  pointer: { x: number; y: number }
): SnapData {
  // TODO (RFC-003 §8)
  return {
    vertical: [],
    horizontal: [],
  };
}
