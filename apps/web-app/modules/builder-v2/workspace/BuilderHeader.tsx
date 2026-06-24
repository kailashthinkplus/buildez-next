"use client";

import {
  Laptop,
  Tablet,
  Smartphone,
  Save,
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
  status: "Draft" | "Published";
}

interface BuilderHeaderProps {
  pageId: string;
}



/* ============================================================================
   BUILDER HEADER — V4 (LOCKED)
============================================================================ */

export default function BuilderHeader(
  { pageId }: BuilderHeaderProps
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
  const [publishing, setPublishing] = useState(false);

  const [pageMenuOpen, setPageMenuOpen] = useState(false);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [showCreatePageModal, setShowCreatePageModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  /* -------------------------------------------------------------
   DERIVED PAGE STATE (SAFE)
------------------------------------------------------------- */
const currentPage =
  pages.find((p) => p.id === pageId) ??
  pages.find((p) => pageSlugWithId?.includes(p.id)) ??
  null;


  /* -------------------------------------------------------------
     LOAD PAGES FOR SWITCHER
  ------------------------------------------------------------- */
  useEffect(() => {
    
    if (!pageMenuOpen || !siteSlug) return;

    (async () => {
      const res = await fetch(`/api/pages?take=200`, {
        credentials: "include",
      });

      const json = await res.json();
      const allPages: PageItem[] = json?.pages ?? [];

      setPages(allPages.filter((p) => p.site?.slug === siteSlug));
    })();
  }, [pageMenuOpen, siteSlug]);

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

const resolvedStatus =
  currentPage?.status ?? "Draft";
  


  /* -------------------------------------------------------------
     ACTIONS
  ------------------------------------------------------------- */

const saveBlueprint = useCallback(async (showToast: boolean) => {
  if (!blueprint || !pageId) return;

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

    clearDirty(savingRevision);
    setLastSavedAt(new Date());

    if (showToast) {
      setToast({
        message: "Page saved successfully",
        type: "success",
      });
    }
  } catch (error) {
    console.error("Save error:", error);
    setSaveError(true);

    if (showToast) {
      setToast({
        message: "Failed to save page",
        type: "error",
      });
    }
  } finally {
    setSaving(false);
  }
}, [blueprint, clearDirty, pageId, revision]);

function handleSave() {
  void saveBlueprint(true);
}

useEffect(() => {
  if (!dirty || saving || !blueprint || !pageId) return;

  const timeout = window.setTimeout(() => {
    void saveBlueprint(false);
  }, 2000);

  return () => window.clearTimeout(timeout);
}, [blueprint, dirty, pageId, revision, saveBlueprint, saving]);

async function handlePublish() {
  if (!blueprint || !pageId) return;

  setShowPublishModal(true);
}

function handlePreview() {
  if (!siteSlug || !pageSlugWithId) {
    setToast({ message: "Preview unavailable", type: "error" });
    return;
  }

  const previewUrl = `/preview/${siteSlug}/${pageSlugWithId}`;
  window.open(previewUrl, "_blank", "noopener,noreferrer");
}

function handleExport() {
  if (!blueprint) return;

  try {
    // Create downloadable JSON
    const dataStr = JSON.stringify(blueprint, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `blueprint-${pageId}-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setToast({
      message: "Blueprint exported",
      type: "success",
    });
  } catch (error) {
    console.error("Export error:", error);
    setToast({
      message: "Failed to export blueprint",
      type: "error",
    });
  }
}

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
      <header className="h-[56px] w-full flex items-center px-4 md:px-6 bg-[#0F1118]/80 border-b border-white/10 backdrop-blur-xl text-white">
        {/* =====================================================
           LEFT
        ===================================================== */}
        <div className="flex items-center gap-3 w-[320px]">
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

          {/* STATUS */}
          <span
  className={`px-2 py-0.5 rounded-full text-xs border ${
    resolvedStatus === "Published"
      ? "bg-green-500/10 text-green-400 border-green-500/20"
      : "bg-blue-500/10 text-blue-400 border-blue-500/20"
  }`}
>
  {resolvedStatus}
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

          <button
            onClick={handleExport}
            className="px-3 py-1.5 rounded-xl text-sm bg-white/[0.08] border border-white/10 flex items-center gap-2 hover:bg-white/10 transition"
            title="Export blueprint as JSON"
          >
            ⬇ Export
          </button>

          <button
            onClick={handleSave}
            disabled={saving || !dirty}
            className="px-3 py-1.5 rounded-xl text-sm bg-white/[0.08] border border-white/10 flex items-center gap-2 hover:bg-white/10 transition disabled:opacity-50"
            title="Save page blueprint"
          >
            <Save size={16} />
            {saving
              ? "Saving..."
              : saveError
              ? "Save failed"
              : dirty
              ? "Unsaved"
              : lastSavedAt
              ? "Saved"
              : "Save"}
          </button>

<button
  onClick={() => setShowPublishModal(true)}
  disabled={publishing}
  className="px-4 py-1.5 rounded-xl text-sm bg-gradient-to-r from-orange-500 to-orange-600 flex items-center gap-2 hover:from-orange-600 hover:to-orange-700 transition disabled:opacity-50"
  title="Publish page to live site"
>
  <Rocket size={16} /> {publishing ? "Publishing..." : "Publish"}
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
  pageId={pageId!}
  siteSlug={siteSlug}
  pageSlugWithId={pageSlugWithId}
/>
    </>
  );
}
