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
        dashboard-subtle
        border
        dashboard-border
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
                  ? "bg-[#1349A3] text-white shadow-sm"
                  : "dashboard-muted dashboard-hover"
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
