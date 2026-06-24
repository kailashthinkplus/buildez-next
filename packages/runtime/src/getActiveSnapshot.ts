import { prisma } from "@buildez/db";

export async function getActiveSnapshot(siteId: string) {
  return prisma.siteSnapshot.findFirst({
    where: { siteId, status: "PUBLISHED" },
    orderBy: { version: "desc" },
  });
}
