import { notFound, redirect } from "next/navigation";
import { prisma } from "@buildez/db";

import { getSession } from "@/lib/auth/getSession";
import Builder3Canvas from "./Builder3Canvas";

type BuilderSearchParams = {
  pageId?: string;
  panel?: string;
  prompt?: string;
  context?: string;
  autorun?: string;
};

const AGENT_CONTEXTS = [
  "Website",
  "Page",
  "Selected element",
  "Image",
] as const;

type AgentContext = (typeof AGENT_CONTEXTS)[number];

function normalizePrompt(value: string | undefined) {
  return typeof value === "string"
    ? value.trim().slice(0, 4000)
    : "";
}

function normalizeContext(value: string | undefined): AgentContext {
  return AGENT_CONTEXTS.includes(value as AgentContext)
    ? (value as AgentContext)
    : "Website";
}

export default async function Builder3Page({
  params,
  searchParams,
}: {
  params: Promise<{ siteId: string }>;
  searchParams: Promise<BuilderSearchParams>;
}) {
  const auth = await getSession();

  if (!auth?.user) {
    redirect("/app/login");
  }

  if (!auth.tenant) {
    redirect("/app/onboarding");
  }

  const { siteId } = await params;
  const requested = await searchParams;

  const site = await prisma.site.findFirst({
    where: {
      id: siteId,
      tenantId: auth.tenant.id,
      deletedAt: null,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      domains: { where: { status: "VERIFIED" }, select: { domain: true }, take: 1 },
    },
  });

  if (!site) {
    notFound();
  }

  const page = await prisma.page.findFirst({
    where: {
      siteId: site.id,
      deletedAt: null,
      ...(requested.pageId ? { id: requested.pageId } : {}),
    },
    orderBy: {
      createdAt: "asc",
    },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      metadata: true,
      publishedAt: true,
      scheduledPublishAt: true,
      customCss: true,
      customJs: true,
    },
  });

  const metadata =
    page?.metadata &&
    typeof page.metadata === "object" &&
    !Array.isArray(page.metadata)
      ? (page.metadata as Record<string, unknown>)
      : {};

  return (
    <Builder3Canvas
      siteId={site.id}
      siteName={site.name}
      siteSlug={site.slug}
      verifiedDomain={site.domains[0]?.domain ?? null}
      initialPanel={
        requested.panel === "ai"
          ? "ai"
          : requested.panel === "insights"
            ? "insights"
            : undefined
      }
      initialPrompt={normalizePrompt(requested.prompt)}
      initialContext={normalizeContext(requested.context)}
      initialAutoSubmit={requested.autorun === "1"}
      page={
        page
          ? {
              id: page.id,
              title: page.title,
              slug: page.slug,
              status: page.status,
              seoTitle: String(metadata.seoTitle ?? ""),
              seoDescription: String(metadata.seoDescription ?? ""),
              faviconUrl: String(metadata.faviconUrl ?? ""),
              publishedAt: page.publishedAt ? page.publishedAt.toISOString() : null,
              scheduledPublishAt: page.scheduledPublishAt ? page.scheduledPublishAt.toISOString() : null,
              customCss: page.customCss ?? "",
              customJs: page.customJs ?? "",
            }
          : undefined
      }
    />
  );
}
