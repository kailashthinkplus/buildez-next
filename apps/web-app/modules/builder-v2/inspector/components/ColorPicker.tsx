"use client";

import { useState } from "react";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

const COLOR_PALETTE = [
  // Grays
  "#ffffff",
  "#f5f5f5",
  "#e0e0e0",
  "#bdbdbd",
  "#808080",
  "#424242",
  "#212121",
  "#000000",
  // Blues
  "#e3f2fd",
  "#bbdefb",
  "#90caf9",
  "#64b5f6",
  "#42a5f5",
  "#2196f3",
  "#1e88e5",
  "#1565c0",
  // Reds
  "#ffebee",
  "#ffcdd2",
  "#ef9a9a",
  "#e57373",
  "#ef5350",
  "#f44336",
  "#e53935",
  "#c62828",
  // Greens
  "#e8f5e9",
  "#c8e6c9",
  "#a5d6a7",
  "#81c784",
  "#66bb6a",
  "#4caf50",
  "#43a047",
  "#388e3c",
  // Oranges
  "#fff3e0",
  "#ffe0b2",
  "#ffcc80",
  "#ffb74d",
  "#ffa726",
  "#ff9800",
  "#f57c00",
  "#e65100",
];

export default function ColorPicker({
  value,
  onChange,
}: ColorPickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [customColor, setCustomColor] = useState(value || "#000000");

  const handleColorSelect = (color: string) => {
    onChange(color);
    setCustomColor(color);
  };

  return (
    <div className="relative">
      <div className="flex gap-2 items-center">
        <button
          type="button"
          onClick={() => setShowPicker(!showPicker)}
          className="w-10 h-10 rounded border border-white/20 shadow-md transition hover:border-white/40"
          style={{ backgroundColor: value || "#000000" }}
          title="Click to open color picker"
        />
        <input
          type="text"
          value={value || "#000000"}
          onChange={(e) => {
            onChange(e.target.value);
            setCustomColor(e.target.value);
          }}
          placeholder="#000000"
          className="flex-1 px-3 py-2 rounded bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/50"
        />
      </div>

      {showPicker && (
        <div className="absolute top-full mt-2 left-0 z-50 bg-black/95 border border-white/10 rounded-lg p-3 shadow-2xl">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-white/60">
              Color
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
          <div className="grid grid-cols-8 gap-2 mb-3">
            {COLOR_PALETTE.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => handleColorSelect(color)}
                className={`w-8 h-8 rounded border-2 transition hover:scale-110 ${
                  value === color ? "border-white" : "border-white/20"
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>

          <div className="border-t border-white/10 pt-2">
            <label className="text-xs text-white/70 block mb-1">
              Custom Color
            </label>
            <input
              type="color"
              value={customColor}
              onChange={(e) => handleColorSelect(e.target.value)}
              className="w-full h-8 rounded cursor-pointer"
            />
          </div>
        </div>
      )}
    </div>
  );
}
