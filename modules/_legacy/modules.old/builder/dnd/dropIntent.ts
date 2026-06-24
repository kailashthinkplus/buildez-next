// RFC-003 — Drop Intent Normalization Logic

import { DropIntent, DropPosition } from "./dndTypes";

export function computeDropIntent(
  draggingId: string,
  hoveredParentId: string,
  hoveredIndex: number,
  position: DropPosition
): DropIntent {
  // TODO (RFC-003 §7)
  return {
    parentId: hoveredParentId,
    index: hoveredIndex,
    position,
  };
}
