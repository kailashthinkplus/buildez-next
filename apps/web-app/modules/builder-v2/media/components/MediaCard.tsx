"use client";

import { Check, Image as ImageIcon, Sparkles } from "lucide-react";

import type { MediaAsset } from "../types";

/* ==========================================================
   TYPES
========================================================== */

interface MediaCardProps {
  asset: MediaAsset;
  selected?: boolean;
  onClick(asset: MediaAsset): void;
}

/* ==========================================================
   COMPONENT
========================================================== */

export default function MediaCard({
  asset,
  selected = false,
  onClick,
}: MediaCardProps) {
  return (
    <button
      type="button"
      onClick={() => onClick(asset)}
      className={`
        relative
        overflow-hidden
        rounded-xl
        border
        transition-all
        group
        aspect-square
        ${
          selected
            ? "border-blue-500 ring-2 ring-blue-500/30"
            : "border-white/10 hover:border-white/30"
        }
      `}
    >
      {/* Thumbnail */}

      {asset.thumbnail || asset.url ? (
        <img
          src={asset.thumbnail ?? asset.url}
          alt={asset.fileName}
          className="
            absolute
            inset-0
            h-full
            w-full
            object-cover
          "
          draggable={false}
        />
      ) : (
        <div
          className="
            absolute
            inset-0
            flex
            items-center
            justify-center
            bg-[#1E293B]
          "
        >
          <ImageIcon
            size={32}
            className="text-white/30"
          />
        </div>
      )}

      {/* Gradient */}

      <div
        className="
          absolute
          inset-x-0
          bottom-0
          h-20
          bg-gradient-to-t
          from-black/70
          to-transparent
        "
      />

      {/* Filename */}

      <div
        className="
          absolute
          left-3
          right-3
          bottom-3
        "
      >
        <div
          className="
            truncate
            text-xs
            font-medium
            text-white
          "
        >
          {asset.fileName}
        </div>

        {asset.width && asset.height && (
          <div
            className="
              mt-1
              text-[10px]
              text-white/60
            "
          >
            {asset.width} × {asset.height}
          </div>
        )}
      </div>

      {/* AI Badge */}

      {asset.aiGenerated && (
        <div
          className="
            absolute
            top-2
            left-2
            rounded-lg
            bg-black/70
            backdrop-blur
            px-2
            py-1
            flex
            items-center
            gap-1
          "
        >
          <Sparkles
            size={12}
            className="text-yellow-400"
          />

          <span
            className="
              text-[10px]
              font-medium
              text-white
            "
          >
            AI
          </span>
        </div>
      )}

      {/* Selected */}

      {selected && (
        <div
          className="
            absolute
            top-2
            right-2
            h-7
            w-7
            rounded-full
            bg-blue-600
            flex
            items-center
            justify-center
            shadow-lg
          "
        >
          <Check
            size={15}
            className="text-white"
          />
        </div>
      )}
    </button>
  );
}