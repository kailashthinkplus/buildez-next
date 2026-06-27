"use client";

import { useState } from "react";
import { Check, ExternalLink, Loader2 } from "lucide-react";

interface PublishModalProps {
  open: boolean;
  pageId: string;
  siteSlug: string;
  pageSlugWithId: string;
  publicUrl: string;
  previewUrl: string;
  onPublished?(): void;
  onClose(): void;
}

export default function PublishModal({
  open,
  pageId,
  publicUrl,
  previewUrl,
  onPublished,
  onClose,
}: PublishModalProps) {
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const publish = async () => {
    setPublishing(true);
    setError(null);

    try {
      const response = await fetch(`/api/pages/${pageId}/publish`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error || "Publishing failed");
      }

      onPublished?.();
      setPublished(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Publishing failed");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/70 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="publish-title"
        className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111827] p-6 text-white shadow-2xl"
      >
        {published ? (
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-full bg-emerald-500/15 p-2 text-emerald-300">
              <Check size={18} />
            </div>
            <div>
              <h2 id="publish-title" className="text-lg font-semibold">
                Page published
              </h2>
              <p className="mt-2 text-sm text-white/60">
                Your latest saved builder page is now live.
              </p>
            </div>
          </div>
        ) : (
          <>
            <h2 id="publish-title" className="text-lg font-semibold">
              Publish this page?
            </h2>
            <p className="mt-2 text-sm text-white/60">
              The live site will be generated from the latest saved builder blueprint.
            </p>
          </>
        )}

        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

        {published && (
          <div className="mt-5 space-y-2">
            <a
              href={publicUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between rounded-lg border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100 transition hover:bg-emerald-500/15"
            >
              View live website
              <ExternalLink size={15} />
            </a>
            <a
              href={previewUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white/75 transition hover:bg-white/[0.08]"
            >
              Open preview
              <ExternalLink size={15} />
            </a>
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={publishing}
            className="rounded-lg px-4 py-2 text-sm text-white/70 hover:bg-white/10"
          >
            {published ? "Done" : "Cancel"}
          </button>
          {!published && (
            <button
              type="button"
              onClick={() => void publish()}
              disabled={publishing}
              className="flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium hover:bg-orange-500 disabled:opacity-50"
            >
              {publishing && <Loader2 size={15} className="animate-spin" />}
              {publishing ? "Publishing..." : "Publish"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
