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
  Search,
  CircleHelp,
  ExternalLink,
  Package,
  ReceiptText,
  Percent,
  CreditCard,
  UsersRound,
  ListTree,
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
    <div className="h-full px-3 py-4 flex flex-col overflow-y-auto">
      {/* LOGO + SITE NAME */}
      <div className="flex items-center justify-between px-2">
        <div className="flex flex-col">
          <DashboardLogo />
          <span className="max-w-[150px] truncate text-[11px] dashboard-muted mt-0.5">
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

      {sections.map((section) => (
        <div key={section.title} className="mb-5">
          <div className="px-3 text-[10px] uppercase tracking-[.14em] font-semibold dashboard-faint mb-2">
            {section.title}
          </div>

          <div className="flex flex-col gap-1">
            {section.links.map(({ name, href, icon: Icon, children }) => {
              const pathOnly = href.split("?")[0];
              const active = pathname === pathOnly;
              return (
                <div key={href}>
                  <Link href={href} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${active ? "dashboard-nav-active" : "dashboard-muted dashboard-hover"}`}><Icon size={18}/>{name}</Link>
                  {active && children?.length ? <div className="ml-5 mt-1 space-y-0.5 border-l dashboard-border pl-2">{children.map(child => <Link key={child.href} href={child.href} className="flex items-center gap-2 rounded-lg px-2 py-2 text-xs dashboard-muted dashboard-hover"><child.icon size={14}/>{child.name}</Link>)}</div> : null}
                </div>
              );
            })}
          </div>
        </div>
      ))}
      <div className="mt-auto border-t dashboard-border pt-3 space-y-1">
        <Link href={`${base}/settings`} className="flex items-center gap-3 px-3 py-2 text-sm dashboard-muted dashboard-hover rounded-xl"><CircleHelp size={17}/> Help & support</Link>
        <Link href={`/${currentWebsite.slug}`} className="flex items-center gap-3 px-3 py-2 text-sm dashboard-muted dashboard-hover rounded-xl"><ExternalLink size={17}/> View live site</Link>
      </div>
    </div>
  );
}
