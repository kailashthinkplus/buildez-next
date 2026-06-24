"use client";

import {
  Wand2,
  Blocks,
  Layers,
  Image as ImageIcon,
  Droplet,
  Settings,
  Component as ComponentIcon,
} from "lucide-react";

import { usePanelStore } from "@/modules/builder/state/usePanelStore";

/* ========================================================================
   LEFT SIDEBAR — V4 SAFE (V3 UI PARITY)
   ------------------------------------------------------------------------
   • Single source of truth → usePanelStore
   • togglePanel(toolId) handles open/close
   • FullPanelContainer renders actual panel content
   • NO blueprint logic
   • NO selection logic
   • NO coupling to editor internals
=========================================================================== */

const tools = [
  { id: "ai", icon: Wand2, label: "AI" },
  { id: "blocks", icon: Blocks, label: "Blocks" },
  { id: "components", icon: ComponentIcon, label: "Components" },
  { id: "layers", icon: Layers, label: "Layers" }, // ✅ already present
  { id: "media", icon: ImageIcon, label: "Media" },
  { id: "colors", icon: Droplet, label: "Colors" },
  { id: "settings", icon: Settings, label: "Settings" },
] as const;

export default function LeftSidebar() {
  const { leftPanel, togglePanel } = usePanelStore();

  return (
    <div
      className="
        fixed left-0 top-12 bottom-0
        w-[60px] pt-5

        bg-white/10 dark:bg-white/5
        backdrop-blur-xl
        border-r border-white/20
        shadow-xl shadow-black/20

        flex flex-col gap-[2px] py-1
        z-[8000]
      "
    >
      {tools.map((tool) => {
        const Icon = tool.icon;
        const isActive = leftPanel === tool.id;

        return (
          <button
            key={tool.id}
            onClick={() => togglePanel(tool.id)}
            title={tool.label}
            aria-label={tool.label}
            className={`
              w-full h-[42px]
              flex items-center justify-center
              rounded-lg
              transition-all duration-200
              ${
                isActive
                  ? "text-white"
                  : "text-neutral-300 hover:text-white"
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
  );
}
