"use client";

import { useState, useEffect } from "react";
import {
  Wand2,
  Blocks,
  Layers,
  Droplet,
  Settings,
  Plus,
} from "lucide-react";

import type { BuilderBlueprint, BuilderNode } from "../types/blueprint";
import { WidgetRegistry } from "../core/registry/WidgetRegistry";

// AI Panel
const AiPanel = ({ pageId, onRunAI, onAbortAI, aiChatRuntime, onRequestLogoUpload, onRefine, hasGeneratedCode }: any) => {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = () => {
    if (prompt.trim()) {
      onRunAI(prompt);
    }
  };

  return (
    <div className="p-4 space-y-4 h-full flex flex-col">
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="w-full flex-1 p-2 border border-gray-300 rounded resize-none text-sm"
        placeholder="Describe your design request..."
      />
      <button
        onClick={handleSubmit}
        disabled={aiChatRuntime.status === "running" || !prompt.trim()}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
      >
        {aiChatRuntime.status === "running" ? "Generating..." : "Generate"}
      </button>
      {aiChatRuntime.message && (
        <div className="p-2 bg-blue-50 text-blue-900 text-sm rounded border border-blue-200">
          {aiChatRuntime.message}
        </div>
      )}
    </div>
  );
};

// Block Menu - proper implementation
const BlockMenu = ({ onAddBlock, onOpenColumnPicker }: any) => {
  const widgets = WidgetRegistry.getAll();
  
  // Group widgets by category
  const grouped: Record<string, any[]> = {};
  widgets.forEach((w) => {
    const cat = w.category || "Other";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(w);
  });

  const categoryOrder = ["basic", "layout", "media", "forms", "ecommerce", "dynamic"];
  const sortedCategories = categoryOrder.filter((cat) => grouped[cat]).concat(
    Object.keys(grouped).filter((cat) => !categoryOrder.includes(cat))
  );

  return (
    <div className="p-4 space-y-6 overflow-y-auto h-full">
      {sortedCategories.map((category) => (
        <div key={category}>
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3 tracking-wide">
            {category}
          </h3>
          <div className="space-y-2">
            {grouped[category].map((widget) => (
              <button
                key={widget.type}
                onClick={() => onAddBlock(widget.type)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-900 text-sm font-medium text-left transition"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.effectAllowed = "copy";
                  e.dataTransfer.setData("widget-type", widget.type);
                }}
              >
                <Plus size={14} />
                <span>{widget.name}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// Layers Panel
const LayersPanel = ({ blueprint, selectedId, onSelect }: any) => {
  const renderNode = (nodeId: string, depth = 0): React.ReactNode => {
    const node: BuilderNode | undefined = blueprint.nodes[nodeId];
    if (!node) return null;

    const isSelected = node.id === selectedId;
    return (
      <div key={node.id}>
        <button
          onClick={() => onSelect(node.id)}
          className={`w-full text-left px-2 py-1 rounded text-sm ${
            isSelected
              ? "bg-blue-500 text-white"
              : "hover:bg-gray-100"
          }`}
          style={{ paddingLeft: `${12 + depth * 12}px` }}
        >
          {node.type}
        </button>
        {node.children?.map((childId) => renderNode(childId, depth + 1))}
      </div>
    );
  };

  return (
    <div className="p-4 space-y-1 overflow-y-auto h-full">
      {renderNode(blueprint.root)}
    </div>
  );
};

// Colors Panel
const ColorsPanel = () => (
  <div className="p-4">
    <div className="text-sm text-gray-600">Colors Panel (Placeholder)</div>
  </div>
);

// Settings Panel
const PageSettingsPanel = ({ blueprint, onUpdateNode }: any) => (
  <div className="p-4">
    <div className="text-sm text-gray-600">Settings Panel (Placeholder)</div>
  </div>
);

/* ============================================================
   PANEL CONFIGURATION
============================================================ */

const PANELS = [
  { id: "ai", icon: Wand2, label: "AI" },
  { id: "blocks", icon: Blocks, label: "Blocks" },
  { id: "layers", icon: Layers, label: "Layers" },
  { id: "colors", icon: Droplet, label: "Colors" },
  { id: "settings", icon: Settings, label: "Settings" },
] as const;

type PanelId = typeof PANELS[number]["id"];

/* ============================================================
   PROPS
============================================================ */

interface IntegratedLeftSidebarProps {
  blueprint: BuilderBlueprint;
  selectedId: string | null;
  onSelect(id: string | null): void;
  onUpdateNode(id: string, patch: Partial<BuilderNode>): void;

  /* 🔑 Builder mutation entry point */
  onAddBlock(type: string): void;

  onRunAI(prompt: string): void;
  onAbortAI(): void;
  pageId: string;

  aiChatRuntime: {
    status: "idle" | "running" | "success" | "error";
    message?: string;
  };

  onRequestLogoUpload(): void;
  onCapturePrompt?(prompt: string): void;
  onRefine?(request: string, targetSection?: string): void;
  hasGeneratedCode?: boolean;
}

/* ============================================================
   INTEGRATED LEFT SIDEBAR (LOVABLE-STYLE)
============================================================ */

export default function IntegratedLeftSidebar({
  blueprint,
  selectedId,
  onSelect,
  onUpdateNode,
  onAddBlock,
  onRunAI,
  onAbortAI,
  pageId,
  aiChatRuntime,
  onRequestLogoUpload,
  onCapturePrompt,
  onRefine,
  hasGeneratedCode,
}: IntegratedLeftSidebarProps) {
  const [activePanel, setActivePanel] = useState<PanelId | null>("ai");
  const [showColumnPicker, setShowColumnPicker] = useState(false);

  const handlePanelClick = (panelId: PanelId) => {
    setActivePanel((current) => (current === panelId ? null : panelId));
  };

  const closePanel = () => setActivePanel(null);

  /* ----------------------------------------------------------
     ESC KEY → CLOSE PANEL
  ---------------------------------------------------------- */
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && activePanel) {
        closePanel();
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [activePanel]);

  return (
    <div className="flex relative z-[9999]">
      {/* ============================================================
           ICON BAR (ALWAYS VISIBLE)
      ============================================================ */}
      <div
        className="
          w-[60px] pt-5
          bg-white/10 dark:bg-white/5
          backdrop-blur-xl
          border-r border-white/20
          shadow-xl shadow-black/20
          flex flex-col gap-[2px] py-1
        "
      >
        {PANELS.map((panel) => {
          const Icon = panel.icon;
          const isActive = activePanel === panel.id;

          return (
            <button
              key={panel.id}
              onClick={() => handlePanelClick(panel.id)}
              title={panel.label}
              aria-label={panel.label}
              className={`
                w-full h-[42px]
                flex items-center justify-center
                rounded-lg
                transition-all duration-200
                ${
                  isActive
                    ? "text-white bg-white/10"
                    : "text-neutral-300 hover:text-white hover:bg-white/5"
                }
              `}
            >
              <Icon
                size={20}
                className={
                  isActive
                    ? "text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.55)]"
                    : "text-neutral-300"
                }
              />
            </button>
          );
        })}
      </div>

      {/* ============================================================
           PANEL CONTENT (SLIDE-OUT)
      ============================================================ */}
      <div
        className={`
          bg-black/40 dark:bg-black/50
          backdrop-blur-2xl
          border-r border-white/10
          shadow-xl shadow-black/50
          transition-all duration-300 ease-out
          overflow-hidden
          ${activePanel ? "w-[360px] opacity-100" : "w-0 opacity-0"}
        `}
      >
        {activePanel && (
          <>
            {/* PANEL HEADER */}
            <div className="h-12 px-4 flex items-center justify-between border-b border-white/10 bg-black/30 backdrop-blur-xl text-white">
              <span className="capitalize text-sm font-medium">
                {PANELS.find((p) => p.id === activePanel)?.label}
              </span>

              <button
                onClick={closePanel}
                className="p-1 rounded text-white/70 hover:text-white hover:bg-white/10 transition"
                aria-label="Close panel"
              >
                ✕
              </button>
            </div>

            {/* PANEL CONTENT (SCROLLABLE) */}
            <div className="h-[calc(100vh-48px)] overflow-y-auto">
              {activePanel === "ai" && (
                <AiPanel
                  pageId={pageId}
                  onRunAI={onRunAI}
                  onAbortAI={onAbortAI}
                  aiChatRuntime={aiChatRuntime}
                  onRequestLogoUpload={onRequestLogoUpload}
                  onRefine={onRefine}
                  hasGeneratedCode={hasGeneratedCode}
                />
              )}

              {activePanel === "blocks" && (
                <BlockMenu
                  onAddBlock={onAddBlock}
                  onOpenColumnPicker={() => setShowColumnPicker(true)}
                />
              )}

              {activePanel === "layers" && (
                <LayersPanel
                  blueprint={blueprint}
                  selectedId={selectedId}
                  onSelect={onSelect}
                />
              )}

              {activePanel === "colors" && <ColorsPanel />}

              {activePanel === "settings" && (
                <PageSettingsPanel
                  blueprint={blueprint}
                  onUpdateNode={onUpdateNode}
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}