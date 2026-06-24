"use client";

import { useEffect, useRef, useState } from "react";
import {
  MoreHorizontal,
  Settings,
  Copy,
  Trash2,
  Eye,
} from "lucide-react";
import PublishButton from "./PublishButton";

export default function PageActionsMenu({
  page,
  onSettings,
  onDelete,
  onDuplicate,
  onPreview,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  /* -------------------------------------------------- */
  /* Close dropdown on outside click                    */
  /* -------------------------------------------------- */
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      {/* Trigger Button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="
          p-2 rounded-lg 
          hover:bg-gray-200 dark:hover:bg-white/10 
          transition-colors
        "
      >
        <MoreHorizontal className="h-5 w-5" />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="
            absolute right-0 mt-2 w-48 rounded-xl z-50
            overflow-hidden
            border border-white/20 dark:border-white/10
            bg-white/70 dark:bg-white/[0.06]
            backdrop-blur-xl shadow-xl
          "
        >
          {/* Preview */}
          <button
            onClick={() => {
              onPreview();
              setOpen(false);
            }}
            className="
              flex w-full items-center gap-3 px-4 py-2 text-left
              hover:bg-black/5 dark:hover:bg-white/10
            "
          >
            <Eye className="h-4 w-4" />
            Preview
          </button>

          {/* Settings */}
          <button
            onClick={() => {
              onSettings();
              setOpen(false);
            }}
            className="
              flex w-full items-center gap-3 px-4 py-2 text-left
              hover:bg-black/5 dark:hover:bg-white/10
            "
          >
            <Settings className="h-4 w-4" />
            Settings
          </button>

          {/* Publish / Unpublish */}
          <div
            className="
              border-t border-white/20 dark:border-white/10
              px-4 py-2
            "
          >
            <PublishButton
              page={page}
              onClick={() => setOpen(false)}
            />
          </div>

          {/* Duplicate */}
          <button
            onClick={() => {
              onDuplicate();
              setOpen(false);
            }}
            className="
              flex w-full items-center gap-3 px-4 py-2 text-left
              hover:bg-black/5 dark:hover:bg-white/10
            "
          >
            <Copy className="h-4 w-4" />
            Duplicate
          </button>

          {/* Delete */}
          <button
            onClick={() => {
              onDelete();
              setOpen(false);
            }}
            className="
              flex w-full items-center gap-3 px-4 py-2 text-left
              text-red-600 
              hover:bg-red-50 dark:hover:bg-red-500/10
            "
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
