"use client";

import { createPortal } from "react-dom";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  Bot,
  Eye,
  FolderKanban,
  Globe2,
  LayoutGrid,
  Loader2,
  Plus,
  Search,
  Sparkles,
  Users,
  WandSparkles,
  X,
} from "lucide-react";

import CopilotPromptCard from "../components/CopilotPromptCard";
import CreateSiteModal, {
  type CreatedSite,
  type CreateSiteIntent,
} from "../components/CreateSiteModal";
import { WebsiteThumbnail } from "../components/WebsiteThumbnail";
import WebsiteActionsMenu from "../components/WebsiteActionsMenu";
import { publishedSitePath } from "@/lib/runtime/published-site-path";
import { stashPendingAttachments } from "@/modules/ai-v12/pendingAttachments";

const PLATFORM_DOMAIN = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "getbuildezy.com";

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
    archived: boolean;
    pageViews: number;
    visitors: number;
  }>;
};

export default function GlobalDashboardPage() {
  const router = useRouter();

  const [data, setData] = useState<WorkspaceAnalytics>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [createSiteOpen, setCreateSiteOpen] = useState(false);
  const [createIntent, setCreateIntent] =
    useState<CreateSiteIntent>("dashboard");
  const [pendingAiPrompt, setPendingAiPrompt] = useState("");
  const [aiDestinationOpen, setAiDestinationOpen] = useState(false);

  const matchingSites = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return data?.sites ?? [];

    return (data?.sites ?? []).filter(
      (site) =>
        site.name.toLowerCase().includes(query) ||
        site.slug.toLowerCase().includes(query) ||
        site.status.toLowerCase().includes(query),
    );
  }, [data?.sites, search]);

  const visibleSites = useMemo(
    () => matchingSites.filter((site) => !site.archived),
    [matchingSites],
  );
  const archivedSites = useMemo(
    () => matchingSites.filter((site) => site.archived),
    [matchingSites],
  );

  function handleSiteChanged(patch: { id: string; status: string; archived: boolean }) {
    setData((current) => {
      if (!current) return current;

      const sites = current.sites.map((site) =>
        site.id === patch.id ? { ...site, status: patch.status, archived: patch.archived } : site,
      );
      const activeSites = sites.filter((site) => !site.archived);

      return {
        ...current,
        sites,
        totals: {
          ...current.totals,
          sites: activeSites.length,
          publishedSites: activeSites.filter((site) => site.status === "PUBLISHED").length,
        },
      };
    });
  }

  function openCreateSite(
    intent: CreateSiteIntent,
    prompt?: string,
  ) {
    setCreateIntent(intent);

    if (intent === "ai" && typeof prompt === "string") {
      setPendingAiPrompt(prompt.trim());
    }

    if (intent !== "ai") {
      setPendingAiPrompt("");
    }

    setAiDestinationOpen(false);
    setCreateSiteOpen(true);
  }

  function openAiDestination(prompt = "", attachments?: File[]) {
    setPendingAiPrompt(prompt.trim());
    stashPendingAttachments(attachments ?? []);
    setAiDestinationOpen(true);
  }

  function closeAiDestination() {
    setAiDestinationOpen(false);
    setPendingAiPrompt("");
    stashPendingAttachments([]);
  }

  function openExistingWebsite(siteId: string) {
    const query = new URLSearchParams({
      panel: "ai",
      context: "Website",
    });

    if (pendingAiPrompt) {
      query.set("prompt", pendingAiPrompt.slice(0, 4000));
    }

    setAiDestinationOpen(false);
    router.push(`/app/builder-v3/${siteId}?${query.toString()}`);
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
      const query = new URLSearchParams({
        panel: "ai",
        context: "Website",
      });

      if (pendingAiPrompt) {
        query.set("prompt", pendingAiPrompt.slice(0, 4000));
      }

      router.push(`/app/builder-v3/${site.id}?${query.toString()}`);
      return;
    }

    router.push(`/app/${site.slug}/dashboard`);
  }

  return (
    <>
      <main className="mx-auto w-full max-w-[1540px] pb-16">
        <section className="relative overflow-hidden rounded-[30px] border dashboard-border bg-[#07101d] text-white shadow-xl">
          <img
            src="/dashboard/buildez-workspace-aurora.svg"
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/20 to-transparent" />

          <div className="relative flex min-h-[290px] flex-col justify-between gap-8 p-7 sm:p-9 lg:flex-row lg:items-end lg:p-11">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/15 px-3 py-1.5 text-xs font-medium text-white/80 backdrop-blur-md">
                <Sparkles size={13} />
                BuildEZ Workspace
              </div>

              <h1 className="mt-5 max-w-xl text-3xl font-semibold tracking-[-0.035em] sm:text-4xl lg:text-5xl">
                Build, manage and grow every website from one place.
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-6 text-white/70 sm:text-base">
                Create with AI, edit visually, publish instantly and track
                performance across your entire workspace.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => openAiDestination()}
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/15"
              >
                <WandSparkles size={16} />
                Create with AI
              </button>

              <button
                type="button"
                onClick={() => openCreateSite("dashboard")}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white/90"
              >
                <Plus size={16} />
                New website
              </button>
            </div>
          </div>
        </section>

        {error ? (
          <div className="mt-5 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-600 dark:text-rose-300">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="dashboard-card mt-5 flex h-64 items-center justify-center rounded-3xl">
            <Loader2 className="animate-spin dashboard-muted" />
          </div>
        ) : (
          <>
            <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                icon={FolderKanban}
                label="Websites"
                value={formatNumber(data?.totals.sites || 0)}
                helper={`${data?.totals.publishedSites || 0} published`}
                tone="indigo"
              />
              <MetricCard
                icon={Eye}
                label="Page views"
                value={formatNumber(data?.totals.pageViews || 0)}
                helper="Last 30 days"
                tone="cyan"
              />
              <MetricCard
                icon={Users}
                label="Visitors"
                value={formatNumber(data?.totals.visitors || 0)}
                helper="Unique visitors"
                tone="emerald"
              />
              <MetricCard
                icon={Bot}
                label="AI generations"
                value={formatNumber(data?.totals.aiGenerations || 0)}
                helper="Last 30 days"
                tone="violet"
              />
            </section>

            <section className="mt-6 grid gap-5 xl:grid-cols-[1.18fr_.82fr]">
              <CopilotPromptCard
                onSubmit={(prompt, attachments) =>
                  openAiDestination(prompt, attachments)
                }
              />

              <div className="dashboard-card rounded-3xl p-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] dashboard-faint">
                      Quick actions
                    </p>
                    <h2 className="mt-1 text-lg font-semibold">
                      Start something new
                    </h2>
                  </div>

                  <Sparkles size={18} className="dashboard-faint" />
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <ActionCard
                    icon={WandSparkles}
                    title="Generate with AI"
                    text="Start from a prompt."
                    onClick={() => openAiDestination()}
                  />
                  <ActionCard
                    icon={LayoutGrid}
                    title="Browse websites"
                    text="Manage existing projects."
                    href="/app/workspace/websites"
                  />
                  <ActionCard
                    icon={BarChart3}
                    title="View analytics"
                    text="Review workspace traffic."
                    href="/app/workspace/analytics"
                  />
                  <ActionCard
                    icon={Globe2}
                    title="Domains and publishing"
                    text="Connect and publish."
                    href="/app/workspace/websites"
                  />
                </div>
              </div>
            </section>

            <section className="mt-9">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] dashboard-faint">
                    Projects
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                    Your websites
                  </h2>
                  <p className="mt-1 text-sm dashboard-muted">
                    Open, manage and monitor every website in your workspace.
                  </p>
                </div>

                <div className="flex w-full items-center gap-3 sm:w-auto">
                  <label className="dashboard-input flex min-w-0 flex-1 items-center gap-2 rounded-xl px-3 py-2.5 sm:w-72">
                    <Search size={16} className="dashboard-faint" />
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search websites"
                      className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:dashboard-faint"
                    />
                  </label>

                  <Link
                    href="/app/workspace/websites"
                    className="dashboard-subtle inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium dashboard-hover"
                  >
                    View all
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </div>

              {!data?.sites.length ? (
                <div className="dashboard-card mt-5 rounded-3xl p-12 text-center">
                  <span className="dashboard-subtle mx-auto flex h-14 w-14 items-center justify-center rounded-2xl">
                    <Globe2 className="dashboard-muted" />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold">
                    Create your first website
                  </h3>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 dashboard-muted">
                    Start with AI, a blank workspace or an existing design.
                  </p>
                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => openAiDestination()}
                      className="dashboard-subtle rounded-xl px-4 py-2.5 text-sm font-semibold dashboard-hover"
                    >
                      Create with AI
                    </button>
                    <button
                      type="button"
                      onClick={() => openCreateSite("dashboard")}
                      className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500"
                    >
                      New website
                    </button>
                  </div>
                </div>
              ) : visibleSites.length === 0 && archivedSites.length === 0 ? (
                <div className="dashboard-card mt-5 rounded-3xl p-10 text-center">
                  <Search className="mx-auto dashboard-faint" />
                  <h3 className="mt-3 font-semibold">No matching websites</h3>
                  <p className="mt-1 text-sm dashboard-muted">
                    Try searching by website name, address or status.
                  </p>
                </div>
              ) : (
                <>
                  {visibleSites.length > 0 && (
                    <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                      {visibleSites.map((site) => (
                        <WebsiteCard
                          key={site.id}
                          site={site}
                          onChanged={handleSiteChanged}
                        />
                      ))}
                    </div>
                  )}

                  {archivedSites.length > 0 && (
                    <details className="mt-8 group/archived">
                      <summary className="cursor-pointer list-none text-sm font-medium dashboard-muted hover:dashboard-hover">
                        Archived websites ({archivedSites.length})
                      </summary>
                      <div className="mt-4 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                        {archivedSites.map((site) => (
                          <WebsiteCard
                            key={site.id}
                            site={site}
                            onChanged={handleSiteChanged}
                          />
                        ))}
                      </div>
                    </details>
                  )}
                </>
              )}
            </section>
          </>
        )}
      </main>

      {typeof document !== "undefined" && aiDestinationOpen
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="ai-destination-title"
              className="fixed inset-0 z-[120] flex items-center justify-center bg-black/25 p-4 backdrop-blur-xl"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                  closeAiDestination();
                }
              }}
            >
              <div className="dashboard-modal-surface max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border dashboard-border shadow-2xl backdrop-blur-2xl">
                <div className="flex items-start justify-between border-b dashboard-border p-5 sm:p-6">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.1em] dashboard-faint">
                      AI website destination
                    </p>

                    <h2
                      id="ai-destination-title"
                      className="mt-1 text-xl font-semibold"
                    >
                      Where should BuildEZ work?
                    </h2>

                    <p className="mt-1 text-sm dashboard-muted">
                      Continue with an existing website or create a new one.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={closeAiDestination}
                    aria-label="Close website selection"
                    className="rounded-xl border dashboard-border p-2 dashboard-hover"
                  >
                    <X size={18} />
                  </button>
                </div>

                {pendingAiPrompt ? (
                  <div className="dashboard-subtle mx-5 mt-5 rounded-2xl border dashboard-border p-4 sm:mx-6">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.1em] dashboard-faint">
                      Your request
                    </p>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 dashboard-muted">
                      {pendingAiPrompt}
                    </p>
                  </div>
                ) : null}

                <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[1fr_.8fr]">
                  <section className="dashboard-card rounded-2xl border dashboard-border p-5">
                    <div className="flex items-center gap-3">
                      <span className="dashboard-subtle flex h-10 w-10 items-center justify-center rounded-xl">
                        <Globe2 size={19} />
                      </span>

                      <div>
                        <h3 className="font-semibold">Use existing website</h3>
                        <p className="text-xs dashboard-muted">
                          Continue building a current website.
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 space-y-2">
                      {!data?.sites.filter((site) => !site.archived).length ? (
                        <div className="rounded-xl border border-dashed dashboard-border p-5 text-center">
                          <p className="text-sm font-medium">
                            No existing websites
                          </p>
                          <p className="mt-1 text-xs dashboard-muted">
                            Create your first website to continue.
                          </p>
                        </div>
                      ) : (
                        data.sites.filter((site) => !site.archived).map((site) => (
                          <button
                            key={site.id}
                            type="button"
                            onClick={() => openExistingWebsite(site.id)}
                            className="dashboard-control flex w-full items-center gap-3 rounded-xl border dashboard-border p-3 text-left dashboard-hover"
                          >
                            <span className="dashboard-subtle flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                              <Globe2 size={16} />
                            </span>

                            <span className="min-w-0">
                              <span className="block truncate text-sm font-medium">
                                {site.name}
                              </span>
                              <span className="block truncate text-xs dashboard-muted">
                                {PLATFORM_DOMAIN}{publishedSitePath(site.slug)}
                              </span>
                            </span>

                            <ArrowRight
                              size={16}
                              className="ml-auto shrink-0 dashboard-faint"
                            />
                          </button>
                        ))
                      )}
                    </div>
                  </section>

                  <section className="dashboard-card flex flex-col rounded-2xl border dashboard-border p-5">
                    <span className="dashboard-subtle flex h-10 w-10 items-center justify-center rounded-xl">
                      <Plus size={19} />
                    </span>

                    <h3 className="mt-4 font-semibold">Create new website</h3>

                    <p className="mt-2 text-sm leading-6 dashboard-muted">
                      Start a new workspace and continue in Builder 3 with
                      the AI panel ready.
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        openCreateSite("ai", pendingAiPrompt)
                      }
                      className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-500 lg:mt-auto"
                    >
                      <Plus size={16} />
                      Create new website
                    </button>
                  </section>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}

      <CreateSiteModal
        open={createSiteOpen}
        intent={createIntent}
        onClose={() => {
          setCreateSiteOpen(false);
          setPendingAiPrompt("");
          if (createIntent === "ai") stashPendingAttachments([]);
        }}
        onCreated={handleSiteCreated}
      />
    </>
  );
}


function MetricCard({
  icon: Icon,
  label,
  value,
  helper,
  tone,
}: {
  icon: typeof Globe2;
  label: string;
  value: string;
  helper: string;
  tone: "indigo" | "cyan" | "emerald" | "violet";
}) {
  const tones = {
    indigo: {
      card:
        "border-indigo-500/15 bg-gradient-to-br from-indigo-500/[0.10] via-indigo-500/[0.035] to-transparent",
      icon:
        "bg-indigo-500/12 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-300",
      value: "text-indigo-700 dark:text-indigo-300",
      glow: "bg-indigo-500/15",
    },
    cyan: {
      card:
        "border-cyan-500/15 bg-gradient-to-br from-cyan-500/[0.10] via-cyan-500/[0.035] to-transparent",
      icon:
        "bg-cyan-500/12 text-cyan-700 dark:bg-cyan-400/10 dark:text-cyan-300",
      value: "text-cyan-700 dark:text-cyan-300",
      glow: "bg-cyan-500/15",
    },
    emerald: {
      card:
        "border-emerald-500/15 bg-gradient-to-br from-emerald-500/[0.10] via-emerald-500/[0.035] to-transparent",
      icon:
        "bg-emerald-500/12 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300",
      value: "text-emerald-700 dark:text-emerald-300",
      glow: "bg-emerald-500/15",
    },
    violet: {
      card:
        "border-violet-500/15 bg-gradient-to-br from-violet-500/[0.10] via-violet-500/[0.035] to-transparent",
      icon:
        "bg-violet-500/12 text-violet-700 dark:bg-violet-400/10 dark:text-violet-300",
      value: "text-violet-700 dark:text-violet-300",
      glow: "bg-violet-500/15",
    },
  } as const;

  const palette = tones[tone];

  return (
    <article
      className={`dashboard-card relative overflow-hidden rounded-2xl border p-5 ${palette.card}`}
    >
      <div
        className={`pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full blur-3xl ${palette.glow}`}
      />

      <div className="relative flex items-start justify-between">
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${palette.icon}`}
        >
          <Icon size={18} />
        </span>

        <span className="rounded-full border dashboard-border px-2 py-1 text-[10px] font-medium dashboard-faint">
          Live
        </span>
      </div>

      <div className="relative mt-5">
        <p className="text-xs font-medium dashboard-muted">{label}</p>

        <div
          className={`mt-1 text-3xl font-semibold tracking-[-0.035em] ${palette.value}`}
        >
          {value}
        </div>

        <p className="mt-1 text-xs dashboard-faint">{helper}</p>
      </div>
    </article>
  );
}

function ActionCard({
  icon: Icon,
  title,
  text,
  href,
  onClick,
}: {
  icon: typeof Globe2;
  title: string;
  text: string;
  href?: string;
  onClick?: () => void;
}) {
  const content = (
    <>
      <span className="dashboard-subtle flex h-9 w-9 items-center justify-center rounded-xl">
        <Icon size={16} />
      </span>
      <div className="mt-4 font-medium">{title}</div>
      <div className="mt-1 text-xs leading-5 dashboard-muted">{text}</div>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="dashboard-control rounded-2xl border dashboard-border p-4 dashboard-hover"
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="dashboard-control rounded-2xl border dashboard-border p-4 text-left dashboard-hover"
    >
      {content}
    </button>
  );
}

function WebsiteCard({
  site,
  onChanged,
}: {
  site: WorkspaceAnalytics["sites"][number];
  onChanged: (patch: { id: string; status: string; archived: boolean }) => void;
}) {
  return (
    <article className={`dashboard-card group overflow-hidden rounded-3xl ${site.archived ? "opacity-70" : ""}`}>
      <Link
        href={`/app/${site.slug}/dashboard`}
        className="relative block h-52 overflow-hidden bg-slate-900"
      >
        <WebsiteThumbnail siteId={site.id} siteName={site.name} siteStatus={site.status} className="h-full w-full transition duration-300 group-hover:scale-[1.015]" />

        <span className="absolute right-3 top-3 rounded-full border border-white/15 bg-black/25 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-md">
          {site.archived ? "ARCHIVED" : site.status}
        </span>
      </Link>

      <div className="p-5">
        <div className="flex items-start gap-3">
          <div className="min-w-0">
            <h3 className="truncate font-semibold">{site.name}</h3>
            <p className="mt-1 truncate text-xs dashboard-muted">
              {PLATFORM_DOMAIN}{publishedSitePath(site.slug)}
            </p>
          </div>

          <div className="ml-auto">
            <WebsiteActionsMenu site={site} onChanged={onChanged} />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-5 border-t dashboard-border pt-4 text-xs dashboard-muted">
          <span>
            <strong className="font-semibold text-current">
              {formatNumber(site.pageViews)}
            </strong>{" "}
            views
          </span>
          <span>
            <strong className="font-semibold text-current">
              {formatNumber(site.visitors)}
            </strong>{" "}
            visitors
          </span>

          <Link
            href={`/app/${site.slug}/dashboard`}
            className="ml-auto inline-flex items-center gap-1 font-semibold"
          >
            Open
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </article>
  );
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: value >= 10000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value);
}
