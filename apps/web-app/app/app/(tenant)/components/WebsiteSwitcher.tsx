"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Plus } from "lucide-react";
import { useWorkspace } from "./WorkspaceContext";
import CreateSiteModal from "./CreateSiteModal";

export function WebsiteSwitcher() {
  const {
    websites,
    currentWebsite,
    switchWebsite,
    loading,
  } = useWorkspace();

  const [open, setOpen] = useState(false);
  const [showCreateSite, setShowCreateSite] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  /* -----------------------------------------------------------
     CLOSE ON OUTSIDE CLICK
  ----------------------------------------------------------- */
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }

    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  if (loading || !currentWebsite) return null;

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        {/* Trigger */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="
            flex items-center gap-2 px-3 py-2 rounded-xl
            bg-black/5 dark:bg-white/10
            text-sm font-medium
            hover:bg-black/10 dark:hover:bg-white/15
            max-w-[220px]
          "
        >
          <span className="truncate max-w-[160px]">
            {currentWebsite.name}
          </span>
          <ChevronDown size={14} />
        </button>

        {/* Dropdown */}
        {open && (
          <div
            className="
              absolute left-0 mt-2 w-64 z-50
              rounded-xl border border-black/10 dark:border-white/10
              bg-white dark:bg-zinc-900
              shadow-xl overflow-hidden
            "
          >
            {/* Sites list */}
            <div className="max-h-64 overflow-y-auto">
              {websites.map((site) => {
                const active = site.id === currentWebsite.id;

                return (
                  <button
                    key={site.id}
                    onClick={() => {
                      setOpen(false);
                      if (!active) switchWebsite(site.id);
                    }}
                    className={`
                      w-full flex items-center justify-between
                      px-3 py-2 text-sm
                      hover:bg-black/5 dark:hover:bg-white/10
                      ${
                        active
                          ? "font-semibold text-indigo-600 dark:text-indigo-400"
                          : "text-black/80 dark:text-white/80"
                      }
                    `}
                  >
                    <span className="truncate">{site.name}</span>
                    {active && <Check size={14} />}
                  </button>
                );
              })}
            </div>

            {/* Divider */}
            <div className="border-t border-black/10 dark:border-white/10" />

            {/* Create new site */}
            <button
              onClick={() => {
                setOpen(false);
                setShowCreateSite(true);
              }}
              className="
                w-full flex items-center gap-2
                px-3 py-2 text-sm font-medium
                hover:bg-black/5 dark:hover:bg-white/10
              "
            >
              <Plus size={14} />
              Create new website
            </button>
          </div>
        )}
      </div>

      {/* CREATE SITE MODAL */}
      <CreateSiteModal
        open={showCreateSite}
        onClose={() => setShowCreateSite(false)}
      />
    </>
  );
}
