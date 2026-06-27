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
  onApplyColumnStructure(id: string, widths: number[]): void;
  siteId: string;
}

/* ============================================================
   INSPECTOR PANEL — V4 CANONICAL
============================================================ */

export default function InspectorPanel({
  selectedId,
  blueprint,
  onUpdateNode,
  onApplyColumnStructure,
  siteId,
}: InspectorPanelProps) {
  const [activeTab, setActiveTab] = useState<
    "content" | "style" | "advanced"
  >("content");

  const node = useMemo(() => {
    if (!selectedId) return null;
    return blueprint.nodes[selectedId] ?? null;
  }, [selectedId, blueprint]);

  if (!node) {
    return (
      <div className="builder-chrome h-full flex items-center justify-center text-sm text-white/40">
        Select an element to edit
      </div>
    );
  }

  return (
    <div className="builder-chrome h-full flex flex-col">
      {/* =====================================================
         HEADER
      ===================================================== */}
      <div className="border-b border-white/10 bg-[#0B0D12] px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold capitalize text-white">
              {node.type}
            </div>
            <div className="mt-0.5 text-[11px] text-white/40">
              Inspector
            </div>
          </div>
          <div className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] uppercase tracking-wide text-white/45">
            {node.id.slice(0, 8)}
          </div>
        </div>

        <div className="mt-3 grid grid-cols-3 rounded-lg border border-white/10 bg-black/25 p-1">
          <TabButton
            active={activeTab === "content"}
            onClick={() => setActiveTab("content")}
          >
            Content
          </TabButton>

          <TabButton
            active={activeTab === "style"}
            onClick={() => setActiveTab("style")}
          >
            Style
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
      <div className="flex-1 overflow-y-auto p-3">
        {activeTab === "content" && (
          <ContentTab
            node={node}
            onUpdateNode={onUpdateNode}
            siteId={siteId}
          />
        )}

        {activeTab === "style" && (
          <DesignTab
            node={node}
            onUpdateNode={onUpdateNode}
            onApplyColumnStructure={onApplyColumnStructure}
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
            ? "bg-blue-500 text-white shadow"
            : "text-white/50 hover:text-white"
        }
      `}
    >
      {children}
    </button>
  );
}
