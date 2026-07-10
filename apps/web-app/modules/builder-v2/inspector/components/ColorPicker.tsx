"use client";

import { useEffect, useState } from "react";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  onClear?: () => void;
  allowClear?: boolean;
  themeTokenReady?: boolean;
}

const COLOR_PALETTE = [
  "#ffffff", "#f5f5f5", "#e0e0e0", "#bdbdbd", "#808080", "#424242", "#212121", "#000000",
  "#e3f2fd", "#bbdefb", "#90caf9", "#64b5f6", "#42a5f5", "#2196f3", "#1e88e5", "#1565c0",
  "#ffebee", "#ffcdd2", "#ef9a9a", "#e57373", "#ef5350", "#f44336", "#e53935", "#c62828",
  "#e8f5e9", "#c8e6c9", "#a5d6a7", "#81c784", "#66bb6a", "#4caf50", "#43a047", "#388e3c",
  "#fff3e0", "#ffe0b2", "#ffcc80", "#ffb74d", "#ffa726", "#ff9800", "#f57c00", "#e65100",
];

export default function ColorPicker({
  value,
  onChange,
  onClear,
  allowClear = true,
  themeTokenReady = true,
}: ColorPickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const normalizedColor = normalizeColor(value);
  const [customColor, setCustomColor] = useState(normalizedColor === "transparent" ? "#000000" : normalizedColor);

  useEffect(() => {
    const next = normalizeColor(value);
    setCustomColor(next === "transparent" ? "#000000" : next);
  }, [value]);

  const isTransparent = normalizedColor === "transparent";

  const handleColorSelect = (color: string) => {
    onChange(color);
    setCustomColor(color);
  };

  const handleClear = () => {
    if (onClear) {
      onClear();
    } else {
      onChange("transparent");
    }
    setCustomColor("#000000");
  };

  return (
    <div className="relative" data-theme-token-ready={themeTokenReady ? "true" : "false"}>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowPicker((current) => !current)}
          className="relative h-8 w-8 shrink-0 overflow-hidden rounded-md border border-white/20 transition hover:border-white/40"
          title="Open color picker"
          aria-label="Open color picker"
        >
          <span
            className="absolute inset-0"
            style={
              isTransparent
                ? {
                    backgroundColor: "#111827",
                    backgroundImage:
                      "linear-gradient(45deg, #6b7280 25%, transparent 25%), linear-gradient(-45deg, #6b7280 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #6b7280 75%), linear-gradient(-45deg, transparent 75%, #6b7280 75%)",
                    backgroundSize: "8px 8px",
                    backgroundPosition: "0 0, 0 4px, 4px -4px, -4px 0px",
                  }
                : { backgroundColor: normalizedColor }
            }
          />
        </button>

        <input
          type="text"
          value={value || ""}
          onChange={(event) => {
            const next = event.target.value;
            onChange(next);
            setCustomColor(normalizeColor(next) === "transparent" ? "#000000" : normalizeColor(next));
          }}
          placeholder="#000000"
          className="h-8 min-w-0 flex-1 rounded-md border border-white/10 bg-white/[0.06] px-2 text-xs text-white outline-none placeholder:text-white/35 focus:border-blue-400/60"
        />

        {allowClear && (
          <button
            type="button"
            onClick={handleClear}
            className="h-8 shrink-0 rounded-md border border-white/10 px-2 text-xs text-white/60 transition hover:bg-white/10 hover:text-white"
          >
            Clear
          </button>
        )}
      </div>

      {showPicker && (
        <div className="absolute left-0 top-full z-50 mt-2 w-64 rounded-lg border border-white/10 bg-black/95 p-3 shadow-2xl">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-white/60">
              Select color
            </span>
            <button
              type="button"
              onClick={() => setShowPicker(false)}
              className="rounded px-2 py-1 text-xs text-white/60 transition hover:bg-white/10 hover:text-white"
              aria-label="Close color picker"
            >
              Close
            </button>
          </div>

          <div className="mb-3 grid grid-cols-8 gap-2">
            {COLOR_PALETTE.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => handleColorSelect(color)}
                className={`h-7 w-7 rounded border transition hover:scale-105 ${
                  normalizeColor(value) === color ? "border-white" : "border-white/20"
                }`}
                style={{ backgroundColor: color }}
                title={color}
                aria-label={color}
              />
            ))}
          </div>

          <div className="border-t border-white/10 pt-2">
            <label className="mb-1 block text-xs text-white/70">
              Custom color
            </label>
            <input
              type="color"
              value={customColor}
              onChange={(event) => handleColorSelect(event.target.value)}
              className="h-8 w-full cursor-pointer rounded"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function normalizeColor(value: string): string {
  if (value === "transparent") return "transparent";
  if (/^#[0-9a-f]{6}$/i.test(value)) return value;
  if (/^#[0-9a-f]{3}$/i.test(value)) {
    return `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`;
  }
  return "#000000";
}