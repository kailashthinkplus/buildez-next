"use client";

import { X } from "lucide-react";

export type ColumnStructurePreset = {
  id: string;
  label: string;
  columns: number[];
};

const PRESETS: ColumnStructurePreset[] = [
  { id: "stack", label: "Stack", columns: [100] },
  { id: "row", label: "Row", columns: [50, 50] },
  { id: "2-even", label: "2 equal", columns: [50, 50] },
  { id: "2-left", label: "1 / 2", columns: [33.333, 66.667] },
  { id: "4-even", label: "4 equal", columns: [25, 25, 25, 25] },
  { id: "3-center", label: "1 / 2 / 1", columns: [25, 50, 25] },
  { id: "2x2", label: "2 x 2", columns: [50, 50, 50, 50] },
  { id: "top-bottom", label: "Top / bottom", columns: [50, 50] },
  { id: "sidebar-right", label: "Sidebar right", columns: [50, 25, 25] },
  { id: "3x2", label: "3 x 2", columns: [33.333, 33.333, 33.333, 33.333, 33.333, 33.333] },
  { id: "mixed-left", label: "Mixed left", columns: [33.333, 33.333, 33.333] },
  { id: "mixed-right", label: "Mixed right", columns: [50, 50, 33.333, 66.667] },
];

export default function ColumnStructurePicker({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose(): void;
  onSelect(columns: number[] | number): void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[20000] flex items-center justify-center bg-black/55 p-6 backdrop-blur-sm">
      <div className="w-full max-w-5xl rounded-2xl border border-white/10 bg-[#0F1118] p-6 shadow-2xl">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Select your structure</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10"
          >
            <X size={18} className="text-white/70" />
          </button>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-2 gap-5 md:grid-cols-4 lg:grid-cols-6">
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => onSelect(preset.columns)}
              className="
                group
                border border-white/10
                bg-white/[0.04]
                hover:bg-white/[0.08]
                hover:border-white/20
                p-3
                transition
              "
              title={preset.label}
            >
              {/* COLUMN PREVIEW */}
              <div className="grid h-[72px] grid-cols-12 gap-0.5 overflow-hidden bg-white/5">
                {preset.columns.map((width, i) => (
                  <div
                    key={i}
                    className="min-h-0 border border-[#0F1118] bg-neutral-300/80 transition group-hover:bg-white/85"
                    style={{
                      gridColumn: `span ${Math.max(1, Math.round((width / 100) * 12))}`,
                    }}
                  />
                ))}
              </div>

              {/* LABEL */}
              <p className="mt-2 truncate text-center text-xs text-white/60">{preset.label}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
