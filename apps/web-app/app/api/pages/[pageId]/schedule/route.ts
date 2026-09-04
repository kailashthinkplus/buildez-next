import { NextResponse } from "next/server";
import { prisma } from "@buildez/db";
import { apiHandler } from "@/lib/api/apiHandler";
import {
  resolveExecutionContext,
  type ExecutionContext,
} from "@/lib/context/resolveExecutionContext";

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ pageId: string }> }
) {
  return apiHandler(async ({ auth }) => {
    const { pageId } = await ctx.params;
    const body = await req.json().catch(() => ({}));

    const scheduledFor = typeof body.scheduledPublishAt === "string" ? new Date(body.scheduledPublishAt) : null;
    if (!scheduledFor || Number.isNaN(scheduledFor.getTime())) {
      return NextResponse.json({ error: "A valid date/time is required." }, { status: 400 });
    }
    if (scheduledFor.getTime() <= Date.now()) {
      return NextResponse.json({ error: "Scheduled time must be in the future." }, { status: 400 });
    }

    const execCtx: ExecutionContext = await resolveExecutionContext({
      req,
      scope: "page",
      source: "builder",
      query: { pageId },
      userId: auth.user.id,
      tenantId: auth.tenant.id,
    });

    const updated = await prisma.page.updateMany({
      where: { id: execCtx.pageId, siteId: execCtx.siteId, deletedAt: null, deleted: false },
      data: { scheduledPublishAt: scheduledFor },
    });

    if (updated.count !== 1) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    return { scheduledPublishAt: scheduledFor.toISOString() };
  }, { requireTenant: true })(req);
}

export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ pageId: string }> }
) {
  return apiHandler(async ({ auth }) => {
    const { pageId } = await ctx.params;

    const execCtx: ExecutionContext = await resolveExecutionContext({
      req,
      scope: "page",
      source: "builder",
      query: { pageId },
      userId: auth.user.id,
      tenantId: auth.tenant.id,
    });

    const updated = await prisma.page.updateMany({
      where: { id: execCtx.pageId, siteId: execCtx.siteId, deletedAt: null, deleted: false },
      data: { scheduledPublishAt: null },
    });

    if (updated.count !== 1) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    return { scheduledPublishAt: null };
  }, { requireTenant: true })(req);
}
