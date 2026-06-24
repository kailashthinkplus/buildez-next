"use client";

import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
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

  const isSite =
    !!currentWebsite &&
    pathname.startsWith(`/app/${currentWebsite.slug}`);

  const Sidebar = isSite ? SiteSidebar : GlobalSidebar;

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
            className="fixed top-0 left-0 z-50 h-full w-[250px] glass border-r"
          >
            <Sidebar setMobileOpen={setMobileOpen} />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* DESKTOP */}
      <aside className="hidden lg:block w-[250px] h-full glass border-r">
        <Sidebar setMobileOpen={setMobileOpen} />
      </aside>
    </>
  );
}
