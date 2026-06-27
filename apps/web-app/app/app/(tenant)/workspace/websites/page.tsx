"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MoreVertical, Plus } from "lucide-react";

import CreateSiteModal from "@/app/app/(tenant)/components/CreateSiteModal";

/* ============================================================
   TYPES
============================================================ */

interface Site {
  id: string;
  name: string;
  slug: string;
  status: "Draft" | "Published";
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
        <div className="dashboard-faint text-sm">
          No websites yet
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
              {/* KEBAB MENU (UI ONLY FOR NOW) */}
              <button
                className="absolute top-3 right-3 dashboard-muted hover:text-[var(--dashboard-text)]"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical size={16} />
              </button>

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
                    site.status === "Published"
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
        onCreated={() => {
          setShowCreateModal(false);
          fetchSites(); // 🔄 refresh list after create
        }}
      />
    </div>
  );
}
