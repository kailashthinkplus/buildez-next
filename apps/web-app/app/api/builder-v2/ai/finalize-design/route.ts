import { Prisma, prisma } from "@buildez/db";
import { NextRequest, NextResponse } from "next/server";

import { getUser } from "@/lib/auth/getUser";

type FinalizeDesignBody = {
  pageId?: string;
};

function getRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function cleanString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as FinalizeDesignBody;
    const auth = await getUser();

    if (!auth?.user || !auth.tenant) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const pageId = body.pageId?.trim();

    if (!pageId) {
      return NextResponse.json({ error: "Missing pageId" }, { status: 400 });
    }

    const page = await prisma.page.findFirst({
      where: {
        id: pageId,
        deleted: false,
        site: {
          tenantId: auth.tenant.id,
        },
      },
      include: {
        site: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!page?.site) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    const metadata = getRecord(page.metadata);
    const review = getRecord(metadata.aiDesignReview);
    const context = getRecord(metadata.aiContext || review.context);
    const now = new Date().toISOString();
    const nextMetadata = {
      ...metadata,
      aiDesignStatus: "accepted",
      aiDesignScope: "site_reference_design",
      aiDesignAcceptedAt: now,
      aiDesignAcceptedBy: auth.user.id,
      aiDesignIntent:
        cleanString(metadata.aiDesignIntent) ||
        cleanString(review.designIntent) ||
        cleanString(context.designIntent),
      aiDesignReview: {
        ...review,
        status: "accepted",
        scope: "site_reference_design",
        pageId,
        pageTitle: page.title,
        acceptedAt: now,
        acceptedBy: auth.user.id,
        context,
        nextStep:
          "Future AI page generations can inherit this accepted design direction.",
      },
    };

    await prisma.page.update({
      where: {
        id: page.id,
      },
      data: {
        metadata: nextMetadata as Prisma.InputJsonValue,
      },
    });

    return NextResponse.json({
      success: true,
      status: "accepted",
      pageId,
      siteId: page.site.id,
      acceptedAt: now,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to accept AI design";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
