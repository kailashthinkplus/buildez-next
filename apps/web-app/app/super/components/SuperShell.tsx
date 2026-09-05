"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Activity, Building2, CircleGauge, CreditCard, Globe2,
  Headphones, LogOut, Megaphone, Menu, Search, Users, X,
} from "lucide-react";
import ThemeToggle from "@/app/app/components/ThemeToggle";

const navigation = [
  { href: "/super/dashboard", label: "Dashboard", icon: CircleGauge },
  { href: "/super/tenants", label: "Tenants", icon: Building2 },
  { href: "/super/users", label: "Users & access", icon: Users },
  { href: "/super/websites", label: "Websites", icon: Globe2 },
  { href: "/super/plans", label: "Plans", icon: CreditCard },
  { href: "/super/transactions", label: "Transactions", icon: CreditCard },
  { href: "/super/changelog", label: "Changelog", icon: Megaphone },
  { href: "/super/support", label: "Support", icon: Headphones },
  { href: "/super/security/auth-logs", label: "Security logs", icon: Activity },
];

export default function SuperShell({ children, admin }: { children: React.ReactNode; admin: { name: string | null; email: string | null } }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/super/login");
  }

  return (
    <div className="dashboard-shell flex h-screen w-full overflow-hidden p-2 sm:p-3">
      {mobileOpen && <button aria-label="Close navigation" className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setMobileOpen(false)} />}
      <aside className={`${mobileOpen ? "translate-x-0" : "-translate-x-full"} dashboard-panel dashboard-border fixed inset-y-0 left-0 z-50 flex w-[250px] flex-col border-r px-3 py-4 transition-transform lg:relative lg:inset-auto lg:z-auto lg:h-full lg:w-[248px] lg:shrink-0 lg:translate-x-0 lg:border-r-0`}>
        <div className="flex items-center justify-between px-2">
          <Link href="/super/dashboard" aria-label="BuildEZ superadmin dashboard">
            <Image src="/buildez-logo-light.svg" alt="BuildEzy" width={170} height={84} priority className="h-12 w-[142px] object-contain object-left dark:hidden" />
            <Image src="/buildez-logo-dark.svg" alt="" width={170} height={84} priority className="hidden h-12 w-[142px] object-contain object-left dark:block" />
          </Link>
          <button className="rounded-lg p-2 dashboard-hover lg:hidden" onClick={() => setMobileOpen(false)}><X size={18} /></button>
        </div>
        <p className="mt-3 px-3 pb-2 text-[10px] font-semibold uppercase tracking-[.14em] dashboard-faint">Platform</p>
        <nav className="flex flex-col gap-1 overflow-y-auto">
          {navigation.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/super/dashboard" && pathname.startsWith(`${href}/`));
            return <Link key={href} href={href} onClick={() => setMobileOpen(false)} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${active ? "dashboard-nav-active" : "dashboard-muted dashboard-hover"}`}><Icon size={18} /><span>{label}</span></Link>;
          })}
        </nav>
      </aside>

      <div className="dashboard-workspace flex h-full min-w-0 flex-1 flex-col overflow-hidden rounded-[24px] border dashboard-border">
        <header className="relative z-40 flex h-[68px] shrink-0 items-center justify-between border-b dashboard-border px-4 text-[14px] text-[var(--dashboard-text)] backdrop-blur-xl md:px-8">
          <div className="flex items-center gap-3">
            <button className="rounded-lg p-2 dashboard-hover lg:hidden" onClick={() => setMobileOpen(true)}><Menu size={20} /></button>
            <div className="lg:hidden">
              <Image src="/buildez-logo-light.svg" alt="BuildEzy" width={88} height={23} className="block dark:hidden" />
              <Image src="/buildez-logo-dark.svg" alt="" width={88} height={23} className="hidden dark:block" />
            </div>
          </div>
          <form action="/super/users" className="relative hidden w-[360px] items-center xl:flex">
            <Search className="absolute left-3 h-4 w-4 text-slate-600 dark:text-slate-300" />
            <input name="q" placeholder="Search across BuildEZ..." aria-label="Search the platform" className="dashboard-input w-full rounded-xl py-2 pl-10 pr-4 text-[14px]" />
          </form>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div className="relative">
              <button onClick={() => setAccountOpen(v => !v)} className="flex h-9 items-center gap-2 rounded-xl px-1.5 dashboard-hover"><span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-xs font-bold text-white">{(admin.name || admin.email || "A")[0].toUpperCase()}</span><span className="hidden max-w-32 truncate text-xs font-semibold md:block">{admin.name || "Administrator"}</span></button>
              {accountOpen && <div className="dashboard-modal-surface absolute right-0 top-11 w-64 rounded-2xl border dashboard-border p-2 shadow-2xl"><div className="px-3 py-2"><p className="truncate text-sm font-semibold">{admin.name || "Super Administrator"}</p><p className="truncate text-xs dashboard-muted">{admin.email}</p></div><button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm dashboard-hover"><LogOut size={16}/> Sign out</button></div>}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 md:px-8"><div className="mx-auto w-full max-w-[1540px] pb-16">{children}</div></main>
      </div>
    </div>
  );
}
