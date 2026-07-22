"use client";

import { useState, useEffect } from "react";
import { usePageMutations } from "../hooks/usePageMutations";
import {
  ArrowRight,
  Sparkles,
  FileText,
  Layers,
  Copy,
  X,
} from "lucide-react";
import { DashboardModalPortal } from "../../components/ui/DashboardModalPortal";

type Props = {
  open: boolean;
  onClose: () => void;
  siteSlug: string;
};

export default function CreatePageModal({ open, onClose, siteSlug }: Props) {
  const [step, setStep] = useState<
    "choose" | "blank" | "ai" | "template" | "duplicate"
  >("choose");

  const [title, setTitle] = useState("");
  const [creating, setCreating] = useState(false);

  /* -------------------------------------------------
     DEBUG: siteSlug sanity
  -------------------------------------------------- */
  useEffect(() => {
    if (open) {
      console.log("🟦 [CreatePageModal] OPENED");
      console.log("🟦 [CreatePageModal] siteSlug:", siteSlug);
    }
  }, [open, siteSlug]);

  if (!siteSlug) {
    console.warn(
      "🟥 [CreatePageModal] siteSlug is EMPTY — page creation will fail"
    );
  }

  const pageMutations = usePageMutations(siteSlug);

  if (!open) return null;

  async function handleCreate() {
    if (!title.trim() || creating) {
      console.warn("🟨 [CreatePageModal] Create blocked", {
        title,
        creating,
      });
      return;
    }

    try {
      setCreating(true);

      console.log("🟩 [CreatePageModal] CREATE PAGE →", {
        title,
        siteSlug,
      });

await pageMutations.create.mutate({ title });
console.log("🟩 [CreatePageModal] CREATE SUCCESS");


      // 🚑 HARD RESET — GUARANTEED UI CONSISTENCY
      window.location.reload();
    } catch (err) {
      console.error("🟥 [CreatePageModal] Create page FAILED", err);
      setCreating(false);
    }
  }

  return (
    <DashboardModalPortal onClose={onClose}>
    <div className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-lg">
      <div className="dashboard-modal-surface relative flex h-[100dvh] w-screen flex-col overflow-y-auto shadow-2xl">
        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 z-10 rounded-xl border dashboard-border p-2.5 dashboard-hover"
          aria-label="Close create page"
        >
          <X className="h-5 w-5 dashboard-muted" />
        </button>

        <header className="border-b dashboard-border px-6 py-5 md:px-10"><div className="mx-auto max-w-5xl"><div className="text-xs font-semibold uppercase tracking-wide text-[#1349A3] dark:text-blue-300">Page builder</div><h2 className="mt-1 text-2xl font-semibold">Create new page</h2><p className="mt-1 text-sm dashboard-muted">Choose the best starting point for your next page.</p></div></header>

        <main className="flex flex-1 items-center justify-center p-6 md:p-10"><div className="w-full max-w-5xl">

        {/* STEP 1 */}
        {step === "choose" && (
          <div className="grid gap-4 md:grid-cols-2">
            <OptionButton
              icon={<FileText className="h-5 w-5 text-[#1349A3] dark:text-blue-300" />}
              title="Blank Page"
              desc="Start with an empty canvas."
              onClick={() => setStep("blank")}
            />

            <OptionButton
              icon={<Sparkles className="h-5 w-5 text-amber-500" />}
              title="AI-Generated Page"
              desc="Describe your page. AI builds it instantly."
              onClick={() => setStep("ai")}
            />

            <OptionButton
              icon={<Layers className="h-5 w-5 text-cyan-600 dark:text-cyan-300" />}
              title="Choose a Template"
              desc="Start from a professionally designed layout."
              onClick={() => setStep("template")}
            />

            <OptionButton
              icon={<Copy className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />}
              title="Duplicate Existing Page"
              desc="Make a copy of a page you already have."
              onClick={() => setStep("duplicate")}
            />
          </div>
        )}

        {/* STEP 2 */}
        {step !== "choose" && (
          <div className="mx-auto max-w-xl rounded-2xl border dashboard-border dashboard-card p-6 md:p-8">
            <div className="mb-5"><div className="text-xs font-semibold uppercase tracking-wide text-[#1349A3] dark:text-blue-300">Page details</div><h3 className="mt-1 text-xl font-semibold">Name your page</h3><p className="mt-1 text-sm dashboard-muted">You can change its URL and publishing settings later.</p></div>
            <input
              type="text"
              placeholder="Page title…"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 rounded-xl text-sm dashboard-input"
            />

            <div className="flex justify-between pt-1">
              <button
                onClick={() => setStep("choose")}
                className="text-sm dashboard-muted hover:text-[var(--dashboard-text)] underline"
              >
                ← Back
              </button>

              <button
                disabled={!title.trim() || creating}
                onClick={handleCreate}
                className="rounded-xl bg-[#1349A3] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1D5FC7] disabled:opacity-50"
              >
                {creating ? "Creating…" : "Create Page"}
              </button>
            </div>
          </div>
        )}
        </div></main>
      </div>
    </div>
    </DashboardModalPortal>
  );
}

function OptionButton({
  icon,
  title,
  desc,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group flex min-h-32 w-full items-center gap-4 rounded-2xl border dashboard-border dashboard-card p-5 transition hover:-translate-y-0.5 hover:border-[#3B82F6]/60 hover:shadow-lg"
    >
      {icon}
      <div className="flex-1 text-left">
        <p className="font-medium">{title}</p>
        <p className="dashboard-muted text-sm">{desc}</p>
      </div>
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1349A3]/10 text-[#1349A3] transition group-hover:bg-[#1349A3] group-hover:text-white dark:text-blue-300"><ArrowRight className="h-4 w-4" /></span>
    </button>
  );
}
