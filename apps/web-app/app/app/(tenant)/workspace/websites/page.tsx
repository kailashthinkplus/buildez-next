"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Globe2, Plus, Sparkles } from "lucide-react";

import CreateSiteModal from "@/app/app/(tenant)/components/CreateSiteModal";
import { WebsiteThumbnail } from "@/app/app/(tenant)/components/WebsiteThumbnail";
import WebsiteActionsMenu from "@/app/app/(tenant)/components/WebsiteActionsMenu";

/* ============================================================
   TYPES
============================================================ */

interface Site {
  id: string;
  name: string;
  slug: string;
  status: string;
  archivedAt?: string | null;
}

/* ============================================================
   WEBSITES PAGE
============================================================ */

export default function WebsitesPage() {
  const router = useRouter();

  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  /* ------------------------------------------------------------
     FETCH SITES (REUSABLE)
  ------------------------------------------------------------ */
  async function fetchSites() {
    try {
      setLoading(true);
      const res = await fetch("/api/sites", {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to load sites");
      }

      const json = await res.json();
      setSites(json.sites || []);
    } catch (err) {
      console.error(err);
      setError("Could not load websites");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSites();
  }, []);

  /* ------------------------------------------------------------
     STATES
  ------------------------------------------------------------ */

  if (loading) {
    return (
      <div className="p-8 dashboard-muted">
        Loading websites…
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-red-400">
        {error}
      </div>
    );
  }

  /* ------------------------------------------------------------
     RENDER
  ------------------------------------------------------------ */

  return (
    <div className="p-8">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">
          Websites
        </h1>

        <button
          onClick={() => setShowCreateModal(true)}
          className="
            flex items-center gap-2
            px-4 py-2 rounded-xl
            bg-blue-600 hover:bg-blue-500
            text-white text-sm
          "
        >
          <Plus size={16} />
          New website
        </button>
      </div>

      {/* GRID */}
      {sites.length === 0 ? (
        <div className="dashboard-card relative overflow-hidden rounded-3xl border dashboard-border px-6 py-14 text-center sm:px-12">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,.13),transparent_42%)]" />
          <span className="dashboard-subtle relative mx-auto grid h-16 w-16 place-items-center rounded-2xl text-blue-500">
            <Globe2 size={28} />
          </span>
          <p className="relative mx-auto mt-6 flex w-fit items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-300">
            <Sparkles size={13} /> Start from an idea
          </p>
          <h2 className="relative mt-4 text-2xl font-semibold tracking-tight">Build your first website</h2>
          <p className="relative mx-auto mt-2 max-w-lg text-sm leading-6 dashboard-muted">
            Tell AI what you want to create, choose the visual direction, or begin with a clean blank website.
          </p>
          <button type="button" onClick={() => setShowCreateModal(true)} className="relative mt-7 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500">
            Get started <ArrowRight size={16} />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sites.map((site) => (
            <div
              key={site.id}
              className="
                relative rounded-2xl p-4
                dashboard-card
                backdrop-blur-xl
                dashboard-hover
                transition
              "
            >
              <button type="button" onClick={() => router.push(`/app/${site.slug}/dashboard`)} className="mb-4 block w-full overflow-hidden rounded-xl text-left" aria-label={`Open ${site.name} dashboard`}>
                <WebsiteThumbnail siteId={site.id} siteName={site.name} siteStatus={site.status} className="h-40 w-full" />
              </button>

              <div className="absolute top-3 right-3" onClick={(e) => e.stopPropagation()}>
                <WebsiteActionsMenu
                  site={{ id: site.id, name: site.name, slug: site.slug, status: site.status, archived: Boolean(site.archivedAt) }}
                  onChanged={(patch) =>
                    setSites((current) =>
                      current.map((item) => (item.id === patch.id ? { ...item, status: patch.status, archivedAt: patch.archived ? new Date().toISOString() : null } : item)),
                    )
                  }
                />
              </div>

              {/* CONTENT */}
              <div className="space-y-1">
                <div className="font-medium">
                  {site.name}
                </div>

                <div className="text-xs dashboard-faint">
                  {site.slug}
                </div>

                <div
                  className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs ${
                    site.status.toUpperCase() === "PUBLISHED"
                      ? "bg-green-500/10 text-green-400"
                      : "bg-blue-500/10 text-blue-400"
                  }`}
                >
                  {site.status}
                </div>
              </div>

              {/* ACTION */}
              <button
                onClick={() =>
                  router.push(`/app/${site.slug}/dashboard`)
                }
                className="
                  mt-4 w-full py-2 rounded-xl
                  dashboard-subtle dashboard-hover
                  text-sm
                "
              >
                Visit Dashboard
              </button>

            </div>
          ))}
        </div>
      )}

      {/* CREATE SITE MODAL */}
      <CreateSiteModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
}
