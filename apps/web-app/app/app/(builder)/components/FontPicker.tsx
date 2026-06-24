"use client";

import { useEffect, useState } from "react";

interface FontPickerProps {
  value?: string;
  onChange(fontFamily: string): void;
}

export function FontPicker({ value, onChange }: FontPickerProps) {
  const [fonts, setFonts] = useState<string[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("/api/fonts/google")
      .then((res) => res.json())
      .then((data) =>
        setFonts(data.fonts.map((f: any) => f.family))
      )
      .catch(() => setFonts([]));
  }, []);

  const filtered = fonts.filter((f) =>
    f.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-2">
      <input
        className="input"
        placeholder="Search Google Fonts…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="max-h-56 overflow-auto rounded-md border border-white/10">
        {filtered.map((font) => (
          <button
            key={font}
            className={`block w-full px-3 py-2 text-left text-sm hover:bg-white/5 ${
              value === font ? "bg-white/10" : ""
            }`}
            style={{ fontFamily: font }}
            onClick={() => onChange(font)}
          >
            {font}
          </button>
        ))}
      </div>
    </div>
  );
}
