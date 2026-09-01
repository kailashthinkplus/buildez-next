"use client";

import Link from "next/link";
import { DashboardLogo } from "../DashboardLogo";
import {
  LayoutDashboard,
  FolderTree,
  Users,
  CreditCard,
  WalletCards,
  Settings,
  X,
  Sparkles,
  CircleHelp,
} from "lucide-react";
import { usePathname } from "next/navigation";

interface GlobalSidebarProps {
  setMobileOpen: (v: boolean) => void;
}

export function GlobalSidebar({ setMobileOpen }: GlobalSidebarProps) {
  const pathname = usePathname();

  const links = [
    {
      id: "global-dashboard",
      name: "Dashboard",
      href: "/app/dashboard",
      icon: LayoutDashboard,
    },
    {
      id: "global-websites",
      name: "Websites",
      href: "/app/workspace/websites",
      icon: FolderTree,
    },
    {
      id: "global-team",
      name: "Team",
      href: "/app/workspace/team",
      icon: Users,
    },
    {
      id: "global-plans",
      name: "Plans",
      href: "/app/plans",
      icon: WalletCards,
    },
    {
      id: "global-billing",
      name: "Billing",
      href: "/app/workspace/billing",
      icon: CreditCard,
    },
    {
      id: "global-settings",
      name: "Settings",
      href: "/app/workspace/settings",
      icon: Settings,
    },
  ];

  return (
    <div className="h-full px-3 py-4 flex flex-col">
      {/* LOGO */}
      <div className="flex items-center justify-between px-2">
        <DashboardLogo />

        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10"
        >
          <X size={18} />
        </button>
      </div>

      {/* NAV */}
      <p className="mt-5 px-3 pb-2 text-[10px] font-semibold uppercase tracking-[.14em] dashboard-faint">Workspace</p>
      <nav className="flex flex-col gap-1">
        {links.map(({ id, name, href, icon: Icon }) => {
          const active =
            pathname === href || pathname.startsWith(href + "/");

          return (
            <Link
              key={id}
              href={href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition
                ${
                  active
                    ? "dashboard-nav-active"
                    : "dashboard-muted dashboard-hover"
                }
              `}
            >
              <Icon size={18} />
              <span>{name}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto space-y-3">
        <Link href="/app/ai" className="block rounded-2xl border dashboard-border bg-[var(--dashboard-surface)] p-4 dashboard-hover">
          <Sparkles className="h-5 w-5" />
          <p className="mt-3 text-sm font-semibold">Build with AI</p>
          <p className="mt-1 text-[11px] leading-4 dashboard-muted">Turn an idea into a polished website in minutes.</p>
          <span className="mt-3 inline-block text-xs font-semibold text-blue-600 dark:text-blue-400">Start creating</span>
        </Link>
        <Link href="/app/help" className="flex items-center gap-3 px-3 py-2 text-sm dashboard-muted"><CircleHelp size={17}/> Help center</Link>
      </div>
    </div>
  );
}
