"use client";

import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  FolderTree,
  Users,
  CreditCard,
  Settings,
  X,
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
    <div className="h-full px-4 py-6 flex flex-col gap-8">
      {/* LOGO */}
      <div className="flex items-center justify-between">
        <Image
          src="/buildez-logo-light.svg"
          alt="BuildEZ"
          width={148}
          height={72}
          className="block h-11 w-[148px] object-contain object-left dark:hidden"
        />
        <Image
          src="/buildez-logo-dark.svg"
          alt="BuildEZ"
          width={148}
          height={72}
          className="hidden h-11 w-[148px] object-contain object-left dark:block"
        />

        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10"
        >
          <X size={18} />
        </button>
      </div>

      {/* NAV */}
      <nav className="flex flex-col gap-1">
        {links.map(({ id, name, href, icon: Icon }) => {
          const active =
            pathname === href || pathname.startsWith(href + "/");

          return (
            <Link
              key={id}
              href={href}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition
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
    </div>
  );
}
