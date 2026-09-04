"use client";

import { useMemo, useState } from "react";
import { HardDrive, Image as ImageIcon, RefreshCw, Sparkles, Upload } from "lucide-react";
import type { LucideIcon } from "lucide-react";

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
  compact?: boolean;
  /** Skip the full-page hero (heading, description, stat cards, decorative blur) for narrow hosts like a builder sidebar. */
  hideHero?: boolean;
}

export default function MediaLibrary({
  siteId,
  title = "Media Library",
  description = "Upload, search, select and manage optimized WebP assets.",
  pickerMode = false,
  onSelect,
  compact = false,
  hideHero = false,
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

  if (hideHero) {
    return (
      <div className="flex h-full min-h-0 flex-col gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => refresh()}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border dashboard-border dashboard-hover"
            title="Refresh media"
          >
            <RefreshCw size={14} aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => setTab("upload")}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#1349A3] px-3 py-2 text-xs font-semibold text-white hover:bg-[#1D5FC7]"
          >
            <Upload size={14} aria-hidden />
            Upload
          </button>
          <span className="shrink-0 text-[11px] dashboard-faint">{assets.length} assets</span>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border dashboard-border dashboard-card-strong">
          <div className="border-b dashboard-border p-3">
            <MediaSearch onSearch={search} />
            <div className="mt-3">
              <MediaTabs value={tab} onChange={setTab} />
            </div>
            {error && (
              <p className="mt-2 rounded-md border border-red-500/20 bg-red-500/10 px-2.5 py-1.5 text-xs text-red-200">
                {error}
              </p>
            )}
          </div>
          <div className="min-h-0 flex-1 overflow-hidden">
            {tab === "library" && (
              <MediaGrid assets={assets} loading={loading} selectedAsset={selectedAsset} onSelect={handleSelect} onDelete={handleDelete} columns="two" />
            )}
            {tab === "upload" && (
              <MediaUpload uploading={uploading} onUpload={async (files) => { await uploadImages(files); await refresh(); setTab("library"); }} />
            )}
            {tab === "ai" && (
              <MediaAIGenerator generating={generating} onGenerate={generateImages} onFinished={async () => { await refresh(); setTab("library"); }} />
            )}
          </div>
        </div>

        <MediaAssetDetailsModal
          asset={detailsAsset}
          onClose={() => setDetailsAsset(null)}
          onDelete={handleDelete}
          onUse={onSelect ? (asset) => { onSelect(asset); setDetailsAsset(null); } : undefined}
        />
      </div>
    );
  }

  return (
    <div className="relative flex h-full min-h-[720px] flex-col gap-6">
      <div className="pointer-events-none absolute left-[10%] top-0 h-80 w-80 rounded-full bg-[#1349A3]/10 blur-[110px]" />
      <div className="pointer-events-none absolute right-[8%] top-40 h-64 w-64 rounded-full bg-cyan-400/10 blur-[100px]" />
      <section className="relative overflow-hidden rounded-[26px] border dashboard-border dashboard-card-strong">
        <div className="grid gap-6 p-6 md:grid-cols-[1fr_auto] md:items-end md:p-8">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#1349A3]/10 px-3 py-1.5 text-xs font-semibold text-[#1349A3] dark:text-blue-300"><ImageIcon className="h-3.5 w-3.5" /> Creative assets</div>
            <h1 className="max-w-3xl text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 dashboard-muted">{description}</p>
          </div>
          <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => refresh()}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border dashboard-border dashboard-hover"
            title="Refresh media"
          >
            <RefreshCw size={16} aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => setTab("upload")}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1349A3] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#1349A3]/15 hover:bg-[#1D5FC7]"
          >
            <Upload size={16} aria-hidden />
            Upload files
          </button>
        </div>
        </div>
        <div className="grid grid-cols-1 border-t dashboard-border sm:grid-cols-3">
          <StatCard icon={ImageIcon} label="Assets" value={String(assets.length)} />
          <StatCard icon={Sparkles} label="AI generated" value={String(assets.filter((asset) => asset.source === "AI").length)} tone="text-amber-600" />
          <StatCard icon={HardDrive} label="Storage used" value={formatBytes(totalSize)} tone="text-[#1349A3] dark:text-blue-300" />
        </div>
      </section>

      <div className="relative overflow-hidden rounded-[22px] border dashboard-border dashboard-card-strong shadow-sm">
        <div className="border-b dashboard-border p-4 md:px-5">
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
              columns={compact ? "two" : "responsive"}
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

function StatCard({ icon: Icon, label, value, tone = "text-current" }: { icon: LucideIcon; label: string; value: string; tone?: string }) {
  return (
    <div className="flex items-center gap-3 border-b border-r dashboard-border p-4 last:border-r-0 sm:border-b-0 md:p-5">
      <span className={`dashboard-subtle flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}><Icon className="h-4 w-4" /></span>
      <div><div className="text-xl font-semibold tracking-tight">{value}</div><div className="text-xs dashboard-muted">{label}</div></div>
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
