"use client";

import { useState } from "react";
import { Loader2, UserX, X } from "lucide-react";
import { DashboardModalPortal } from "../../../components/ui/DashboardModalPortal";

type RemoveMemberModalProps = {
  name: string;
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
};

export default function RemoveMemberModal({ name, open, onClose, onConfirm }: RemoveMemberModalProps) {
  const [working, setWorking] = useState(false);

  if (!open) return null;

  async function confirm() {
    setWorking(true);
    await onConfirm();
    setWorking(false);
    onClose();
  }

  return (
    <DashboardModalPortal onClose={onClose}>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xl">
        <div className="dashboard-modal-surface relative w-full max-w-sm rounded-2xl border dashboard-border p-6 shadow-2xl backdrop-blur-2xl">
          <button onClick={onClose} className="absolute right-4 top-4 dashboard-muted" aria-label="Close">
            <X className="h-5 w-5" />
          </button>

          <div className="text-center">
            <UserX className="mx-auto mb-3 h-10 w-10 text-red-500" />
            <h2 className="text-lg font-semibold">Remove {name}?</h2>
            <p className="mt-1 text-sm dashboard-muted">They will immediately lose access to this workspace.</p>
          </div>

          <div className="mt-6 flex justify-center gap-4">
            <button onClick={onClose} className="rounded-xl px-4 py-2 dashboard-subtle dashboard-hover">
              Cancel
            </button>
            <button
              onClick={confirm}
              disabled={working}
              className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2 font-semibold text-white hover:bg-red-500 disabled:opacity-40"
            >
              {working ? <Loader2 size={16} className="animate-spin" /> : null}
              {working ? "Removing…" : "Remove"}
            </button>
          </div>
        </div>
      </div>
    </DashboardModalPortal>
  );
}
