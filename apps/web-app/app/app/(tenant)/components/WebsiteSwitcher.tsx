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
            dashboard-subtle
            text-sm font-medium
            dashboard-hover
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
            className="absolute left-0 mt-2 w-64 rounded-xl dashboard-card-strong shadow-xl overflow-hidden border border-slate-700 bg-[#0b1118] text-slate-100 shadow-2xl shadow-black/60 z-[9999] isolate !bg-[#071018] dark:!bg-[#071018] !bg-none opacity-100 border-slate-700/80 shadow-black/80"
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
                      dashboard-hover
                      ${
                        active
                          ? "font-semibold text-indigo-600 dark:text-indigo-400"
                          : "dashboard-muted"
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
            <div className="border-t dashboard-border" />

            {/* Create new site */}
            <button
              onClick={() => {
                setOpen(false);
                setShowCreateSite(true);
              }}
              className="
                w-full flex items-center gap-2
                px-3 py-2 text-sm font-medium
                dashboard-hover
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
