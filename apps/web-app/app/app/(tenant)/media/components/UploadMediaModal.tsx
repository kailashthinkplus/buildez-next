"use client";

import { useState } from "react";
import { X } from "lucide-react";

export default function UploadMediaModal({ open, onClose }: any) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number>(0);

  const handleFileChange = (e: any) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    if (selectedFile) {
      // Set image preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);

      // Set file size
      setFileSize(selectedFile.size);
    }
  };

  const handleUpload = async () => {
    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-lg">
      <div className="relative w-full max-w-lg p-8 rounded-2xl dashboard-card-strong backdrop-blur-2xl backdrop-saturate-150 shadow-[0_20px_70px_-10px_rgba(0,0,0,0.25)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.65)]">
        
        {/* CLOSE ICON */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-full dashboard-hover transition"
        >
          <X className="h-5 w-5 dashboard-muted" />
        </button>

        {/* HEADER */}
        <h2 className="text-center text-xl font-semibold mb-6 mt-2">Upload New Media</h2>

        {/* IMAGE PREVIEW AND FILE DETAILS */}
        <div className="flex flex-col items-center">
          {/* Image Preview */}
          <div className="w-full mb-4">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-64 object-contain rounded-xl dashboard-card"
              />
            ) : (
              <div className="w-full h-64 flex items-center justify-center border-dashed border-2 dashboard-border rounded-xl dashboard-muted">
                <span className="text-lg">No image selected</span>
              </div>
            )}
          </div>

          {/* File Info */}
          {file && (
            <div className="text-center dashboard-muted text-sm mb-4">
              <p><strong>File Size:</strong> {(fileSize / (1024 * 1024)).toFixed(2)} MB</p>
              <p><strong>File Type:</strong> {file.type}</p>
            </div>
          )}
        </div>

        {/* FILE INPUT */}
        <div className="mt-4 space-y-4">
          <input
            type="file"
            onChange={handleFileChange}
            className="w-full p-3 rounded-xl text-sm dashboard-input backdrop-blur-xl"
          />

          <div className="flex justify-between pt-1">
            <button
              onClick={onClose}
              className="text-sm dashboard-muted hover:text-[var(--dashboard-text)] underline"
            >
              Close
            </button>

            <button
              onClick={handleUpload}
              className="px-5 py-2 text-sm rounded-xl bg-blue-600 text-white hover:bg-blue-500 shadow-[0_0_15px_rgba(0,122,255,0.4)]"
            >
              Upload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
