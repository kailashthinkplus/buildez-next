"use client";

import { useState, useEffect } from "react";

interface GoogleFontsPickerProps {
  value: string;
  onChange: (font: string) => void;
}

const POPULAR_FONTS = [
  "Roboto",
  "Open Sans",
  "Lato",
  "Montserrat",
  "Playfair Display",
  "Poppins",
  "Inter",
  "Nunito",
  "Raleway",
  "Source Sans Pro",
  "Ubuntu",
  "Oswald",
  "Quicksand",
  "Caveat",
  "JetBrains Mono",
];

export default function GoogleFontsPicker({
  value,
  onChange,
}: GoogleFontsPickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [search, setSearch] = useState("");
  const [fonts, setFonts] = useState(POPULAR_FONTS);

  const handleSearch = (query: string) => {
    setSearch(query);
    if (!query.trim()) {
      setFonts(POPULAR_FONTS);
      return;
    }

    const filtered = POPULAR_FONTS.filter((font) =>
      font.toLowerCase().includes(query.toLowerCase())
    );
    setFonts(filtered);
  };

  const handleSelect = (font: string) => {
    onChange(font);
    setShowPicker(false);
    setSearch("");
  };

  useEffect(() => {
    // Load selected font from Google Fonts
    if (value && value !== "system-ui") {
      const link = document.querySelector(
        `link[href*="family=${value.replace(/ /g, "+")}"]`
      );
      if (!link) {
        const fontLink = document.createElement("link");
        fontLink.href = `https://fonts.googleapis.com/css2?family=${value.replace(/ /g, "+")}&display=swap`;
        fontLink.rel = "stylesheet";
        document.head.appendChild(fontLink);
      }
    }
  }, [value]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setShowPicker(!showPicker)}
        className="w-full px-3 py-2 rounded bg-white/5 border border-white/10 text-sm text-white/90 hover:bg-white/10 transition text-left"
        style={{ fontFamily: value === "system-ui" ? "inherit" : value }}
      >
        {value || "Select font..."}
      </button>

      {showPicker && (
        <div className="absolute top-full mt-1 left-0 right-0 z-50 bg-black/95 border border-white/10 rounded-lg p-2 shadow-2xl">
          <input
            type="text"
            placeholder="Search fonts..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-2 py-1.5 rounded bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/50 mb-2"
          />
          <div className="max-h-48 overflow-y-auto space-y-1">
            {fonts.map((font) => (
              <button
                key={font}
                type="button"
                onClick={() => handleSelect(font)}
                className="w-full text-left px-2 py-1.5 rounded text-sm hover:bg-white/10 transition"
                style={{ fontFamily: font }}
              >
                {font}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
