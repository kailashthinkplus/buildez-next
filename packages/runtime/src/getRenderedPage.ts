import { prisma } from "@buildez/db";

export async function getRenderedPage(snapshotId: string, slug: string) {
  return prisma.renderedPage.findUnique({
    where: {
      renderId_slug: {
        renderId: snapshotId,
        slug,
      },
    },
  });
}
