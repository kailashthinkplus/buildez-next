// /Users/kailash/buildez/apps/web-app/app/app/(builder)/components/ImageUploadModal.tsx

"use client";

import { useState, useEffect } from "react";
import { Upload, Image as ImageIcon, X, Check, Loader2 } from "lucide-react";

/* ============================================================
   TYPES
============================================================ */

interface ImageUploadModalProps {
  siteId: string;
  onSelect(url: string): void;
  onClose(): void;
}

interface StoredImage {
  url: string;
  key: string;
  uploadedAt: string;
  size?: number;
  name?: string;
}

/* ============================================================
   IMAGE CONVERSION (CLIENT-SIDE)
============================================================ */

async function convertToWebP(
  file: File,
  maxWidth = 2400,
  quality = 0.88
): Promise<File> {
  const bitmap = await createImageBitmap(file);

  const scale = Math.min(1, maxWidth / bitmap.width);
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas context not available");
  }

  ctx.drawImage(bitmap, 0, 0, width, height);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject("WebP conversion failed")),
      "image/webp",
      quality
    );
  });

  return new File([blob], file.name.replace(/\.\w+$/, ".webp"), {
    type: "image/webp",
  });
}

/* ============================================================
   MODAL WITH TABS
============================================================ */

export function ImageUploadModal({
  siteId,
  onSelect,
  onClose,
}: ImageUploadModalProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "library">("upload");
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Library state
  const [images, setImages] = useState<StoredImage[]>([]);
  const [loadingLibrary, setLoadingLibrary] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Drag & drop state
  const [isDragging, setIsDragging] = useState(false);

  /* ============================================================
     FETCH IMAGE LIBRARY
  ============================================================ */

  useEffect(() => {
    if (activeTab === "library" && images.length === 0) {
      fetchImages();
    }
  }, [activeTab]);

  async function fetchImages() {
    try {
      setLoadingLibrary(true);
      setError(null);

      const res = await fetch(`/api/uploads/images?siteId=${siteId}`, {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(`Failed to load images: ${res.status}`);
      }

      const data = await res.json();
      setImages(data.images || []);
    } catch (err: any) {
      console.error("[ImageLibrary] Fetch error:", err);
      setError(err.message || "Failed to load images");
    } finally {
      setLoadingLibrary(false);
    }
  }

  /* ============================================================
     FILE UPLOAD HANDLER
  ============================================================ */

  async function handleFile(file: File) {
    try {
      setUploading(true);
      setError(null);

      // Validate file type
      if (!file.type.startsWith("image/")) {
        throw new Error("Please select an image file");
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error("Image must be smaller than 10MB");
      }

      /* 1️⃣ Convert image */
      setStatus("Optimizing image…");
      const webpFile = await convertToWebP(file);

      /* 2️⃣ Init upload */
      setStatus("Requesting upload URL…");

      const res = await fetch("/api/uploads/image/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          siteId,
          fileName: webpFile.name,
          fileType: "image/webp",
        }),
      });

      const raw = await res.text();

      if (!res.ok) {
        throw new Error(`Upload init failed (${res.status}): ${raw}`);
      }

      const { uploadUrl, publicUrl } = JSON.parse(raw);

      if (!uploadUrl || !publicUrl) {
        throw new Error("Invalid upload init response");
      }

      /* 3️⃣ Upload to storage */
      setStatus("Uploading to storage…");

      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": "image/webp" },
        body: webpFile,
      });

      if (!uploadRes.ok) {
        const errText = await uploadRes.text();
        throw new Error(`Upload failed (${uploadRes.status}): ${errText}`);
      }

      /* 4️⃣ Done */
      setStatus("Upload complete!");
      setTimeout(() => {
        onSelect(publicUrl);
        onClose();
      }, 500);
    } catch (err: any) {
      console.error("[ImageUpload] ERROR:", err);
      setError(err.message || "Image upload failed");
      setUploading(false);
      setStatus(null);
    }
  }

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
     SELECT FROM LIBRARY
  ============================================================ */

  function handleSelectFromLibrary() {
    if (selectedImage) {
      onSelect(selectedImage);
      onClose();
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
      <div className="relative w-[640px] max-h-[80vh] rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 shadow-2xl overflow-hidden">
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/30 backdrop-blur-xl">
          <h2 className="text-lg font-semibold text-white">Media Library</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            disabled={uploading}
          >
            <X size={20} />
          </button>
        </div>

        {/* TABS */}
        <div className="flex border-b border-white/10 bg-black/20">
          <button
            onClick={() => setActiveTab("upload")}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === "upload"
                ? "text-white bg-white/5 border-b-2 border-blue-500"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <Upload size={16} className="inline mr-2" />
            Upload New
          </button>
          <button
            onClick={() => setActiveTab("library")}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === "library"
                ? "text-white bg-white/5 border-b-2 border-blue-500"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <ImageIcon size={16} className="inline mr-2" />
            Media Library ({images.length})
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* ============================================================
               UPLOAD TAB
          ============================================================ */}
          {activeTab === "upload" && (
            <div className="space-y-4">
              {/* DROP ZONE */}
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
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
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
                        ? "Uploading..."
                        : "Click to upload or drag and drop"}
                    </div>
                    <div className="text-sm text-white/50">
                      PNG, JPG, GIF, WebP up to 10MB
                    </div>
                    <div className="text-xs text-white/40 mt-2">
                      Auto-optimized to WebP · High quality
                    </div>
                  </div>
                </div>
              </label>

              {/* STATUS */}
              {status && (
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
              <div className="space-y-2 text-xs text-white/50">
                <p className="font-medium text-white/70">💡 Tips:</p>
                <ul className="space-y-1 pl-4">
                  <li>• Use high-resolution images for best quality</li>
                  <li>• Images are automatically optimized for web</li>
                  <li>• Supports transparent backgrounds (PNG)</li>
                  <li>• Maximum file size: 10MB</li>
                </ul>
              </div>
            </div>
          )}

          {/* ============================================================
               LIBRARY TAB
          ============================================================ */}
          {activeTab === "library" && (
            <div className="space-y-4">
              {loadingLibrary && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 size={32} className="text-white/40 animate-spin" />
                </div>
              )}

              {!loadingLibrary && images.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <ImageIcon size={48} className="text-white/20 mb-4" />
                  <p className="text-white/60 mb-2">No images uploaded yet</p>
                  <p className="text-sm text-white/40">
                    Upload your first image to get started
                  </p>
                  <button
                    onClick={() => setActiveTab("upload")}
                    className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Upload Image
                  </button>
                </div>
              )}

              {!loadingLibrary && images.length > 0 && (
                <>
                  {/* IMAGE GRID */}
                  <div className="grid grid-cols-3 gap-3">
                    {images.map((img) => (
                      <button
                        key={img.key}
                        onClick={() =>
                          setSelectedImage(
                            selectedImage === img.url ? null : img.url
                          )
                        }
                        className={`group relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                          selectedImage === img.url
                            ? "border-blue-500 ring-2 ring-blue-500/50"
                            : "border-white/10 hover:border-white/30"
                        }`}
                      >
                        <img
                          src={img.url}
                          alt={img.name || "Uploaded image"}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />

                        {/* OVERLAY */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                        {/* SELECTED INDICATOR */}
                        {selectedImage === img.url && (
                          <div className="absolute top-2 right-2 h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center shadow-lg">
                            <Check size={14} className="text-white" />
                          </div>
                        )}

                        {/* INFO */}
                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-xs text-white/90 truncate">
                            {img.name ||
                              img.key.split("/").pop() ||
                              "Untitled"}
                          </p>
                          {img.size && (
                            <p className="text-xs text-white/60">
                              {(img.size / 1024).toFixed(1)} KB
                            </p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* ERROR */}
                  {error && (
                    <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-300">
                      {error}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-black/30 backdrop-blur-xl">
          <button
            onClick={onClose}
            disabled={uploading}
            className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors disabled:opacity-50"
          >
            Cancel
          </button>

          {activeTab === "library" && (
            <button
              onClick={handleSelectFromLibrary}
              disabled={!selectedImage}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl disabled:shadow-none"
            >
              Select Image
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
