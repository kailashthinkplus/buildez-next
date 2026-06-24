// RFC-003 — Pointer math, normalization, hit detection

export function distance(a: number, b: number): number {
  return Math.abs(a - b);
}

export function rectContains(
  rect: DOMRect,
  x: number,
  y: number
): boolean {
  // TODO (RFC-003 helper)
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

export function isDragThresholdPassed(
  startX: number,
  startY: number,
  curX: number,
  curY: number,
  threshold = 4
): boolean {
  return (
    Math.abs(curX - startX) > threshold ||
    Math.abs(curY - startY) > threshold
  );
}
