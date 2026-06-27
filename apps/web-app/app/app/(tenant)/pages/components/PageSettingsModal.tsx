"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useUpdatePage } from "../hooks/useUpdatePage";

export default function PageSettingsModal({ page, open, onClose, onSaved }) {
  const { updatePage, loading } = useUpdatePage();
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(page?.title || "");
  const [slug, setSlug] = useState(page?.slug || "");
  const [seoTitle, setSeoTitle] = useState(page?.seoTitle || "");
  const [seoDescription, setSeoDescription] = useState(
    page?.seoDescription || ""
  );

  useEffect(() => {
    if (page) {
      setTitle(page.title);
      setSlug(page.slug);
      setSeoTitle(page.seoTitle || "");
      setSeoDescription(page.seoDescription || "");
    }
  }, [page]);

  if (!open) return null;

  async function save() {
    setError(null);
    const result = await updatePage(page.id, {
      title,
      slug,
      seoTitle,
      seoDescription,
    });

    if (!result.success) {
      setError(result.error || "Failed to update page");
      return;
    }

    onSaved?.();
    onClose();
  }

  return (
    <div
      className="
        fixed inset-0 z-50 flex items-center justify-center
        bg-black/40 backdrop-blur-xl
      "
    >
      <div
        className="
          w-full max-w-lg rounded-2xl p-6
          dashboard-card-strong
          shadow-2xl backdrop-blur-2xl
          relative animate-[fadeIn_0.15s_ease-out]
        "
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="
            absolute right-4 top-4
            dashboard-muted
            hover:opacity-70
          "
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-semibold mb-4">
          Page Settings
        </h2>

        <div className="flex flex-col gap-4">
          {error && (
            <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </p>
          )}

          {/* Title */}
          <div>
            <label className="text-sm dashboard-muted">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="
                w-full mt-1 px-3 py-2 rounded-xl
                dashboard-input
              "
            />
          </div>

          {/* Slug */}
          <div>
            <label className="text-sm dashboard-muted">Slug</label>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="
                w-full mt-1 px-3 py-2 rounded-xl
                dashboard-input
              "
            />
          </div>

          {/* SEO Title */}
          <div>
            <label className="text-sm dashboard-muted">SEO Title</label>
            <input
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              className="
                w-full mt-1 px-3 py-2 rounded-xl
                dashboard-input
              "
            />
          </div>

          {/* SEO Description */}
          <div>
            <label className="text-sm dashboard-muted">
              SEO Description
            </label>
            <textarea
              rows={3}
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              className="
                w-full mt-1 px-3 py-2 rounded-xl resize-none
                dashboard-input
              "
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 font-medium rounded-xl dashboard-subtle dashboard-hover"
          >
            Cancel
          </button>

          <button
            onClick={save}
            disabled={loading}
            className="
              px-5 py-2 font-semibold rounded-xl
              bg-[var(--brand)] text-white
              hover:brightness-110 disabled:opacity-40
            "
          >
            {loading ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
