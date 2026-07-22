"use client";

import { useEffect, useMemo, useState } from "react";
import {
  FONT_OPTIONS,
  SYSTEM_FONT_OPTIONS,
  isSystemFont,
  normalizeGoogleFontFamily,
  type GoogleFontItem,
} from "@/lib/googleFonts";

interface GoogleFontsPickerProps {
  value: string;
  onChange: (font: string) => void;
}

const FONT_WEIGHTS = ["400", "500", "600", "700"];

function buildFontUrl(family: string) {
  const encoded = normalizeGoogleFontFamily(family).replace(/\s+/g, "+");
  return `https://fonts.googleapis.com/css2?family=${encoded}:wght@${FONT_WEIGHTS.join(";")}&display=swap`;
}

function loadGoogleFont(family: string) {
  const normalized = normalizeGoogleFontFamily(family);
  if (!normalized || isSystemFont(normalized)) return;

  const id = `builder-google-font-${normalized.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`;
  if (document.getElementById(id)) return;

  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = buildFontUrl(normalized);
  document.head.appendChild(link);
}

export default function GoogleFontsPicker({
  value,
  onChange,
}: GoogleFontsPickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [search, setSearch] = useState("");
  const [fonts, setFonts] = useState<GoogleFontItem[]>(FONT_OPTIONS);
  const currentFont = normalizeGoogleFontFamily(value || "system-ui");

  useEffect(() => {
    let cancelled = false;

    fetch("/api/fonts/google")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled || !Array.isArray(data?.fonts)) return;
        setFonts([...SYSTEM_FONT_OPTIONS, ...data.fonts]);
      })
      .catch(() => {
        if (!cancelled) setFonts(FONT_OPTIONS);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    loadGoogleFont(currentFont);
  }, [currentFont]);

  const filteredFonts = useMemo(() => {
    const query = search.trim().toLowerCase();
    const seen = new Set<string>();

    return fonts.filter((font) => {
      const family = normalizeGoogleFontFamily(font.family);
      const key = family.toLowerCase();
      if (!family || seen.has(key)) return false;
      seen.add(key);
      return !query || key.includes(query);
    });
  }, [fonts, search]);

  const handleSelect = (font: string) => {
    const normalized = normalizeGoogleFontFamily(font);
    loadGoogleFont(normalized);
    onChange(normalized);
    setShowPicker(false);
    setSearch("");
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setShowPicker((open) => !open)}
        className="w-full rounded-md border border-white/10 bg-white/[0.06] px-3 py-2 text-left text-sm text-white/90 transition hover:bg-white/[0.09]"
        style={{ fontFamily: isSystemFont(currentFont) ? undefined : currentFont }}
      >
        {currentFont || "Select font"}
      </button>

      {showPicker && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border border-white/10 bg-[#07090d] p-2 shadow-2xl">
          <div className="mb-2 flex items-center justify-between gap-2 px-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-white/60">
              Font family
            </span>
            <button
              type="button"
              onClick={() => setShowPicker(false)}
              className="rounded px-2 py-1 text-xs text-white/60 transition hover:bg-white/10 hover:text-white"
              aria-label="Close font picker"
            >
              Close
            </button>
          </div>

          <input
            type="text"
            placeholder="Search fonts"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-2 w-full rounded-md border border-white/10 bg-white/[0.06] px-2.5 py-2 text-sm text-white outline-none placeholder:text-white/35 focus:border-blue-400/60"
          />

          <div className="max-h-80 overflow-y-auto pr-1">
            {filteredFonts.map((font) => {
              const family = normalizeGoogleFontFamily(font.family);
              const selected = family === currentFont;

              return (
                <button
                  key={`${font.category ?? "font"}-${family}`}
                  type="button"
                  onClick={() => handleSelect(family)}
                  className={`flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-sm transition ${
                    selected
                      ? "bg-blue-500/20 text-white"
                      : "text-white/75 hover:bg-white/10 hover:text-white"
                  }`}
                  style={{ fontFamily: isSystemFont(family) ? undefined : family }}
                >
                  <span>{family}</span>
                  {font.category && (
                    <span className="text-[10px] capitalize text-white/35">
                      {font.category}
                    </span>
                  )}
                </button>
              );
            })}

            {filteredFonts.length === 0 && (
              <div className="px-2 py-6 text-center text-sm text-white/40">
                No fonts found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
