"use client";

import { useState } from "react";
import { X, Loader2, Rocket } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useWorkspace } from "./WorkspaceContext";
import CreateSiteModal from "@/app/app/(tenant)/components/CreateSiteModal";


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
          flex items-center justify-center
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
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.96, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="
            w-full max-w-md
            rounded-2xl
            bg-white/10 dark:bg-white/5
            backdrop-blur-xl
            border border-white/10
            shadow-2xl
            p-6
            text-white
          "
        >
          {/* HEADER */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold">Create new website</h2>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-white/10"
            >
              <X size={18} />
            </button>
          </div>

          {/* PLAN INFO */}
          <div className="mb-4 p-3 rounded-xl bg-white/5 border border-white/10 text-sm">
            <div className="flex justify-between">
              <span className="opacity-70">Plan</span>
              <span className="font-medium">
                {plan?.plan?.name ?? plan?.planCode ?? "Trial"}
              </span>
            </div>
            <div className="flex justify-between mt-1">
              <span className="opacity-70">Websites</span>
              <span>
                {usedSites}/{siteLimit} used
              </span>
            </div>
          </div>

          {!canCreate && (
            <div className="mb-4 p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-sm text-orange-400">
              You’ve reached your website limit.
              <br />
              <span className="underline cursor-pointer">
                Upgrade your plan
              </span>{" "}
              to create more websites.
            </div>
          )}

          {/* FORM */}
          <div className="space-y-4">
            <div>
              <label className="text-xs opacity-70">Website name</label>
              <input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setSlug(autoSlug(e.target.value));
                }}
                placeholder="My Startup"
                className="
                  mt-1 w-full px-3 py-2 rounded-xl
                  bg-white/5 border border-white/10
                  outline-none
                  focus:ring-2 focus:ring-indigo-500/40
                "
              />
            </div>

            <div>
              <label className="text-xs opacity-70">Site slug</label>
              <input
                value={slug}
                onChange={(e) => setSlug(autoSlug(e.target.value))}
                placeholder="my-startup"
                className="
                  mt-1 w-full px-3 py-2 rounded-xl
                  bg-white/5 border border-white/10
                  outline-none
                "
              />
            </div>
          </div>

          {/* STATUS */}
          {error && (
            <div className="mt-4 text-sm text-red-400">{error}</div>
          )}

          {success && (
            <div className="mt-4 text-sm text-green-400">
              Website created successfully 🎉
            </div>
          )}

          {/* ACTIONS */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm bg-white/10 hover:bg-white/20"
            >
              Cancel
            </button>

            <button
              onClick={handleCreate}
              disabled={!canCreate || loading}
              className="
                px-4 py-2 rounded-xl text-sm
                bg-gradient-to-r from-indigo-500 to-indigo-600
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
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
