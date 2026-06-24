// apps/web-app/app/(tenant)/media/page.tsx

"use client";

import { useState, useEffect } from "react";
import { Plus, Search, ChevronLeft, ChevronRight } from "lucide-react";

import { useMedia } from "./hooks/useMedia";  // Custom hook to fetch media
import MediaActionsMenu from "./components/MediaActionsMenu";  // Component for media options
import UploadMediaModal from "./components/UploadMediaModal";  // Component for file upload modal

export default function MediaPage() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("createdAt_desc");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const limit = 10;

  const [uploadMediaOpen, setUploadMediaOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  const { media, total, isLoading, mutate } = useMedia({
    search,
    sort,
    filter,
    page,
    limit,
  });

  const totalPages = Math.ceil(total / limit);
  const startIdx = (page - 1) * limit + 1;
  const endIdx = Math.min(page * limit, total);

  const allSelected = media.length > 0 && selected.length === media.length;

  function toggleSelect(id: string) {
    if (selected.includes(id))
      setSelected(selected.filter((x) => x !== id));
    else setSelected([...selected, id]);
  }

  async function bulkDelete() {
    for (const id of selected) {
      await fetch(`/api/media/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
    }
    setSelected([]);
    mutate();
  }

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold dark:text-white">Media Library</h1>

        <button
          onClick={() => setUploadMediaOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--brand)] text-white font-medium hover:brightness-110"
        >
          <Plus className="w-4 h-4" />
          Upload New Media
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          {[
            { id: "all", label: "All" },
            { id: "images", label: "Images" },
            { id: "videos", label: "Videos" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => {
                setFilter(f.id);
                setPage(1);
              }}
              className={`
                px-4 py-2 rounded-xl text-sm border border-white/20 dark:border-white/10
                ${
                  filter === f.id
                    ? "bg-[var(--brand)] text-white"
                    : "dark:text-white/70"
                }
              `}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-3 w-4 h-4 opacity-50" />
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-white/20 dark:border-white/10 bg-white dark:bg-white/5 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
            placeholder="Search media…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <select
          className="px-3 py-2 rounded-xl border border-white/20 dark:border-white/10 bg-white dark:bg-white/5 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
          value={sort}
          onChange={(e) => {
            setSort(e.target.value);
            setPage(1);
          }}
        >
          <option value="createdAt_desc">Newest</option>
          <option value="createdAt_asc">Oldest</option>
          <option value="title_asc">Title A–Z</option>
          <option value="title_desc">Title Z–A</option>
        </select>
      </div>

      {isLoading && (
        <div className="md:hidden space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse p-5 rounded-2xl bg-white/20 dark:bg-white/10"></div>
          ))}
        </div>
      )}

      {!isLoading && (
        <div className="md:hidden space-y-4">
          {media.length === 0 ? (
            <div className="text-center py-10 opacity-60">No media found</div>
          ) : (
            media.map((item) => {
              const isChecked = selected.includes(item.id);
              return (
                <div
                  key={item.id}
                  className="relative p-5 rounded-2xl bg-white/60 dark:bg-white/5 border border-white/20 dark:border-white/10 backdrop-blur-xl shadow-sm hover:shadow-md transition"
                >
                  <button
                    onClick={() => toggleSelect(item.id)}
                    className="absolute left-4 top-4"
                  >
                    {isChecked ? (
                      <CheckSquare className="w-5 h-5" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>

                  <h3 className="text-lg font-semibold dark:text-white pr-10">
                    {item.title}
                  </h3>

                  <p className="text-sm opacity-60 mb-3 dark:text-white/70">
                    {item.type} / {item.size}
                  </p>

                  <div className="absolute right-3 top-3">
                    <MediaActionsMenu
                      item={item}
                      onDelete={() => bulkDelete()}
                    />
                  </div>

                  <img
                    src={item.url}
                    alt={item.title}
                    className="w-full h-32 object-cover rounded-lg mt-3"
                  />
                </div>
              );
            })
          )}
        </div>
      )}

      <div className="flex items-center justify-between mt-6">
        <p className="text-sm opacity-60 dark:text-white/70">
          Showing <strong>{startIdx}</strong>–<strong>{endIdx}</strong> of{" "}
          <strong>{total}</strong> media
        </p>

        <div className="flex items-center gap-3">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="p-2 rounded-lg border border-white/20 dark:border-white/10 disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-sm dark:text-white/70">
            Page {page} of {totalPages || 1}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="p-2 rounded-lg border border-white/20 dark:border-white/10 disabled:opacity-40"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {uploadMediaOpen && (
        <UploadMediaModal
          open={true}
          onClose={() => {
            setUploadMediaOpen(false);
            mutate();
          }}
        />
      )}
    </div>
  );
}
