"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { GlobalSidebar } from "./GlobalSidebar";
import { SiteSidebar } from "./SiteSidebar";
import { useWorkspace } from "../WorkspaceContext";

interface Props {
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}

export function SidebarShell({ mobileOpen, setMobileOpen }: Props) {
  const pathname = usePathname();
  const { currentWebsite } = useWorkspace();
  const [siteSidebarCollapsed, setSiteSidebarCollapsed] = useState(false);

  const isSite =
    !!currentWebsite &&
    pathname.startsWith(`/app/${currentWebsite.slug}`);

  function toggleSiteSidebar() {
    setSiteSidebarCollapsed((collapsed) => !collapsed);
  }

  return (
    <>
      {/* MOBILE OVERLAY */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* MOBILE */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: -260 }}
            animate={{ x: 0 }}
            exit={{ x: -260 }}
            transition={{ duration: 0.25 }}
            className="fixed top-0 left-0 z-50 h-full w-[250px] shrink-0 dashboard-panel border-r dashboard-border"
          >
            {isSite ? <SiteSidebar setMobileOpen={setMobileOpen} /> : <GlobalSidebar setMobileOpen={setMobileOpen} />}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* DESKTOP */}
      <aside className={`relative z-20 -mt-2 hidden h-[calc(100%+0.5rem)] shrink-0 pt-2 transition-[width] duration-200 sm:-mt-3 sm:h-[calc(100%+0.75rem)] sm:pt-3 lg:block ${isSite && siteSidebarCollapsed ? "w-[72px]" : "w-[248px]"}`}>
        <div className="h-full overflow-hidden">
          {isSite ? <SiteSidebar setMobileOpen={setMobileOpen} compact={siteSidebarCollapsed} /> : <GlobalSidebar setMobileOpen={setMobileOpen} />}
        </div>
        {isSite ? <button type="button" onClick={toggleSiteSidebar} aria-label={siteSidebarCollapsed ? "Expand website sidebar" : "Collapse website sidebar"} title={siteSidebarCollapsed ? "Expand website sidebar" : "Collapse website sidebar"} className="dashboard-panel absolute right-0 top-1/2 z-30 grid h-8 w-8 -translate-y-1/2 translate-x-1/2 place-items-center rounded-full border dashboard-border shadow-lg dashboard-hover">{siteSidebarCollapsed ? <ChevronRight size={16}/> : <ChevronLeft size={16}/>}</button> : null}
      </aside>
    </>
  );
}
