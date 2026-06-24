"use client";

import { useState } from "react";

interface PublishModalProps {
  open: boolean;
  pageId: string;
  siteSlug: string;
  pageSlugWithId: string;
  onClose(): void;
}

export default function PublishModal({
  open,
  pageId,
  onClose,
}: PublishModalProps) {
  const [publishing, setPublishing] = useState(false);
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

      onClose();
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
        <h2 id="publish-title" className="text-lg font-semibold">
          Publish this page?
        </h2>
        <p className="mt-2 text-sm text-white/60">
          A new immutable site snapshot will be created from the saved blueprint.
        </p>

        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={publishing}
            className="rounded-lg px-4 py-2 text-sm text-white/70 hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void publish()}
            disabled={publishing}
            className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium hover:bg-orange-500 disabled:opacity-50"
          >
            {publishing ? "Publishing…" : "Publish"}
          </button>
        </div>
      </div>
    </div>
  );
}
