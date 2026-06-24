"use server";

import { prisma } from "@buildez/db";
import { notFound } from "next/navigation";
import { headers } from "next/headers";

import { verifyTenantAccess } from "@/lib/auth/verifyTenant";
import BuilderRoot from "./BuilderRoot";

/* ============================================================================
   BUILDER PAGE — V4 SERVER ENTRY (NEXT 15 SAFE)
   ----------------------------------------------------------------------------
   RESPONSIBILITIES:
   • Tenant auth
   • Page + blueprint fetch
   • Blueprint bootstrap (if missing)
   • Pass clean props → BuilderRoot (client)
============================================================================ */

export default async function BuilderPage({
  params,
}: {
  params: Promise<{ siteSlug: string; pageSlugWithId: string }>;
}) {
  /* -------------------------------------------------------------
     PARAMS (NEXT 15 — MUST AWAIT)
  ------------------------------------------------------------- */
  const { siteSlug, pageSlugWithId } = await params;

  /* -------------------------------------------------------------
     EXTRACT PAGE ID (SUFFIX)
  ------------------------------------------------------------- */
  const parts = pageSlugWithId.split("-");
  const shortId = parts.at(-1);

  if (!shortId || shortId.length < 4) {
    return notFound();
  }

  /* -------------------------------------------------------------
     HEADERS + COOKIE SHIM (NEXT 15 — MUST AWAIT)
  ------------------------------------------------------------- */
  const hdrs = await headers();
  const rawCookie = hdrs.get("cookie") || "";

  const cookieMap = Object.fromEntries(
    rawCookie
      .split(";")
      .map((v) => v.trim())
      .filter(Boolean)
      .map((v) => {
        const [key, ...rest] = v.split("=");
        return [key, rest.join("=")];
      })
  );

  const req = {
    headers: {
      get: (key: string) => hdrs.get(key),
    },
    cookies: {
      get: (key: string) =>
        cookieMap[key] ? { value: cookieMap[key] } : undefined,
    },
  } as any;

  /* -------------------------------------------------------------
     TENANT AUTH
  ------------------------------------------------------------- */
  const tenant = await verifyTenantAccess(req);
  if (!tenant) return notFound();

  /* -------------------------------------------------------------
     FIND SITE
  ------------------------------------------------------------- */
  const site = await prisma.site.findFirst({
    where: {
      slug: siteSlug,
      tenantId: tenant.id,
    },
    select: {
      id: true,
      slug: true,
    },
  });

  if (!site) return notFound();

  /* -------------------------------------------------------------
     FIND PAGE (+ BLUEPRINT)
  ------------------------------------------------------------- */
  const page = await prisma.page.findFirst({
    where: {
      id: { startsWith: shortId },
      siteId: site.id,
    },
    include: {
      blueprint: true,
    },
  });

  if (!page) return notFound();

  /* -------------------------------------------------------------
     ENSURE BLUEPRINT EXISTS
  ------------------------------------------------------------- */
  let blueprintData = page.blueprint?.data;

  if (!blueprintData) {
    const created = await prisma.blueprint.create({
      data: {
        pageId: page.id,
        siteId: site.id,
        tenantId: tenant.id,
        data: {
          page: {
            id: page.id,
            type: "page",
            props: {
              title: page.title,
            },
            children: [],
          },
        },
      },
    });

    blueprintData = created.data;
  }

  /* -------------------------------------------------------------
     RENDER CLIENT ROOT
  ------------------------------------------------------------- */
  return (
    <BuilderRoot
      pageId={page.id}
      siteId={site.id}
      initialBlueprint={blueprintData}
    />
  );
}
