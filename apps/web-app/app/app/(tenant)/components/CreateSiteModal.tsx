"use client";

import { useState } from "react";
import { X, Loader2, Rocket } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useWorkspace } from "./WorkspaceContext";


type Props = {
  open: boolean;
  onClose: () => void;
};

export default function CreateSiteModal({ open, onClose }: Props) {
  const { plan, websites, refreshWebsites } = useWorkspace();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  /* -----------------------------------------------------------
     PLAN LIMITS (SAFE DEFAULTS)
  ----------------------------------------------------------- */
  const siteLimit =
    plan?.plan?.limits?.sites ??
    (plan?.planCode === "starter" ? 1 : 999);

  const usedSites = websites.length;
  const remaining = Math.max(siteLimit - usedSites, 0);
  const canCreate = remaining > 0;

  function autoSlug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  }

  async function handleCreate() {
    if (!name || !slug) {
      setError("Site name and slug are required");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/sites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.error || "Failed to create site");
      }

      setSuccess(true);
      await refreshWebsites();

      setTimeout(() => {
        onClose();
        setSuccess(false);
        setName("");
        setSlug("");
      }, 1200);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <AnimatePresence>
      {/* BACKDROP */}
      <motion.div
        className="
          fixed inset-0 z-[100]
          flex
          bg-black/40 backdrop-blur-md
        "
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        {/* MODAL CARD */}
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="
            h-screen w-screen
            dashboard-card-strong
            backdrop-blur-xl
            shadow-2xl
            overflow-y-auto
          "
        >
          {/* HEADER */}
          <div className="flex items-center justify-between border-b dashboard-border px-6 py-5 md:px-10">
            <div><div className="text-xs font-semibold uppercase tracking-wide text-[#1349A3] dark:text-blue-300">Website setup</div><h2 className="mt-1 text-2xl font-semibold">Create new website</h2></div>
            <button
              onClick={onClose}
              className="rounded-xl border dashboard-border p-2.5 dashboard-hover"
              aria-label="Close create website"
            >
              <X size={18} />
            </button>
          </div>

          <div className="mx-auto flex w-full max-w-5xl flex-1 items-center p-6 md:p-10"><div className="grid w-full gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <aside className="rounded-2xl border dashboard-border dashboard-card p-6">
            <Rocket className="h-8 w-8 text-[#1349A3] dark:text-blue-300" />
            <h3 className="mt-5 text-xl font-semibold">A fresh home for your next idea.</h3>
            <p className="mt-2 text-sm leading-6 dashboard-muted">Name your website and claim its BuildEZ address. You can connect a custom domain after setup.</p>
          {/* PLAN INFO */}
          <div className="mt-6 p-4 rounded-xl dashboard-subtle text-sm">
            <div className="flex justify-between">
              <span className="dashboard-muted">Plan</span>
              <span className="font-medium">
                {plan?.plan?.name ?? plan?.planCode ?? "Trial"}
              </span>
            </div>
            <div className="flex justify-between mt-1">
              <span className="dashboard-muted">Websites</span>
              <span>
                {usedSites}/{siteLimit} used
              </span>
            </div>
          </div>

          {!canCreate && (
            <div className="mt-4 p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-sm text-orange-600 dark:text-orange-300">
              You’ve reached your website limit.
              <br />
              <span className="underline cursor-pointer">
                Upgrade your plan
              </span>{" "}
              to create more websites.
            </div>
          )}
          </aside>

          {/* FORM */}
          <section className="rounded-2xl border dashboard-border dashboard-card p-6 md:p-8"><div className="mb-6"><div className="text-xs font-semibold uppercase tracking-wide dashboard-faint">Website details</div><h3 className="mt-1 text-xl font-semibold">Choose a name and address</h3></div><div className="space-y-5">
            <div>
              <label className="text-xs dashboard-muted">Website name</label>
              <input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setSlug(autoSlug(e.target.value));
                }}
                placeholder="My Startup"
                className="
                  mt-1 w-full px-3 py-2 rounded-xl
                  dashboard-input
                "
              />
            </div>

            <div>
              <label className="text-xs dashboard-muted">Site slug</label>
              <input
                value={slug}
                onChange={(e) => setSlug(autoSlug(e.target.value))}
                placeholder="my-startup"
                className="
                  mt-1 w-full px-3 py-2 rounded-xl
                  dashboard-input
                "
              />
            </div>
          </div>

          {/* STATUS */}
          {error && (
            <div className="mt-4 text-sm text-red-600 dark:text-red-300">{error}</div>
          )}

          {success && (
            <div className="mt-4 text-sm text-green-600 dark:text-green-300">
              Website created successfully 🎉
            </div>
          )}

          {/* ACTIONS */}
          <div className="mt-8 flex justify-end gap-3 border-t dashboard-border pt-5">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm dashboard-subtle dashboard-hover"
            >
              Cancel
            </button>

            <button
              onClick={handleCreate}
              disabled={!canCreate || loading}
              className="
                px-4 py-2 rounded-xl text-sm
                bg-[#1349A3] text-white hover:bg-[#1D5FC7]
                flex items-center gap-2
                disabled:opacity-50
              "
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Rocket size={16} />
              )}
              Create site
            </button>
          </div>
          </section>
          </div></div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
