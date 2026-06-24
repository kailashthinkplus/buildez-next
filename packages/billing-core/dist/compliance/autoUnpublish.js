import { prisma } from "@buildez/db";
/* -----------------------------------------
   AUTO UNPUBLISH ON COMPLIANCE BLOCK
------------------------------------------ */
export async function autoUnpublishSite(params) {
    const { siteId, tenantId, reasons } = params;
    // 1️⃣ Unpublish site (idempotent)
    await db.site.updateMany({
        where: {
            id: siteId,
            tenantId,
            status: "PUBLISHED",
        },
        data: {
            status: "DRAFT",
        },
    });
    // 2️⃣ Persist compliance audit
    await db.complianceAudit.create({
        data: {
            siteId,
            tenantId,
            level: "BLOCK",
            reasons,
        },
    });
    // 3️⃣ Notify Super Admin
    await db.systemNotification.create({
        data: {
            type: "COMPLIANCE_BLOCK",
            title: "Site auto-unpublished",
            message: `Site was automatically unpublished due to compliance violations.`,
            entityType: "SITE",
            entityId: siteId,
        },
    });
}
