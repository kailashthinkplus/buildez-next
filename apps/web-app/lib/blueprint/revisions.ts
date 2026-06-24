// /apps/web-app/lib/blueprint/revisions.ts
import { prisma } from "@buildez/db";

export async function writeBlueprintRevision(pageId: string, bp: any) {
  await prisma.blueprintHistory.create({
    data: {
      blueprintId: bp.id,
      pageId,
      siteId: bp.siteId,
      tenantId: bp.tenantId,
      data: bp.data,
      schemaVersion: bp.schemaVersion,
    },
  });
}
