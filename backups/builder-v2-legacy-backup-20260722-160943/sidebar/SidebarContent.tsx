"use client";

import { usePanelStore } from "../store/usePanelStore";

import BlocksPanel from "./panels/BlocksPanel";
import LayersPanel from "./panels/LayersPanel";

/*
Future

import AIChatPanel from "./panels/AIChatPanel";
import ComponentsPanel from "./panels/ComponentsPanel";
import MediaPanel from "./panels/MediaPanel";
import ThemesPanel from "./panels/ThemesPanel";
import SettingsPanel from "./panels/SettingsPanel";
*/

export default function SidebarContent() {
  const leftPanel = usePanelStore(
    (s) => s.leftPanel
  );

  if (!leftPanel) {
    return null;
  }

  return (
    <aside
      className="
        fixed
        left-[60px]
        top-14
        bottom-0

        w-[320px]

        border-r
        border-white/10

        bg-[#0F1118]/95
        backdrop-blur-xl

        overflow-hidden

        z-[999]
      "
    >
      {leftPanel === "blocks" && (
        <BlocksPanel />
      )}

      {leftPanel === "layers" && (
        <LayersPanel />
      )}

      {/* Future Panels */}
    </aside>
  );
}