import { notFound } from "next/navigation";
import { prisma } from "@buildez/db";

export const dynamic = "force-dynamic";

export default async function PublicRuntimePage(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const resolvedParams = await props.params;
  const parts = resolvedParams.slug ?? [];

  let siteSlug: string;
  let pageSlug: string;

  /* -------------------------------------------
     Resolve site + page slugs
  ------------------------------------------- */
  if (parts.length === 0) {
    siteSlug = await resolveDefaultSiteSlug();
    pageSlug = "home";
  } else if (parts.length === 1) {
    siteSlug = parts[0];
    pageSlug = "home";
  } else {
    siteSlug = parts[0];
    pageSlug = parts[1];
  }

  /* -------------------------------------------
     Resolve PUBLISHED SITE only
  ------------------------------------------- */
  const site = await prisma.site.findFirst({
    where: {
      slug: siteSlug,
      status: "PUBLISHED",
    },
    select: { id: true },
  });

  if (!site) {
    console.log("❌ SITE NOT FOUND OR NOT PUBLISHED:", siteSlug);
    notFound();
  }

  /* -------------------------------------------
     🔑 SLUG-ONLY PAGE RESOLUTION (Option B)
     → Latest published page wins
  ------------------------------------------- */
  const page = await prisma.page.findFirst({
    where: {
      siteId: site.id,
      slug: pageSlug,
      status: "PUBLISHED",
      deletedAt: null,
    },
    orderBy: {
      updatedAt: "desc", // ✅ critical fix
    },
    select: { id: true },
  });

  if (!page) {
    console.log("❌ PAGE NOT FOUND FOR SLUG:", pageSlug);
    notFound();
  }

  /* -------------------------------------------
     Load latest PUBLISHED snapshot
  ------------------------------------------- */
  const snapshot = await prisma.snapshot.findFirst({
    where: {
      pageId: page.id,
      type: "PUBLISHED",
    },
    orderBy: { createdAt: "desc" },
    select: { html: true, css: true },
  });

  if (!snapshot) {
    console.log("❌ SNAPSHOT NOT FOUND FOR PAGE:", page.id);
    notFound();
  }

  /* -------------------------------------------
     Render static snapshot
  ------------------------------------------- */
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: snapshot.css }} />
      <div
        id="buildez-preview-root"
        dangerouslySetInnerHTML={{ __html: snapshot.html }}
      />
    </>
  );
}

/* ============================================================
   DEFAULT SITE RESOLUTION (unchanged)
============================================================ */
async function resolveDefaultSiteSlug(): Promise<string> {
  const site = await prisma.site.findFirst({
    where: {
      status: "PUBLISHED",
    },
    orderBy: { createdAt: "asc" },
    select: { slug: true },
  });

  if (!site) notFound();
  return site.slug;
}
