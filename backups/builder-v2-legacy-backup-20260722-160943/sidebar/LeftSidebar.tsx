"use client";

import {
  Wand2,
  Blocks,
  Layers,
  Image as ImageIcon,
  Palette,
  Settings,
  Component,
} from "lucide-react";

import { usePanelStore } from "../store/usePanelStore";

const tools = [
  {
    id: "ai",
    icon: Wand2,
    label: "AI",
  },
  {
    id: "blocks",
    icon: Blocks,
    label: "Blocks",
  },
  {
    id: "components",
    icon: Component,
    label: "Components",
  },
  {
    id: "layers",
    icon: Layers,
    label: "Layers",
  },
  {
    id: "media",
    icon: ImageIcon,
    label: "Media",
  },
  {
    id: "themes",
    icon: Palette,
    label: "Themes",
  },
  {
    id: "settings",
    icon: Settings,
    label: "Settings",
  },
];

export default function LeftSidebar() {

  const {

    leftPanel,

    togglePanel,

  } = usePanelStore();

  return (

    <aside
      className="
      fixed
      left-0
      top-12
      bottom-0

      w-[60px]

      bg-white/10
      dark:bg-white/5

      backdrop-blur-xl

      border-r
      border-white/10

      flex
      flex-col

      items-center

      py-3

      gap-2

      z-[1000]
      "
    >

      {tools.map((tool) => {

        const Icon = tool.icon;

        const active =
          leftPanel === tool.id;

        return (

          <button

            key={tool.id}

            onClick={() => togglePanel(tool.id as any)}

            className={`
            w-11
            h-11

            rounded-xl

            flex
            items-center
            justify-center

            transition-all

            ${
              active
                ? "bg-blue-600 text-white shadow-lg"
                : "hover:bg-white/10 text-slate-400"
            }

          `}

          >

            <Icon size={20} />

          </button>

        );

      })}

    </aside>

  );

}