"use client";

import { useEffect, useRef } from "react";
import {
  FileText,
  Image as ImageIcon,
  Figma,
  BadgeCheck,
  RotateCcw,
} from "lucide-react";

/* ============================================================
   TYPES
============================================================ */

export type AIAttachmentType =
  | "document"
  | "image"        // screenshots / inspiration
  | "figma"        // figma url or file
  | "logo";        // brand logo

interface AIAttachmentMenuProps {
  open: boolean;
  onClose(): void;

  /**
   * Fired when user selects an attachment type.
   * Actual upload / AI handling is done by caller.
   */
  onSelect(type: AIAttachmentType): void;

  /**
   * Reset chat + AI flow
   */
  onReset(): void;
}

/* ============================================================
   COMPONENT
============================================================ */

export function AIAttachmentMenu({
  open,
  onClose,
  onSelect,
  onReset,
}: AIAttachmentMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  /* ------------------------------------------------------------
     CLOSE ON OUTSIDE CLICK
  ------------------------------------------------------------ */
  useEffect(() => {
    if (!open) return;

    function handle(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handle);
    return () =>
      document.removeEventListener("mousedown", handle);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={ref}
      className="
        absolute bottom-12 left-2 z-50
        w-64 rounded-xl
        bg-[#020617]
        border border-white/10
        shadow-xl
        p-2
      "
    >
      {/* ---------------- DOCUMENT ---------------- */}
      <MenuItem
        icon={<FileText size={16} />}
        label="Document"
        description="PDF, DOC, brand guidelines"
        onClick={() => {
          onSelect("document");
          onClose();
        }}
      />

      {/* ---------------- IMAGE / SCREENSHOT ---------------- */}
      <MenuItem
        icon={<ImageIcon size={16} />}
        label="Screenshot / Image"
        description="UI screenshots, inspiration"
        onClick={() => {
          onSelect("image");
          onClose();
        }}
      />

      {/* ---------------- FIGMA ---------------- */}
      <MenuItem
        icon={<Figma size={16} />}
        label="Figma"
        description="Figma file or frame URL"
        onClick={() => {
          onSelect("figma");
          onClose();
        }}
      />

      <div className="my-1 h-px bg-white/10" />

      {/* ---------------- LOGO (SPECIAL) ---------------- */}
      <MenuItem
        icon={<BadgeCheck size={16} />}
        label="Logo"
        description="Extract brand colors & style"
        highlight
        onClick={() => {
          onSelect("logo");
          onClose();
        }}
      />

      <div className="my-2 h-px bg-white/10" />

      {/* ---------------- RESET CHAT ---------------- */}
      <MenuItem
        icon={<RotateCcw size={16} />}
        label="Reset chat"
        description="Clear conversation & restart"
        danger
        onClick={() => {
          onReset();
          onClose();
        }}
      />
    </div>
  );
}

/* ============================================================
   MENU ITEM (PRIVATE)
============================================================ */

function MenuItem({
  icon,
  label,
  description,
  onClick,
  highlight,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  description?: string;
  highlight?: boolean;
  danger?: boolean;
  onClick(): void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-start gap-3
        rounded-lg px-3 py-2
        text-left transition
        ${
          danger
            ? "hover:bg-red-600/20"
            : highlight
            ? "bg-blue-600/10 hover:bg-blue-600/20"
            : "hover:bg-white/5"
        }
      `}
    >
      <div
        className={`
          mt-0.5
          ${
            danger
              ? "text-red-400"
              : highlight
              ? "text-blue-400"
              : "text-white/80"
          }
        `}
      >
        {icon}
      </div>

      <div className="flex flex-col">
        <span
          className={`
            text-sm font-medium
            ${danger ? "text-red-400" : "text-white"}
          `}
        >
          {label}
        </span>
        {description && (
          <span className="text-xs text-white/50">
            {description}
          </span>
        )}
      </div>
    </button>
  );
}
