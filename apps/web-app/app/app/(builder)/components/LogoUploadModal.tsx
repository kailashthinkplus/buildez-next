// /Users/kailash/buildez/apps/web-app/app/app/(builder)/components/LogoUploadModal.tsx

"use client";

import { useState } from "react";
import { Upload, X, Loader2, Sparkles, Palette } from "lucide-react";

/* ============================================================
   TYPES
============================================================ */

interface LogoUploadModalProps {
  siteId: string;
  onComplete(result: { logoUrl: string; palette: BrandPalette }): void;
  onClose(): void;
}

export type BrandPalette = {
  primary: string;
  secondary: string;
  background: string;
  text: string;
};

/* ============================================================
   CLIENT LOGO OPTIMIZATION
============================================================ */

async function convertLogoToWebP(
  file: File,
  maxSize = 1024,
  quality = 0.9
): Promise<File> {
  const bitmap = await createImageBitmap(file);

  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));

  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");

  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(bitmap, 0, 0, width, height);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject("WebP failed")),
      "image/webp",
      quality
    );
  });

  return new File([blob], file.name.replace(/\.\w+$/, ".webp"), {
    type: "image/webp",
  });
}

/* ============================================================
   MODAL WITH ENHANCED UI
============================================================ */

export function LogoUploadModal({
  siteId,
  onComplete,
  onClose,
}: LogoUploadModalProps) {
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [extractedColors, setExtractedColors] = useState<BrandPalette | null>(
    null
  );
  const [isDragging, setIsDragging] = useState(false);

  /* ============================================================
     DRAG & DROP HANDLERS
  ============================================================ */

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      handleFile(file);
    } else {
      setError("Please drop an image file");
    }
  }

  /* ============================================================
     FILE UPLOAD HANDLER
  ============================================================ */

  async function handleFile(file: File) {
    // ✅ Guard against missing siteId
    if (!siteId) {
      console.error("[LogoUpload] FATAL: siteId is missing at upload time");
      setError(
        "Site information is still loading. Please wait a moment and try again."
      );
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Validate file size (5MB max for logo)
    if (file.size > 5 * 1024 * 1024) {
      setError("Logo must be smaller than 5MB");
      return;
    }

    try {
      setUploading(true);
      setError(null);
      setExtractedColors(null);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);

      /* 1️⃣ Convert */
      setStatus("Optimizing logo…");
      const webp = await convertLogoToWebP(file);

      /* 2️⃣ Init upload */
      setStatus("Uploading logo…");

      const payload = {
        siteId,
        fileName: webp.name,
        fileType: "image/webp",
      };

      console.group("[LogoUpload] INIT PAYLOAD");
      console.log(payload);
      console.groupEnd();

      const initRes = await fetch("/api/uploads/logo/init", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const raw = await initRes.text();

      console.group("[LogoUpload] INIT RESPONSE");
      console.log("status:", initRes.status);
      console.log("raw:", raw);
      console.groupEnd();

      if (!initRes.ok) {
        throw new Error(`Upload init failed (${initRes.status}): ${raw}`);
      }

      const { uploadUrl, publicUrl } = JSON.parse(raw);

      if (!uploadUrl || !publicUrl) {
        throw new Error("Invalid upload init response");
      }

      /* 3️⃣ PUT to storage */
      const putRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": "image/webp" },
        body: webp,
      });

      if (!putRes.ok) {
        const errText = await putRes.text();
        throw new Error(`Upload failed (${putRes.status}): ${errText}`);
      }

      /* 4️⃣ Extract palette */
      setStatus("Extracting brand colors…");

      const paletteRes = await fetch("/api/branding/extract-palette", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteId,
          logoUrl: publicUrl,
        }),
      });

      if (!paletteRes.ok) {
        const errText = await paletteRes.text();
        throw new Error(`Palette extraction failed: ${errText}`);
      }

      const palette = await paletteRes.json();

      console.log("[LogoUpload] ✅ Extracted colors:", palette);

      setExtractedColors(palette);
      setStatus("Colors extracted successfully!");

      // Wait a moment to show colors
      setTimeout(() => {
        onComplete({
          logoUrl: publicUrl,
          palette,
        });
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error("[LogoUpload] ERROR:", err);
      setError(err.message || "Logo upload failed");
      setUploading(false);
      setStatus(null);
    }
  }

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      />

      {/* MODAL */}
      <div className="relative w-[480px] rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 shadow-2xl overflow-hidden">
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/30 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                Upload Brand Logo
              </h2>
              <p className="text-xs text-white/60">
                Automatically extract brand colors
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={uploading}
            className="p-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6 space-y-4">
          {/* PREVIEW */}
          {preview && (
            <div className="flex justify-center p-6 bg-white/5 rounded-xl border border-white/10">
              <img
                src={preview}
                alt="Logo preview"
                className="max-h-32 max-w-full object-contain"
              />
            </div>
          )}

          {/* DROP ZONE */}
          {!preview && (
            <label
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`block cursor-pointer rounded-xl border-2 border-dashed p-12 text-center transition-all ${
                isDragging
                  ? "border-blue-500 bg-blue-500/10"
                  : uploading
                  ? "border-white/20 bg-white/5 cursor-not-allowed"
                  : "border-white/20 hover:border-white/40 hover:bg-white/5"
              }`}
            >
              <input
                type="file"
                accept="image/*"
                hidden
                disabled={uploading}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />

              <div className="flex flex-col items-center gap-4">
                {uploading ? (
                  <Loader2 size={48} className="text-blue-400 animate-spin" />
                ) : (
                  <Upload size={48} className="text-white/40" />
                )}

                <div>
                  <div className="text-lg font-medium text-white mb-1">
                    {uploading
                      ? "Processing logo..."
                      : "Click to upload or drag and drop"}
                  </div>
                  <div className="text-sm text-white/50">
                    PNG, JPG, SVG up to 5MB
                  </div>
                  <div className="text-xs text-white/40 mt-2">
                    Auto-optimized to WebP · Transparent backgrounds supported
                  </div>
                </div>
              </div>
            </label>
          )}

          {/* EXTRACTED COLORS */}
          {extractedColors && (
            <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-white">
                <Palette size={16} className="text-blue-400" />
                <span>Brand Colors Extracted</span>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div className="space-y-2">
                  <div
                    className="h-12 rounded-lg border border-white/10 shadow-lg"
                    style={{ backgroundColor: extractedColors.primary }}
                  />
                  <div className="text-xs text-center">
                    <div className="text-white/60">Primary</div>
                    <div className="text-white/90 font-mono">
                      {extractedColors.primary}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div
                    className="h-12 rounded-lg border border-white/10 shadow-lg"
                    style={{ backgroundColor: extractedColors.secondary }}
                  />
                  <div className="text-xs text-center">
                    <div className="text-white/60">Secondary</div>
                    <div className="text-white/90 font-mono">
                      {extractedColors.secondary}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div
                    className="h-12 rounded-lg border border-white/10 shadow-lg"
                    style={{ backgroundColor: extractedColors.background }}
                  />
                  <div className="text-xs text-center">
                    <div className="text-white/60">Background</div>
                    <div className="text-white/90 font-mono">
                      {extractedColors.background}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div
                    className="h-12 rounded-lg border border-white/10 shadow-lg"
                    style={{ backgroundColor: extractedColors.text }}
                  />
                  <div className="text-xs text-center">
                    <div className="text-white/60">Text</div>
                    <div className="text-white/90 font-mono">
                      {extractedColors.text}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STATUS */}
          {status && !extractedColors && (
            <div className="flex items-center gap-2 px-4 py-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-sm text-blue-300">
              <Loader2 size={14} className="animate-spin" />
              {status}
            </div>
          )}

          {/* ERROR */}
          {error && (
            <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-300">
              {error}
            </div>
          )}

          {/* TIPS */}
          {!preview && !uploading && (
            <div className="space-y-2 text-xs text-white/50">
              <p className="font-medium text-white/70">💡 Tips:</p>
              <ul className="space-y-1 pl-4">
                <li>• Use your brand logo for accurate color extraction</li>
                <li>• Transparent backgrounds (PNG) work best</li>
                <li>• Colors are extracted automatically using AI</li>
                <li>• Maximum file size: 5MB</li>
              </ul>
            </div>
          )}
        </div>

        {/* FOOTER */}
        {!uploading && (
          <div className="flex items-center justify-end px-6 py-4 border-t border-white/10 bg-black/30 backdrop-blur-xl">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
