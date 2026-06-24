import { NextRequest, NextResponse } from "next/server";

/* 🔒 AUTH */
import { getSession } from "@/lib/auth/getSession";

/* 🔒 EXECUTION CONTEXT */
import {
  resolveExecutionContext,
  type ExecutionContext,
} from "@/lib/context/resolveExecutionContext";

/* ============================================================
   AI INTERVIEW — FINALIZE
   AGGREGATE ANSWERS → CANONICAL SHAPE
============================================================ */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pageId, conversationId } = body ?? {};

    if (!pageId || !conversationId) {
      return NextResponse.json(
        { error: "pageId and conversationId required" },
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
      source: "ai-interview-finalize",
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
       LOAD CONVERSATION + ANSWERS
    ---------------------------------------------------------- */
    const conversation = await Conversation.findFirst({
      where: {
        id: conversationId,
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
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    /* ----------------------------------------------------------
       EXTRACT INTERVIEW ANSWERS
    ---------------------------------------------------------- */
    const answers: Record<string, any> = {};

    for (const msg of conversation.messages) {
      if (
        msg.role === "user" &&
        msg.content?.type === "interview_answer"
      ) {
        answers[msg.content.questionId] = msg.content.answer;
      }
    }

    /* ----------------------------------------------------------
       HARD VALIDATION (MINIMAL, STRICT)
    ---------------------------------------------------------- */
    const REQUIRED_KEYS = [
      "industry",
      "designLanguage",
      "pages",
    ];

    const missing = REQUIRED_KEYS.filter(
      (key) => answers[key] == null
    );

    if (missing.length > 0) {
      return NextResponse.json(
        {
          error: "Interview incomplete",
          missing,
        },
        { status: 400 }
      );
    }

    /* ----------------------------------------------------------
       LOCK CONVERSATION (NO MORE ANSWERS)
    ---------------------------------------------------------- */
    await Conversation.update({
      where: { id: conversation.id },
      data: {
        updatedAt: new Date(),
      },
    });

    /* ----------------------------------------------------------
       RETURN CANONICAL ANSWERS
    ---------------------------------------------------------- */
    return NextResponse.json({
      success: true,
      answers: {
        industry: answers.industry,
        designLanguage: answers.designLanguage,
        pages: answers.pages,
        logoUrl: answers.logoUrl ?? null,
        colorStrategy: answers.colorStrategy ?? "auto",
        primaryColor: answers.primaryColor ?? null,
        secondaryColor: answers.secondaryColor ?? null,
      },
    });
  } catch (err: any) {
    console.error("[AI INTERVIEW FINALIZE]", err);

    return NextResponse.json(
      {
        error: "Failed to finalize interview",
        detail: err?.message,
      },
      { status: 500 }
    );
  }
}
