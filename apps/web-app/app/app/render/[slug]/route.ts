import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { Prisma, prisma } from "@buildez/db";

import { apiHandler } from "@/lib/api/apiHandler";
import { verifyTenantAccess } from "@/lib/auth/verifyTenant";
import { resolveBlueprintTree, type BlueprintData } from "@/modules/builder/runtime/resolveBlueprintTree";



export async function POST(
  req: Request,
  ctx: { params: Promise<{ slug: string }> }
) {
  return apiHandler(async () => {
    console.log("\n==============================");
    console.log("🔥 PUBLISH API HIT");

    console.log("🔥 DATABASE_URL:", process.env.DATABASE_URL);


    const h = await headers();
    const tenantId = h.get("tenant-id");
    const { slug: pageId } = await ctx.params;

    console.log("🔥 pageId:", pageId);
    console.log("🔥 tenantId:", tenantId);

    if (!tenantId) {
      throw new Error("Missing tenant context");
    }

    /* ----------------------------------------------------------
       AUTH
    ---------------------------------------------------------- */
    const tenant = await verifyTenantAccess(req);
    if (!tenant || tenant.id !== tenantId) {
      throw new Error("Unauthorized publish attempt");
    }

    /* ----------------------------------------------------------
       LOAD PAGE + BLUEPRINT
    ---------------------------------------------------------- */
    const page = await prisma.page.findFirst({
      where: {
        id: pageId,
        site: { tenantId },
      },
      include: {
        blueprint: true,
        site: true,
      },
    });

    console.log("🔥 PAGE FOUND?", Boolean(page));

    if (!page) {
      throw new Error("Page not found");
    }

    if (!page.blueprint?.data) {
      throw new Error("Page has no blueprint data");
    }

    console.log("🔥 PAGE STATUS BEFORE:", page.status);
    console.log("🔥 SITE STATUS BEFORE:", page.site.status);

    /* ----------------------------------------------------------
       GENERATE RUNTIME OUTPUT
    ---------------------------------------------------------- */
    const tree = resolveBlueprintTree(page.blueprint.data as unknown as BlueprintData);
    /* ----------------------------------------------------------
       TRANSACTION (NO SILENT FAILURE)
    ---------------------------------------------------------- */
    const result = await prisma.$transaction(async (tx) => {
      const previous = await tx.siteSnapshot.findFirst({
        where: { siteId: page.siteId, tenantId },
        orderBy: { version: "desc" },
        select: { version: true },
      });
      const snapshot = await tx.siteSnapshot.create({
        data: {
          siteId: page.siteId,
          tenantId,
          status: "PUBLISHED",
          version: (previous?.version ?? 0) + 1,
        },
      });

      await tx.pageSnapshot.create({
        data: {
          siteSnapshotId: snapshot.id,
          pageId: page.id,
          title: page.title,
          slug: page.slug,
          content: tree as unknown as Prisma.InputJsonValue,
        },
      });

      const updatedPage = await tx.page.update({
        where: { id: page.id },
        data: {
          status: "PUBLISHED",
          publishedAt: new Date(),
        },
      });

      const updatedSite = await tx.site.update({
        where: { id: page.siteId },
        data: {
          status: "PUBLISHED",
          updatedAt: new Date(),
        },
      });

      return { snapshot, updatedPage, updatedSite };
    });

    console.log("🔥 PAGE STATUS AFTER:", result.updatedPage.status);
    console.log("🔥 SITE STATUS AFTER:", result.updatedSite.status);

    /* ----------------------------------------------------------
       HARD ASSERTIONS (THIS IS CRITICAL)
    ---------------------------------------------------------- */
    if (result.updatedPage.status !== "PUBLISHED") {
      throw new Error("Page publish failed: status not updated");
    }

    if (result.updatedSite.status !== "PUBLISHED") {
      throw new Error("Site publish failed: status not updated");
    }

    console.log("✅ PUBLISH COMMITTED SUCCESSFULLY");

    return NextResponse.json({
      success: true,
      snapshotId: result.snapshot.id,
    });
  })(req);
}
