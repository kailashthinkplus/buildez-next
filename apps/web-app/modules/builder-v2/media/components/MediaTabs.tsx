"use client";

import {
  FolderOpen,
  Upload,
  Sparkles,
} from "lucide-react";

type Tab =
  | "library"
  | "upload"
  | "ai";

interface MediaTabsProps {
  value: Tab;
  onChange(tab: Tab): void;
}

const tabs: {
  id: Tab;
  label: string;
  icon: React.ElementType;
}[] = [
  {
    id: "library",
    label: "Library",
    icon: FolderOpen,
  },
  {
    id: "upload",
    label: "Upload",
    icon: Upload,
  },
  {
    id: "ai",
    label: "AI Generate",
    icon: Sparkles,
  },
];

export default function MediaTabs({
  value,
  onChange,
}: MediaTabsProps) {
  return (
    <div
      className="
        flex
        items-center
        gap-2
        rounded-xl
        bg-[#0F172A]
        border
        border-white/10
        p-1
      "
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;

        const active =
          value === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`
              flex-1
              h-10
              rounded-lg
              flex
              items-center
              justify-center
              gap-2
              text-sm
              font-medium
              transition-all
              ${
                active
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }
            `}
          >
            <Icon size={16} />

            <span>
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}