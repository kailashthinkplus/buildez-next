"use client";

import { useState, useEffect } from "react";
import {
  Wand2,
  Blocks,
  Layers,
  Image as ImageIcon,
  Droplet,
  Settings,
} from "lucide-react";

import type { BuilderBlueprint, BuilderNode } from "../types/blueprint";
import AiPanel from "../ai/components/AiPanel";
import BlockMenu from "./panels/BlockMenu";
import MediaLibrary from "../media/components/MediaLibrary";

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
  { id: "media", icon: ImageIcon, label: "Media" },
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

  /* Builder mutation entry point */
  onAddBlock(type: string): void;

  onRunAI(prompt: string): void;
  onAbortAI(): void;
  pageId: string;
  siteId: string;

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
  siteId,
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

  useEffect(() => {
    const openPanelFromEvent = (event: Event) => {
      const detail = (event as CustomEvent<{ panel?: PanelId }>).detail;
      const panel = detail?.panel;
      if (!panel) return;

      const exists = PANELS.some((entry) => entry.id === panel);
      if (!exists) return;

      setActivePanel(panel);
    };

    window.addEventListener("builder:open-panel", openPanelFromEvent);
    return () => window.removeEventListener("builder:open-panel", openPanelFromEvent);
  }, []);

  return (
    <div className="relative z-[9999] flex h-full min-h-0">
      {/* ============================================================
           ICON BAR (ALWAYS VISIBLE)
      ============================================================ */}
      <div
        className="
          h-full w-[60px] pt-5
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
          builder-chrome
          flex h-full min-h-0 flex-col
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
            <div className="builder-chrome h-12 px-4 flex items-center justify-between border-b backdrop-blur-xl">
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
            <div className="min-h-0 flex-1 overflow-hidden">
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
                <div className="h-full overflow-y-auto">
                  <BlockMenu
                    onAddBlock={onAddBlock}
                    onOpenColumnPicker={() => setShowColumnPicker(true)}
                  />
                </div>
              )}

              {activePanel === "layers" && (
                <LayersPanel
                  blueprint={blueprint}
                  selectedId={selectedId}
                  onSelect={onSelect}
                />
              )}

              {activePanel === "media" && (
                <div className="h-full overflow-y-auto p-4">
                  <MediaLibrary
                    siteId={siteId}
                    title="Media"
                    description="Upload and manage this site's assets."
                    pickerMode
                  />
                </div>
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
