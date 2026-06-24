"use client";

import { useEffect, useRef, useState } from "react";

type ContextMenuPosition = {
  x: number;
  y: number;
};

type ContextMenuAction = {
  label: string;
  icon?: string;
  action: () => void;
  isDanger?: boolean;
  disabled?: boolean;
};

interface ContextMenuProps {
  actions: ContextMenuAction[];
}

export default function ContextMenu({ actions }: ContextMenuProps) {
  const [position, setPosition] = useState<ContextMenuPosition | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest("[data-node-id]");
      if (el) {
        e.preventDefault();
        setPosition({ x: e.clientX, y: e.clientY });
      }
    };

    const handleClickOutside = () => {
      setPosition(null);
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!position || !menuRef.current) return;

    const rect = menuRef.current.getBoundingClientRect();
    const x = Math.min(
      position.x,
      window.innerWidth - rect.width - 12
    );
    const y = Math.min(
      position.y,
      window.innerHeight - rect.height - 12
    );

    menuRef.current.style.left = `${x}px`;
    menuRef.current.style.top = `${y}px`;
  }, [position]);

  if (!position) return null;

  return (
    <div
      ref={menuRef}
      className="fixed z-[10050] min-w-48 rounded-lg border border-white/10 bg-black/95 backdrop-blur-md shadow-2xl p-1"
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      {actions.map((action, idx) => (
        <button
          key={idx}
          type="button"
          disabled={action.disabled}
          onClick={() => {
            action.action();
            setPosition(null);
          }}
          className={`
            w-full text-left px-3 py-2 rounded-md text-sm
            transition flex items-center gap-2
            ${
              action.isDanger
                ? "text-red-200 hover:bg-red-500/20 disabled:opacity-50"
                : "text-white/80 hover:bg-white/10 disabled:opacity-50"
            }
          `}
        >
          {action.icon && <span className="text-xs">{action.icon}</span>}
          <span>{action.label}</span>
        </button>
      ))}
    </div>
  );
}
