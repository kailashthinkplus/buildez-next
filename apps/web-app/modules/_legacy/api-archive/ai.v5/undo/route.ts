import { apiHandler } from "@/lib/api/apiHandler";
import { prisma } from "@buildez/db";

/* ============================================================
   AI UNDO — RESTORE LAST SNAPSHOT (PAGE SCOPED)
   AUTHORITATIVE, TENANT-SAFE
============================================================ */

export const POST = apiHandler(
  async ({ req, tenant }) => {
    const { pageId } = await req.json();

    if (!pageId) {
      throw new Error("MISSING_PAGE_ID");
    }

    /* ----------------------------------------------------------
       1️⃣ Get latest snapshot (TENANT + PAGE SAFE)
    ---------------------------------------------------------- */
    const snapshot = await prisma.aIBlueprintSnapshot.findFirst({
      where: {
        tenantId: tenant.id,
        pageId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!snapshot) {
      throw new Error("NO_AI_SNAPSHOT_FOUND");
    }

    /* ----------------------------------------------------------
       2️⃣ Restore blueprint (CANONICAL STORAGE)
    ---------------------------------------------------------- */
    await prisma.blueprint.upsert({
      where: {
        pageId,
      },
      create: {
        pageId,
        tenantId: tenant.id,
        siteId: snapshot.siteId,
        data: { page: snapshot.blueprint },
        schemaVersion: 1,
      },
      update: {
        data: { page: snapshot.blueprint },
      },
    });

    /* ----------------------------------------------------------
       3️⃣ DO NOT DELETE SNAPSHOT (IMPORTANT)
       - Enables multi-level undo later
       - Enables debugging / audit
    ---------------------------------------------------------- */

    return { restored: true };
  },
  { requireTenant: true }
);
