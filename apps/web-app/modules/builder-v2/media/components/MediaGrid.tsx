"use client";

import type { MediaAsset } from "../types";
import { Image as ImageIcon } from "lucide-react";

import MediaCard from "./MediaCard";

/* ==========================================================
   TYPES
========================================================== */

interface MediaGridProps {
  assets: MediaAsset[];

  loading?: boolean;

  selectedAsset?: MediaAsset | null;

  onSelect(asset: MediaAsset): void;

  onDelete?(asset: MediaAsset): void;
}

/* ==========================================================
   COMPONENT
========================================================== */

export default function MediaGrid({
  assets,
  loading = false,
  selectedAsset = null,
  onSelect,
  onDelete,
}: MediaGridProps) {
  /* --------------------------------------------------------
     Loading
  -------------------------------------------------------- */

  if (loading) {
    return (
      <div
        className="
          p-6
          grid
          grid-cols-2
          sm:grid-cols-3
          lg:grid-cols-5
          gap-4
          overflow-y-auto
          h-full
        "
      >
        {Array.from({ length: 15 }).map((_, index) => (
          <div
            key={index}
            className="
              aspect-square
              rounded-xl
              border
              border-white/10
              bg-white/5
              animate-pulse
            "
          />
        ))}
      </div>
    );
  }

  /* --------------------------------------------------------
     Empty State
  -------------------------------------------------------- */

  if (assets.length === 0) {
    return (
      <div
        className="
          h-full
          flex
          flex-col
          items-center
          justify-center
          text-center
          px-10
        "
      >
        <div
          className="
            w-20
            h-20
            rounded-2xl
            bg-white/5
            border
            border-white/10
            flex
            items-center
            justify-center
            text-4xl
          "
        >
          <ImageIcon size={36} aria-hidden />
        </div>

        <h3
          className="
            mt-6
            text-lg
            font-semibold
            text-white
          "
        >
          No media found
        </h3>

        <p
          className="
            mt-2
            max-w-sm
            text-sm
            text-white/50
          "
        >
          Upload an image or generate one using AI to
          start building your media library.
        </p>
      </div>
    );
  }

  /* --------------------------------------------------------
     Grid
  -------------------------------------------------------- */

  return (
    <div
      className="
        h-full
        overflow-y-auto
        p-6
      "
    >
      <div
        className="
          grid
          grid-cols-2
          sm:grid-cols-3
          lg:grid-cols-5
          gap-4
        "
      >
        {assets.map((asset) => (
          <MediaCard
            key={asset.id}
            asset={asset}
            selected={
              selectedAsset?.id === asset.id
            }
            onClick={onSelect}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}
