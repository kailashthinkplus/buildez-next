"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

import MediaAssetDetailsModal from "./MediaAssetDetailsModal";
import MediaGrid from "./MediaGrid";
import MediaUpload from "./MediaUpload";
import MediaAIGenerator from "./MediaAIGenerator";
import MediaSearch from "./MediaSearch";
import MediaTabs from "./MediaTabs";

import { useMedia } from "../hooks/useMedia";
import type { MediaAsset } from "../types";

/* ==========================================================
   TYPES
========================================================== */

interface MediaLibraryModalProps {

  open: boolean;

  siteId: string;

  onClose(): void;

  onSelect(asset: MediaAsset): void;

}

/* ==========================================================
   COMPONENT
========================================================== */

export default function MediaLibraryModal({

  open,

  siteId,

  onClose,

  onSelect,

}: MediaLibraryModalProps) {

  const {

    assets,

    loading,

    uploading,

    generating,

    uploadImages,

    generateImages,

    search,

    refresh,

    deleteAsset,

  } = useMedia(siteId);

  const [tab, setTab] = useState<
    "library" |
    "upload" |
    "ai"
  >("library");

  const [detailsAsset, setDetailsAsset] =
    useState<MediaAsset | null>(null);

  async function handleDelete(asset: MediaAsset) {
    if (!confirm(`Delete ${asset.filename}?`)) return;
    await deleteAsset(asset.id);
    if (detailsAsset?.id === asset.id) {
      setDetailsAsset(null);
    }
  }

  if (!open) return null;

  return createPortal(

    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-6">

      {/* Backdrop */}

      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}

      <div
        className="
          relative
          h-[min(780px,calc(100vh-3rem))]
          w-full
          max-w-5xl
          rounded-2xl
          border
          border-white/10
          bg-[#0F1118]
          shadow-2xl
          overflow-hidden
          flex
          flex-col
        "
      >

        {/* ====================================================
            HEADER
        ==================================================== */}

        <div
          className="
            min-h-16
            border-b
            border-white/10
            px-6
            flex
            items-center
            justify-between
          "
        >

          <div>

            <h2 className="text-lg font-semibold text-white">
              Media Library
            </h2>

            <p className="text-xs text-white/50 mt-1">
              Upload, browse or generate assets.
            </p>

          </div>

          <button
            onClick={onClose}
            className="
              w-9
              h-9
              rounded-lg
              hover:bg-white/10
              flex
              items-center
              justify-center
            "
          >
            <X size={18} />
          </button>

        </div>

        {/* ====================================================
            SEARCH
        ==================================================== */}

        <div className="px-6 pt-5">

          <MediaSearch
            onSearch={search}
          />

        </div>

        {/* ====================================================
            TABS
        ==================================================== */}

        <div className="px-6 pt-5">

          <MediaTabs
            value={tab}
            onChange={setTab}
          />

        </div>

        {/* ====================================================
            BODY
        ==================================================== */}

        <div className="flex-1 overflow-hidden">

          {tab === "library" && (

            <MediaGrid
              assets={assets}
              loading={loading}
              selectedAsset={detailsAsset}
              onSelect={setDetailsAsset}
              onDelete={handleDelete}
            />

          )}

          {tab === "upload" && (

            <MediaUpload
              uploading={uploading}
              onUpload={async (files) => {

                await uploadImages(files);

                await refresh();

                setTab("library");

              }}
            />

          )}

          {tab === "ai" && (

            <MediaAIGenerator
              generating={generating}
              onGenerate={generateImages}
              onFinished={async () => {

                await refresh();

                setTab("library");

              }}
            />

          )}

        </div>

      </div>

      <MediaAssetDetailsModal
        asset={detailsAsset}
        onClose={() => setDetailsAsset(null)}
        onDelete={handleDelete}
        onUse={(asset) => {
          onSelect(asset);
          setDetailsAsset(null);
        }}
      />

    </div>,
    document.body

  );

}
