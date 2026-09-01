import { NextResponse } from "next/server";
import { prisma } from "@buildez/db";
import { apiHandler } from "@/lib/api/apiHandler";
import {
  resolveExecutionContext,
  type ExecutionContext,
} from "@/lib/context/resolveExecutionContext";

const MAX_CODE_LENGTH = 100_000;

export async function GET(
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

    const page = await prisma.page.findFirst({
      where: {
        id: execCtx.pageId,
        siteId: execCtx.siteId,
        deletedAt: null,
        deleted: false,
        site: { tenantId: execCtx.tenantId, deletedAt: null },
      },
      select: { customCss: true, customJs: true },
    });

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    return { customCss: page.customCss ?? "", customJs: page.customJs ?? "" };
  }, { requireTenant: true })(req);
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ pageId: string }> }
) {
  return apiHandler(async ({ auth }) => {
    const { pageId } = await ctx.params;
    const body = await req.json().catch(() => ({}));

    const customCss = typeof body.customCss === "string" ? body.customCss.slice(0, MAX_CODE_LENGTH) : "";
    const customJs = typeof body.customJs === "string" ? body.customJs.slice(0, MAX_CODE_LENGTH) : "";

    const execCtx: ExecutionContext = await resolveExecutionContext({
      req,
      scope: "page",
      source: "builder",
      query: { pageId },
      userId: auth.user.id,
      tenantId: auth.tenant.id,
    });

    const updated = await prisma.page.updateMany({
      where: {
        id: execCtx.pageId,
        siteId: execCtx.siteId,
        deletedAt: null,
        deleted: false,
        site: { tenantId: execCtx.tenantId, deletedAt: null },
      },
      data: {
        customCss: customCss || null,
        customJs: customJs || null,
      },
    });

    if (updated.count !== 1) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    return { customCss, customJs };
  }, { requireTenant: true })(req);
}
