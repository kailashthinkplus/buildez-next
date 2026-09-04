import { revalidatePath } from "next/cache";
import { Prisma, prisma } from "@buildez/db";
import { resolveBlueprintTree, type BlueprintData } from "@/modules/builder/runtime/resolveBlueprintTree";
import { isBuilderV2Blueprint } from "@/modules/builder-v2/runtime/isBuilderV2Blueprint";
import { publishedSitePath } from "@/lib/runtime/published-site-path";
import { invalidateRouteCache } from "@/lib/runtime/routeCache";

/*
 * The single publish implementation — used by the manual publish route
 * (app/api/pages/[pageId]/publish/route.ts, after it resolves and authorizes
 * the tenant-scoped execution context) and by the scheduled-publish scanner
 * below, which runs outside an HTTP request context. Self-contained: looks up
 * siteId/tenantId from the page itself rather than requiring a caller-supplied
 * auth context.
 *
 * Deliberately does not import modules/runtime/v12PublishedBundle.ts, even
 * dynamically — this file (via runDuePublishScans) is reached by
 * instrumentation.ts's `await import(...)`, which Next.js also compiles for
 * an edge-like target. v12PublishedBundle.ts uses node:child_process/node:fs
 * directly, which that edge compilation can't bundle at all (confirmed: even
 * a nested dynamic import inside this function still broke the build).
 * Callers that need the eager republish-bundle build (see
 * lib/publishing/buildAfterPublish.ts) trigger it themselves, from route
 * handlers that are never part of that bundle graph.
 */
export async function publishPageNow(pageId: string) {
  const page = await prisma.page.findFirst({
    where: { id: pageId, deletedAt: null, deleted: false, site: { deletedAt: null } },
    include: {
      blueprint: true,
      site: { select: { id: true, tenantId: true, slug: true } },
    },
  });

  if (!page) {
    throw new Error(`Page ${pageId} not found or not publishable`);
  }

  const siteId = page.site.id;
  const tenantId = page.site.tenantId;

  const blueprintData = page.blueprint?.data;
  const project = !blueprintData
    ? await prisma.v12Project.findUnique({
        where: { siteId },
        include: {
          files: { select: { path: true, contentHash: true, revision: true }, orderBy: { path: "asc" } },
        },
      })
    : null;

  if (!blueprintData && !project?.files.length) {
    throw new Error("Page has no publishable source");
  }

  const snapshotContent = blueprintData
    ? (isBuilderV2Blueprint(blueprintData) ? blueprintData : resolveBlueprintTree(blueprintData as unknown as BlueprintData))
    : { version: 12, renderMode: "REACT", projectId: project!.id, revision: project!.currentRevision, files: project!.files };
  const publishedRenderMode = blueprintData ? "BLUEPRINT" : "REACT";

  await prisma.$transaction(async (tx) => {
    const lastSnapshot = await tx.siteSnapshot.findFirst({
      where: { siteId, tenantId },
      orderBy: { version: "desc" },
    });

    const nextVersion = (lastSnapshot?.version ?? 0) + 1;

    const siteSnapshot = await tx.siteSnapshot.create({
      data: { siteId, tenantId, status: "PUBLISHED", version: nextVersion },
    });

    await tx.pageSnapshot.create({
      data: {
        siteSnapshotId: siteSnapshot.id,
        pageId: page.id,
        title: page.title,
        slug: page.slug,
        content: snapshotContent as unknown as Prisma.InputJsonValue,
      },
    });

    const updatedPage = await tx.page.updateMany({
      where: { id: page.id, siteId, deletedAt: null, deleted: false },
      data: {
        status: "PUBLISHED",
        renderMode: publishedRenderMode,
        publishedAt: new Date(),
        scheduledPublishAt: null,
      },
    });

    const updatedSite = await tx.site.updateMany({
      where: { id: siteId, tenantId, deletedAt: null },
      data: { status: "PUBLISHED" },
    });

    if (updatedPage.count !== 1 || updatedSite.count !== 1) {
      throw new Error("Publish target no longer belongs to this workspace");
    }

    // Pin what "published" means for this project's file revision — the
    // runtime bundle build below is gated on this, not on live editing HEAD
    // (project.currentRevision), so further edits after this point don't
    // leak onto the live site until the next publish.
    if (project) {
      await tx.v12Project.update({
        where: { id: project.id },
        data: { publishedRevision: project.currentRevision },
      });
    }
  });

  revalidatePath(publishedSitePath(page.site.slug, page.slug));
  revalidatePath(publishedSitePath(page.site.slug));
  invalidateRouteCache(page.site.slug);

  return { siteSlug: page.site.slug, pageSlug: page.slug, siteId, tenantId, isV12: Boolean(project) };
}

/*
 * Called every minute by the in-process scheduler (instrumentation.ts) and by the
 * /api/cron/publish-scheduled HTTP fallback. A failure on one page must never block
 * the others, and a page that can never publish (e.g. missing source) must not retry
 * forever — its schedule is cleared so it surfaces as a one-time failure, not a loop.
 */
export async function runDuePublishScans() {
  const duePages = await prisma.page.findMany({
    where: {
      status: "DRAFT",
      scheduledPublishAt: { lte: new Date() },
      deleted: false,
      deletedAt: null,
    },
    select: { id: true },
  });

  let published = 0;
  let failed = 0;
  const v12Sites = new Map<string, { siteId: string; tenantId: string }>();

  for (const { id } of duePages) {
    try {
      const result = await publishPageNow(id);
      published += 1;
      if (result.isV12) v12Sites.set(result.siteId, { siteId: result.siteId, tenantId: result.tenantId });
    } catch (error) {
      failed += 1;
      console.error(`[scheduled publish] failed for page ${id}:`, error);
      await prisma.page
        .update({ where: { id }, data: { scheduledPublishAt: null } })
        .catch(() => undefined);
    }
  }

  return { scanned: duePages.length, published, failed, v12Sites: Array.from(v12Sites.values()) };
}
