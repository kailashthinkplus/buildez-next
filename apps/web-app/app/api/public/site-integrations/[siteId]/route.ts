import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@buildez/db";

const FUNCTIONAL_SLUGS = ["googleanalytics", "meta", "hotjar", "microsoftclarity", "linkedin"] as const;

export async function GET(_req: NextRequest, { params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = await params;
  const site = await prisma.site.findFirst({ where: { id: siteId, deletedAt: null }, select: { id: true } });
  if (!site) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const rows = await prisma.siteIntegration.findMany({
    where: { siteId: site.id, appSlug: { in: [...FUNCTIONAL_SLUGS] } },
    select: { appSlug: true, config: true },
  });

  const configBySlug = new Map(rows.map((row) => [row.appSlug, row.config as Record<string, string> | null]));

  return NextResponse.json({
    googleAnalytics: configBySlug.get("googleanalytics") ?? null,
    meta: configBySlug.get("meta") ?? null,
    hotjar: configBySlug.get("hotjar") ?? null,
    microsoftClarity: configBySlug.get("microsoftclarity") ?? null,
    linkedin: configBySlug.get("linkedin") ?? null,
  });
}
