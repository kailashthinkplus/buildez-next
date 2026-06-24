"use client";

import { useState, useRef } from "react";
import { X, Loader2, Image as ImageIcon } from "lucide-react";
import { applyDesignTokensToDOM } from
  "@/modules/builder/runtime/designTokens/applyDesignTokensToDOM";

/* ============================================================
   TYPES
============================================================ */

interface PreviewColors {
  primary: string;
  onPrimary: string;
  background?: string;
  surface?: string;
}

interface LogoUploaderProps {
  siteId: string;
  open: boolean;
  onClose(): void;
}

/* ============================================================
   COMPONENT
============================================================ */

export function LogoUploader({
  siteId,
  open,
  onClose,
}: LogoUploaderProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [previewColors, setPreviewColors] =
    useState<PreviewColors | null>(null);

  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [needsConfirm, setNeedsConfirm] =
    useState(false);

  if (!open) return null;

  /* ------------------------------------------------------------
     UPLOAD (PREVIEW OR FIRST APPLY)
  ------------------------------------------------------------ */
  async function upload(overwrite = false) {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const form = new FormData();
      form.append("file", file);

      const res = await fetch(
        `/api/sites/${siteId}/branding/logo${
          overwrite ? "?overwrite=true" : ""
        }`,
        {
          method: "POST",
          credentials: "include",
          body: form,
        }
      );

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.error || "Upload failed");
      }

      setLogoUrl(json.logoUrl || null);

      if (json.previewColors) {
        setPreviewColors(json.previewColors);
      }

      if (json.designTokens) {
        applyDesignTokensToDOM(json.designTokens);
        onClose();
      }

      if (json.requiresConfirmation) {
        setNeedsConfirm(true);
      }

      setFile(null);
    } catch (err: any) {
      setError(err?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  /* ------------------------------------------------------------
     CONFIRM OVERWRITE
  ------------------------------------------------------------ */
  async function confirmOverwrite() {
    await upload(true);
  }

  /* ------------------------------------------------------------
     RESET STATE
  ------------------------------------------------------------ */
  function closeAndReset() {
    setFile(null);
    setPreviewColors(null);
    setNeedsConfirm(false);
    setError(null);
    onClose();
  }

  /* ------------------------------------------------------------
     RENDER
  ------------------------------------------------------------ */
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-[440px] rounded-2xl bg-[#020617] border border-white/10 p-4">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-white">
            Upload brand logo
          </h3>
          <button
            onClick={closeAndReset}
            className="text-white/60 hover:text-white"
          >
            <X size={14} />
          </button>
        </div>

        {/* DROP ZONE */}
        {!previewColors && (
          <button
            onClick={() => fileRef.current?.click()}
            className="
              w-full h-40 rounded-xl
              border border-dashed border-white/15
              flex flex-col items-center justify-center gap-2
              hover:bg-white/5 transition
            "
          >
            <ImageIcon size={20} className="text-white/60" />
            <span className="text-sm text-white/70">
              Click to select logo
            </span>
            <span className="text-xs text-white/40">
              PNG, JPG, WEBP, SVG
            </span>
          </button>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) =>
            setFile(e.target.files?.[0] || null)
          }
        />

        {/* FILE */}
        {file && !previewColors && (
          <div className="mt-2 text-xs text-white/70">
            Selected: {file.name}
          </div>
        )}

        {/* PREVIEW COLORS */}
        {previewColors && (
          <div className="mt-3 space-y-3">
            <div className="text-xs text-white/60">
              Extracted brand colors
            </div>

            <div className="flex gap-3">
              <ColorSwatch
                label="Primary"
                value={previewColors.primary}
              />
              <ColorSwatch
                label="On Primary"
                value={previewColors.onPrimary}
              />
            </div>

            {needsConfirm && (
              <div className="text-xs text-yellow-400">
                This will overwrite existing brand colors.
              </div>
            )}
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="mt-2 text-xs text-red-400">
            {error}
          </div>
        )}

        {/* ACTIONS */}
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={closeAndReset}
            className="px-3 py-1.5 text-xs rounded-lg bg-white/5 hover:bg-white/10"
          >
            Cancel
          </button>

          {!previewColors && (
            <button
              disabled={!file || loading}
              onClick={() => upload(false)}
              className="
                px-4 py-1.5 text-xs rounded-lg
                bg-blue-600 hover:bg-blue-500
                disabled:opacity-50
                flex items-center gap-2
              "
            >
              {loading && (
                <Loader2 size={12} className="animate-spin" />
              )}
              Upload
            </button>
          )}

          {needsConfirm && (
            <button
              disabled={loading}
              onClick={confirmOverwrite}
              className="
                px-4 py-1.5 text-xs rounded-lg
                bg-red-600 hover:bg-red-500
                flex items-center gap-2
              "
            >
              {loading && (
                <Loader2 size={12} className="animate-spin" />
              )}
              Confirm overwrite
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   COLOR SWATCH
============================================================ */

function ColorSwatch({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="h-8 w-8 rounded-md border border-white/20"
        style={{ background: value }}
      />
      <div className="text-xs text-white/70">
        <div>{label}</div>
        <div className="opacity-60">{value}</div>
      </div>
    </div>
  );
}
