import { NextRequest, NextResponse } from "next/server";
import { Prisma, prisma } from "@buildez/db";
import { getAuthContext } from "@/lib/auth/getAuthContext";
import { getThemePreset } from "@/modules/builder-v2/theme/themePresets";
import {
  canSeedThemeDemoBlueprint,
  createThemeDemoBlueprint,
  getThemeDemoPageSeeds,
} from "@/modules/builder-v2/theme/themeDemoBlueprints";

function slugifyPageTitle(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "page";
}

/* ============================================================
   PUT — SAVE DESIGN TOKENS
============================================================ */

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const auth = await getAuthContext();

    if (!auth?.tenantId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { siteId } = await params;
    const body = await req.json();
    const { designTokens, seedDemoBlueprints } = body ?? {};

    if (!designTokens) {
      return NextResponse.json(
        { error: "Missing designTokens" },
        { status: 400 }
      );
    }

    const site = await prisma.site.findUnique({
      where: { id: siteId },
      select: { id: true, name: true, slug: true, tenantId: true },
    });

    if (!site || site.tenantId !== auth.tenantId) {
      return NextResponse.json(
        { error: "Site not found" },
        { status: 404 }
      );
    }

    const updatedSite = await prisma.site.update({
      where: { id: siteId },
      data: { designTokens },
      select: {
        id: true,
        designTokens: true,
      },
    });

    let demoBlueprintsUpdated = 0;
    let demoBlueprintsSkipped = 0;
    let demoPagesCreated = 0;

    if (
      seedDemoBlueprints === true &&
      typeof designTokens.themePresetId === "string"
    ) {
      const preset = getThemePreset(designTokens.themePresetId);
      const pageSeeds = getThemeDemoPageSeeds(preset);
      const pages = await prisma.page.findMany({
        where: {
          siteId,
          deleted: false,
        },
        select: {
          id: true,
          title: true,
          slug: true,
          siteId: true,
          blueprint: {
            select: {
              id: true,
              data: true,
              schemaVersion: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      await prisma.$transaction(async (tx) => {
        const pagesBySlug = new Map(pages.map((page) => [page.slug, page]));

        for (const pageSeed of pageSeeds) {
          if (pagesBySlug.has(pageSeed.slug)) continue;

          let slug = pageSeed.slug || slugifyPageTitle(pageSeed.title);
          let counter = 1;

          while (
            await tx.page.findFirst({
              where: {
                siteId,
                slug,
                deletedAt: null,
              },
              select: { id: true },
            })
          ) {
            slug = `${pageSeed.slug}-${counter++}`;
          }

          const page = await tx.page.create({
            data: {
              siteId,
              title: pageSeed.title,
              slug,
              status: "DRAFT",
              renderMode: "BLUEPRINT",
              metadata: {
                themeDemoPresetId: preset.id,
                themeDemoCategory: preset.demoData?.category ?? preset.tone,
                themeDemoSeededAt: new Date().toISOString(),
                themeDemoCreated: true,
              },
            },
            select: {
              id: true,
              title: true,
              slug: true,
              siteId: true,
            },
          });

          const blueprint = createThemeDemoBlueprint({
            preset,
            pageTitle: page.title,
            siteName: site.name,
            pageSeed,
          });

          await tx.blueprint.create({
            data: {
              pageId: page.id,
              siteId: page.siteId,
              tenantId: auth.tenantId,
              data: blueprint as unknown as Prisma.InputJsonValue,
              schemaVersion: 1,
              updatedBy: auth.userId,
            },
          });

          pagesBySlug.set(page.slug, {
            ...page,
            blueprint: {
              id: "",
              data: blueprint as unknown as Prisma.JsonValue,
              schemaVersion: 1,
            },
          });
          demoPagesCreated += 1;
        }

        for (const page of pages) {
          const currentData = page.blueprint?.data;

          if (!canSeedThemeDemoBlueprint(currentData)) {
            demoBlueprintsSkipped += 1;
            continue;
          }

          const nextBlueprint = createThemeDemoBlueprint({
            preset,
            pageTitle: page.title,
            siteName: site.name,
            pageSeed: pageSeeds.find((seed) => seed.slug === page.slug),
          });

          if (page.blueprint?.id && currentData) {
            await tx.blueprintHistory.create({
              data: {
                blueprintId: page.blueprint.id,
                pageId: page.id,
                siteId: page.siteId,
                tenantId: auth.tenantId,
                data: currentData as Prisma.InputJsonValue,
                schemaVersion: page.blueprint.schemaVersion,
                createdBy: auth.userId,
              },
            });
          }

          await tx.blueprint.upsert({
            where: {
              pageId: page.id,
            },
            create: {
              pageId: page.id,
              siteId: page.siteId,
              tenantId: auth.tenantId,
              data: nextBlueprint as unknown as Prisma.InputJsonValue,
              schemaVersion: 1,
              updatedBy: auth.userId,
            },
            update: {
              data: nextBlueprint as unknown as Prisma.InputJsonValue,
              updatedBy: auth.userId,
            },
          });

          await tx.page.update({
            where: { id: page.id },
            data: {
              renderMode: "BLUEPRINT",
              reactCode: null,
              metadata: {
                themeDemoPresetId: preset.id,
                themeDemoCategory: preset.demoData?.category ?? preset.tone,
                themeDemoSeededAt: new Date().toISOString(),
              },
            },
          });

          demoBlueprintsUpdated += 1;
        }
      });
    }

    console.log("[DESIGN TOKENS] Saved", { siteId });

    return NextResponse.json({
      success: true,
      site: updatedSite,
      designTokens: updatedSite.designTokens,
      demoBlueprintsUpdated,
      demoBlueprintsSkipped,
      demoPagesCreated,
    });
  } catch (err: unknown) {
    console.error("[DESIGN TOKENS] Save failed", err);
    return NextResponse.json(
      { error: "Failed to save design tokens" },
      { status: 500 }
    );
  }
}

/* ============================================================
   GET — LOAD DESIGN TOKENS
============================================================ */

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const auth = await getAuthContext();

    if (!auth?.tenantId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { siteId } = await params;

    const site = await prisma.site.findFirst({
      where: {
        id: siteId,
        tenantId: auth.tenantId,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        designTokens: true,
      },
    });

    if (!site) {
      return NextResponse.json(
        { error: "Site not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      site,
      designTokens: site.designTokens,
    });
  } catch (err: unknown) {
    console.error("[DESIGN TOKENS] Load failed", err);
    return NextResponse.json(
      { error: "Failed to load design tokens" },
      { status: 500 }
    );
  }
}
