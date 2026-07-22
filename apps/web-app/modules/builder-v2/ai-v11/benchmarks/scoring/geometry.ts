export type RectEvidence = Readonly<{
  x: number;
  y: number;
  width: number;
  height: number;
  parentX: number;
  parentY: number;
  parentWidth: number;
  parentHeight: number;
  lineCount: number;
  fontSize: number;
  lineHeight: number;
  borderRadius: number;
}>;
export const normalizedDistance = (a: number, b: number, normalizer: number) =>
  Math.min(1, Math.abs(a - b) / Math.max(1, normalizer));
export function compareRegion(
  reference: RectEvidence,
  compiled: RectEvidence,
  viewportWidth: number,
) {
  return Object.freeze({
    x: normalizedDistance(reference.x, compiled.x, viewportWidth),
    y: normalizedDistance(
      reference.y,
      compiled.y,
      Math.max(reference.parentHeight, compiled.parentHeight),
    ),
    width: normalizedDistance(
      reference.width,
      compiled.width,
      Math.max(reference.parentWidth, compiled.parentWidth),
    ),
    height: normalizedDistance(
      reference.height,
      compiled.height,
      Math.max(reference.parentHeight, compiled.parentHeight),
    ),
    parentEdgeLeft: normalizedDistance(
      reference.x - reference.parentX,
      compiled.x - compiled.parentX,
      viewportWidth,
    ),
    parentWidth: normalizedDistance(
      reference.parentWidth,
      compiled.parentWidth,
      viewportWidth,
    ),
    lineCount: normalizedDistance(
      reference.lineCount,
      compiled.lineCount,
      Math.max(reference.lineCount, compiled.lineCount),
    ),
    fontSize: normalizedDistance(
      reference.fontSize,
      compiled.fontSize,
      Math.max(reference.fontSize, compiled.fontSize),
    ),
    lineHeight: normalizedDistance(
      reference.lineHeight,
      compiled.lineHeight,
      Math.max(reference.lineHeight, compiled.lineHeight),
    ),
    borderRadius: normalizedDistance(
      reference.borderRadius,
      compiled.borderRadius,
      Math.max(1, reference.borderRadius, compiled.borderRadius),
    ),
  });
}
export const overlapDistance = (card: RectEvidence, parent: RectEvidence) =>
  parent.y + parent.height - card.y;
