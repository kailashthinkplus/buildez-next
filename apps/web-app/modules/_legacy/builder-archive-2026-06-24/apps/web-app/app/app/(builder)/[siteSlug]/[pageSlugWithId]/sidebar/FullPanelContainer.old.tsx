"use client";

import React from "react";
import { usePanelStore } from "@/modules/builder/state/usePanelStore";
import { BlueprintNode } from "@/modules/builder/renderer/PageRenderer";
import ColorsPanel from "./colors/ColorsPanel";

/* ============================================================
   REAL PANELS
============================================================ */

import AiPanel from "./ai/AiPanel";
import BlockMenu from "./BlockMenu";
import { LayersPanel } from "./LayersPanel";
import PageSettingsPanel from "./PageSettingsPanel";

/* ============================================================
   PLACEHOLDER PANELS (INTENTIONAL)
============================================================ */

const ComponentsPanel = () => (
  <div className="text-white p-4">
    Components panel coming soon…
  </div>
);

const MediaPanel = () => (
  <div className="text-white p-4">
    Media panel coming soon…
  </div>
);

/* ============================================================
   PROPS
============================================================ */

interface FullPanelContainerProps {
  blueprint: BlueprintNode;
  selectedId: string | null;
  onSelect(id: string | null): void;

  /* PAGE SETTINGS */
  onUpdateNode(id: string, patch: Partial<BlueprintNode>): void;

  /* 🔥 AI (REQUIRED) */
  onRunAI: (prompt: string, context?: any) => Promise<void>;
  onAbortAI: () => void;
  pageId: string;

  /* ✅ AI CHAT RUNTIME (V7 SOURCE OF TRUTH) */
  aiChatRuntime: {
    status: "idle" | "running" | "success" | "error";
    message?: string;
  };

  /* ✅ LOGO UPLOAD REQUEST */
  onRequestLogoUpload(): void;
}

/* ============================================================
   FULL PANEL CONTAINER — CANONICAL
============================================================ */

export default function FullPanelContainer({
  blueprint,
  selectedId,
  onSelect,
  onUpdateNode,
  onRunAI,
  onAbortAI,
  pageId,
  aiChatRuntime,
  onRequestLogoUpload,
}: FullPanelContainerProps) {
  const { leftPanel, isLeftPanelOpen, closeLeftPanel } =
    usePanelStore();

  /* 🔒 HARD GUARD — DO NOT MOUNT WHEN CLOSED */
  if (!leftPanel || !isLeftPanelOpen) return null;

  return (
    <div
      className="
        fixed left-0 top-0 bottom-0
        w-[320px]
        bg-black/40 dark:bg-black/50
        backdrop-blur-2xl
        border-r border-white/10
        shadow-xl shadow-black/50
        z-[99999]
        transition-transform duration-300 ease-out
        translate-x-0
      "
    >
      {/* =====================================================
         HEADER
      ===================================================== */}
      <div
        className="
          h-12 px-4
          flex items-center justify-between
          border-b border-white/10
          bg-black/30 backdrop-blur-xl
          text-white
        "
      >
        <span className="capitalize text-sm font-medium">
          {leftPanel}
        </span>

        <button
          onClick={closeLeftPanel}
          className="
            p-1 rounded
            text-white/70
            hover:text-white
            hover:bg-white/10
            transition
          "
          aria-label="Close panel"
        >
          ✕
        </button>
      </div>

      {/* =====================================================
         CONTENT
      ===================================================== */}
      <div className="h-[calc(100%-48px)] overflow-y-auto">
        {leftPanel === "ai" && (
          <AiPanel
            page={blueprint}
            pageId={pageId}
            onRunAI={onRunAI}
            onAbortAI={onAbortAI}
            aiChatRuntime={aiChatRuntime}
            onRequestLogoUpload={onRequestLogoUpload}
          />
        )}

        {leftPanel === "blocks" && <BlockMenu />}

        {leftPanel === "layers" && (
          <LayersPanel
            blueprint={blueprint}
            selectedId={selectedId}
            onSelect={onSelect}
          />
        )}

        {leftPanel === "components" && <ComponentsPanel />}

        {leftPanel === "media" && <MediaPanel />}

        {leftPanel === "colors" && <ColorsPanel />}

        {leftPanel === "settings" && (
          <PageSettingsPanel
            blueprint={blueprint}
            onUpdateNode={onUpdateNode}
          />
        )}
      </div>
    </div>
  );
}
