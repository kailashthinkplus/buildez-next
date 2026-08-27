"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

/* ============================================================
   TYPES
============================================================ */

export interface Website {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  faviconUrl?: string | null;
}

interface SubscriptionPlan {
  planCode: string;
  billingCycle: string;
  status: string;
  trialEnds?: string;
  plan?: {
    name: string;
    code: string;
  };
  Plan?: {
    name: string;
    code: string;
  };
}

interface Tenant {
  id: string;
  name: string;
}

interface WorkspaceContextProps {
  tenant: Tenant | null;
  websites: Website[];
  currentWebsite: Website | null;

  switchWebsite: (id: string) => void;

  plan: SubscriptionPlan | null;

  isWorkspaceOpen: boolean;
  toggleWorkspace: () => void;

  loading: boolean;
}

/* ============================================================
   CONTEXT
============================================================ */

const WorkspaceContext = createContext<WorkspaceContextProps | undefined>(
  undefined
);

const SITE_AREAS = new Set([
  "dashboard", "pages", "media", "cms", "themes", "apps", "shopez",
  "analytics", "insights", "crm", "ai", "forms", "settings", "builder",
  "plugins", "brand", "widgets",
]);

function routeSiteSlug(value: string | null | undefined) {
  const segments = value?.split("/").filter(Boolean) ?? [];
  return segments[0] === "app" && segments[1] && SITE_AREAS.has(segments[2] ?? "")
    ? segments[1]
    : null;
}

/* ============================================================
   PROVIDER
============================================================ */

export function WorkspaceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [websites, setWebsites] = useState<Website[]>([]);
  const [currentWebsite, setCurrentWebsite] = useState<Website | null>(null);
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [loading, setLoading] = useState(true);

  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(true);
  const toggleWorkspace = () => setIsWorkspaceOpen((prev) => !prev);

  /* ============================================================
     LOAD TENANT + SITES + PLAN
  ============================================================ */
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/tenant/me", {
          credentials: "include",
          cache: "no-store",
        });

        const json = await res.json();
        if (!json?.data) return;

        setTenant(json.data.tenant);

        const mappedSites: Website[] = (json.data.sites || []).map(
          (s: any) => ({
            id: s.id,
            name: s.name,
            slug: s.slug,
            logoUrl: typeof s.logoUrl === "string" ? s.logoUrl : null,
            faviconUrl: typeof s.settings?.faviconUrl === "string" ? s.settings.faviconUrl : null,
          })
        );

        setWebsites(mappedSites);

        const requestedSlug = routeSiteSlug(window.location.pathname);
        setCurrentWebsite(
          requestedSlug
            ? mappedSites.find((site) => site.slug === requestedSlug) ?? null
            : mappedSites[0] ?? null,
        );

        setPlan(json.data.plan ?? null);
      } catch (err) {
        console.error("WorkspaceContext load error:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  useEffect(() => {
    const requestedSlug = routeSiteSlug(pathname);
    if (!requestedSlug) return;
    const routeWebsite = websites.find((site) => site.slug === requestedSlug) ?? null;
    if (routeWebsite?.id !== currentWebsite?.id) {
      setCurrentWebsite(routeWebsite);
    }
  }, [currentWebsite?.id, pathname, websites]);

  /* ============================================================
     SITE SWITCH (EXPLICIT USER ACTION ONLY)
  ============================================================ */
  const switchWebsite = useCallback(
    (id: string) => {
      const site = websites.find((w) => w.id === id);
      if (!site) return;

      setCurrentWebsite(site);

      // ✅ Explicit navigation ONLY when user switches site
      router.push(`/app/${site.slug}/dashboard`);
    },
    [router, websites]
  );

  /* ============================================================
     PROVIDER VALUE
  ============================================================ */
  return (
    <WorkspaceContext.Provider
      value={{
        tenant,
        websites,
        currentWebsite,
        switchWebsite,

        plan,

        isWorkspaceOpen,
        toggleWorkspace,

        loading,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

/* ============================================================
   HOOK
============================================================ */

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used inside a WorkspaceProvider");
  }
  return context;
}
