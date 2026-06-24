"use client";

import { X } from "lucide-react";

export default function ColumnStructurePicker({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose(): void;
  onSelect(columns: number): void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[20000] bg-black/40 flex items-center justify-center">
      <div className="w-[420px] rounded-2xl bg-[#0F1118] border border-white/10 shadow-2xl p-6">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">
            Choose column layout
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10"
          >
            <X size={18} className="text-white/70" />
          </button>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((count) => (
            <button
              key={count}
              onClick={() => onSelect(count)}
              className="
                group
                rounded-xl
                border border-white/10
                bg-white/[0.04]
                hover:bg-white/[0.08]
                hover:border-white/20
                p-4
                transition
              "
            >
              {/* COLUMN PREVIEW */}
              <div className="flex gap-1 h-10">
                {Array.from({ length: count }).map((_, i) => (
                  <div
                    key={i}
                    className="
                      flex-1 rounded
                      bg-neutral-500/30
                      group-hover:bg-neutral-400/40
                      transition
                    "
                  />
                ))}
              </div>

              {/* LABEL */}
              <p className="mt-2 text-sm text-center text-white/70">
                {count} column{count > 1 ? "s" : ""}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
