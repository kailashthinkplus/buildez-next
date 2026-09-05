"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
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

/**
 * Rendered via a body-level portal rather than inline: the dashboard shell
 * (.dashboard-workspace) applies backdrop-filter/overflow-hidden, which
 * creates a new containing block for `position: fixed` descendants and
 * clips this modal to the shell's box instead of the real viewport.
 */
export default function MediaAssetDetailsModal(props: MediaAssetDetailsModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!props.asset) return;
    queueMicrotask(() => setMounted(true));
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") props.onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      setMounted(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.asset]);

  if (!props.asset || !mounted) return null;

  return createPortal(<MediaAssetDetailsModalContent {...props} asset={props.asset} />, document.body);
}

function MediaAssetDetailsModalContent({
  asset,
  onClose,
  onDelete,
  onUse,
}: MediaAssetDetailsModalProps & { asset: MediaAsset }) {
  const title = asset.title || asset.filename;
  const dimensions =
    asset.width && asset.height ? `${asset.width} x ${asset.height}` : "Unknown";

  async function copyUrl() {
    await navigator.clipboard.writeText(asset!.url);
  }

  return (
    <div className="fixed inset-0 z-[100001] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md text-slate-950 dark:text-slate-50">
      <div
        className="
          flex
          h-full
          max-h-[900px]
          w-full
          max-w-6xl
          flex-col
          overflow-hidden
          rounded-2xl
          dashboard-card-strong
          shadow-2xl
          lg:flex-row
        "
      >
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="flex h-16 shrink-0 items-center justify-between border-b dashboard-border px-5">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">{title}</div>
              <div className="text-xs dashboard-muted">{asset.mimeType}</div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-xl dashboard-muted dashboard-hover"
              aria-label="Close details"
            >
              <X size={18} aria-hidden />
            </button>
          </div>

          <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-slate-100/70 p-6 dark:bg-black/25 lg:p-10">
            {asset.url ? (
              <img
                src={asset.url}
                alt={asset.alt || title}
                className="block max-h-full max-w-full rounded-lg object-contain"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-xl border dashboard-border dashboard-subtle">
                <ImageIcon size={48} className="dashboard-faint" aria-hidden />
              </div>
            )}
          </div>
        </div>

        <aside className="flex max-h-[52vh] w-full shrink-0 flex-col border-t dashboard-border dashboard-card lg:max-h-none lg:w-[380px] lg:border-l lg:border-t-0">
          <div className="border-b dashboard-border p-5">
            <div className="text-xs font-medium uppercase dashboard-faint">
              Details
            </div>
            <h2 className="mt-2 break-words text-lg font-semibold leading-snug">
              {title}
            </h2>
            {asset.alt && (
              <p className="mt-2 text-sm leading-5 dashboard-muted">{asset.alt}</p>
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
                <div className="mb-2 text-xs font-medium uppercase dashboard-faint">
                  Tags
                </div>
                <div className="flex flex-wrap gap-2">
                  {asset.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md border dashboard-border dashboard-subtle px-2 py-1 text-xs dashboard-muted"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {asset.prompt && (
              <div>
                <div className="mb-2 text-xs font-medium uppercase dashboard-faint">
                  Prompt
                </div>
                <p className="rounded-lg border dashboard-border dashboard-subtle p-3 text-xs leading-5 dashboard-muted">
                  {asset.prompt}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2 border-t dashboard-border p-4">
            {onUse && (
              <button
                type="button"
                onClick={() => onUse(asset)}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#1349A3] text-sm font-medium text-white hover:bg-[#1D5FC7]"
              >
                <Check size={16} aria-hidden />
                Use image
              </button>
            )}

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={copyUrl}
                className="flex h-10 items-center justify-center gap-2 rounded-lg border dashboard-border dashboard-subtle text-sm dashboard-hover"
              >
                <Copy size={15} aria-hidden />
                Copy URL
              </button>
              <a
                href={asset.url}
                target="_blank"
                rel="noreferrer"
                className="flex h-10 items-center justify-center gap-2 rounded-lg border dashboard-border dashboard-subtle text-sm dashboard-hover"
              >
                <ExternalLink size={15} aria-hidden />
                Open
              </a>
            </div>

            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(asset)}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-red-500/25 bg-red-500/10 text-sm font-medium text-red-600 hover:bg-red-500/20 dark:text-red-300"
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
        <div className="mb-2 text-xs font-medium uppercase dashboard-faint">
          {title}
        </div>
      )}
      <div className="overflow-hidden rounded-lg border dashboard-border">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="grid grid-cols-[92px_minmax(0,1fr)] gap-3 border-b dashboard-border px-3 py-2 last:border-b-0"
          >
            <div className="text-xs dashboard-faint">{label}</div>
            <div className="break-words text-xs dashboard-muted">{value}</div>
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
    hour12: true,
  }).format(date);
}
