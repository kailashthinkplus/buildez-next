"use client";

import React from "react";
import { useBlueprintStore } from "../state/useBlueprintStore";
import { usePanelStore } from "../state/usePanelStore";
import { getInspectorSchema } from "../blueprint/registry";
import InspectorTabs from "./InspectorTabs";
import InspectorRenderer from "./InspectorRenderer";

export default function InspectorPanel() {
  const selectedId = useBlueprintStore((s) => s.selectedId);
  const closeInspector = useSidebarStore((s) => s.closeInspector);

  if (!selectedId) {
    return (
      <div className="w-[360px] h-full bg-white border-l flex items-center justify-center text-gray-500">
        No element selected
      </div>
    );
  }

  const node = useBlueprintStore.getState().findNode(selectedId);
  if (!node) {
    return (
      <div className="w-[360px] h-full bg-white border-l flex items-center justify-center text-gray-500">
        Invalid selection
      </div>
    );
  }

  const schema = getInspectorSchema(node.type);

  return (
    <div className="w-[360px] h-full flex flex-col bg-white border-l">
      <InspectorTabs />

      <div className="flex-1 overflow-auto px-4 py-4">
        <InspectorRenderer node={node} schema={schema} />
      </div>
    </div>
  );
}
