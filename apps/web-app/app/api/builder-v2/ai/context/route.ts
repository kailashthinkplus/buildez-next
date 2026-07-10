import { Prisma, prisma } from "@buildez/db";
import { NextRequest, NextResponse } from "next/server";

import { getUser } from "@/lib/auth/getUser";
import {
  getOrCreateAiConversation,
  loadBuilderAiContext,
  normalizeContextForm,
} from "@/modules/builder-v2/ai-v9/context/brandContext";

type ContextBody = {
  pageId?: string;
  context?: unknown;
};

export async function GET(req: NextRequest) {
  const auth = await getUser();
  if (!auth?.user || !auth.tenant) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const pageId = req.nextUrl.searchParams.get("pageId")?.trim();
  if (!pageId) {
    return NextResponse.json({ error: "Missing pageId" }, { status: 400 });
  }

  const loaded = await loadBuilderAiContext({
    tenantId: auth.tenant.id,
    userId: auth.user.id,
    pageId,
  });

  if (!loaded?.page?.site) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  await getOrCreateAiConversation({
    tenantId: auth.tenant.id,
    userId: auth.user.id,
    siteId: loaded.page.site.id,
    pageId: loaded.page.id,
    context: loaded.context,
  });

  return NextResponse.json({
    context: loaded.context,
    messages: loaded.messages,
  });
}

export async function POST(req: NextRequest) {
  const auth = await getUser();
  if (!auth?.user || !auth.tenant) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const body = (await req.json()) as ContextBody;
  const pageId = body.pageId?.trim();
  if (!pageId) {
    return NextResponse.json({ error: "Missing pageId" }, { status: 400 });
  }

  const loaded = await loadBuilderAiContext({
    tenantId: auth.tenant.id,
    userId: auth.user.id,
    pageId,
  });

  if (!loaded?.page?.site) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  const context = normalizeContextForm(body.context);
  const conversation = await getOrCreateAiConversation({
    tenantId: auth.tenant.id,
    userId: auth.user.id,
    siteId: loaded.page.site.id,
    pageId: loaded.page.id,
    context,
  });

  await prisma.page.update({
    where: { id: loaded.page.id },
    data: {
      metadata: {
        ...((loaded.page.metadata && typeof loaded.page.metadata === "object"
          ? loaded.page.metadata
          : {}) as Record<string, unknown>),
        aiContext: conversation.context,
      } as Prisma.InputJsonValue,
    },
  });

  return NextResponse.json({
    success: true,
    context: conversation.context,
  });
}
