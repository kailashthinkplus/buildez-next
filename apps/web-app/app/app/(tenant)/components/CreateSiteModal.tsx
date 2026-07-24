"use client";

import { useEffect, useState } from "react";
import { Loader2, Rocket, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { useWorkspace } from "./WorkspaceContext";
import { DashboardModalPortal } from "./ui/DashboardModalPortal";

export type CreateSiteIntent = "dashboard" | "ai";

export type CreatedSite = {
  id: string;
  name: string;
  slug: string;
  status?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  intent?: CreateSiteIntent;
  onCreated?: (
    site: CreatedSite,
    intent: CreateSiteIntent,
  ) => void | Promise<void>;
};

export default function CreateSiteModal({
  open,
  onClose,
  intent = "dashboard",
  onCreated,
}: Props) {
  const { plan, websites } = useWorkspace();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const planLimits = (
    plan?.plan as { limits?: { sites?: number } } | undefined
  )?.limits;

  const siteLimit =
    planLimits?.sites ?? (plan?.planCode === "starter" ? 1 : 999);

  const usedSites = websites.length;
  const remaining = Math.max(siteLimit - usedSites, 0);
  const canCreate = remaining > 0;

  useEffect(() => {
    if (!open) {
      setName("");
      setSlug("");
      setError(null);
      setSuccess(false);
      setLoading(false);
    }
  }, [open]);

  function autoSlug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  }

  async function handleCreate() {
    const cleanName = name.trim();
    const cleanSlug = autoSlug(slug);

    if (!cleanName || !cleanSlug) {
      setError("Site name and slug are required");
      return;
    }

    if (!canCreate || loading) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const response = await fetch("/api/sites", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: cleanName,
          slug: cleanSlug,
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.error || "Failed to create site");
      }

      const createdSite =
        payload?.site ??
        payload?.data?.site ??
        payload?.data ??
        payload;

      if (
        !createdSite ||
        typeof createdSite.id !== "string" ||
        typeof createdSite.slug !== "string"
      ) {
        throw new Error(
          "Website was created, but the server returned an invalid response.",
        );
      }

      const site: CreatedSite = {
        id: createdSite.id,
        name:
          typeof createdSite.name === "string"
            ? createdSite.name
            : cleanName,
        slug: createdSite.slug,
        status:
          typeof createdSite.status === "string"
            ? createdSite.status
            : undefined,
      };

      setSuccess(true);

      if (onCreated) {
        await onCreated(site, intent);
        return;
      }

      window.location.assign(
        intent === "ai"
          ? `/app/builder-v3/${site.id}?panel=ai`
          : `/app/${site.slug}/dashboard`,
      );
    } catch (reason: unknown) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Failed to create site",
      );
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return null;
  }

  return (
    <AnimatePresence>
      <DashboardModalPortal onClose={onClose}>
        <motion.div
          className="fixed inset-0 z-[100] flex bg-black/40 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            if (!loading) onClose();
          }}
        >
          <motion.div
            onClick={(event) => event.stopPropagation()}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="dashboard-modal-surface h-[100dvh] w-screen overflow-y-auto shadow-2xl backdrop-blur-xl"
          >
            <div className="flex items-center justify-between border-b dashboard-border px-6 py-5 md:px-10">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-[#1349A3] dark:text-blue-300">
                  Website setup
                </div>
                <h2 className="mt-1 text-2xl font-semibold">
                  {intent === "ai"
                    ? "Create website with AI"
                    : "Create new website"}
                </h2>
              </div>

              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="rounded-xl border dashboard-border p-2.5 dashboard-hover disabled:opacity-50"
                aria-label="Close create website"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mx-auto flex w-full max-w-5xl flex-1 items-center p-6 md:p-10">
              <div className="grid w-full gap-6 lg:grid-cols-[0.8fr_1.2fr]">
                <aside className="dashboard-card rounded-2xl border dashboard-border p-6">
                  <Rocket className="h-8 w-8 text-[#1349A3] dark:text-blue-300" />

                  <h3 className="mt-5 text-xl font-semibold">
                    {intent === "ai"
                      ? "Create the workspace for your AI-generated website."
                      : "A fresh home for your next idea."}
                  </h3>

                  <p className="mt-2 text-sm leading-6 dashboard-muted">
                    {intent === "ai"
                      ? "After setup, BuildEZ will open Builder 3 with the AI panel ready."
                      : "Name your website and claim its BuildEZ address. You can connect a custom domain after setup."}
                  </p>

                  <div className="dashboard-subtle mt-6 rounded-xl p-4 text-sm">
                    <div className="flex justify-between">
                      <span className="dashboard-muted">Plan</span>
                      <span className="font-medium">
                        {plan?.plan?.name ??
                          plan?.planCode ??
                          "Trial"}
                      </span>
                    </div>

                    <div className="mt-1 flex justify-between">
                      <span className="dashboard-muted">Websites</span>
                      <span>
                        {usedSites}/{siteLimit} used
                      </span>
                    </div>
                  </div>

                  {!canCreate ? (
                    <div className="mt-4 rounded-xl border border-orange-500/20 bg-orange-500/10 p-3 text-sm text-orange-600 dark:text-orange-300">
                      You’ve reached your website limit.
                      <br />
                      Upgrade your plan to create more websites.
                    </div>
                  ) : null}
                </aside>

                <section className="dashboard-card rounded-2xl border dashboard-border p-6 md:p-8">
                  <div className="mb-6">
                    <div className="text-xs font-semibold uppercase tracking-wide dashboard-faint">
                      Website details
                    </div>
                    <h3 className="mt-1 text-xl font-semibold">
                      Choose a name and address
                    </h3>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label
                        htmlFor="create-site-name"
                        className="text-xs dashboard-muted"
                      >
                        Website name
                      </label>

                      <input
                        id="create-site-name"
                        value={name}
                        disabled={loading}
                        onChange={(event) => {
                          const value = event.target.value;
                          setName(value);
                          setSlug(autoSlug(value));
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            void handleCreate();
                          }
                        }}
                        placeholder="My Startup"
                        className="dashboard-input mt-1 w-full rounded-xl px-3 py-2"
                        autoFocus
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="create-site-slug"
                        className="text-xs dashboard-muted"
                      >
                        Site slug
                      </label>

                      <input
                        id="create-site-slug"
                        value={slug}
                        disabled={loading}
                        onChange={(event) =>
                          setSlug(autoSlug(event.target.value))
                        }
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            void handleCreate();
                          }
                        }}
                        placeholder="my-startup"
                        className="dashboard-input mt-1 w-full rounded-xl px-3 py-2"
                      />

                      <p className="mt-2 text-xs dashboard-faint">
                        {slug
                          ? `${slug}.buildez.site`
                          : "your-site.buildez.site"}
                      </p>
                    </div>
                  </div>

                  {error ? (
                    <div className="mt-4 text-sm text-red-600 dark:text-red-300">
                      {error}
                    </div>
                  ) : null}

                  {success ? (
                    <div className="mt-4 text-sm text-green-600 dark:text-green-300">
                      Website created successfully.
                    </div>
                  ) : null}

                  <div className="mt-8 flex justify-end gap-3 border-t dashboard-border pt-5">
                    <button
                      type="button"
                      onClick={onClose}
                      disabled={loading}
                      className="dashboard-subtle rounded-xl px-4 py-2 text-sm dashboard-hover disabled:opacity-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={() => void handleCreate()}
                      disabled={
                        !canCreate ||
                        loading ||
                        !name.trim() ||
                        !slug.trim()
                      }
                      className="flex items-center gap-2 rounded-xl bg-[#1349A3] px-4 py-2 text-sm text-white hover:bg-[#1D5FC7] disabled:opacity-50"
                    >
                      {loading ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Rocket size={16} />
                      )}

                      {loading
                        ? "Creating…"
                        : intent === "ai"
                          ? "Create and open AI"
                          : "Create website"}
                    </button>
                  </div>
                </section>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </DashboardModalPortal>
    </AnimatePresence>
  );
}
