"use client";

import { FormEvent, useState } from "react";
import { Loader2, MailPlus, X } from "lucide-react";
import { DashboardModalPortal } from "../../../components/ui/DashboardModalPortal";
import type { Role } from "../types";

const roles: Role[] = ["ADMIN", "EDITOR", "VIEWER"];

type AddTeamMemberModalProps = {
  open: boolean;
  onClose: () => void;
  onInvited: (message: string) => void;
  seatsFull: boolean;
};

export default function AddTeamMemberModal({ open, onClose, onInvited, seatsFull }: AddTeamMemberModalProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("VIEWER");
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  function reset() {
    setEmail("");
    setRole("VIEWER");
    setError("");
  }

  function close() {
    reset();
    onClose();
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setWorking(true);
    setError("");
    try {
      const response = await fetch("/api/tenant/team", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, role }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Invitation could not be created.");
      onInvited(payload.kind === "member" ? "Existing BuildEZ user added to the team." : "Invitation created and valid for 7 days.");
      reset();
      onClose();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Invitation failed.");
    } finally {
      setWorking(false);
    }
  }

  return (
    <DashboardModalPortal onClose={close}>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xl">
        <div className="dashboard-modal-surface relative w-full max-w-md rounded-2xl border dashboard-border p-6 shadow-2xl backdrop-blur-2xl">
          <button onClick={close} className="absolute right-4 top-4 dashboard-muted" aria-label="Close">
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-500/10 text-blue-500">
              <MailPlus size={19} />
            </span>
            <div>
              <h2 className="text-lg font-semibold">Add team member</h2>
              <p className="text-xs dashboard-muted">Invite a collaborator to your workspace.</p>
            </div>
          </div>

          <form onSubmit={submit} className="mt-6 grid gap-4">
            <label>
              <span className="mb-2 block text-sm font-medium">Email address</span>
              <div className="dashboard-input flex items-center gap-2 rounded-xl px-3">
                <MailPlus size={16} className="dashboard-faint" />
                <input
                  required
                  autoFocus
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="colleague@company.com"
                  className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none"
                />
              </div>
            </label>

            <label>
              <span className="mb-2 block text-sm font-medium">Role</span>
              <select value={role} onChange={(event) => setRole(event.target.value as Role)} className="dashboard-input h-11 w-full rounded-xl px-3 text-sm">
                {roles.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>

            {error && (
              <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-300">
                {error}
              </p>
            )}

            <div className="mt-2 flex justify-end gap-3">
              <button type="button" onClick={close} className="rounded-xl px-4 py-2 dashboard-subtle dashboard-hover">
                Cancel
              </button>
              <button
                type="submit"
                disabled={working || seatsFull}
                className="dashboard-primary-button flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-white disabled:opacity-50"
              >
                {working ? <Loader2 size={16} className="animate-spin" /> : <MailPlus size={16} />}
                {seatsFull ? "Seat limit reached" : "Send invite"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardModalPortal>
  );
}
