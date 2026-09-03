import { Prisma, prisma } from "@buildez/db";

import { apiHandler } from "@/lib/api/apiHandler";

type BlueprintPayload = {
  blueprint?: unknown;
  reactCode?: string | null;
  metadata?: Record<string, unknown> | null;
};

export const GET = apiHandler(
  async ({ auth, params }) => {
    const pageId = params?.pageId;

    if (!pageId) {
      throw new Error("Missing pageId");
    }

    const page = await prisma.page.findFirst({
      where: {
        id: pageId,
        site: {
          tenantId: auth.tenant.id,
        },
      },
      include: {
        blueprint: true,
        site: {
          include: {
            layout: true,
          },
        },
      },
    });

    if (!page) {
      throw new Error("Page not found");
    }

    return {
      pageId: page.id,
      pageStatus: page.status,
      blueprint: page.blueprint?.data ?? null,
      schemaVersion: page.blueprint?.schemaVersion ?? null,
      reactCode: page.reactCode,
      metadata: page.metadata,
      siteLayout: page.site.layout
        ? {
            header: page.site.layout.header,
            footer: page.site.layout.footer,
          }
        : null,
      updatedAt: page.blueprint?.updatedAt?.toISOString() ?? null,
    };
  },
  { requireTenant: true }
);

export const POST = apiHandler(
  async ({ auth, params, req }) => {
    const pageId = params?.pageId;

    if (!pageId) {
      throw new Error("Missing pageId");
    }

    const body = (await req.json()) as BlueprintPayload;
    const blueprint = body.blueprint;

    if (!blueprint || typeof blueprint !== "object") {
      throw new Error("No blueprint provided");
    }

    const page = await prisma.page.findFirst({
      where: {
        id: pageId,
        site: {
          tenantId: auth.tenant.id,
        },
      },
      include: {
        blueprint: true,
      },
    });

    if (!page) {
      throw new Error("Page not found");
    }

    await prisma.$transaction(async (tx) => {
      if (page.blueprint?.data) {
        const previousData = JSON.stringify(page.blueprint.data);
        const nextData = JSON.stringify(blueprint);

        if (previousData !== nextData) {
          await tx.blueprintHistory.create({
            data: {
              blueprintId: page.blueprint.id,
              pageId: page.id,
              siteId: page.siteId,
              tenantId: auth.tenant.id,
              data: page.blueprint.data,
              schemaVersion: page.blueprint.schemaVersion,
              createdBy: auth.user.id,
            },
          });
        }
      }

      await tx.blueprint.upsert({
        where: {
          pageId: page.id,
        },
        create: {
          pageId: page.id,
          siteId: page.siteId,
          tenantId: auth.tenant.id,
          data: blueprint,
          schemaVersion: 1,
          updatedBy: auth.user.id,
        },
        update: {
          data: blueprint,
          updatedBy: auth.user.id,
        },
      });

      if (typeof body.reactCode === "string" || body.reactCode === null) {
        await tx.page.update({
          where: {
            id: page.id,
          },
          data: {
            reactCode: body.reactCode,
          },
        });
      }

      if (body.metadata && typeof body.metadata === "object") {
        await tx.page.update({
          where: {
            id: page.id,
          },
          data: {
            metadata: body.metadata as Prisma.InputJsonValue,
          },
        });
      }
    });

    return {
      pageId: page.id,
      pageStatus: page.status,
      saved: true,
      updatedAt: new Date().toISOString(),
    };
  },
  { requireTenant: true }
);
