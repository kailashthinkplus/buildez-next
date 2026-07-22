"use client";

import { useState } from "react";
import { Image as ImageIcon, Search } from "lucide-react";

import MediaLibraryModal from "./MediaLibraryModal";
import type { MediaAsset } from "../types";

interface MediaPickerProps {
  siteId: string;
  label: string;
  value?: string;
  onChange(asset: MediaAsset): void;
}

export default function MediaPicker({
  siteId,
  label,
  value,
  onChange,
}: MediaPickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="space-y-2">
        <div className="text-xs font-medium text-white/65">{label}</div>

        {value ? (
          <div className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.04]">
            <img
              src={value}
              alt=""
              className="h-32 w-full object-cover"
            />
            <div className="flex items-center justify-between gap-2 p-2">
              <span className="min-w-0 truncate text-xs text-white/55">
                {value}
              </span>
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-blue-600 text-white hover:bg-blue-500"
                title="Choose media"
              >
                <Search size={14} aria-hidden />
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-white/15 bg-white/[0.04] px-3 py-8 text-sm text-white/60 transition hover:border-white/30 hover:text-white"
          >
            <ImageIcon size={18} aria-hidden />
            Choose from media library
          </button>
        )}
      </div>

      <MediaLibraryModal
        open={open}
        siteId={siteId}
        onClose={() => setOpen(false)}
        onSelect={(asset) => {
          onChange(asset);
          setOpen(false);
        }}
      />
    </>
  );
}
