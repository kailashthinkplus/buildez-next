"use client";

import { useState, useMemo, useEffect } from "react";

import { useBlueprintStore } from "@/modules/builder/state/useBlueprintStore";
import WIDGET_CONFIG from "@/modules/builder/inspector/schema/WIDGET_CONFIG";

import ContentTab from "./ContentTab";
import StylesTab from "./StylesTab";
import LayoutTab from "./LayoutTab";

/* ------------------------------------------------------------------
   Helper: find node deep inside tree (recursive)
------------------------------------------------------------------ */
function findNode(tree: any, id: string | null): any {
  if (!tree || !id) return null;
  if (tree.id === id) return tree;

  if (Array.isArray(tree.children)) {
    for (const child of tree.children) {
      const found = findNode(child, id);
      if (found) return found;
      }
  }

  return null;
}

/* ------------------------------------------------------------------
   INSPECTOR PANEL (Framer-style UI)
------------------------------------------------------------------ */
export default function InspectorPanel() {
  const selectedId = useBlueprintStore((s) => s.selectedId);
  const selectedNode = useBlueprintStore((s) => s.selectedNode);
  const tree = useBlueprintStore((s) => s.blueprint.page.tree);

  const [activeTab, setActiveTab] =
    useState<"content" | "styles" | "layout">("content");

  /* ---------------------- Resolve Active Node ---------------------- */
  const node = useMemo(() => {
    if (selectedNode?.id === selectedId) return selectedNode;
    return findNode(tree, selectedId);
  }, [tree, selectedId, selectedNode]);

  /* ---------------------- Resolve Schema Config ---------------------- */
  const config = node?.type ? WIDGET_CONFIG[node.type] || null : null;

  const hasContent = !!config?.tabs?.content?.length;
  const hasStyles = !!config?.tabs?.styles?.length;
  const hasLayout = !!config?.tabs?.layout?.length;

  /* Auto-switch tab if content tab is empty */
  useEffect(() => {
    if (activeTab === "content" && !hasContent) {
      if (hasStyles) setActiveTab("styles");
      else if (hasLayout) setActiveTab("layout");
    }
  }, [activeTab, hasContent, hasStyles, hasLayout]);

  /* ---------------------- Handle Empty / No Selection ---------------------- */
  if (!node) {
    return (
      <div className="h-full flex items-center justify-center text-white/70">
        Select an element
      </div>
    );
  }

  if (!config) {
    return (
      <div className="h-full flex items-center justify-center text-white/70">
        No editable options for this element
      </div>
    );
  }

  /* ---------------------- Tabs Array ---------------------- */
  const tabs = [
    hasContent && { key: "content", label: "Content" },
    hasStyles && { key: "styles", label: "Styles" },
    hasLayout && { key: "layout", label: "Layout" },
  ].filter(Boolean) as Array<{ key: string; label: string }>;

  /* ---------------------- RENDER ---------------------- */
  return (
    <div
      className="
        h-full flex flex-col
        bg-[#0A0D14]/80
        backdrop-blur-2xl
        border-l border-white/10
        shadow-xl
        text-white
      "
    >
      {/* ---------------------- TABS ---------------------- */}
      <div
        className="
          flex gap-2 px-3 py-2
          border-b border-white/10
          bg-[#0D1018]/70
          backdrop-blur-xl
        "
      >
        {tabs.map((t) => {
          const isActive = activeTab === t.key;

          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key as any)}
              className={`
                px-3 py-2 text-sm rounded-md select-none transition-colors
                ${
                  isActive
                    ? "text-white font-semibold border-b-2 border-white"
                    : "text-white/60 hover:text-white"
                }
              `}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ---------------------- TAB CONTENT ---------------------- */}
      <div
        className="
          flex-1 overflow-y-auto
          p-4 space-y-4
          bg-gradient-to-b from-transparent to-black/10
        "
      >
        {activeTab === "content" && hasContent && (
          <ContentTab node={node} config={config} />
        )}

        {activeTab === "styles" && hasStyles && (
          <StylesTab node={node} config={config} />
        )}

        {activeTab === "layout" && hasLayout && (
          <LayoutTab node={node} config={config} />
        )}
      </div>
    </div>
  );
}
