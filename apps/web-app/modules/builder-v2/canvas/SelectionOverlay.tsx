"use client";

import { useSelectionStore } from "../store/useSelectionStore";
import SelectionToolbar from "./SelectionToolbar";
import type { SelectionToolbarProps } from "./SelectionToolbar";

interface SelectionOverlayProps {
  selectionToolbarProps: SelectionToolbarProps;
}

export default function SelectionOverlay({
  selectionToolbarProps,
}: SelectionOverlayProps) {
  const selectedNodeId = useSelectionStore((s) => s.selectedNodeId);

  if (!selectedNodeId) return null;

  return (
    <>
      <SelectionToolbar {...selectionToolbarProps} />
    </>
  );
}
