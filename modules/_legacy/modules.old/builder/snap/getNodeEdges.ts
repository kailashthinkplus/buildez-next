export function getNodeEdges(rect) {
  const left = rect.left;
  const right = rect.right;
  const top = rect.top;
  const bottom = rect.bottom;
  const midX = left + rect.width / 2;
  const midY = top + rect.height / 2;

  return {
    left,
    right,
    top,
    bottom,
    midX,
    midY,
  };
}
