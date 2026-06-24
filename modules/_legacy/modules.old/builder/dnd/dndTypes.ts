export type DragKind = "section" | "block" | "freeform";

export interface DragStartEvent {
  id: string;
  kind: DragKind;
  parentId: string | null;
  index: number;
}

export interface DragOverEvent {
  targetId: string;
  position: "before" | "after" | "inside";
}

export interface DropResult {
  draggedId: string;
  targetId: string;
  position: "before" | "after" | "inside";
}
