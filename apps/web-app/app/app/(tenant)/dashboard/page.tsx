"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Globe2,
  Loader2,
  Plus,
  Sparkles,
  Users,
  WandSparkles,
} from "lucide-react";

import CopilotPromptCard from "../components/CopilotPromptCard";
import CreateSiteModal, {
  type CreatedSite,
  type CreateSiteIntent,
} from "../components/CreateSiteModal";

type WorkspaceAnalytics = {
  totals: {
    sites: number;
    publishedSites: number;
    pageViews: number;
    visitors: number;
    aiGenerations: number;
  };
  sites: Array<{
    id: string;
    name: string;
    slug: string;
    status: string;
    pageViews: number;
    visitors: number;
  }>;
};

export default function GlobalDashboardPage() {
  const router = useRouter();

  const [data, setData] = useState<WorkspaceAnalytics>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [createSiteOpen, setCreateSiteOpen] = useState(false);
  const [createIntent, setCreateIntent] =
    useState<CreateSiteIntent>("dashboard");

  function openCreateSite(intent: CreateSiteIntent) {
    setCreateIntent(intent);
    setCreateSiteOpen(true);
  }

  function loadAnalytics() {
    setLoading(true);
    setError("");

    fetch("/api/analytics/workspace", { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(
            payload?.error || "Workspace analytics could not be loaded.",
          );
        }

        setData(payload);
      })
      .catch((reason) =>
        setError(
          reason instanceof Error
            ? reason.message
            : "Workspace analytics could not be loaded.",
        ),
      )
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadAnalytics();
  }, []);

  function handleSiteCreated(
    site: CreatedSite,
    intent: CreateSiteIntent,
  ) {
    setCreateSiteOpen(false);

    if (intent === "ai") {
      router.push(`/app/builder-v3/${site.id}?panel=ai`);
      return;
    }

    router.push(`/app/${site.slug}/dashboard`);
  }

  return (
    <>
      <div className="mx-auto max-w-[1450px] pb-12">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-sm dashboard-muted">
              <Sparkles size={14} /> Workspace overview
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              Welcome back
            </h1>
            <p className="mt-1 text-sm dashboard-muted">
              Manage your websites and see real activity across your workspace.
            </p>
          </div>

          <button
            type="button"
            onClick={() => openCreateSite("dashboard")}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-500"
          >
            <Plus size={16} />
            New website
          </button>
        </div>

        {error ? (
          <div className="mb-5 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-600 dark:text-rose-300">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="dashboard-card flex h-56 items-center justify-center rounded-2xl">
            <Loader2 className="animate-spin text-blue-500" />
          </div>
        ) : (
          <>
            <section className="grid gap-4 sm:grid-cols-3">
              <Summary
                tone="blue"
                icon={Globe2}
                value={formatNumber(data?.totals.sites || 0)}
                label={`${data?.totals.publishedSites || 0} published websites`}
              />
              <Summary
                tone="cyan"
                icon={Users}
                value={formatNumber(data?.totals.visitors || 0)}
                label="Unique visitors · 30 days"
              />
              <Summary
                tone="amber"
                icon={WandSparkles}
                value={formatNumber(data?.totals.aiGenerations || 0)}
                label="AI generations · 30 days"
              />
            </section>

            <section className="mt-5 grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
              <CopilotPromptCard />

              <div className="dashboard-card rounded-2xl p-5 sm:p-6">
                <div className="flex items-center gap-2">
                  <Sparkles size={17} className="text-blue-500" />
                  <h2 className="font-semibold">Quick start</h2>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <Quick
                    onClick={() => openCreateSite("ai")}
                    title="Create with AI"
                    text="Describe your business and generate a complete site."
                  />
                  <Quick
                    href="/app/workspace/websites"
                    title="Choose a website"
                    text="Open an existing website and continue designing."
                  />
                  <Quick
                    href="/app/workspace/websites"
                    title="Manage publishing"
                    text="Review websites, domains, and publishing status."
                  />
                  <Quick
                    href="/app/workspace/billing"
                    title="Workspace plan"
                    text="Manage billing, limits, and workspace access."
                  />
                </div>
              </div>
            </section>

            <section className="mt-8">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Your websites</h2>
                  <p className="mt-1 text-xs dashboard-muted">
                    Real traffic from the last 30 days
                  </p>
                </div>

                <Link
                  href="/app/workspace/websites"
                  className="text-xs font-medium text-blue-600 dark:text-blue-400"
                >
                  View all
                </Link>
              </div>

              {!data?.sites.length ? (
                <div className="dashboard-card rounded-2xl p-10 text-center">
                  <Globe2 className="mx-auto dashboard-faint" />
                  <h3 className="mt-3 font-medium">No websites yet</h3>
                  <p className="mt-1 text-sm dashboard-muted">
                    Create your first website with AI or a template.
                  </p>

                  <button
                    type="button"
                    onClick={() => openCreateSite("dashboard")}
                    className="mt-5 inline-flex rounded-xl bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-500"
                  >
                    Create website
                  </button>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {data.sites.map((site) => (
                    <Link
                      key={site.id}
                      href={`/app/${site.slug}/dashboard`}
                      className="dashboard-card group overflow-hidden rounded-2xl"
                    >
                      <div className="relative flex h-36 items-center justify-center bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-transparent">
                        <Globe2 className="h-9 w-9 text-blue-500/60" />

                        <span
                          className={`absolute right-3 top-3 rounded-full px-2 py-1 text-[10px] font-semibold ${
                            site.status === "PUBLISHED"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
                              : "bg-black/5 dashboard-muted dark:bg-white/5"
                          }`}
                        >
                          {site.status}
                        </span>
                      </div>

                      <div className="p-4">
                        <div className="flex items-center">
                          <div>
                            <h3 className="font-medium">{site.name}</h3>
                            <p className="mt-1 text-xs dashboard-muted">
                              {site.slug}.buildez.site
                            </p>
                          </div>

                          <ArrowRight className="ml-auto h-4 w-4 dashboard-faint transition group-hover:translate-x-1" />
                        </div>

                        <div className="mt-4 flex gap-4 border-t dashboard-border pt-3 text-xs dashboard-muted">
                          <span>
                            <strong className="text-current">
                              {formatNumber(site.pageViews)}
                            </strong>{" "}
                            views
                          </span>
                          <span>
                            <strong className="text-current">
                              {formatNumber(site.visitors)}
                            </strong>{" "}
                            visitors
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>

      <CreateSiteModal
        open={createSiteOpen}
        intent={createIntent}
        onClose={() => setCreateSiteOpen(false)}
        onCreated={handleSiteCreated}
      />
    </>
  );
}

function Summary({
  icon: Icon,
  value,
  label,
  tone,
}: {
  icon: typeof Globe2;
  value: string;
  label: string;
  tone: string;
}) {
  return (
    <div
      className={`dashboard-card workspace-summary workspace-summary-${tone} flex items-center gap-4 rounded-2xl p-5`}
    >
      <span className="workspace-summary-icon flex h-10 w-10 items-center justify-center rounded-xl">
        <Icon size={18} />
      </span>

      <div>
        <p className="text-xl font-semibold">{value}</p>
        <p className="text-xs dashboard-muted">{label}</p>
      </div>
    </div>
  );
}

function Quick({
  href,
  title,
  text,
  onClick,
}: {
  href?: string;
  title: string;
  text: string;
  onClick?: () => void;
}) {
  const className =
    "dashboard-control block w-full rounded-xl border dashboard-border p-4 text-left dashboard-hover";

  const content = (
    <>
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-xs leading-5 dashboard-muted">{text}</p>
    </>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        {content}
      </button>
    );
  }

  return (
    <Link href={href || "/app/dashboard"} className={className}>
      {content}
    </Link>
  );
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en", {
    notation: value >= 10000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value);
}
