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
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-lg">
      <div className="relative w-full max-w-xl p-8 rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/15 shadow-xl">
        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-full hover:bg-white/10"
        >
          <X className="h-5 w-5 text-white/70" />
        </button>

        <h2 className="text-center text-xl font-semibold text-white mb-6 mt-2">
          Create New Page
        </h2>

        {/* STEP 1 */}
        {step === "choose" && (
          <div className="space-y-4">
            <OptionButton
              icon={<FileText className="h-5 w-5 text-gray-300" />}
              title="Blank Page"
              desc="Start with an empty canvas."
              onClick={() => setStep("blank")}
            />

            <OptionButton
              icon={<Sparkles className="h-5 w-5 text-yellow-300" />}
              title="AI-Generated Page"
              desc="Describe your page. AI builds it instantly."
              onClick={() => setStep("ai")}
            />

            <OptionButton
              icon={<Layers className="h-5 w-5 text-blue-300" />}
              title="Choose a Template"
              desc="Start from a professionally designed layout."
              onClick={() => setStep("template")}
            />

            <OptionButton
              icon={<Copy className="h-5 w-5 text-purple-300" />}
              title="Duplicate Existing Page"
              desc="Make a copy of a page you already have."
              onClick={() => setStep("duplicate")}
            />
          </div>
        )}

        {/* STEP 2 */}
        {step !== "choose" && (
          <div className="mt-4 space-y-4">
            <input
              type="text"
              placeholder="Page title…"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 rounded-xl text-sm bg-white/20 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />

            <div className="flex justify-between pt-1">
              <button
                onClick={() => setStep("choose")}
                className="text-sm text-white/60 hover:text-white underline"
              >
                ← Back
              </button>

              <button
                disabled={!title.trim() || creating}
                onClick={handleCreate}
                className="px-5 py-2 text-sm rounded-xl bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50"
              >
                {creating ? "Creating…" : "Create Page"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
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
      className="w-full flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition"
    >
      {icon}
      <div className="flex-1 text-left">
        <p className="text-white font-medium">{title}</p>
        <p className="text-white/60 text-sm">{desc}</p>
      </div>
      <ArrowRight className="h-4 w-4 text-white/50" />
    </button>
  );
}
