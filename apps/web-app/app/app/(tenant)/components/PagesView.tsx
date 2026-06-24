"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  CheckSquare,
  Square,
  ChevronUp,
  ChevronDown,
  Search,
} from "lucide-react";

import PageActionsMenu from "../pages/components/PageActionsMenu";
import CreatePageModal from "../pages/components/CreatePageModal";
import PageSettingsModal from "../pages/components/PageSettingsModal";
import DeletePageModal from "../pages/components/DeletePageModal";

import { usePages } from "../pages/hooks/usePages";
import { usePageMutations } from "../pages/hooks/usePageMutations";

/* ============================================================
   TYPES
============================================================ */
type Props = {
  siteSlug: string;
};

type SortKey = "title" | "status" | "updatedAt";
type SortDir = "asc" | "desc";

/* ============================================================
   PAGES VIEW — TABLE
============================================================ */
export default function PagesView({ siteSlug }: Props) {
  /* ============================================================
     STATE
  ============================================================ */
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const [sortKey, setSortKey] = useState<SortKey>("updatedAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const [createPageOpen, setCreatePageOpen] = useState(false);
  const [settingsPage, setSettingsPage] = useState<any>(null);
  const [deletePage, setDeletePage] = useState<any>(null);
  const [selected, setSelected] = useState<string[]>([]);

  /* ============================================================
     DATA
  ============================================================ */
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
  });

  const pageMutations = usePageMutations(siteSlug);

  /* ============================================================
     SORTING (CLIENT-SIDE, SAFE)
  ============================================================ */
  const sortedPages = useMemo(() => {
    const copy = [...pages];

    copy.sort((a: any, b: any) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (aVal == null || bVal == null) return 0;

      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      return 0;
    });

    return copy;
  }, [pages, sortKey, sortDir]);

  /* ============================================================
     SELECTION
  ============================================================ */
  useEffect(() => {
    setSelected([]);
  }, [pages.map((p) => p.id).join(",")]);

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selected.length === pages.length) {
      setSelected([]);
    } else {
      setSelected(pages.map((p) => p.id));
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

  /* ============================================================
     RENDER
  ============================================================ */
  return (
    <div className="p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold dark:text-white">
            Pages <span className="opacity-60">— {siteSlug}</span>
          </h1>

          <button
            onClick={() => setCreatePageOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--brand)] text-white font-medium hover:brightness-110"
          >
            <Plus className="w-4 h-4" />
            Add Page
          </button>
        </div>

        {/* SEARCH */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search pages…"
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/60 dark:bg-white/5 border border-white/20 dark:border-white/10 backdrop-blur-xl text-sm"
          />
        </div>

        {/* EMPTY */}
        {!isLoading && sortedPages.length === 0 && (
          <div className="text-center py-12 opacity-60">
            No pages found
          </div>
        )}

        {/* TABLE */}
        {!isLoading && sortedPages.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-white/20 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-xl">
            <table className="w-full text-sm">
              <thead className="border-b border-white/20 dark:border-white/10">
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
                    label="Updated"
                    active={sortKey === "updatedAt"}
                    dir={sortDir}
                    onClick={() => toggleSort("updatedAt")}
                  />

                  <th className="p-3 w-12" />
                </tr>
              </thead>

              <tbody>
                {sortedPages.map((page) => {
                  const isChecked = selected.includes(page.id);

                  return (
                    <tr
                      key={page.id}
                      className="border-t border-white/10 hover:bg-black/5 dark:hover:bg-white/5"
                    >
                      <td className="p-3">
                        <button onClick={() => toggleSelect(page.id)}>
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      <td
                        className="p-3 font-medium text-[var(--brand)] cursor-pointer hover:underline"
                        onClick={() =>
                          (window.location.href =
                            `/app/${page.site.slug}/${page.slug}-${page.id}`)
                        }
                      >
                        {page.title}
                      </td>

                      <td className="p-3 opacity-70">/{page.slug}</td>

                      <td className="p-3">
                        <span
                          className={`px-2 py-1 text-xs rounded-lg ${
                            page.status === "PUBLISHED"
                              ? "bg-green-600 text-white"
                              : "bg-gray-300 dark:bg-white/10 dark:text-white/70"
                          }`}
                        >
                          {page.status}
                        </span>
                      </td>

                      <td className="p-3 opacity-70">
                        {new Date(page.updatedAt).toLocaleDateString()}
                      </td>

                      <td className="p-2 text-right">
                        <PageActionsMenu
                          page={page}
                          onSettings={() => setSettingsPage(page)}
                          onDelete={() => setDeletePage(page)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* MODALS */}
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

/* ============================================================
   SORTABLE HEADER CELL
============================================================ */
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
    <th
      onClick={onClick}
      className="p-3 cursor-pointer select-none"
    >
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
