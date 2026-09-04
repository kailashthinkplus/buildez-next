"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Plus,
  CheckSquare,
  Square,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  FileText,
  Globe2,
  Clock3,
  Layers3,
  Loader2,
  SendToBack,
  Trash2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import PageActionsMenu from "../pages/components/PageActionsMenu";
import CreatePageModal from "../pages/components/CreatePageModal";
import PageSettingsModal from "../pages/components/PageSettingsModal";
import DeletePageModal from "../pages/components/DeletePageModal";
import { publishedSitePath } from "@/lib/runtime/published-site-path";

import { usePages } from "../pages/hooks/usePages";
import { WebsiteThumbnail } from "./WebsiteThumbnail";

type Props = {
  siteSlug?: string;
};

type SortKey = "title" | "status" | "updatedAt" | "aiScore";
type SortDir = "asc" | "desc";

type PageRow = {
  id: string;
  title: string;
  slug: string;
  status: string;
  updatedAt: string;
  deletedAt?: string | null;
  site?: { id?: string; slug?: string; v12Project?: { id: string } | null };
  siteSlug?: string;
  renderMode?: string;
  isFrontPage?: boolean;
  hasMeaningfulPreview?: boolean;
  aiScore?: number;
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
    ? `/preview/${resolvedSiteSlug}/${page.slug}`
    : "";
}

function getScoreTone(score: number) {
  if (score >= 80) return "bg-green-600 text-white";
  if (score >= 50) return "bg-amber-500 text-white";
  return "bg-red-500 text-white";
}

export default function PagesView({ siteSlug }: Props) {
  const searchParams = useSearchParams();
  const routeSearch = searchParams.get("search") || "";
  const [search, setSearch] = useState(routeSearch);
  const [page, setPage] = useState(1);
  const limit = 10;

  const [sortKey, setSortKey] = useState<SortKey>("updatedAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const [createPageOpen, setCreatePageOpen] = useState(false);
  const [settingsPage, setSettingsPage] = useState<PageRow | null>(null);
  const [deletePage, setDeletePage] = useState<PageRow | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [bulkWorking, setBulkWorking] = useState<"publish"|"unpublish"|"delete"|null>(null);
  const [showTrash, setShowTrash] = useState(false);

  useEffect(() => {
    setSearch(routeSearch);
    setPage(1);
  }, [routeSearch]);

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
  const publishedCount = pages.filter((item: PageRow) => item.status === "PUBLISHED").length;
  const draftCount = pages.filter((item: PageRow) => item.status !== "PUBLISHED").length;

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

  const setFrontPage = async (pageRow: PageRow) => {
    const siteId = pageRow.site?.id;
    if (!siteId) throw new Error("Website information is unavailable");
    const response = await fetch(`/api/sites/${siteId}/front-page`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pageId: pageRow.id }),
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      throw new Error(payload?.error || "Could not set the front page");
    }
    await mutatePages();
  };

  const runBulkAction = async (action: "publish" | "unpublish" | "delete") => {
    if (!selected.length || bulkWorking) return;
    if (action === "delete" && !window.confirm(`Move ${selected.length} selected page${selected.length === 1 ? "" : "s"} to trash?`)) return;
    setBulkWorking(action);
    try {
      await Promise.all(selected.map(pageId => fetch(
        action === "delete" ? `/api/pages/${pageId}` : `/api/pages/${pageId}/${action}`,
        { method: action === "delete" ? "DELETE" : "POST", credentials: "include" },
      ).then(response => { if (!response.ok) throw new Error(`Could not ${action} selected pages`); })));
      setSelected([]);
      await mutatePages();
    } finally {
      setBulkWorking(null);
    }
  };

  return (
    <div className="relative px-1 py-2 md:px-2">
      <div className="pointer-events-none absolute left-[10%] top-0 h-80 w-80 rounded-full bg-[#1349A3]/10 blur-[110px]" />
      <div className="pointer-events-none absolute right-[8%] top-40 h-64 w-64 rounded-full bg-cyan-400/10 blur-[100px]" />
      <div className="relative max-w-[1400px] mx-auto space-y-6">
        <section className="overflow-hidden rounded-[26px] border dashboard-border dashboard-card-strong">
          <div className="grid gap-6 p-6 lg:grid-cols-[1fr_auto] lg:items-end lg:p-8">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#1349A3]/10 px-3 py-1.5 text-xs font-semibold text-[#1349A3] dark:text-blue-300"><Layers3 className="h-3.5 w-3.5" /> Site structure</div>
              <h1 className="max-w-3xl text-2xl font-semibold tracking-tight md:text-3xl">Build the journey, page by page.</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 dashboard-muted">Manage the structure, visibility, search readiness, and content of {siteSlug ? <strong className="font-semibold">{siteSlug}</strong> : "your websites"} from one focused workspace.</p>
            </div>
            {!showTrash && <button onClick={() => setCreatePageOpen(true)} className="flex items-center justify-center gap-2 rounded-xl bg-[#1349A3] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#1349A3]/15 transition hover:bg-[#1D5FC7]"><Plus className="h-4 w-4" /> Create new page</button>}
          </div>
          <div className="grid grid-cols-2 border-t dashboard-border md:grid-cols-4">
            <PageMetric icon={FileText} label="Total pages" value={total} />
            <PageMetric icon={Globe2} label="Published here" value={publishedCount} tone="text-emerald-600" />
            <PageMetric icon={Clock3} label="Drafts here" value={draftCount} tone="text-amber-600" />
            <PageMetric icon={Search} label="Average AI page score" value={pages.length ? Math.round(pages.reduce((sum: number, item: PageRow) => sum + (item.aiScore ?? 0), 0) / pages.length) : 0} suffix="/100" tone="text-[#1349A3] dark:text-blue-300" />
          </div>
        </section>

        <div className="dashboard-card-strong sticky top-0 z-10 flex flex-wrap items-center gap-3 rounded-2xl border dashboard-border p-3"><div className="relative min-w-[240px] flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder={showTrash ? "Search trash…" : "Search pages…"}
            className="w-full rounded-xl border dashboard-border bg-transparent py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#3B82F6]"
          />
        </div>{!showTrash && <select value={`${sortKey}:${sortDir}`} onChange={(event) => { const [key, dir] = event.target.value.split(":") as [SortKey, SortDir]; setSortKey(key); setSortDir(dir); }} aria-label="Sort pages" className="rounded-xl border dashboard-border bg-transparent px-3 py-2.5 text-xs font-medium outline-none"><option value="updatedAt:desc">Recently updated</option><option value="updatedAt:asc">Oldest updated</option><option value="title:asc">Title A–Z</option><option value="title:desc">Title Z–A</option><option value="aiScore:desc">Best AI page score</option></select>}<div className="flex items-center gap-2 ml-auto">
          <button
            onClick={() => {
              setShowTrash(false);
              setPage(1);
              setSelected([]);
            }}
            className={`rounded-xl px-4 py-2 text-sm font-medium ${
              !showTrash
                ? "bg-[#1349A3] text-white shadow-lg shadow-[#1349A3]/20"
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

        {!showTrash && selected.length > 0 && <div className="sticky top-[70px] z-20 flex flex-wrap items-center gap-2 rounded-2xl border border-blue-400/25 bg-blue-600 p-3 text-white shadow-xl shadow-blue-950/20"><CheckSquare size={17}/><strong className="mr-2 text-sm">{selected.length} selected</strong><button disabled={Boolean(bulkWorking)} onClick={()=>void runBulkAction('publish')} className="flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-2 text-xs font-semibold hover:bg-white/20"><Globe2 size={13}/>Publish</button><button disabled={Boolean(bulkWorking)} onClick={()=>void runBulkAction('unpublish')} className="flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-2 text-xs font-semibold hover:bg-white/20"><SendToBack size={13}/>Unpublish</button><button disabled={Boolean(bulkWorking)} onClick={()=>void runBulkAction('delete')} className="flex items-center gap-1.5 rounded-lg bg-rose-500/80 px-3 py-2 text-xs font-semibold hover:bg-rose-500"><Trash2 size={13}/>Move to trash</button>{bulkWorking&&<Loader2 size={15} className="animate-spin"/>}<button onClick={()=>setSelected([])} className="ml-auto rounded-lg px-3 py-2 text-xs font-semibold hover:bg-white/10">Clear selection</button></div>}

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
          <div className="overflow-x-auto rounded-[22px] border dashboard-border dashboard-card-strong backdrop-blur-xl">
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
                      label="AI Page Score"
                      active={sortKey === "aiScore"}
                      dir={sortDir}
                      onClick={() => toggleSort("aiScore")}
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
                  const aiScore = pageRow.aiScore ?? 0;

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
                          className="group block h-[72px] w-28 overflow-hidden rounded-xl border dashboard-border bg-white/70 text-left shadow-sm disabled:cursor-default dark:bg-white/5"
                        >
                          {pageRow.site?.id ? <WebsiteThumbnail
                            siteId={pageRow.site.id}
                            siteName={pageRow.title}
                            siteSlug={getPageSiteSlug(pageRow, siteSlug)}
                            pageId={pageRow.id}
                            pageSlug={pageRow.slug}
                            updatedAt={pageRow.updatedAt}
                            hasMeaningfulPreview={pageRow.hasMeaningfulPreview === true}
                            renderMode={pageRow.renderMode}
                            className="h-full w-full transition-transform group-hover:scale-105"
                          /> : <img src="/website-placeholder.svg" alt={`${pageRow.title} website preview placeholder`} className="h-full w-full object-cover" />}
                        </button>
                      </td>

                      <td
                        className="p-3 cursor-pointer text-base font-semibold transition hover:text-[#1349A3]"
                        onClick={() => (window.location.href = editUrl)}
                      >
                        {pageRow.title}
                      </td>

                      <td className="p-3 dashboard-muted">/{pageRow.slug}</td>

                      <td className="p-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                            pageRow.status === "PUBLISHED"
                              ? "bg-emerald-500/10 text-emerald-600"
                              : "bg-gray-300 text-gray-800 dark:bg-white/10 dark:text-white/70"
                          }`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${pageRow.status === "PUBLISHED" ? "bg-emerald-500" : "bg-gray-400"}`} />
                          {pageRow.status}
                        </span>
                      </td>

                      <td className="p-3">
                        <span
                          className={`inline-flex min-w-12 justify-center rounded-lg px-2 py-1 text-xs font-semibold ${getScoreTone(aiScore)}`}
                        >
                          {aiScore}
                        </span>
                      </td>

                      <td className="p-3 dashboard-muted">
                        {new Date(pageRow.updatedAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short", hour12: true })}
                      </td>

                      <td className="p-2 text-right">
                        <PageActionsMenu
                          page={pageRow}
                          onEdit={() => {
                            window.location.href = editUrl;
                          }}
                          onSettings={() => setSettingsPage(pageRow)}
                          onSetFrontPage={() => setFrontPage(pageRow)}
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
                          onView={pageRow.status === "PUBLISHED" && getPageSiteSlug(pageRow, siteSlug) ? () => window.open(publishedSitePath(getPageSiteSlug(pageRow, siteSlug), pageRow.slug), "_blank", "noopener,noreferrer") : undefined}
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
            onCreated={async () => {
              setSearch("");
              setPage(1);
              setShowTrash(false);
              setSelected([]);
              await mutatePages();
            }}
            onClose={() => {
              setCreatePageOpen(false);
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

function PageMetric({ icon: Icon, label, value, suffix, tone = "text-current" }: { icon: LucideIcon; label: string; value: number; suffix?: string; tone?: string }) {
  return (
    <div className="flex items-center gap-3 border-b border-r dashboard-border p-4 last:border-r-0 md:border-b-0 md:p-5">
      <span className={`dashboard-subtle flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}><Icon className="h-4 w-4" /></span>
      <div><div className="text-xl font-semibold tracking-tight">{value}<span className="ml-0.5 text-xs font-medium dashboard-muted">{suffix}</span></div><div className="text-xs dashboard-muted">{label}</div></div>
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
