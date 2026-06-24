"use client";

import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  FileText,
  Image as ImageIcon,
  Brush,
  Puzzle,
  BarChart3,
  Bot,
  Layers,
  Settings,
  X,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useWorkspace } from "../WorkspaceContext";

export function SiteSidebar({
  setMobileOpen,
}: {
  setMobileOpen: (v: boolean) => void;
}) {
  const pathname = usePathname();
  const { currentWebsite } = useWorkspace();

  if (!currentWebsite) return null;

  const base = `/app/${currentWebsite.slug}`;

  const sections = [
    {
      title: "Site",
      links: [
        { name: "Dashboard", href: `${base}/dashboard`, icon: LayoutDashboard },
        { name: "Pages", href: `${base}/pages`, icon: FileText },
        { name: "Media", href: `${base}/media`, icon: ImageIcon },
        { name: "Themes", href: `${base}/themes`, icon: Brush },
        { name: "Plugins", href: `${base}/plugins`, icon: Puzzle },
      ],
    },
    {
      title: "Growth",
      links: [
        { name: "Analytics", href: `${base}/analytics`, icon: BarChart3 },
        { name: "AI Tools", href: `${base}/ai`, icon: Bot },
        { name: "Forms", href: `${base}/forms`, icon: Layers },
      ],
    },
    {
      title: "Settings",
      links: [
        { name: "Site Settings", href: `${base}/settings`, icon: Settings },
      ],
    },
  ];

  return (
    <div className="h-full px-4 py-6 flex flex-col gap-8">
      {/* LOGO + SITE NAME */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <Image src="/buildez-logo-light.svg" alt="BuildEZ" width={120} height={32} />
          <span className="text-xs opacity-60 mt-1">
            {currentWebsite.name}
          </span>
        </div>
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-2 rounded-lg"
        >
          <X />
        </button>
      </div>

      {/* SECTIONS */}
      {sections.map((section) => (
        <div key={section.title}>
          <div className="text-xs uppercase font-semibold opacity-60 mb-2">
            {section.title}
          </div>

          <div className="flex flex-col gap-1">
            {section.links.map(({ name, href, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition ${
                    active
                      ? "bg-blue-500/20 border border-blue-500/40"
                      : "hover:bg-black/5"
                  }`}
                >
                  <Icon size={18} />
                  {name}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
