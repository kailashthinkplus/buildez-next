"use client";

import { useMemo, useState } from "react";
import {
  Plus,
  CheckSquare,
  Square,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  ImageIcon,
} from "lucide-react";

import PageActionsMenu from "../pages/components/PageActionsMenu";
import CreatePageModal from "../pages/components/CreatePageModal";
import PageSettingsModal from "../pages/components/PageSettingsModal";
import DeletePageModal from "../pages/components/DeletePageModal";

import { usePages } from "../pages/hooks/usePages";

type Props = {
  siteSlug?: string;
};

type SortKey = "title" | "status" | "updatedAt" | "seoScore";
type SortDir = "asc" | "desc";

type PageRow = {
  id: string;
  title: string;
  slug: string;
  status: string;
  updatedAt: string;
  deletedAt?: string | null;
  site?: { slug?: string };
  siteSlug?: string;
  screenshotUrl?: string;
  seoScore?: number;
};

function getPageSiteSlug(page: PageRow, fallbackSiteSlug?: string) {
  return page.site?.slug || page.siteSlug || fallbackSiteSlug || "";
}

function getEditUrl(page: PageRow, fallbackSiteSlug?: string) {
  const resolvedSiteSlug = getPageSiteSlug(page, fallbackSiteSlug);
  return resolvedSiteSlug
    ? `/app/${resolvedSiteSlug}/${page.slug}-${page.id}`
    : `/app/pages/${page.id}`;
}

function getPreviewUrl(page: PageRow, fallbackSiteSlug?: string) {
  const resolvedSiteSlug = getPageSiteSlug(page, fallbackSiteSlug);
  return resolvedSiteSlug
    ? `/preview/${resolvedSiteSlug}/${page.slug}-${page.id}`
    : "";
}

function getScoreTone(score: number) {
  if (score >= 80) return "bg-green-600 text-white";
  if (score >= 50) return "bg-amber-500 text-white";
  return "bg-red-500 text-white";
}

export default function PagesView({ siteSlug }: Props) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const [sortKey, setSortKey] = useState<SortKey>("updatedAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const [createPageOpen, setCreatePageOpen] = useState(false);
  const [settingsPage, setSettingsPage] = useState<PageRow | null>(null);
  const [deletePage, setDeletePage] = useState<PageRow | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [showTrash, setShowTrash] = useState(false);

  const {
    pages,
    total,
    isLoading,
    mutate: mutatePages,
  } = usePages({
    siteSlug,
    search,
    page,
    limit,
    trash: showTrash,
  });

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const pageStart = total === 0 ? 0 : (page - 1) * limit + 1;
  const pageEnd = Math.min(page * limit, total);

  const sortedPages = useMemo(() => {
    const copy = [...pages] as PageRow[];

    copy.sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (aVal == null || bVal == null) return 0;

      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      return 0;
    });

    return copy;
  }, [pages, sortKey, sortDir]);

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selected.length === pages.length) {
      setSelected([]);
    } else {
      setSelected(pages.map((p: PageRow) => p.id));
    }
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const duplicatePage = async (pageId: string) => {
    const res = await fetch("/api/pages/duplicate", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pageId }),
    });

    if (!res.ok) {
      throw new Error((await res.text()) || "Failed to duplicate page");
    }

    await mutatePages();
  };

  const restorePage = async (pageId: string) => {
    const res = await fetch(`/api/pages/${pageId}/restore`, {
      method: "POST",
      credentials: "include",
    });

    if (!res.ok) {
      throw new Error((await res.text()) || "Failed to restore page");
    }

    await mutatePages();
  };

  return (
    <div className="relative px-1 py-2 md:px-2">
      <div className="pointer-events-none absolute right-[8%] top-0 h-64 w-64 rounded-full bg-violet-500/10 blur-[90px]" />
      <div className="relative max-w-[1400px] mx-auto space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><p className="mb-1 text-xs font-semibold uppercase tracking-[.14em] dashboard-faint">Website content</p><h1 className="text-2xl font-semibold">
            Pages {siteSlug && <span className="opacity-60">- {siteSlug}</span>}
          </h1><p className="mt-2 text-sm dashboard-muted">Create, organize, preview, and publish every page in one place.</p></div>

          {!showTrash && (
            <button
              onClick={() => setCreatePageOpen(true)}
              className="dashboard-primary-button flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Page
            </button>
          )}
        </div>

        <div className="dashboard-card-strong flex flex-wrap items-center gap-3 rounded-2xl p-3"><div className="relative min-w-[240px] flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder={showTrash ? "Search trash…" : "Search pages…"}
            className="w-full pl-9 pr-3 py-2 rounded-xl dashboard-input backdrop-blur-xl text-sm"
          />
        </div><div className="flex items-center gap-2 ml-auto">
          <button
            onClick={() => {
              setShowTrash(false);
              setPage(1);
              setSelected([]);
            }}
            className={`rounded-xl px-4 py-2 text-sm font-medium ${
              !showTrash
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                : "dashboard-card dashboard-muted"
            }`}
          >
            Pages
          </button>

          <button
            onClick={() => {
              setShowTrash(true);
              setPage(1);
              setSelected([]);
            }}
            className={`rounded-xl px-4 py-2 text-sm font-medium ${
              showTrash
                ? "bg-red-600 text-white"
                : "dashboard-card dashboard-muted"
            }`}
          >
            Trash
          </button></div></div>

        {isLoading && (
          <div className="overflow-hidden rounded-2xl dashboard-card backdrop-blur-xl">
            {[...Array(5)].map((_, index) => (
              <div
                key={index}
                className="h-20 animate-pulse border-t border-white/10 first:border-t-0 bg-black/[0.03] dark:bg-white/[0.03]"
              />
            ))}
          </div>
        )}

        {!isLoading && sortedPages.length === 0 && (
          <div className="text-center py-12 opacity-60">
            {showTrash ? "No trashed pages found" : "No pages found"}
          </div>
        )}

        {!isLoading && sortedPages.length > 0 && (
          <div className="overflow-x-auto rounded-[22px] dashboard-card backdrop-blur-xl">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="border-b dashboard-border bg-black/[.025] dark:bg-white/[.025]">
                {showTrash ? (
                  <tr className="text-left">
                    <th className="p-3">Title</th>
                    <th className="p-3">Slug</th>
                    <th className="p-3">Deleted</th>
                    <th className="p-3 w-12" />
                  </tr>
                ) : (
                  <tr className="text-left">
                    <th className="p-3 w-10">
                      <button onClick={toggleSelectAll}>
                        {selected.length === pages.length ? (
                          <CheckSquare className="w-4 h-4" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </th>

                    <th className="p-3 w-32">Preview</th>

                    <SortableTh
                      label="Title"
                      active={sortKey === "title"}
                      dir={sortDir}
                      onClick={() => toggleSort("title")}
                    />

                    <th className="p-3">Slug</th>

                    <SortableTh
                      label="Status"
                      active={sortKey === "status"}
                      dir={sortDir}
                      onClick={() => toggleSort("status")}
                    />

                    <SortableTh
                      label="SEO Score"
                      active={sortKey === "seoScore"}
                      dir={sortDir}
                      onClick={() => toggleSort("seoScore")}
                    />

                    <SortableTh
                      label="Updated"
                      active={sortKey === "updatedAt"}
                      dir={sortDir}
                      onClick={() => toggleSort("updatedAt")}
                    />

                    <th className="p-3 w-12" />
                  </tr>
                )}
              </thead>

              <tbody>
                {sortedPages.map((pageRow) => {
                  if (showTrash) {
                    return (
                      <tr
                        key={pageRow.id}
                        className="border-t dashboard-border dashboard-hover"
                      >
                        <td className="p-3 font-medium">{pageRow.title}</td>

                        <td className="p-3 dashboard-muted">
                          /{pageRow.slug}
                        </td>

                        <td className="p-3 dashboard-muted">
                          {pageRow.deletedAt
                            ? new Date(pageRow.deletedAt).toLocaleDateString()
                            : "-"}
                        </td>

                        <td className="p-2 text-right">
                          <PageActionsMenu
                            page={pageRow}
                            isTrash
                            onRestore={async () => restorePage(pageRow.id)}
                          />
                        </td>
                      </tr>
                    );
                  }

                  const isChecked = selected.includes(pageRow.id);
                  const editUrl = getEditUrl(pageRow, siteSlug);
                  const previewUrl = getPreviewUrl(pageRow, siteSlug);
                  const seoScore = pageRow.seoScore ?? 0;

                  return (
                    <tr
                      key={pageRow.id}
                      className="border-t dashboard-border dashboard-hover"
                    >
                      <td className="p-3">
                        <button onClick={() => toggleSelect(pageRow.id)}>
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      <td className="p-3">
                        <button
                          onClick={() => {
                            if (previewUrl) {
                              window.open(
                                previewUrl,
                                "_blank",
                                "noopener,noreferrer"
                              );
                            }
                          }}
                          disabled={!previewUrl}
                          className="group block h-16 w-28 overflow-hidden rounded-lg border border-white/20 bg-white/70 text-left shadow-sm disabled:cursor-default dark:border-white/10 dark:bg-white/5"
                        >
                          {pageRow.screenshotUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={pageRow.screenshotUrl}
                              alt={`${pageRow.title} screenshot preview`}
                              className="h-full w-full object-cover transition-transform group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-gradient-to-br from-white to-gray-100 dashboard-faint dark:from-white/10 dark:to-white/5">
                              <ImageIcon className="h-5 w-5" />
                              <span className="text-[10px] font-medium">
                                No preview
                              </span>
                            </div>
                          )}
                        </button>
                      </td>

                      <td
                        className="p-3 font-medium text-[var(--brand)] cursor-pointer hover:underline"
                        onClick={() => (window.location.href = editUrl)}
                      >
                        {pageRow.title}
                      </td>

                      <td className="p-3 dashboard-muted">/{pageRow.slug}</td>

                      <td className="p-3">
                        <span
                          className={`px-2 py-1 text-xs rounded-lg ${
                            pageRow.status === "PUBLISHED"
                              ? "bg-green-600 text-white"
                              : "bg-gray-300 text-gray-800 dark:bg-white/10 dark:text-white/70"
                          }`}
                        >
                          {pageRow.status}
                        </span>
                      </td>

                      <td className="p-3">
                        <span
                          className={`inline-flex min-w-12 justify-center rounded-lg px-2 py-1 text-xs font-semibold ${getScoreTone(seoScore)}`}
                        >
                          {seoScore}
                        </span>
                      </td>

                      <td className="p-3 dashboard-muted">
                        {new Date(pageRow.updatedAt).toLocaleDateString()}
                      </td>

                      <td className="p-2 text-right">
                        <PageActionsMenu
                          page={pageRow}
                          onEdit={() => {
                            window.location.href = editUrl;
                          }}
                          onSettings={() => setSettingsPage(pageRow)}
                          onDelete={() => setDeletePage(pageRow)}
                          onChanged={() => mutatePages()}
                          onPreview={() => {
                            if (previewUrl) {
                              window.open(
                                previewUrl,
                                "_blank",
                                "noopener,noreferrer"
                              );
                            }
                          }}
                          onDuplicate={async () => {
                            await duplicatePage(pageRow.id);
                          }}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && total > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm opacity-80">
            <span>
              Showing {pageStart}-{pageEnd} of {total} pages
            </span>

            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg dashboard-card disabled:opacity-40"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <span className="min-w-20 text-center">
                Page {page} of {totalPages}
              </span>

              <button
                disabled={page >= totalPages}
                onClick={() =>
                  setPage((current) => Math.min(totalPages, current + 1))
                }
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg dashboard-card disabled:opacity-40"
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {createPageOpen && (
          <CreatePageModal
            open
            siteSlug={siteSlug}
            onClose={() => {
              setCreatePageOpen(false);
              mutatePages();
            }}
          />
        )}

        {settingsPage && (
          <PageSettingsModal
            page={settingsPage}
            open
            onSaved={() => mutatePages()}
            onClose={() => setSettingsPage(null)}
          />
        )}

        {deletePage && (
          <DeletePageModal
            page={deletePage}
            open
            onClose={() => {
              setDeletePage(null);
              mutatePages();
            }}
          />
        )}
      </div>
    </div>
  );
}

function SortableTh({
  label,
  active,
  dir,
  onClick,
}: {
  label: string;
  active: boolean;
  dir: "asc" | "desc";
  onClick: () => void;
}) {
  return (
    <th onClick={onClick} className="p-3 cursor-pointer select-none">
      <div className="flex items-center gap-1">
        {label}
        {active &&
          (dir === "asc" ? (
            <ChevronUp className="w-3 h-3" />
          ) : (
            <ChevronDown className="w-3 h-3" />
          ))}
      </div>
    </th>
  );
}
