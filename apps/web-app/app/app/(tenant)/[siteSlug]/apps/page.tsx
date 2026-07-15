import { notFound } from "next/navigation";
import { prisma } from "@buildez/db";

import { getUser } from "@/lib/auth/getUser";
import AppsMarketplaceClient from "./AppsMarketplaceClient";

export default async function SiteAppsPage({
  params,
}: {
  params: Promise<{ siteSlug: string }>;
}) {
  const { siteSlug } = await params;
  const auth = await getUser();

  if (!auth?.tenant?.id) return notFound();

  const site = await prisma.site.findFirst({
    where: { slug: siteSlug, tenantId: auth.tenant.id, deletedAt: null },
    select: { id: true, name: true },
  });

  if (!site) return notFound();

  return <AppsMarketplaceClient siteName={site.name} />;
}
