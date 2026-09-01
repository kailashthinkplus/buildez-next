"use client";

import Link from "next/link";
import { DashboardLogo } from "../DashboardLogo";
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
  Database,
  ContactRound,
  ShoppingBag,
  X,
  CircleHelp,
  ExternalLink,
  Package,
  ReceiptText,
  Percent,
  CreditCard,
  UsersRound,
  ListTree,
  CircleGauge,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useWorkspace } from "../WorkspaceContext";

export function SiteSidebar({
  setMobileOpen,
  compact = false,
}: {
  setMobileOpen: (v: boolean) => void;
  compact?: boolean;
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
        { name: "CMS", href: `${base}/cms`, icon: Database, children: [
          { name: "Collections", href: `${base}/cms?view=collections`, icon: ListTree },
          { name: "Content entries", href: `${base}/cms?view=entries`, icon: FileText },
        ] },
        { name: "Themes", href: `${base}/themes`, icon: Brush },
        { name: "Apps", href: `${base}/apps`, icon: Puzzle },
        { name: "Shopez", href: `${base}/shopez`, icon: ShoppingBag, children: [
          { name: "Overview", href: `${base}/shopez?view=overview`, icon: LayoutDashboard },
          { name: "Products", href: `${base}/shopez?view=products`, icon: Package },
          { name: "Orders", href: `${base}/shopez?view=orders`, icon: ReceiptText },
          { name: "Customers", href: `${base}/shopez?view=customers`, icon: UsersRound },
          { name: "Discounts", href: `${base}/shopez?view=discounts`, icon: Percent },
          { name: "Payments", href: `${base}/shopez?view=payments`, icon: CreditCard },
          { name: "Settings", href: `${base}/shopez?view=settings`, icon: Settings },
        ] },
      ],
    },
    {
      title: "Growth",
      links: [
        { name: "Analytics", href: `${base}/analytics`, icon: BarChart3 },
        { name: "AI Insights", href: `${base}/insights`, icon: CircleGauge },
        { name: "CRM", href: `${base}/crm`, icon: ContactRound },
        { name: "AI Agents", href: `${base}/ai`, icon: Bot },
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
    <div className={`h-full py-4 flex flex-col overflow-y-auto ${compact ? "px-2" : "px-3"}`}>
      {/* LOGO */}
      <div className={`flex items-center justify-between ${compact ? "justify-center" : "px-2"}`}>
        <div className="flex items-center">
          {compact ? <img src="/favicon.png" alt="BuildEZ" className="h-9 w-9 object-contain" /> : <DashboardLogo />}
        </div>
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-2 rounded-lg"
        >
          <X />
        </button>
      </div>

      {sections.map((section, index) => (
        <div key={section.title} className={`${compact ? "mb-3" : "mb-5"} ${index === 0 ? "pt-6" : ""}`}>
          {!compact ? <div className="px-3 text-[10px] uppercase tracking-[.14em] font-semibold dashboard-faint mb-2">
            {section.title}
          </div> : <div className="mx-2 mb-2 border-t dashboard-border"/>}

          <div className="flex flex-col gap-1">
            {section.links.map(({ name, href, icon: Icon, children }) => {
              const pathOnly = href.split("?")[0];
              const active = pathname === pathOnly;
              return (
                <div key={href}>
                  <Link href={href} title={compact ? name : undefined} aria-label={compact ? name : undefined} className={`flex items-center rounded-xl text-sm font-medium transition ${compact ? "h-10 justify-center px-2" : "gap-3 px-3 py-2.5"} ${active ? "dashboard-nav-active" : "dashboard-muted dashboard-hover"}`}><Icon size={18}/>{compact ? null : name}</Link>
                  {!compact && active && children?.length ? <div className="ml-5 mt-1 space-y-0.5 border-l dashboard-border pl-2">{children.map(child => <Link key={child.href} href={child.href} className="flex items-center gap-2 rounded-lg px-2 py-2 text-xs dashboard-muted dashboard-hover"><child.icon size={14}/>{child.name}</Link>)}</div> : null}
                </div>
              );
            })}
          </div>
        </div>
      ))}
      <div className="mt-auto border-t dashboard-border pt-3 space-y-1">
        <Link href={`/app/help?site=${encodeURIComponent(currentWebsite.id)}`} title={compact ? "Help & support" : undefined} className={`flex items-center rounded-xl text-sm dashboard-muted dashboard-hover ${compact ? "h-10 justify-center" : "gap-3 px-3 py-2"}`}><CircleHelp size={17}/>{compact ? null : "Help & support"}</Link>
        <Link href={`/${encodeURIComponent(currentWebsite.slug)}`} title={compact ? "View live website" : undefined} className={`mt-2 flex items-center justify-center rounded-xl bg-slate-700 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-600 dark:bg-zinc-700 dark:hover:bg-zinc-600 ${compact ? "h-10" : "gap-2 px-3 py-2.5"}`}><ExternalLink size={17}/>{compact ? null : "View live website"}</Link>
      </div>
    </div>
  );
}
