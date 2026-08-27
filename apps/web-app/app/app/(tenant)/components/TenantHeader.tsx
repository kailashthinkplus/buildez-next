"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Menu,
  CircleHelp,
  Crown,
  Search,
  LayoutGrid,
} from "lucide-react";
import { WebsiteSwitcher } from "./WebsiteSwitcher";
import { useWorkspace } from "./WorkspaceContext";
import { usePathname, useRouter } from "next/navigation";
import ThemeToggle from "../../components/ThemeToggle";
import AccountMenu from "../../components/AccountMenu";

export function TenantHeader({
  setMobileSidebarOpen,
}: {
  setMobileSidebarOpen: (v: boolean) => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<Array<{ id: string; type: string; title: string; subtitle: string; href: string }>>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [highestPlanCode, setHighestPlanCode] = useState<string | null>(null);

  const { plan } = useWorkspace();

  useEffect(() => {
    let cancelled = false;
    fetch("/api/plans?active=true&public=true", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Plans unavailable");
        return response.json();
      })
      .then((plans: Array<{
        code: string;
        maxSites: number;
        maxPages: number;
        aiCredits: number;
        teamMembers: number;
      }>) => {
        if (cancelled || !Array.isArray(plans) || !plans.length) return;
        const highest = plans.find((candidate) =>
          plans.every((other) =>
            candidate.maxSites >= other.maxSites &&
            candidate.maxPages >= other.maxPages &&
            candidate.aiCredits >= other.aiCredits &&
            candidate.teamMembers >= other.teamMembers,
          ),
        );
        if (highest) setHighestPlanCode(highest.code.toUpperCase());
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = search.trim();
    if (!query) return;
    setSearchOpen(false);
    router.push(`/app/search?q=${encodeURIComponent(query)}`);
  }

  useEffect(() => {
    const query = search.trim();
    if (query.length < 2) { setSearchResults([]); setSearchLoading(false); return; }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setSearchLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, { cache: "no-store", signal: controller.signal });
        const payload = await response.json();
        setSearchResults(Array.isArray(payload.results) ? payload.results.slice(0, 8) : []);
        setSearchOpen(true);
      } catch { if (!controller.signal.aborted) setSearchResults([]); }
      finally { if (!controller.signal.aborted) setSearchLoading(false); }
    }, 220);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [search]);

  /* ------------------------------------------------
     SHOW BACK BUTTON ONLY INSIDE SITE DASHBOARD
     /app/[siteSlug]/...
  ------------------------------------------------ */
  const routeParts = pathname?.split("/").filter(Boolean) ?? [];
  const workspaceRoutes = new Set([
    "dashboard",
    "profile",
    "help",
    "media",
    "pages",
    "settings",
    "search",
  ]);
  const isSiteDashboard =
    routeParts[0] === "app" &&
    Boolean(routeParts[1]) &&
    !workspaceRoutes.has(routeParts[1]);

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

  const planCode = plan?.planCode ?? plan?.Plan?.code ?? "FREE";
  const normalizedPlanCode = planCode.toUpperCase();
  const color = planColors[planCode.toLowerCase()] || "#3B82F6";
  const label = plan?.Plan?.name ?? plan?.plan?.name ?? normalizedPlanCode;
  const canUpgrade = Boolean(
    highestPlanCode && normalizedPlanCode !== highestPlanCode,
  );

  return (
    <header
      className="
        relative z-40
        h-[68px] flex items-center justify-between
        px-4 md:px-8
        text-[14px]
        border-b dashboard-border
        backdrop-blur-xl
        text-[var(--dashboard-text)]
      "
    >
      {/* LEFT */}
      <div className="flex min-w-0 items-center gap-3">
        {/* MOBILE MENU */}
        <div className="flex items-center gap-3 md:hidden">
          <button
            className="p-2 rounded-lg dashboard-hover transition"
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
              dashboard-subtle
              border dashboard-border
              dashboard-hover
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
      <form
        onSubmit={submitSearch}
        role="search"
        className="relative hidden w-[360px] items-center xl:flex"
      >
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-600 dark:text-slate-300" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search across BuildEZ..."
          aria-label="Search websites, pages, media, products and platform links"
          onFocus={()=>{if(search.trim().length>=2)setSearchOpen(true)}}
          onBlur={()=>window.setTimeout(()=>setSearchOpen(false),150)}
          className="
            pl-10 pr-4 py-2 w-full rounded-xl
            dashboard-input
            text-[14px]
          "
        />
        {searchOpen ? <div className="dashboard-modal-surface absolute left-0 right-0 top-11 z-[90] overflow-hidden rounded-2xl border dashboard-border p-2 shadow-2xl backdrop-blur-xl">{searchLoading?<div className="p-4 text-center text-xs dashboard-muted">Searching your workspace…</div>:searchResults.length?<>{searchResults.map(result=><Link key={result.id} href={result.href} onMouseDown={event=>event.preventDefault()} onClick={()=>setSearchOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 dashboard-hover"><span className="min-w-14 rounded-md bg-blue-500/10 px-1.5 py-1 text-center text-[9px] font-semibold uppercase text-blue-600 dark:text-blue-300">{result.type}</span><span className="min-w-0"><strong className="block truncate text-xs">{result.title}</strong><span className="block truncate text-[10px] dashboard-muted">{result.subtitle}</span></span></Link>)}<button type="submit" className="mt-1 flex w-full items-center justify-center gap-2 border-t dashboard-border px-3 pt-3 text-xs font-semibold text-blue-600 dark:text-blue-300"><Search size={13}/>View all results</button></>:<div className="p-4 text-center text-xs dashboard-muted">No matching websites, pages, media, products or links.</div>}</div>:null}
      </form>

      {/* RIGHT */}
      <div className="flex items-center gap-2">
        {canUpgrade ? (
          <Link
            href="/app/workspace/billing?upgrade=1"
            className="dashboard-primary-button inline-flex h-9 items-center gap-2 rounded-xl px-3 text-xs font-semibold text-white"
          >
            <Crown size={15} />
            <span className="hidden sm:inline">Upgrade</span>
          </Link>
        ) : null}

        <ThemeToggle />

        <Link
          href="/app/help"
          title="Help and support"
          aria-label="Help and support"
          className="hidden h-9 w-9 items-center justify-center rounded-xl dashboard-hover sm:flex"
        >
          <CircleHelp className="h-[18px] w-[18px] dashboard-muted" />
        </Link>

        <AccountMenu compact={false} />
      </div>
    </header>
  );
}
