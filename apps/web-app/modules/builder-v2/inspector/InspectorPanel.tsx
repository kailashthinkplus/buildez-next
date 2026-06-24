"use client";

import { useMemo, useState } from "react";
import type { BuilderBlueprint, BuilderNode } from "../types/blueprint";

import ContentTab from "./tabs/ContentTab";
import DesignTab from "./tabs/DesignTab";
import AdvancedTab from "./tabs/AdvancedTab";

/* ============================================================
   TYPES
============================================================ */

interface InspectorPanelProps {
  selectedId: string | null;
  blueprint: BuilderBlueprint;
  onUpdateNode(id: string, patch: Partial<BuilderNode>): void;
}

/* ============================================================
   INSPECTOR PANEL — V4 CANONICAL
============================================================ */

export default function InspectorPanel({
  selectedId,
  blueprint,
  onUpdateNode,
}: InspectorPanelProps) {
  const [activeTab, setActiveTab] = useState<
    "content" | "design" | "advanced"
  >("content");

  const node = useMemo(() => {
    if (!selectedId) return null;
    return blueprint.nodes[selectedId] ?? null;
  }, [selectedId, blueprint]);

  if (!node) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-white/40">
        Select an element to edit
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col text-white">
      {/* =====================================================
         HEADER
      ===================================================== */}
      <div className="px-4 py-3 border-b border-white/10">
        <div className="text-sm font-medium capitalize">
          {node.type} settings
        </div>

        <div className="mt-2 flex gap-2">
          <TabButton
            active={activeTab === "content"}
            onClick={() => setActiveTab("content")}
          >
            Content
          </TabButton>

          <TabButton
            active={activeTab === "design"}
            onClick={() => setActiveTab("design")}
          >
            Design
          </TabButton>

          <TabButton
            active={activeTab === "advanced"}
            onClick={() => setActiveTab("advanced")}
          >
            Advanced
          </TabButton>
        </div>
      </div>

      {/* =====================================================
         BODY
      ===================================================== */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === "content" && (
          <ContentTab
            node={node}
            onUpdateNode={onUpdateNode}
          />
        )}

        {activeTab === "design" && (
          <DesignTab
            node={node}
            onUpdateNode={onUpdateNode}
          />
        )}

        {activeTab === "advanced" && (
          <AdvancedTab
            node={node}
            onUpdateNode={onUpdateNode}
          />
        )}
      </div>
    </div>
  );
}

/* ============================================================
   UI PRIMITIVES
============================================================ */

function TabButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick(): void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        px-3 py-1.5 rounded-md text-xs font-medium
        transition
        ${
          active
            ? "bg-white/15 text-white"
            : "text-white/50 hover:text-white"
        }
      `}
    >
      {children}
    </button>
  );
}
