import { useBlueprintStore } from "../state/useBlueprintStore";

export function updateSize(nodeId, newWidth, newHeight, units = "px") {
  const updateLayout = useBlueprintStore.getState().updateLayout;

  // Convert px → % when container requires responsive
  const widthVal =
    units === "%"
      ? `${newWidth}%`
      : `${Math.max(1, Math.round(newWidth))}px`;

  const heightVal =
    units === "%"
      ? `${newHeight}%`
      : `${Math.max(1, Math.round(newHeight))}px`;

  updateLayout(nodeId, {
    width: widthVal,
    height: heightVal,
  });
}
