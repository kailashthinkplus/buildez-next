import { NextRequest, NextResponse } from "next/server";

/* 🔒 AUTH */
import { getSession } from "@/lib/auth/getSession";

/* 🔒 EXECUTION CONTEXT */
import {
  resolveExecutionContext,
  type ExecutionContext,
} from "@/lib/context/resolveExecutionContext";

/* ============================================================
   AI INTERVIEW STATE — START / RESUME
   PAGE-SCOPED • TENANT-SAFE • DB-BACKED
============================================================ */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pageId } = body ?? {};

    if (!pageId) {
      return NextResponse.json(
        { error: "pageId required" },
        { status: 400 }
      );
    }

    /* ----------------------------------------------------------
       🔒 AUTH
    ---------------------------------------------------------- */
    const session = await getSession();

    if (!session?.tenantId || !session?.userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    /* ----------------------------------------------------------
       🔒 EXECUTION CONTEXT (AUTHORITATIVE)
    ---------------------------------------------------------- */
    const ctx: ExecutionContext = await resolveExecutionContext({
      req,
      scope: "page",
      source: "ai-interview",
      query: { pageId },
      tenantId: session.tenantId,
      userId: session.userId,
    });

    const { prisma } = await import("@buildez/db");

    const Conversation =
      prisma.aiConversation ||
      prisma.aIConversation ||
      prisma.AIConversation;

    if (!Conversation) {
      throw new Error("AIConversation model not found");
    }

    /* ----------------------------------------------------------
       FIND OR CREATE INTERVIEW SESSION
    ---------------------------------------------------------- */
    let conversation = await Conversation.findFirst({
      where: {
        tenantId: ctx.tenantId,
        siteId: ctx.siteId,
        pageId: ctx.pageId,
      },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        data: {
          tenantId: ctx.tenantId,
          siteId: ctx.siteId,
          pageId: ctx.pageId,
          createdBy: session.userId,
        },
        include: {
          messages: true,
        },
      });
    }

    /* ----------------------------------------------------------
       DERIVE INTERVIEW STATE
       (UI decides step order — API is neutral)
    ---------------------------------------------------------- */
    const answeredCount = conversation.messages.filter(
      (m: any) => m.role === "user"
    ).length;

    return NextResponse.json({
      conversationId: conversation.id,
      pageId: ctx.pageId,
      siteId: ctx.siteId,
      tenantId: ctx.tenantId,

      answeredCount,
      messages: conversation.messages,
    });
  } catch (err: any) {
    console.error("[AI INTERVIEW STATE START]", err);

    return NextResponse.json(
      {
        error: "Failed to start interview",
        detail: err?.message,
      },
      { status: 500 }
    );
  }
}
