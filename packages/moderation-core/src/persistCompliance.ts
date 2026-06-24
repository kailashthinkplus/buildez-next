import { prisma } from "@buildez/db";

export async function persistPageCompliance({
  siteId,
  pageId,
  tenantId,
  result,
}: {
  siteId: string;
  pageId: string;
  tenantId: string;
  result: {
    level: "PASS" | "WARN" | "BLOCK";
    reasons: string[];
  };
}) {
  if (result.level === "PASS") return;

  await db.complianceAudit.create({
    data: {
      siteId,
      pageId,
      tenantId,
      level: result.level,
      reasons: result.reasons,
    },
  });

  if (result.level !== "PASS") {
    await db.systemNotification.create({
      data: {
        type: "COMPLIANCE_ALERT",
        title: "Page Compliance Alert",
        message: `Page ${pageId} flagged: ${result.reasons.join(", ")}`,
        entityType: "PAGE",
        entityId: pageId,
      },
    });
  }
}
