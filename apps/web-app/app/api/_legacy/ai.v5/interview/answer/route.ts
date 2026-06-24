import { NextRequest, NextResponse } from "next/server";

/* 🔒 AUTH */
import { getSession } from "@/lib/auth/getSession";

/* 🔒 EXECUTION CONTEXT */
import {
  resolveExecutionContext,
  type ExecutionContext,
} from "@/lib/context/resolveExecutionContext";

/* ============================================================
   AI INTERVIEW — SAVE ANSWER
   PAGE-SCOPED • TENANT-SAFE • DB ONLY
============================================================ */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      pageId,
      conversationId,
      questionId,
      answer,
      step,
    } = body ?? {};

    if (!pageId || !conversationId || !questionId || !answer) {
      return NextResponse.json(
        {
          error:
            "pageId, conversationId, questionId, and answer are required",
        },
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
       🔒 EXECUTION CONTEXT
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

    const Message =
      prisma.aiMessage ||
      prisma.aIMessage ||
      prisma.AIMessage;

    if (!Conversation || !Message) {
      throw new Error("AI interview models not found");
    }

    /* ----------------------------------------------------------
       VERIFY CONVERSATION OWNERSHIP
    ---------------------------------------------------------- */
    const conversation = await Conversation.findFirst({
      where: {
        id: conversationId,
        tenantId: ctx.tenantId,
        siteId: ctx.siteId,
        pageId: ctx.pageId,
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found or access denied" },
        { status: 404 }
      );
    }

    /* ----------------------------------------------------------
       APPEND ANSWER AS STRUCTURED MESSAGE
    ---------------------------------------------------------- */
    const message = await Message.create({
      data: {
        conversationId: conversation.id,
        role: "user",
        content: {
          type: "interview_answer",
          questionId,
          answer,
          step,
        },
        createdBy: session.userId,
      },
    });

    return NextResponse.json({
      success: true,
      message,
    });
  } catch (err: any) {
    console.error("[AI INTERVIEW ANSWER]", err);

    return NextResponse.json(
      {
        error: "Failed to save interview answer",
        detail: err?.message,
      },
      { status: 500 }
    );
  }
}
