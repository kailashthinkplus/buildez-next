"use client";

import React from "react";
import { useInspectorTabStore } from "../state/useInspectorTabStore";

export default function InspectorTabs() {
  const { tab, setTab } = useInspectorTabStore();

  const tabs = ["content", "style", "layout", "effects"] as const;

  return (
    <div className="flex border-b bg-white sticky top-0 z-10">
      {tabs.map((t) => (
        <button
          key={t}
          onClick={() => setTab(t)}
          className={`flex-1 py-2 text-sm capitalize border-r last:border-r-0 
            ${tab === t ? "font-semibold text-black" : "text-gray-500"}`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
