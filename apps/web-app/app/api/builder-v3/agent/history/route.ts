import { NextRequest } from "next/server";

import { prisma } from "@buildez/db";
import { getUser } from "@/lib/auth/getUser";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function textFromContent(content: unknown) {
  if (
    !content ||
    typeof content !== "object" ||
    Array.isArray(content)
  ) {
    return {
      title: "",
      detail: undefined as string | undefined,
    };
  }

  const value = content as Record<string, unknown>;

  const title =
    typeof value.text === "string"
      ? value.text
      : typeof value.title === "string"
        ? value.title
        : typeof value.message === "string"
          ? value.message
          : "";

  const detail =
    typeof value.detail === "string"
      ? value.detail
      : undefined;

  return {
    title,
    detail,
  };
}

export async function GET(req: NextRequest) {
  try {
    const auth = await getUser();

    if (!auth?.user || !auth.tenant) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const siteId =
      req.nextUrl.searchParams
        .get("siteId")
        ?.trim() || "";

    const pageId =
      req.nextUrl.searchParams
        .get("pageId")
        ?.trim() || "";

    if (!siteId) {
      return Response.json(
        { error: "Missing site." },
        { status: 400 },
      );
    }

    const conversation =
      await prisma.aIConversation.findFirst({
        where: {
          tenantId: auth.tenant.id,
          siteId,
          pageId,
        },

        select: {
          id: true,

          messages: {
            orderBy: {
              createdAt: "asc",
            },

            select: {
              id: true,
              role: true,
              content: true,
              createdAt: true,
            },

            take: 200,
          },
        },
      });

    if (!conversation) {
      return Response.json({
        data: {
          events: [],
        },
      });
    }

    const events = conversation.messages
      .filter(
        (message) =>
          message.role === "user" ||
          message.role === "assistant",
      )
      .map((message) => {
        const content =
          textFromContent(message.content);

        return {
          id: message.id,
          type: "message" as const,

          role:
            message.role === "assistant"
              ? ("assistant" as const)
              : ("user" as const),

          title:
            content.title ||
            (message.role === "assistant"
              ? "BuildEZ response"
              : "User request"),

          detail: content.detail,

          timestamp:
            message.createdAt.toISOString(),
        };
      });

    return Response.json({
      data: {
        events,
      },
    });
  } catch (error) {
    console.error(
      "[AI history] route failed",
      error,
    );

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "AI chat history could not be loaded.",
      },
      { status: 500 },
    );
  }
}
