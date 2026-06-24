"use client";

import { useRef, useState } from "react";
import { Upload, Image as ImageIcon, Trash2 } from "lucide-react";

/* ============================================================
   TYPES (LOCAL ONLY)
============================================================ */

interface LogoUploaderProps {
  value?: string | null;          // existing logo URL (optional)
  onChange?: (file: File | null) => void;
}

/* ============================================================
   LOGO UPLOADER — UI SKELETON (NO API)
============================================================ */

export default function LogoUploader({
  value,
  onChange,
}: LogoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [preview, setPreview] = useState<string | null>(
    value ?? null
  );

  /* ----------------------------------------------------------
     HANDLERS
  ---------------------------------------------------------- */

  function handlePick() {
    inputRef.current?.click();
  }

  function handleFile(file: File | null) {
    if (!file) return;

    const url = URL.createObjectURL(file);
    setPreview(url);
    onChange?.(file);
  }

  function handleRemove() {
    setPreview(null);
    onChange?.(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  /* ----------------------------------------------------------
     RENDER
  ---------------------------------------------------------- */

  return (
    <div className="w-full rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-white/90">
          Brand Logo
        </div>

        {preview && (
          <button
            onClick={handleRemove}
            className="text-white/50 hover:text-red-400 transition"
            title="Remove logo"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {/* PREVIEW */}
      <div
        className="
          relative
          flex items-center justify-center
          h-32 w-full
          rounded-lg
          border border-dashed border-white/15
          bg-black/30
          overflow-hidden
        "
      >
        {preview ? (
          <img
            src={preview}
            alt="Logo preview"
            className="max-h-full max-w-full object-contain"
            draggable={false}
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-white/40">
            <ImageIcon size={20} />
            <span className="text-xs">
              Upload your logo (PNG / SVG / JPG)
            </span>
          </div>
        )}
      </div>

      {/* ACTIONS */}
      <div className="flex items-center gap-2">
        <button
          onClick={handlePick}
          className="
            inline-flex items-center gap-2
            rounded-lg
            bg-blue-600 px-3 py-2
            text-xs font-medium
            hover:bg-blue-500
            transition
          "
        >
          <Upload size={14} />
          {preview ? "Replace logo" : "Upload logo"}
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/svg+xml"
          className="hidden"
          onChange={(e) =>
            handleFile(e.target.files?.[0] ?? null)
          }
        />
      </div>

      {/* FOOTNOTE */}
      <div className="text-[11px] text-white/40">
        Used for color extraction & branding. You can change this anytime.
      </div>
    </div>
  );
}
