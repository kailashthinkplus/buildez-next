"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useUpdatePage } from "../hooks/useUpdatePage";

export default function PageSettingsModal({ page, open, onClose }) {
  const { updatePage, loading } = useUpdatePage();

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
    await updatePage(page.id, {
      title,
      slug,
      seoTitle,
      seoDescription,
    });
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
          glass bg-white/40 dark:bg-white/[0.08]
          border border-white/40 dark:border-white/10
          shadow-2xl backdrop-blur-2xl
          relative animate-[fadeIn_0.15s_ease-out]
        "
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="
            absolute right-4 top-4
            text-gray-700 dark:text-white/70
            hover:opacity-70
          "
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-semibold mb-4 dark:text-white">
          Page Settings
        </h2>

        <div className="flex flex-col gap-4">

          {/* Title */}
          <div>
            <label className="text-sm dark:text-white/70">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="
                w-full mt-1 px-3 py-2 rounded-xl
                bg-white text-black
                border border-gray-300
                focus:outline-none focus:ring-2 focus:ring-[var(--brand)]
              "
            />
          </div>

          {/* Slug */}
          <div>
            <label className="text-sm dark:text-white/70">Slug</label>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="
                w-full mt-1 px-3 py-2 rounded-xl
                bg-white text-black
                border border-gray-300
                focus:outline-none focus:ring-2 focus:ring-[var(--brand)]
              "
            />
          </div>

          {/* SEO Title */}
          <div>
            <label className="text-sm dark:text-white/70">SEO Title</label>
            <input
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              className="
                w-full mt-1 px-3 py-2 rounded-xl
                bg-white text-black
                border border-gray-300
                focus:outline-none focus:ring-2 focus:ring-[var(--brand)]
              "
            />
          </div>

          {/* SEO Description */}
          <div>
            <label className="text-sm dark:text-white/70">
              SEO Description
            </label>
            <textarea
              rows={3}
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              className="
                w-full mt-1 px-3 py-2 rounded-xl resize-none
                bg-white text-black
                border border-gray-300
                focus:outline-none focus:ring-2 focus:ring-[var(--brand)]
              "
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 font-medium rounded-xl bg-gray-200 dark:bg-white/10"
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
