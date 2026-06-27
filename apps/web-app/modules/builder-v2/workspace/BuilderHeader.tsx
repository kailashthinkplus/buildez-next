"use client";

import {
  Laptop,
  Tablet,
  Smartphone,
  Check,
  Loader2,
  Rocket,
  ArrowLeft,
  Sun,
  Moon,
  Undo,
  Redo,
  Eye,
  Maximize2,
  ChevronDown,
  Plus,
  Cloud,
  CloudOff,
} from "lucide-react";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { useCanvasStore } from "../store/useCanvasStore";
import Toast from "../components/Toast";
import CreatePageModal from "../components/CreatePageModal";
import PublishModal from "../components/PublishModal";
import { commandBus } from "../core/commands/CommandBus";
import { useBuilderStore } from "../store/useBuilderStore";

/* ============================================================================
   TYPES
============================================================================ */

interface PageItem {
  id: string;
  title: string;
  slug: string;
  site: { slug: string };
  status: "DRAFT" | "PUBLISHED";
}

interface BuilderHeaderProps {
  pageId: string;
  pageStatus: PagePublishStatus;
  pageTitle: string;
}

type PagePublishStatus = "DRAFT" | "PUBLISHED";

function formatRelativeTime(date: Date | null, now: Date) {
  if (!date) return "Not saved";

  const diffMs = Math.max(0, now.getTime() - date.getTime());
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} min${diffMinutes === 1 ? "" : "s"} ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hr${diffHours === 1 ? "" : "s"} ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
}

function formatFullDate(date: Date | null) {
  if (!date) return "Never saved in this session";

  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function stripPageIdFromSlug(value: string, pageId: string) {
  return value
    .replace(new RegExp(`-${pageId}$`), "")
    .replace(new RegExp(`-${pageId.slice(0, 6)}$`), "");
}



/* ============================================================================
   BUILDER HEADER — V4 (LOCKED)
============================================================================ */

export default function BuilderHeader(
  { pageId, pageStatus, pageTitle }: BuilderHeaderProps
) {
  const router = useRouter();
  const params = useParams();

  const siteSlug = params?.siteSlug as string;
  const pageSlugWithId = params?.pageSlugWithId as string;
  /* ------------------------------------------ -------------------
     CANVAS STORE
  ------------------------------------------------------------- */
  const device = useCanvasStore((s) => s.device);
  const setDevice = useCanvasStore((s) => s.setDevice);

  const zoom = useCanvasStore((s) => s.zoom);
  const setZoom = useCanvasStore((s) => s.setZoom);

  const isDarkMode = useCanvasStore((s) => s.isDarkMode);
  const toggleDarkMode = useCanvasStore((s) => s.toggleDarkMode);

  /* ============================================================
   BUILDER STORE
============================================================ */

const blueprint = useBuilderStore(
  (s) => s.blueprint
);

const dirty = useBuilderStore(
  (s) => s.dirty
);

const revision = useBuilderStore(
  (s) => s.revision
);

const canUndo = useBuilderStore(
  (s) => s.canUndo
);

const canRedo = useBuilderStore(
  (s) => s.canRedo
);

const clearDirty = useBuilderStore(
  (s) => s.clearDirty
);

  /* -------------------------------------------------------------
     LOCAL UI STATE
  ------------------------------------------------------------- */
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const [saving, setSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState(false);
  const [showAutoSavePulse, setShowAutoSavePulse] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [saveMenuOpen, setSaveMenuOpen] = useState(false);
  const [now, setNow] = useState(() => new Date());

  const [pageMenuOpen, setPageMenuOpen] = useState(false);
  const [pagesLoading, setPagesLoading] = useState(false);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [currentPageStatus, setCurrentPageStatus] = useState<PagePublishStatus>(pageStatus);
  const [publishedRevision, setPublishedRevision] = useState<number | null>(null);
  const [showCreatePageModal, setShowCreatePageModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);

  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const saveDropdownRef = useRef<HTMLDivElement | null>(null);
  const revisionRef = useRef(revision);
  const loadedPageIdRef = useRef(pageId);

  /* -------------------------------------------------------------
   DERIVED PAGE STATE (SAFE)
------------------------------------------------------------- */
const currentPage =
  pages.find((p) => p.id === pageId) ??
  pages.find((p) => pageSlugWithId?.includes(p.id)) ??
  null;

  useEffect(() => {
    revisionRef.current = revision;
  }, [revision]);

  useEffect(() => {
    if (loadedPageIdRef.current === pageId) return;

    loadedPageIdRef.current = pageId;
    setCurrentPageStatus(pageStatus);
    setPublishedRevision(pageStatus === "PUBLISHED" ? revisionRef.current : null);
    setLastSavedAt(null);
    setSaveError(false);
  }, [pageId, pageStatus]);

  useEffect(() => {
    setCurrentPageStatus((previous) => {
      if (previous === "PUBLISHED" && pageStatus === "DRAFT") {
        return previous;
      }

      return pageStatus;
    });

    if (pageStatus === "PUBLISHED") {
      setPublishedRevision((current) => current ?? revisionRef.current);
    }
  }, [pageStatus]);

  /* -------------------------------------------------------------
     LOAD PAGES FOR SWITCHER
  ------------------------------------------------------------- */
  const loadPages = useCallback(async () => {
    if (!siteSlug) return;

    setPagesLoading(true);

    try {
      const res = await fetch(`/api/pages?take=200&siteSlug=${siteSlug}`, {
        credentials: "include",
      });

      const json = await res.json();
      const allPages: PageItem[] =
        json?.data?.data?.pages ?? json?.data?.pages ?? json?.pages ?? [];

      setPages(allPages);

      const found = allPages.find((p) => p.id === pageId);
      if (found?.status) {
        if (found.status === "PUBLISHED") {
          setPublishedRevision((current) => current ?? revisionRef.current);
        }
        setCurrentPageStatus((previous) => {
          if (found.status === "DRAFT" && previous === "PUBLISHED") {
            return previous;
          }

          return found.status;
        });
      }
    } catch (error) {
      console.error("Failed to load pages:", error);
      setPages([]);
    } finally {
      setPagesLoading(false);
    }
  }, [pageId, siteSlug]);

  useEffect(() => {
    if (!pageMenuOpen) return;
    void loadPages();
  }, [loadPages, pageMenuOpen]);

  useEffect(() => {
    void loadPages();
  }, [loadPages]);

  useEffect(() => {
    function close(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setPageMenuOpen(false);
      }
    }

    if (pageMenuOpen) document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [pageMenuOpen]);

  useEffect(() => {
    const stored = window.localStorage.getItem(`builder:auto-save:${pageId}`);
    if (stored !== null) {
      setAutoSaveEnabled(stored !== "false");
    }
  }, [pageId]);

  useEffect(() => {
    window.localStorage.setItem(
      `builder:auto-save:${pageId}`,
      String(autoSaveEnabled)
    );
  }, [autoSaveEnabled, pageId]);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    function close(e: MouseEvent) {
      if (
        saveDropdownRef.current &&
        !saveDropdownRef.current.contains(e.target as Node)
      ) {
        setSaveMenuOpen(false);
      }
    }

    if (saveMenuOpen) document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [saveMenuOpen]);

const savedPageStatus = currentPageStatus;
const hasUnpublishedChanges =
  savedPageStatus === "PUBLISHED" &&
  publishedRevision !== null &&
  revision > publishedRevision;
const statusLabel =
  savedPageStatus === "PUBLISHED"
    ? hasUnpublishedChanges
      ? "Unpublished changes"
      : "Published"
    : "Draft";
const statusTitle =
  statusLabel === "Unpublished changes"
    ? "Live page is still published. Publish changes to update it."
    : statusLabel === "Published"
      ? "This page is live"
      : "This page has not been published yet";
const publishButtonLabel =
  savedPageStatus === "PUBLISHED" ? "Publish changes" : "Publish";
const pageSlug = currentPage?.slug ?? stripPageIdFromSlug(pageSlugWithId ?? "", pageId);
const previewSlugWithId = currentPage
  ? `${currentPage.slug}-${currentPage.id}`
  : pageSlugWithId;
const previewUrl = siteSlug && previewSlugWithId
  ? `/preview/${siteSlug}/${previewSlugWithId}`
  : "";
const publicUrl = siteSlug && pageSlug ? `/${siteSlug}/${pageSlug}` : previewUrl;
const currentPageTitle = currentPage?.title ?? pageTitle ?? "Untitled page";
  


  /* -------------------------------------------------------------
     ACTIONS
  ------------------------------------------------------------- */

const saveBlueprint = useCallback(async (showToast: boolean) => {
  if (!blueprint || !pageId) return false;

  const savingRevision = revision;
  setSaving(true);
  setSaveError(false);

  try {
    const response = await fetch(
      `/api/builder-v2/blueprints/${pageId}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blueprint }),
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to save");
    }

    const payload = await response.json().catch(() => null);
    const savedAt = payload?.updatedAt ? new Date(payload.updatedAt) : new Date();
    if (payload?.pageStatus === "PUBLISHED") {
      setCurrentPageStatus("PUBLISHED");
      setPublishedRevision((current) => current ?? revisionRef.current);
    }

    clearDirty(savingRevision);
    setLastSavedAt(savedAt);
    setNow(new Date());
    setShowAutoSavePulse(true);
    window.setTimeout(() => setShowAutoSavePulse(false), 1400);

    if (showToast) {
      setToast({
        message: "Page saved successfully",
        type: "success",
      });
    }

    return true;
  } catch (error) {
    console.error("Save error:", error);
    setSaveError(true);

    if (showToast) {
      setToast({
        message: "Failed to save page",
        type: "error",
      });
    }

    return false;
  } finally {
    setSaving(false);
  }
}, [blueprint, clearDirty, pageId, revision]);

function handleSave() {
  void saveBlueprint(true);
}

useEffect(() => {
  if (!autoSaveEnabled || !dirty || saving || !blueprint || !pageId) return;

  const timeout = window.setTimeout(() => {
    void saveBlueprint(false);
  }, 2000);

  return () => window.clearTimeout(timeout);
}, [autoSaveEnabled, blueprint, dirty, pageId, revision, saveBlueprint, saving]);

async function handlePublish() {
  if (!blueprint || !pageId) return;

  if (dirty) {
    const saved = await saveBlueprint(false);
    if (!saved) {
      setToast({ message: "Save failed before publishing", type: "error" });
      return;
    }
  }

  setShowPublishModal(true);
}

async function handlePreview() {
  if (!siteSlug) {
    setToast({ message: "Preview unavailable", type: "error" });
    return;
  }

  if (dirty) {
    const saved = await saveBlueprint(false);
    if (!saved) {
      setToast({ message: "Save failed before preview", type: "error" });
      return;
    }
  }

  const slugWithId = currentPage
    ? `${currentPage.slug}-${currentPage.id}`
    : pageSlugWithId;

  if (!slugWithId) {
    setToast({ message: "Preview unavailable", type: "error" });
    return;
  }

  const url = `/preview/${siteSlug}/${slugWithId}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

async function handleSelectPage(page: PageItem) {
  if (page.id === pageId) {
    setPageMenuOpen(false);
    return;
  }

  if (dirty) {
    const saved = await saveBlueprint(false);
    if (!saved) {
      setToast({ message: "Save failed before switching pages", type: "error" });
      return;
    }
  }

  setPageMenuOpen(false);
  router.push(`/app/${page.site?.slug ?? siteSlug}/${page.slug}-${page.id}`);
}

const relativeLastSavedAt = formatRelativeTime(lastSavedAt, now);
const fullLastSavedAt = formatFullDate(lastSavedAt);

  function fitToPage() {
    const viewportWidth = window.innerWidth;
    const sidebars = 60 + 260;
    const available = viewportWidth - sidebars - 48;

    const base =
      device === "mobile" ? 375 : device === "tablet" ? 768 : 1200;

    setZoom(Math.min(100, Math.floor((available / base) * 100)));
  }
  

  /* ============================================================================
     RENDER
  ============================================================================ */

  return (
    <>
      <header className="builder-chrome h-[56px] w-full flex items-center px-4 md:px-6 border-b backdrop-blur-xl">
        {/* =====================================================
           LEFT
        ===================================================== */}
        <div className="flex items-center gap-3 w-[440px] min-w-0">
<Link
  href={`/app/${siteSlug}/pages`}
  className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10"
>
  <ArrowLeft size={20} />
</Link>


          <Image
            src="/buildez-logo-dark.svg"
            alt="BuildEZ"
            width={115}
            height={40}
            className="mt-[8px]"
          />

          {/* PAGE SWITCHER */}
          <div className="relative ml-2 min-w-0" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => {
                const nextOpen = !pageMenuOpen;
                setPageMenuOpen(nextOpen);
                if (nextOpen) {
                  void loadPages();
                }
              }}
              className="flex max-w-[150px] items-center gap-1.5 text-left text-sm font-medium text-white/85 transition hover:text-white"
              title={currentPageTitle}
            >
              <span className="truncate">{currentPageTitle}</span>
              <ChevronDown
                size={14}
                className={`shrink-0 text-white/40 transition ${
                  pageMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {pageMenuOpen && (
              <div className="absolute left-0 top-full z-50 mt-3 w-72 overflow-hidden rounded-xl border border-white/10 bg-[#0B0D12] py-2 text-sm text-white shadow-2xl">
                <div className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-white/40">
                  Pages
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {pagesLoading ? (
                    <div className="flex items-center gap-2 px-3 py-2 text-white/45">
                      <Loader2 size={14} className="animate-spin" />
                      Loading pages
                    </div>
                  ) : pages.length === 0 ? (
                    <div className="px-3 py-2 text-white/45">No pages found</div>
                  ) : (
                    pages.map((page) => {
                      const selected = page.id === pageId;

                      return (
                        <button
                          key={page.id}
                          type="button"
                          onClick={() => void handleSelectPage(page)}
                          className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left transition ${
                            selected
                              ? "bg-white/[0.08] text-white"
                              : "text-white/70 hover:bg-white/[0.05] hover:text-white"
                          }`}
                        >
                          <span className="min-w-0">
                            <span className="block truncate font-medium">
                              {page.title}
                            </span>
                            <span className="block truncate text-xs text-white/35">
                              /{page.slug}
                            </span>
                          </span>

                          <span
                            className={`shrink-0 rounded-full border px-1.5 py-0.5 text-[10px] ${
                              page.status === "PUBLISHED"
                                ? "border-green-500/20 bg-green-500/10 text-green-300"
                                : "border-blue-500/20 bg-blue-500/10 text-blue-300"
                            }`}
                          >
                            {page.status === "PUBLISHED" ? "Live" : "Draft"}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>

              </div>
            )}
          </div>

          {/* STATUS */}
          <span
  className={`px-2 py-0.5 rounded-full text-xs border ${
              statusLabel === "Published"
      ? "bg-green-500/10 text-green-400 border-green-500/20"
      : statusLabel === "Unpublished changes"
        ? "bg-amber-500/10 text-amber-300 border-amber-500/20"
        : "bg-blue-500/10 text-blue-400 border-blue-500/20"
  }`}
  title={statusTitle}
>
            {statusLabel}
</span>
        </div>

        {/* =====================================================
           CENTER
        ===================================================== */}
        <div className="flex items-center gap-3 flex-1 justify-center">
          {(["desktop", "tablet", "mobile"] as const).map((d) => {
            const Icon =
              d === "desktop" ? Laptop : d === "tablet" ? Tablet : Smartphone;
            return (
              <button
                key={d}
                onClick={() => setDevice(d)}
                className={`p-2 rounded-xl ${
                  device === d
                    ? "bg-blue-500/25 text-blue-400"
                    : "text-white/50 hover:bg-white/10"
                }`}
              >
                <Icon size={18} />
              </button>
            );
          })}

          <select
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="px-2 py-1 rounded-xl bg-white/[0.08] text-sm border border-white/10"
          >
            {[100, 90, 80, 70, 60, 50].map((z) => (
              <option key={z} value={z}>
                {z}%
              </option>
            ))}
          </select>

          <button
            onClick={fitToPage}
            className="p-2 rounded-xl bg-white/[0.08]"
          >
            <Maximize2 size={16} />
          </button>
        </div>

        {/* =====================================================
           RIGHT
        ===================================================== */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => commandBus.undo()}
            disabled={!canUndo}
            className={`p-2 rounded-xl ${
              canUndo ? "bg-white/[0.08]" : "opacity-40"
            }`}
          >
            <Undo size={16} />
          </button>

          <button
            onClick={() => commandBus.redo()}
            disabled={!canRedo}
            className={`p-2 rounded-xl ${
              canRedo ? "bg-white/[0.08]" : "opacity-40"
            }`}
          >
            <Redo size={16} />
          </button>

          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-xl bg-white/[0.08]"
          >
            {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <button
            onClick={handlePreview}
            className="px-3 py-1.5 rounded-xl text-sm bg-white/[0.08] border border-white/10 flex items-center gap-2 hover:bg-white/10 transition"
            title="Open preview in new tab"
          >
            <Eye size={16} /> Preview
          </button>

          <div className="relative" ref={saveDropdownRef}>
            <button
              type="button"
              onClick={() => setSaveMenuOpen((open) => !open)}
              className={`flex items-center gap-2 px-1.5 py-1 text-sm transition ${
                saveError
                  ? "text-red-300"
                  : dirty
                    ? "text-amber-200"
                    : "text-white/70 hover:text-white"
              }`}
              title="Save status"
            >
              {saving ? (
                <Cloud size={16} className="animate-pulse text-blue-300" />
              ) : showAutoSavePulse ? (
                <Cloud size={16} className="animate-bounce text-emerald-300" />
              ) : autoSaveEnabled ? (
                <Cloud size={16} />
              ) : (
                <CloudOff size={16} />
              )}
              <span>
                {saving
                  ? "Saving..."
                  : saveError
                    ? "Save failed"
                    : dirty
                      ? "Unsaved"
                      : relativeLastSavedAt}
              </span>
              <ChevronDown size={14} className="text-white/35" />
            </button>

            {saveMenuOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-xl border border-white/10 bg-[#0B0D12] p-3 text-sm text-white shadow-2xl">
                <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-white/45">
                      Last saved
                    </div>
                    <div className="mt-1 text-white/85">{relativeLastSavedAt}</div>
                    <div className="mt-0.5 text-xs text-white/40">{fullLastSavedAt}</div>
                  </div>
                  {saving ? (
                    <Loader2 size={18} className="animate-spin text-blue-300" />
                  ) : showAutoSavePulse ? (
                    <Check size={18} className="text-emerald-300" />
                  ) : (
                    <Cloud size={18} className="text-white/45" />
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setAutoSaveEnabled((enabled) => !enabled)}
                  className="mt-3 flex w-full items-center justify-between rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-left transition hover:bg-white/[0.08]"
                >
                  <span>
                    <span className="block text-white/80">Auto save</span>
                    <span className="block text-xs text-white/40">
                      {autoSaveEnabled ? "Changes save automatically" : "Manual save only"}
                    </span>
                  </span>
                  <span
                    className={`relative h-5 w-9 rounded-full transition ${
                      autoSaveEnabled ? "bg-blue-500" : "bg-white/15"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${
                        autoSaveEnabled ? "left-4" : "left-0.5"
                      }`}
                    />
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || !blueprint}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-white/[0.06] px-3 py-2 text-white/80 transition hover:bg-white/[0.1] disabled:opacity-50"
                >
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <Cloud size={15} />}
                  Save now
                </button>
              </div>
            )}
          </div>

<button
  onClick={handlePublish}
  className="px-4 py-1.5 rounded-xl text-sm bg-gradient-to-r from-orange-500 to-orange-600 flex items-center gap-2 hover:from-orange-600 hover:to-orange-700 transition disabled:opacity-50"
  title={statusLabel === "Unpublished changes" ? "Publish saved changes to the live site" : "Publish page to live site"}
>
  <Rocket size={16} /> {publishButtonLabel}
</button>
        </div>
      </header>

      {toast && (
        <Toast {...toast} onClose={() => setToast(null)} />
      )}

      <CreatePageModal
        open={showCreatePageModal}
        onClose={() => setShowCreatePageModal(false)}
        siteSlug={siteSlug}
      />
<PublishModal
  open={showPublishModal}
  onClose={() => setShowPublishModal(false)}
  onPublished={() => {
    setCurrentPageStatus("PUBLISHED");
    setPublishedRevision(revision);
    setToast({ message: "Page published", type: "success" });
    void loadPages();
  }}
  pageId={pageId!}
  siteSlug={siteSlug}
  pageSlugWithId={pageSlugWithId}
  publicUrl={publicUrl}
  previewUrl={previewUrl}
/>
    </>
  );
}
