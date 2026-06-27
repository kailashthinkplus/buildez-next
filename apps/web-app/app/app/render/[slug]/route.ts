import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@buildez/db";

import { apiHandler } from "@/lib/api/apiHandler";
import { verifyTenantAccess } from "@/lib/auth/verifyTenant";
import { generateRuntimeHTML } from "@/modules/builder/runtime/generateRuntimeHTML";
import { generateRuntimeCSS } from "@/modules/builder/runtime/generateRuntimeCSS";
import { resolveBlueprintTree } from "@/modules/builder/runtime/resolveBlueprintTree";



export async function POST(
  req: Request,
  ctx: { params: { pageId: string } }
) {
  return apiHandler(async () => {
    console.log("\n==============================");
    console.log("🔥 PUBLISH API HIT");

    console.log("🔥 DATABASE_URL:", process.env.DATABASE_URL);


    const h = await headers();
    const tenantId = h.get("tenant-id");
    const { pageId } = ctx.params;

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
    const tree = resolveBlueprintTree(page.blueprint.data);
    const html = generateRuntimeHTML(tree);
    const css = generateRuntimeCSS(tree as any);

    /* ----------------------------------------------------------
       TRANSACTION (NO SILENT FAILURE)
    ---------------------------------------------------------- */
    const result = await prisma.$transaction(async (tx) => {
      const snapshot = await tx.snapshot.create({
        data: {
          pageId: page.id,
          html,
          css,
          type: "PUBLISHED",
        },
      });

      const updatedPage = await tx.page.update({
        where: { id: page.id },
        data: {
          status: "PUBLISHED",
          publishedAt: new Date(),
          publishedSnapshotId: snapshot.id,
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
