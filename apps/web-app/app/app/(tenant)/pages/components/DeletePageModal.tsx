"use client";

import { useState } from "react";
import { X, Trash2 } from "lucide-react";
import { useDeletePage } from "../hooks/useDeletePage";

type DeletePageModalProps = {
  page: {
    id: string;
    title?: string;
  };
  open: boolean;
  onClose: () => void;
};

export default function DeletePageModal({
  page,
  open,
  onClose,
}: DeletePageModalProps) {
  const { deletePage, loading } = useDeletePage();
  const [error, setError] = useState("");

  if (!open) return null;

  async function confirm() {
    setError("");
    const result = await deletePage(page.id);

    if (!result.success) {
      setError(result.error || "Failed to delete page");
      return;
    }

    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xl flex items-center justify-center z-50">
      <div
        className="
          w-full max-w-sm rounded-2xl p-6
          dashboard-card-strong
          shadow-2xl backdrop-blur-2xl relative
        "
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 dashboard-muted"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center">
          <Trash2 className="h-10 w-10 mx-auto text-red-500 mb-3" />

          <h2 className="text-lg font-semibold">
            Delete Page?
          </h2>
          <p className="text-sm mt-1 dashboard-muted">
            This action cannot be undone.
          </p>
          {error && (
            <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          )}
        </div>

        <div className="mt-6 flex justify-center gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl dashboard-subtle dashboard-hover"
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
