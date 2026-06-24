import { prisma } from "@buildez/db";
import { v4 as uuidv4 } from "uuid";
import { logExecutionContext } from "./logExecutionContext";

/* ============================================================
   TYPES
============================================================ */

export type ExecutionContext = {
  tenantId: string;
  userId: string;

  siteId: string;
  siteSlug: string;

  pageId?: string;
  pageSlug?: string;

  scope: "site" | "page";

  source:
    | "builder"
    | "ai"
    | "publish"
    | "runtime"
    | "admin";

  requestId: string;
};

type ResolveExecutionContextArgs = {
  req: Request;
  params?: {
    siteSlug?: string;
    pageSlug?: string;
  };
  query?: {
    siteId?: string;
    pageId?: string;
  };
  scope: "site" | "page";
  source: ExecutionContext["source"];
  tenantId: string;
  userId: string;
};

/* ============================================================
   RESOLVER (CANONICAL — PURE)
============================================================ */

export async function resolveExecutionContext(
  args: ResolveExecutionContextArgs
): Promise<ExecutionContext> {
  const {
    req,
    params,
    query,
    scope,
    source,
    tenantId,
    userId,
  } = args;

  /* ------------------------------------------------------------
     1️⃣ AUTH CONTEXT
  ------------------------------------------------------------ */

  if (!tenantId || !userId) {
    throw new Error("Invalid auth context");
  }

  /* ------------------------------------------------------------
     2️⃣ SITE RESOLUTION
     Priority: siteId > siteSlug > pageId
  ------------------------------------------------------------ */

  let site: { id: string; slug: string } | null = null;

  if (query?.siteId) {
    site = await prisma.site.findFirst({
      where: { id: query.siteId, tenantId },
      select: { id: true, slug: true },
    });
  }

  if (!site && params?.siteSlug) {
    site = await prisma.site.findFirst({
      where: { slug: params.siteSlug, tenantId },
      select: { id: true, slug: true },
    });
  }

  // ✅ PAGE → SITE → TENANT (AI fallback)
  if (!site && query?.pageId) {
    const pageWithSite = await prisma.page.findFirst({
      where: {
        id: query.pageId,
        site: {
          tenantId,
        },
      },
      select: {
        site: {
          select: { id: true, slug: true },
        },
      },
    });

    if (pageWithSite?.site) {
      site = {
        id: pageWithSite.site.id,
        slug: pageWithSite.site.slug,
      };
    }
  }

  if (!site) {
    throw new Error("Unable to resolve site for tenant");
  }

  /* ------------------------------------------------------------
     3️⃣ PAGE RESOLUTION
  ------------------------------------------------------------ */

  let page: { id: string; slug: string } | null = null;

  if (scope === "page") {
    if (query?.pageId) {
      page = await prisma.page.findFirst({
        where: {
          id: query.pageId,
          siteId: site.id,
        },
        select: { id: true, slug: true },
      });
    }

    if (!page && params?.pageSlug) {
      page = await prisma.page.findFirst({
        where: {
          slug: params.pageSlug,
          siteId: site.id,
        },
        select: { id: true, slug: true },
      });
    }

    if (!page) {
      throw new Error("Unable to resolve page for site");
    }
  }

  /* ------------------------------------------------------------
     4️⃣ FINAL CONTEXT
  ------------------------------------------------------------ */

  const requestId =
    req.headers.get("x-request-id") ?? uuidv4();

  const resolvedContext: ExecutionContext = {
    tenantId,
    userId,
    siteId: site.id,
    siteSlug: site.slug,
    pageId: page?.id,
    pageSlug: page?.slug,
    scope,
    source,
    requestId,
  };

  logExecutionContext(resolvedContext, {
    label: "Resolved ExecutionContext",
    requestId,
  });

  return resolvedContext;
}
