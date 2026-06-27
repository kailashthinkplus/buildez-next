"use client";

import {
  Check,
  Copy,
  ExternalLink,
  Image as ImageIcon,
  Trash2,
  X,
} from "lucide-react";

import type { MediaAsset } from "../types";

interface MediaAssetDetailsModalProps {
  asset: MediaAsset | null;
  onClose(): void;
  onDelete?(asset: MediaAsset): Promise<void> | void;
  onUse?(asset: MediaAsset): void;
}

export default function MediaAssetDetailsModal({
  asset,
  onClose,
  onDelete,
  onUse,
}: MediaAssetDetailsModalProps) {
  if (!asset) return null;

  const title = asset.title || asset.filename;
  const dimensions =
    asset.width && asset.height ? `${asset.width} x ${asset.height}` : "Unknown";

  async function copyUrl() {
    await navigator.clipboard.writeText(asset!.url);
  }

  return (
    <div className="fixed inset-0 z-[100001]">
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className="
          absolute
          left-1/2
          top-1/2
          flex
          h-[min(820px,calc(100vh-48px))]
          w-[min(1180px,calc(100vw-32px))]
          -translate-x-1/2
          -translate-y-1/2
          overflow-hidden
          rounded-xl
          border
          border-white/10
          bg-[#0B1120]
          text-white
          shadow-2xl
        "
      >
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex h-14 items-center justify-between border-b border-white/10 px-4">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">{title}</div>
              <div className="text-xs text-white/45">{asset.mimeType}</div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-white/65 hover:bg-white/10 hover:text-white"
              aria-label="Close details"
            >
              <X size={18} aria-hidden />
            </button>
          </div>

          <div className="flex min-h-0 flex-1 items-center justify-center bg-black/25 p-6">
            {asset.url ? (
              <img
                src={asset.url}
                alt={asset.alt || title}
                className="max-h-full max-w-full rounded-lg object-contain"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-lg border border-white/10 bg-white/[0.03]">
                <ImageIcon size={48} className="text-white/25" aria-hidden />
              </div>
            )}
          </div>
        </div>

        <aside className="flex w-[340px] shrink-0 flex-col border-l border-white/10 bg-[#111827]">
          <div className="border-b border-white/10 p-5">
            <div className="text-xs font-medium uppercase text-white/40">
              Details
            </div>
            <h2 className="mt-2 break-words text-lg font-semibold leading-snug">
              {title}
            </h2>
            {asset.alt && (
              <p className="mt-2 text-sm leading-5 text-white/55">{asset.alt}</p>
            )}
          </div>

          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5">
            <DetailGroup
              rows={[
                ["Type", asset.mediaType],
                ["Dimensions", dimensions],
                ["Size", formatBytes(asset.fileSize)],
                ["Source", asset.source],
                ["Provider", asset.provider || "Unknown"],
                ["Uploaded", formatDate(asset.createdAt)],
              ]}
            />

            <DetailGroup
              title="Storage"
              rows={[
                ["Folder", asset.folder || "Not set"],
                ["Filename", asset.filename],
              ]}
            />

            {asset.tags?.length > 0 && (
              <div>
                <div className="mb-2 text-xs font-medium uppercase text-white/40">
                  Tags
                </div>
                <div className="flex flex-wrap gap-2">
                  {asset.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-xs text-white/70"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {asset.prompt && (
              <div>
                <div className="mb-2 text-xs font-medium uppercase text-white/40">
                  Prompt
                </div>
                <p className="rounded-lg border border-white/10 bg-black/20 p-3 text-xs leading-5 text-white/65">
                  {asset.prompt}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2 border-t border-white/10 p-4">
            {onUse && (
              <button
                type="button"
                onClick={() => onUse(asset)}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 text-sm font-medium text-white hover:bg-blue-500"
              >
                <Check size={16} aria-hidden />
                Use image
              </button>
            )}

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={copyUrl}
                className="flex h-10 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] text-sm text-white/75 hover:bg-white/[0.08] hover:text-white"
              >
                <Copy size={15} aria-hidden />
                Copy URL
              </button>
              <a
                href={asset.url}
                target="_blank"
                rel="noreferrer"
                className="flex h-10 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] text-sm text-white/75 hover:bg-white/[0.08] hover:text-white"
              >
                <ExternalLink size={15} aria-hidden />
                Open
              </a>
            </div>

            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(asset)}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-red-500/25 bg-red-500/10 text-sm font-medium text-red-200 hover:bg-red-500/20"
              >
                <Trash2 size={15} aria-hidden />
                Delete
              </button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function DetailGroup({
  title,
  rows,
}: {
  title?: string;
  rows: Array<[string, string]>;
}) {
  return (
    <div>
      {title && (
        <div className="mb-2 text-xs font-medium uppercase text-white/40">
          {title}
        </div>
      )}
      <div className="overflow-hidden rounded-lg border border-white/10">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="grid grid-cols-[92px_minmax(0,1fr)] gap-3 border-b border-white/10 px-3 py-2 last:border-b-0"
          >
            <div className="text-xs text-white/40">{label}</div>
            <div className="break-words text-xs text-white/75">{value}</div>
          </div>
        ))}
      </div>
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

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
