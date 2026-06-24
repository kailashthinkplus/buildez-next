import { apiHandler } from "@/lib/api/apiHandler";
import { prisma } from "@buildez/db";

/* ============================================================
   AI SNAPSHOT — SAVE BLUEPRINT (PAGE SCOPED)
   AUTHORITATIVE (TENANT + SITE SAFE)
============================================================ */

export const POST = apiHandler(
  async ({ req, tenant }) => {
    const { pageId, siteId, blueprint } = await req.json();

    if (!pageId || !siteId || !blueprint) {
      throw new Error("INVALID_SNAPSHOT_PAYLOAD");
    }

    await prisma.aIBlueprintSnapshot.create({
      data: {
        tenantId: tenant.id,
        siteId,
        pageId,
        blueprint,
      },
    });

    return { success: true };
  },
  { requireTenant: true }
);
