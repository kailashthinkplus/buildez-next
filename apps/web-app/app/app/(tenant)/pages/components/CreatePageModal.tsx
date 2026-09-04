"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { usePageMutations } from "../hooks/usePageMutations";
import { DashboardModalPortal } from "../../components/ui/DashboardModalPortal";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void | Promise<void>;
  siteSlug: string;
};

export default function CreatePageModal({ open, onClose, onCreated, siteSlug }: Props) {
  const [title, setTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const pageMutations = usePageMutations(siteSlug);

  if (!open) return null;

  async function handleCreate() {
    if (!title.trim() || creating) return;
    setCreating(true);
    setError("");
    try {
      const page = await pageMutations.create.mutate({ title });
      await onCreated?.();
      setTitle("");
      if (page?.slug && page?.id) {
        window.location.href = `/app/${siteSlug}/${page.slug}-${page.id}`;
        return;
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create page. Please try again.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <DashboardModalPortal onClose={onClose}>
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/45 p-3 backdrop-blur-xl sm:p-6">
        <div className="dashboard-modal-surface relative w-full max-w-md rounded-[28px] border border-white/20 bg-white/80 p-6 shadow-2xl backdrop-blur-2xl dark:bg-[#0b101c]/85 sm:p-8">
          <button
            onClick={onClose}
            className="absolute right-5 top-5 rounded-xl border dashboard-border p-2.5 dashboard-hover"
            aria-label="Close create page"
          >
            <X className="h-5 w-5 dashboard-muted" />
          </button>

          <div className="text-xs font-semibold uppercase tracking-wide text-[#1349A3] dark:text-blue-300">Page builder</div>
          <h2 className="mt-1 text-2xl font-semibold">Name your page</h2>
          <p className="mt-1 text-sm dashboard-muted">You can change its URL and publishing settings later.</p>

          <input
            type="text"
            autoFocus
            placeholder="Page title…"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            className="mt-5 w-full p-3 rounded-xl text-sm dashboard-input"
          />
          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

          <div className="mt-5 flex justify-end">
            <button
              disabled={!title.trim() || creating}
              onClick={handleCreate}
              className="rounded-xl bg-[#1349A3] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1D5FC7] disabled:opacity-50"
            >
              {creating ? "Creating…" : "Create page"}
            </button>
          </div>
        </div>
      </div>
    </DashboardModalPortal>
  );
}
