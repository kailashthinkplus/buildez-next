"use client";

import { X, Trash2 } from "lucide-react";
import { useDeletePage } from "../hooks/useDeletePage";

export default function DeletePageModal({ page, open, onClose }) {
  const { deletePage, loading } = useDeletePage();

  if (!open) return null;

  async function confirm() {
    await deletePage(page.id);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xl flex items-center justify-center z-50">
      <div
        className="
          w-full max-w-sm rounded-2xl p-6
          glass bg-white/40 dark:bg-white/[0.08]
          border border-white/30 dark:border-white/10
          shadow-2xl backdrop-blur-2xl relative
        "
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 dark:text-white/70"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center">
          <Trash2 className="h-10 w-10 mx-auto text-red-500 mb-3" />

          <h2 className="text-lg font-semibold dark:text-white">
            Delete Page?
          </h2>
          <p className="text-sm mt-1 opacity-70 dark:text-white/70">
            This action cannot be undone.
          </p>
        </div>

        <div className="mt-6 flex justify-center gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gray-200 dark:bg-white/10"
          >
            Cancel
          </button>

          <button
            onClick={confirm}
            disabled={loading}
            className="
              px-5 py-2 rounded-xl font-semibold
              bg-red-600 text-white hover:bg-red-500
              disabled:opacity-40
            "
          >
            {loading ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
