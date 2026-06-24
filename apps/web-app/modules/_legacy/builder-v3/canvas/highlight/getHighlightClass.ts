import { useHighlightStore } from "@/modules/builder/state/useHighlightStore";

export function getHighlightClass(nodeId: string) {
  const { hoverId, selectedId, dragOverId } = useHighlightStore.getState();

  if (dragOverId === nodeId) return "bz-drag-outline";
  if (selectedId === nodeId) return "bz-selected-outline";
  if (hoverId === nodeId) return "bz-hover-outline";

  return "bz-no-outline";
}
