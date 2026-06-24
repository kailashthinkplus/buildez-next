export async function getActiveSnapshot(siteId: string) {
  return db.siteSnapshot.findFirst({
    where: {
      siteId,
      status: "PUBLISHED",
    },
    orderBy: { version: "desc" },
  });
}
