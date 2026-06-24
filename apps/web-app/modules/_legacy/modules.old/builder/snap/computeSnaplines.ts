"use client";

/**
 * computeSnaplines
 * -------------------------------------------------
 * Lightweight snap-engine for resize operations.
 *
 * Input:
 *   rect = { x, y, w, h }
 *
 * Output:
 *   {
 *     x: snappedX,
 *     y: snappedY,
 *     w: snappedWidth,
 *     h: snappedHeight,
 *     guides: { vertical: number[], horizontal: number[] }
 *   }
 */

const SNAP_THRESHOLD = 8;

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface SnapResult {
  x: number;
  y: number;
  w: number;
  h: number;
  guides: {
    vertical: number[];
    horizontal: number[];
  };
}

export function computeSnaplines(rect: Rect, others: Rect[] = []): SnapResult {
  let snapped = { ...rect };

  const guides = {
    vertical: [] as number[],
    horizontal: [] as number[],
  };

  const myLeft = rect.x;
  const myRight = rect.x + rect.w;
  const myTop = rect.y;
  const myBottom = rect.y + rect.h;
  const myCenterX = rect.x + rect.w / 2;
  const myCenterY = rect.y + rect.h / 2;

  for (const o of others) {
    const oLeft = o.x;
    const oRight = o.x + o.w;
    const oTop = o.y;
    const oBottom = o.y + o.h;
    const oCenterX = o.x + o.w / 2;
    const oCenterY = o.y + o.h / 2;

    // ---------- Vertical snaps ----------
    // Snap left-to-left
    if (Math.abs(myLeft - oLeft) < SNAP_THRESHOLD) {
      snapped.x = oLeft;
      guides.vertical.push(oLeft);
    }

    // Snap right-to-right
    if (Math.abs(myRight - oRight) < SNAP_THRESHOLD) {
      snapped.x = oRight - rect.w;
      guides.vertical.push(oRight);
    }

    // Snap center-to-center X
    if (Math.abs(myCenterX - oCenterX) < SNAP_THRESHOLD) {
      snapped.x = oCenterX - rect.w / 2;
      guides.vertical.push(oCenterX);
    }

    // ---------- Horizontal snaps ----------
    // Snap top-to-top
    if (Math.abs(myTop - oTop) < SNAP_THRESHOLD) {
      snapped.y = oTop;
      guides.horizontal.push(oTop);
    }

    // Snap bottom-to-bottom
    if (Math.abs(myBottom - oBottom) < SNAP_THRESHOLD) {
      snapped.y = oBottom - rect.h;
      guides.horizontal.push(oBottom);
    }

    // Snap center-to-center Y
    if (Math.abs(myCenterY - oCenterY) < SNAP_THRESHOLD) {
      snapped.y = oCenterY - rect.h / 2;
      guides.horizontal.push(oCenterY);
    }
  }

  return {
    ...snapped,
    guides,
  };
}
