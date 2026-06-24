"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Globe,
  CreditCard,
  Receipt,
  Layers,
  Cpu,
  Activity,
  Shield,
  Settings,
  ChevronLeft,
  ChevronDown,
  X,
  Palette,
  Store,
  FileText,
  BarChart3,
  Server,
  Key,
  Flag,
  Webhook,
  ScrollText,
  AlertTriangle,
  Boxes,
  LifeBuoy,
  MessageSquare,
  HelpCircle,
  Plug,
  Puzzle,
  AppWindow,
  ClipboardCheck,
} from "lucide-react";

/* ================================
   SUPER SIDEBAR
================================ */

export default function SuperSidebar({
  open,
  collapsed,
  onClose,
  onToggleCollapse,
}: {
  open: boolean;
  collapsed: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
}) {
  const pathname = usePathname();

  const [sections, setSections] = useState<Record<string, boolean>>({
    content: true,
    saas: true,
    platform: true,
    themes: true,
    apps: true,
    support: true,
    governance: true,
    system: true,
  });

  const toggleSection = (key: string) =>
    setSections((s) => ({ ...s, [key]: !s[key] }));

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={[
          "fixed md:relative z-50 flex flex-col",
          "h-screen overflow-hidden",
          "transition-all duration-300 ease-in-out",
          collapsed ? "w-14" : "w-64",
          open ? "left-0" : "-left-full md:left-0",
          "bg-[rgba(26,115,232,0.10)]",
          "dark:bg-[#0B0F19] dark:glass",
          "dark:shadow-[0_20px_60px_rgba(0,0,0,0.45)]",
          "rounded-none border-none",
        ].join(" ")}
      >
        {/* ───── Logo ───── */}
        <div className="pt-4 shrink-0">
          <div
            className={[
              "h-14 flex items-center",
              collapsed ? "justify-center px-0" : "px-4 gap-3",
            ].join(" ")}
          >
            {collapsed ? (
              <Image
                src="/favicon.png"
                alt="BuildEZ"
                width={26}
                height={26}
                priority
              />
            ) : (
              <Image
                src="/buildez-logo-dark.svg"
                alt="BuildEZ"
                width={120}
                height={32}
                priority
              />
            )}

            {!collapsed && (
              <button
                className="ml-auto md:hidden text-mutedForeground hover:text-foreground"
                onClick={onClose}
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* ───── Navigation ───── */}
        <nav className="flex-1 overflow-y-scroll sidebar-scroll px-3 py-4 space-y-5">
          <Section
            title="CONTENT"
            open={sections.content || collapsed}
            collapsed={collapsed}
            onToggle={() => toggleSection("content")}
          >
            <NavLink href="/super/dashboard" icon={LayoutDashboard} label="Dashboard" active={pathname === "/super/dashboard"} collapsed={collapsed} />
            <NavLink href="/super/tenants" icon={Users} label="Tenants" active={pathname.startsWith("/super/tenants")} collapsed={collapsed} />
            <NavLink href="/super/domains" icon={Globe} label="Domains" active={pathname.startsWith("/super/domains")} collapsed={collapsed} />
            <NavLink href="/super/websites" icon={Boxes} label="Websites" active={pathname.startsWith("/super/websites")} collapsed={collapsed} />
          </Section>

          <Section title="SAAS & BILLING" open={sections.saas || collapsed} collapsed={collapsed} onToggle={() => toggleSection("saas")}>
            <NavLink href="/super/plans" icon={CreditCard} label="Plans & Pricing" active={pathname.startsWith("/super/plans")} collapsed={collapsed} />
            <NavLink href="/super/subscriptions" icon={Layers} label="Subscriptions" active={pathname.startsWith("/super/subscriptions")} collapsed={collapsed} />
            <NavLink href="/super/transactions" icon={Receipt} label="Transactions" active={pathname.startsWith("/super/transactions")} collapsed={collapsed} />
            <NavLink href="/super/invoices" icon={FileText} label="Invoices" active={pathname.startsWith("/super/invoices")} collapsed={collapsed} />
          </Section>

          <Section title="PLATFORM" open={sections.platform || collapsed} collapsed={collapsed} onToggle={() => toggleSection("platform")}>
            <NavLink href="/super/ai" icon={Cpu} label="AI Usage" active={pathname.startsWith("/super/ai")} collapsed={collapsed} />
            <NavLink href="/super/analytics" icon={BarChart3} label="Analytics" active={pathname.startsWith("/super/analytics")} collapsed={collapsed} />
            <NavLink href="/super/health" icon={Server} label="Platform Health" active={pathname.startsWith("/super/health")} collapsed={collapsed} />
            <NavLink href="/super/flags" icon={Flag} label="Feature Flags" active={pathname.startsWith("/super/flags")} collapsed={collapsed} />
            <NavLink href="/super/logs" icon={ScrollText} label="Logs" active={pathname.startsWith("/super/logs")} collapsed={collapsed} />
          </Section>

          <Section title="THEMES" open={sections.themes || collapsed} collapsed={collapsed} onToggle={() => toggleSection("themes")}>
            <NavLink href="/super/themes" icon={Palette} label="Theme Library" active={pathname.startsWith("/super/themes")} collapsed={collapsed} />
            <NavLink href="/super/marketplace" icon={Store} label="Theme Marketplace" active={pathname.startsWith("/super/marketplace")} collapsed={collapsed} />
          </Section>

          <Section title="APPS" open={sections.apps || collapsed} collapsed={collapsed} onToggle={() => toggleSection("apps")}>
            <NavLink href="/super/apps" icon={AppWindow} label="Installed Apps" active={pathname.startsWith("/super/apps")} collapsed={collapsed} />
            <NavLink href="/super/apps/marketplace" icon={Puzzle} label="App Marketplace" active={pathname.startsWith("/super/apps/marketplace")} collapsed={collapsed} />
            <NavLink href="/super/apps/submissions" icon={ClipboardCheck} label="Submissions" active={pathname.startsWith("/super/apps/submissions")} collapsed={collapsed} />
            <NavLink href="/super/apps/permissions" icon={Plug} label="Permissions" active={pathname.startsWith("/super/apps/permissions")} collapsed={collapsed} />
          </Section>

          <Section title="SUPPORT" open={sections.support || collapsed} collapsed={collapsed} onToggle={() => toggleSection("support")}>
            <NavLink href="/super/support/tickets" icon={LifeBuoy} label="Support Tickets" active={pathname.startsWith("/super/support/tickets")} collapsed={collapsed} />
            <NavLink href="/super/support/chat" icon={MessageSquare} label="Live Chat" active={pathname.startsWith("/super/support/chat")} collapsed={collapsed} />
            <NavLink href="/super/support/help" icon={HelpCircle} label="Help Center" active={pathname.startsWith("/super/support/help")} collapsed={collapsed} />
          </Section>

          <Section title="GOVERNANCE" open={sections.governance || collapsed} collapsed={collapsed} onToggle={() => toggleSection("governance")}>
            <NavLink href="/super/roles" icon={Shield} label="Roles & Permissions" active={pathname.startsWith("/super/roles")} collapsed={collapsed} />
            <NavLink href="/super/audit" icon={Activity} label="Audit Logs" active={pathname.startsWith("/super/audit")} collapsed={collapsed} />
            <NavLink href="/super/abuse" icon={AlertTriangle} label="Abuse & Reports" active={pathname.startsWith("/super/abuse")} collapsed={collapsed} />
          </Section>

          <Section title="SYSTEM" open={sections.system || collapsed} collapsed={collapsed} onToggle={() => toggleSection("system")}>
            <NavLink href="/super/settings" icon={Settings} label="Settings" active={pathname.startsWith("/super/settings")} collapsed={collapsed} />
            <NavLink href="/super/integrations" icon={Webhook} label="Integrations" active={pathname.startsWith("/super/integrations")} collapsed={collapsed} />
            <NavLink href="/super/api" icon={Key} label="API Keys" active={pathname.startsWith("/super/api")} collapsed={collapsed} />
          </Section>
        </nav>

        {/* Collapse toggle */}
        <button
          onClick={onToggleCollapse}
          className="absolute bottom-4 right-3 hidden md:flex h-8 w-8 items-center justify-center rounded-md text-mutedForeground hover:text-foreground hover:bg-muted"
        >
          <ChevronLeft
            size={16}
            className={`transition-transform ${collapsed ? "rotate-180" : ""}`}
          />
        </button>
      </aside>
    </>
  );
}

/* ================================
   SECTION
================================ */

function Section({
  title,
  open,
  collapsed,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  collapsed: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      {!collapsed && (
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-between px-3 pt-2 text-[11px] font-semibold tracking-widest text-mutedForeground hover:text-foreground"
        >
          {title}
          <ChevronDown
            size={12}
            className={`transition-transform ${open ? "" : "-rotate-90"}`}
          />
        </button>
      )}
      {open && <div className="space-y-1">{children}</div>}
    </div>
  );
}

/* ================================
   NAV LINK
================================ */

function NavLink({
  href,
  icon: Icon,
  label,
  active,
  collapsed,
}: {
  href: string;
  icon: any;
  label: string;
  active: boolean;
  collapsed: boolean;
}) {
  return (
    <Link
      href={href}
      className={[
        "group relative flex items-center transition-all rounded-md",
        collapsed ? "justify-center h-10" : "gap-3 px-3 py-2",
        active
          ? "bg-[rgba(26,115,232,0.18)] text-[#1A73E8] dark:bg-[rgba(255,255,255,0.08)] dark:text-white"
          : "text-foreground/70 hover:text-foreground hover:bg-muted/60 dark:hover:bg-white/5",
      ].join(" ")}
    >
      {active && !collapsed && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] bg-[#1A73E8] dark:bg-white rounded-full" />
      )}

      <span className={collapsed ? "w-10 h-10 flex items-center justify-center" : "w-5 h-5 flex items-center justify-center"}>
        <Icon size={18} />
      </span>

      {!collapsed && (
        <span className="text-sm font-medium truncate">{label}</span>
      )}
    </Link>
  );
}
