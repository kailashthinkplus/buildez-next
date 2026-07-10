export type CanvasOverlayRect = Readonly<{
  left: number;
  top: number;
  width: number;
  height: number;
}>;

export function getCanvasScale(canvas: HTMLElement): number {
  const renderedWidth = canvas.getBoundingClientRect().width;
  return canvas.offsetWidth > 0 ? renderedWidth / canvas.offsetWidth : 1;
}

export function getCanvasRelativeNodeRect(nodeId: string): CanvasOverlayRect | null {
  const canvas = document.querySelector(".builder-canvas-sandbox") as HTMLElement | null;
  const node = canvas?.querySelector(
    `[data-node-id="${CSS.escape(nodeId)}"]`
  ) as HTMLElement | null;
  if (!node || !canvas) return null;

  const nodeRect = node.getBoundingClientRect();
  const canvasRect = canvas.getBoundingClientRect();
  const scale = getCanvasScale(canvas) || 1;
  return {
    left: (nodeRect.left - canvasRect.left) / scale,
    top: (nodeRect.top - canvasRect.top) / scale,
    width: nodeRect.width / scale,
    height: nodeRect.height / scale,
  };
}
