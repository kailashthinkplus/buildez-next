"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Loader2, MoreHorizontal, UserX } from "lucide-react";
import RemoveMemberModal from "./RemoveMemberModal";

type MemberActionsMenuProps = {
  name: string;
  disabled?: boolean;
  onRemove: () => Promise<void>;
};

export default function MemberActionsMenu({ name, disabled, onRemove }: MemberActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
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
      const menuWidth = 200;
      const menuHeight = 52;
      const openAbove = rect.bottom + menuHeight + 12 > window.innerHeight;
      setMenuPosition({
        top: Math.max(8, openAbove ? rect.top - menuHeight - 8 : rect.bottom + 8),
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
            style={{ top: menuPosition.top, left: menuPosition.left }}
            className="dashboard-card-strong fixed z-[50000] w-[200px] overflow-hidden rounded-xl shadow-xl backdrop-blur-xl"
          >
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setConfirmOpen(true);
              }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
            >
              <UserX className="h-4 w-4" /> Remove member
            </button>
          </div>,
          document.body,
        )
      : null;

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={toggleMenu}
        aria-label={`More options for ${name}`}
        className="rounded-lg p-2 dashboard-hover disabled:opacity-40"
      >
        {disabled ? <Loader2 size={16} className="animate-spin dashboard-muted" /> : <MoreHorizontal size={17} className="dashboard-muted" />}
      </button>

      {dropdown}

      <RemoveMemberModal name={name} open={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={onRemove} />
    </div>
  );
}
