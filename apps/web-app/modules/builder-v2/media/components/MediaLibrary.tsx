"use client";

import { useMemo, useState } from "react";
import { Image as ImageIcon, RefreshCw, Upload } from "lucide-react";

import MediaAIGenerator from "./MediaAIGenerator";
import MediaAssetDetailsModal from "./MediaAssetDetailsModal";
import MediaGrid from "./MediaGrid";
import MediaSearch from "./MediaSearch";
import MediaTabs from "./MediaTabs";
import MediaUpload from "./MediaUpload";
import { useMedia } from "../hooks/useMedia";
import type { MediaAsset } from "../types";

type MediaLibraryTab = "library" | "upload" | "ai";

interface MediaLibraryProps {
  siteId: string;
  title?: string;
  description?: string;
  pickerMode?: boolean;
  onSelect?(asset: MediaAsset): void;
}

export default function MediaLibrary({
  siteId,
  title = "Media Library",
  description = "Upload, search, select and manage optimized WebP assets.",
  pickerMode = false,
  onSelect,
}: MediaLibraryProps) {
  const [tab, setTab] = useState<MediaLibraryTab>("library");
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);
  const [detailsAsset, setDetailsAsset] = useState<MediaAsset | null>(null);

  const {
    assets,
    loading,
    uploading,
    generating,
    error,
    refresh,
    search,
    uploadImages,
    generateImages,
    deleteAsset,
  } = useMedia(siteId);

  const totalSize = useMemo(
    () => assets.reduce((sum, asset) => sum + (asset.fileSize || 0), 0),
    [assets]
  );

  async function handleDelete(asset: MediaAsset) {
    if (!confirm(`Delete ${asset.filename}?`)) return;
    await deleteAsset(asset.id);
    if (selectedAsset?.id === asset.id) setSelectedAsset(null);
    if (detailsAsset?.id === asset.id) setDetailsAsset(null);
  }

  function handleSelect(asset: MediaAsset) {
    setSelectedAsset(asset);
    setDetailsAsset(asset);
  }

  return (
    <div className="flex h-full min-h-[720px] flex-col gap-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="mt-1 max-w-2xl text-sm dashboard-muted">
            {description}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => refresh()}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg dashboard-card dashboard-hover"
            title="Refresh media"
          >
            <RefreshCw size={16} aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => setTab("upload")}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
          >
            <Upload size={16} aria-hidden />
            Upload
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Assets" value={String(assets.length)} />
        <StatCard label="Images" value={String(assets.filter((asset) => asset.mediaType === "IMAGE").length)} />
        <StatCard label="Storage" value={formatBytes(totalSize)} />
      </div>

      <div className="rounded-lg border border-white/10 bg-[#111827] text-white shadow-sm">
        <div className="border-b border-white/10 px-5 py-4">
          <MediaSearch onSearch={search} />
          <div className="mt-4">
            <MediaTabs value={tab} onChange={setTab} />
          </div>
          {error && (
            <p className="mt-3 rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </p>
          )}
        </div>

        <div className="h-[560px] overflow-hidden">
          {tab === "library" && (
            <MediaGrid
              assets={assets}
              loading={loading}
              selectedAsset={selectedAsset}
              onSelect={handleSelect}
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

      {pickerMode && selectedAsset && (
        <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-3 text-sm">
          <ImageIcon size={16} aria-hidden />
          <span className="truncate">{selectedAsset.filename}</span>
        </div>
      )}

      <MediaAssetDetailsModal
        asset={detailsAsset}
        onClose={() => setDetailsAsset(null)}
        onDelete={handleDelete}
        onUse={
          onSelect
            ? (asset) => {
                onSelect(asset);
                setDetailsAsset(null);
              }
            : undefined
        }
      />
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg dashboard-card p-4">
      <div className="text-xs dashboard-muted">{label}</div>
      <div className="mt-1 text-xl font-semibold">{value}</div>
    </div>
  );
}

function formatBytes(bytes: number) {
  if (!bytes) return "0 B";

  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );

  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}
