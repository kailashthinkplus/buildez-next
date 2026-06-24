export async function resolveSiteByHost(host: string) {
  // Custom domain
  const domain = await db.siteDomain.findFirst({
    where: {
      domain: host,
      status: "VERIFIED",
    },
    include: { site: true },
  });

  if (domain) return domain.site;

  // *.buildez.site
  if (host.endsWith(".buildez.site")) {
    const slug = host.replace(".buildez.site", "");

    return db.site.findFirst({
      where: {
        slug,
        status: "PUBLISHED",
        deletedAt: null,
      },
    });
  }

  return null;
}
