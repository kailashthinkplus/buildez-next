"use client";

import { BlueprintNode } from "@/modules/builder/renderer/PageRenderer";
import { LayerItem } from "./layers/LayerItem";

interface LayersPanelProps {
  blueprint: BlueprintNode;
  selectedId: string | null;
  onSelect(id: string): void;
}

/* ============================================================
   LAYERS PANEL — NAMED EXPORT (CANONICAL)
============================================================ */
export function LayersPanel({
  blueprint,
  selectedId,
  onSelect,
}: LayersPanelProps) {
  if (!blueprint) return null;

  return (
    <div className="h-full overflow-y-auto px-2 py-2 text-white">
      <LayerItem
        node={blueprint}
        depth={0}
        selectedId={selectedId}
        onSelect={onSelect}
      />
    </div>
  );
}
