"use client";

import { useState, useEffect } from "react";
import {
  Wand2,
  Blocks,
  Layers,
  Droplet,
  Settings,
} from "lucide-react";

import { BlueprintNode } from "@/modules/builder/renderer/PageRenderer";

// Panels
import AiPanel from "./ai/AiPanel";
import BlockMenu, { V4BlockType } from "./BlockMenu";
import { LayersPanel } from "./LayersPanel";
import PageSettingsPanel from "./PageSettingsPanel";
import ColorsPanel from "./colors/ColorsPanel";

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
  blueprint: BlueprintNode;
  selectedId: string | null;
  onSelect(id: string | null): void;
  onUpdateNode(id: string, patch: Partial<BlueprintNode>): void;

  /* 🔑 Builder mutation entry point */
  onAddBlock(type: V4BlockType): void;

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