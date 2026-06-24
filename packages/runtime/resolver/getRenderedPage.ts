export async function getRenderedPage(
  snapshotId: string,
  slug: string
) {
  return db.renderedPage.findFirst({
    where: {
      render: {
        snapshotId,
      },
      slug,
    },
  });
}
