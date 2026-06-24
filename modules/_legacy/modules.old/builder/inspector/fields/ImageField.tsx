"use client";

import React, { useRef } from "react";

export default function ImageField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string | undefined;
  onChange: (v: string | null) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onChange(reader.result); // Base64 MVP — later upgrade to DB/Upload
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <label className="block text-xs text-white/60 mb-1">{label}</label>

      <div
        className="
          bg-white/[0.07]
          border border-white/10
          rounded-lg
          p-3
          flex flex-col gap-3
        "
      >
        {/* Image Preview Area */}
        <div className="flex items-center gap-3">
          <div
            className="
              w-16 h-16 rounded-lg overflow-hidden bg-white/10
              border border-white/20
            "
          >
            {value ? (
              <img
                src={value}
                className="w-full h-full object-cover"
                alt="preview"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/40 text-xs">
                No Image
              </div>
            )}
          </div>

          <button
            className="
              px-3 py-2 rounded-lg bg-white/10 
              text-white/80 text-xs hover:bg-white/20
            "
            onClick={handleSelect}
          >
            {value ? "Replace Image" : "Upload Image"}
          </button>
        </div>

        {value && (
          <button
            onClick={() => onChange(null)}
            className="text-xs text-red-400 hover:text-red-300"
          >
            Remove Image
          </button>
        )}

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFile}
        />
      </div>
    </div>
  );
}
