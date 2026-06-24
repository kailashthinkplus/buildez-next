"use client";

import React from "react";

export default function GroupCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="
        bg-white/[0.04]
        border border-white/10
        rounded-2xl
        p-4
        shadow-[0_4px_12px_rgba(0,0,0,0.25)]
        backdrop-blur-xl
      "
    >
      <div className="text-sm font-medium text-white/90 mb-3">
        {title}
      </div>

      <div className="space-y-4">{children}</div>
    </div>
  );
}
