"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  MoreHorizontal,
  Settings,
  Copy,
  Trash2,
  Eye,
  Pencil,
} from "lucide-react";
import PublishButton from "./PublishButton";

type PageActionsPage = {
  id: string;
  title: string;
  status: string;
  site?: { slug?: string };
};

type PageActionsMenuProps = {
  page: PageActionsPage;
  onEdit?: () => void;
  onSettings?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => Promise<void> | void;
  onPreview?: () => void;
  onChanged?: () => void;
};

export default function PageActionsMenu({
  page,
  onEdit,
  onSettings,
  onDelete,
  onDuplicate,
  onPreview,
  onChanged,
}: PageActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  /* -------------------------------------------------- */
  /* Close dropdown on outside click                    */
  /* -------------------------------------------------- */
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
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

  function toggleMenu() {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      const menuWidth = 192;
      setMenuPosition({
        top: rect.bottom + 8,
        left: Math.max(8, Math.min(window.innerWidth - menuWidth - 8, rect.right - menuWidth)),
      });
    }

    setOpen((value) => !value);
  }

  const dropdown =
    open && typeof document !== "undefined"
      ? createPortal(
          <div
            ref={menuRef}
            style={{
              top: menuPosition.top,
              left: menuPosition.left,
            }}
            className="
              fixed w-48 rounded-xl z-[1000]
              overflow-hidden
              dashboard-card-strong
              backdrop-blur-xl shadow-xl
            "
          >
            {/* Edit */}
            <button
              type="button"
              onClick={() => {
                onEdit?.();
                setOpen(false);
              }}
              disabled={!onEdit}
              className="
                flex w-full items-center gap-3 px-4 py-2 text-left
                dashboard-hover disabled:opacity-40
              "
            >
              <Pencil className="h-4 w-4" />
              Edit
            </button>

            {/* Preview */}
            <button
              type="button"
              onClick={() => {
                onPreview?.();
                setOpen(false);
              }}
              disabled={!onPreview}
              className="
                flex w-full items-center gap-3 px-4 py-2 text-left
                dashboard-hover disabled:opacity-40
              "
            >
              <Eye className="h-4 w-4" />
              Preview
            </button>

            {/* Settings */}
            <button
              type="button"
              onClick={() => {
                onSettings?.();
                setOpen(false);
              }}
              disabled={!onSettings}
              className="
                flex w-full items-center gap-3 px-4 py-2 text-left
                dashboard-hover disabled:opacity-40
              "
            >
              <Settings className="h-4 w-4" />
              Settings
            </button>

            {/* Publish / Unpublish */}
            <div
              className="
                border-t dashboard-border
                px-4 py-2
              "
            >
              <PublishButton
                page={page}
                onClick={() => setOpen(false)}
                onChanged={onChanged}
              />
            </div>

            {/* Duplicate */}
            <button
              type="button"
              onClick={async () => {
                await onDuplicate?.();
                setOpen(false);
              }}
              disabled={!onDuplicate}
              className="
                flex w-full items-center gap-3 px-4 py-2 text-left
                dashboard-hover disabled:opacity-40
              "
            >
              <Copy className="h-4 w-4" />
              Duplicate
            </button>

            {/* Delete */}
            <button
              type="button"
              onClick={() => {
                onDelete?.();
                setOpen(false);
              }}
              disabled={!onDelete}
              className="
                flex w-full items-center gap-3 px-4 py-2 text-left
                text-red-600 
                hover:bg-red-50 disabled:opacity-40 dark:hover:bg-red-500/10
              "
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>,
          document.body
        )
      : null;

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleMenu}
        aria-label={`Open actions for ${page.title}`}
        className="
          p-2 rounded-lg 
          dashboard-hover
          transition-colors
        "
      >
        <MoreHorizontal className="h-5 w-5" />
      </button>

      {dropdown}
    </div>
  );
}
