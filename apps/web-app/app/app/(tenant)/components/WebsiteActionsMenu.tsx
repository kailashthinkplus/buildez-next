"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  Archive,
  ArchiveRestore,
  ExternalLink,
  Globe,
  MoreHorizontal,
  Settings,
  Undo2,
} from "lucide-react";

import { publishedSitePath } from "@/lib/runtime/published-site-path";

export type WebsiteActionsMenuSite = {
  id: string;
  name: string;
  slug: string;
  status: string;
  archived?: boolean;
};

type WebsiteActionsMenuProps = {
  site: WebsiteActionsMenuSite;
  onChanged: (patch: { id: string; status: string; archived: boolean }) => void;
};

export default function WebsiteActionsMenu({ site, onChanged }: WebsiteActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!open) return;
    function close() {
      setOpen(false);
    }
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  function toggleMenu(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      const menuWidth = 216;
      const menuHeight = 196;
      const openAbove = rect.bottom + menuHeight + 12 > window.innerHeight;
      setMenuPosition({
        top: Math.max(8, openAbove ? rect.top - menuHeight - 8 : rect.bottom + 8),
        left: Math.max(8, Math.min(window.innerWidth - menuWidth - 8, rect.right - menuWidth)),
      });
    }

    setError("");
    setOpen((value) => !value);
  }

  async function patchSite(body: Record<string, unknown>) {
    setBusy(true);
    setError("");

    try {
      const response = await fetch(`/api/sites/${encodeURIComponent(site.id)}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.error || "Website could not be updated.");
      }

      onChanged({
        id: site.id,
        status: payload?.site?.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
        archived: Boolean(payload?.site?.archivedAt),
      });
      setOpen(false);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Website could not be updated.");
    } finally {
      setBusy(false);
    }
  }

  const isPublished = site.status === "PUBLISHED";
  const isArchived = Boolean(site.archived);

  const dropdown =
    open && typeof document !== "undefined"
      ? createPortal(
          <div
            ref={menuRef}
            style={{ top: menuPosition.top, left: menuPosition.left }}
            className="dashboard-card-strong fixed z-[50000] w-56 overflow-hidden rounded-xl shadow-xl backdrop-blur-xl"
          >
            <Link
              href={`/app/${site.slug}/settings`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm dashboard-hover"
            >
              <Settings className="h-4 w-4" /> Website settings
            </Link>

            {isPublished && !isArchived ? (
              <a
                href={publishedSitePath(site.slug)}
                target="_blank"
                rel="noreferrer"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm dashboard-hover"
              >
                <ExternalLink className="h-4 w-4" /> View live website
              </a>
            ) : null}

            <div className="border-t dashboard-border" />

            <button
              type="button"
              disabled={busy || isArchived}
              onClick={() => void patchSite({ status: isPublished ? "DRAFT" : "PUBLISHED" })}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm dashboard-hover disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isPublished ? <Undo2 className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
              {isPublished ? "Unpublish" : "Publish"}
            </button>

            <button
              type="button"
              disabled={busy}
              onClick={() => void patchSite({ archived: !isArchived })}
              className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm disabled:cursor-not-allowed disabled:opacity-40 ${
                isArchived
                  ? "dashboard-hover"
                  : "text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
              }`}
            >
              {isArchived ? <ArchiveRestore className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
              {isArchived ? "Unarchive" : "Archive"}
            </button>

            {error && <p className="border-t dashboard-border px-4 py-2 text-xs text-red-500">{error}</p>}
          </div>,
          document.body,
        )
      : null;

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleMenu}
        aria-label={`More options for ${site.name}`}
        className="rounded-lg p-2 dashboard-hover"
      >
        <MoreHorizontal size={17} className="dashboard-muted" />
      </button>

      {dropdown}
    </div>
  );
}
