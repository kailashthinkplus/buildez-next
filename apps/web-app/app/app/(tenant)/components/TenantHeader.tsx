"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Menu,
  MoreVertical,
  Bell,
  Search,
  Moon,
  SunMedium,
  LayoutGrid,
  ArrowLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { WebsiteSwitcher } from "./WebsiteSwitcher";
import { useWorkspace } from "./WorkspaceContext";
import { usePathname } from "next/navigation";

type User = {
  name?: string;
  avatarUrl?: string;
};

export function TenantHeader({
  setMobileSidebarOpen,
  user,
}: {
  setMobileSidebarOpen: (v: boolean) => void;
  user?: User;
}) {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();

  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { plan } = useWorkspace();

  /* ------------------------------------------------
     SHOW BACK BUTTON ONLY INSIDE SITE DASHBOARD
     /app/[siteSlug]/...
  ------------------------------------------------ */
  const isSiteDashboard =
    pathname?.startsWith("/app/") && pathname.split("/").length >= 3;

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/app/login";
  }

  /* -------------------------------------------
     PLAN BADGE (DYNAMIC)
  ------------------------------------------ */
  const planColors: Record<string, string> = {
    trial: "#3B82F6",
    starter: "#6366F1",
    basic: "#6366F1",
    pro: "#8B5CF6",
    business: "#F59E0B",
    agency: "#10B981",
  };

  const planCode = plan?.planCode ?? "trial";
  const color = planColors[planCode] || "#3B82F6";
  const label = plan?.plan?.name ?? planCode.toUpperCase();

  return (
    <header
      className="
        relative z-40
        h-16 flex items-center justify-between
        px-4 md:px-8
        text-[14px]
        border-b border-black/10 dark:border-white/10
        backdrop-blur-xl
        bg-[rgba(255,255,255,0.6)] dark:bg-white/5
      "
    >
      {/* LEFT */}
      <div className="flex items-center gap-4">
        {/* MOBILE MENU */}
        <div className="flex items-center gap-3 md:hidden">
          <button
            className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition"
            onClick={() => setMobileSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>
        </div>

        {/* BACK TO GLOBAL DASHBOARD */}
        {isSiteDashboard && (
          <Link
            href="/app/dashboard"
            title="Back to dashboard"
            className="
              hidden md:flex items-center justify-center
              w-9 h-9 rounded-xl
              bg-black/5 dark:bg-white/10
              border border-black/10 dark:border-white/10
              hover:bg-black/10 dark:hover:bg-white/20
            "
          >
            <div className="relative">
              <LayoutGrid size={16} />
            </div>
          </Link>
        )}

        {/* LOGO (MOBILE ONLY) */}
        <div className="md:hidden">
          <Image
            src="/buildez-logo-light.svg"
            alt="BuildEZ"
            width={100}
            height={26}
            className="block dark:hidden"
          />
          <Image
            src="/buildez-logo-dark.svg"
            alt="BuildEZ"
            width={100}
            height={26}
            className="hidden dark:block"
          />
        </div>

        {/* WEBSITE SWITCHER + PLAN */}
        <div className="hidden md:flex items-center gap-3">
          <WebsiteSwitcher />

          <span
            className="px-3 py-1 rounded-xl text-xs font-medium border"
            style={{
              backgroundColor: color + "22",
              borderColor: color + "55",
              color,
            }}
          >
            {label}
          </span>
        </div>
      </div>

      {/* SEARCH */}
      <div className="hidden md:flex relative w-72 items-center">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-black/40 dark:text-white/40" />
        <input
          placeholder="Search…"
          className="
            pl-10 pr-4 py-2 w-full rounded-xl
            bg-black/5 dark:bg-white/5
            border border-black/10 dark:border-white/10
            text-[14px]
            focus:ring-2 focus:ring-black/10 dark:focus:ring-white/20
            outline-none
          "
        />
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-5">
        <div className="hidden sm:flex items-center gap-4">
          <Bell className="h-5 w-5 text-black/70 dark:text-white/70" />

          {/* USER */}
          <button
            onClick={() => setProfileOpen((v) => !v)}
            className="
              flex items-center gap-2 px-2 py-1 
              rounded-lg overflow-hidden
              hover:bg-black/5 dark:hover:bg-white/10
            "
          >
            <Image
              src={user?.avatarUrl ?? "/default-avatar.svg"}
              alt="avatar"
              width={34}
              height={34}
              className="rounded-full object-cover"
            />
            <span className="hidden sm:block font-medium truncate max-w-[120px]">
              {user?.name || "Account"}
            </span>
          </button>

          {/* PROFILE MENU */}
          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="
                  absolute right-4 top-16 w-48
                  rounded-xl glass p-2 shadow-xl
                  backdrop-blur-xl z-50
                "
              >
                <Link
                  href="/app/profile"
                  className="block px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10"
                >
                  Profile
                </Link>

                <button
                  onClick={logout}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-red-500"
                >
                  Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* MOBILE MENU */}
        <button
          className="
            sm:hidden p-2 rounded-xl
            bg-black/5 dark:bg-white/5
            border border-black/10 dark:border-white/10
          "
          onClick={() => setMobileMenuOpen((p) => !p)}
        >
          <MoreVertical className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
