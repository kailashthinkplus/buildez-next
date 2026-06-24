// /apps/web-app/app/api/ai/message/route.ts

import { NextRequest } from "next/server";
import { prisma } from "@buildez/db";
import { apiHandler } from "@/lib/api/apiHandler";
import { verifyTenantAccess } from "@/lib/auth/verifyTenant";

/**
 * POST /api/ai/message
 * Body:
 * {
 *   conversationId: string
 *   role: "user" | "assistant"
 *   content: string
 * }
 */
export const POST = async (req: NextRequest) => {
  return apiHandler(async () => {
    const tenant = await verifyTenantAccess(req);
    if (!tenant) {
      return { error: "Unauthorized" };
    }

    const body = await req.json();
    const { conversationId, role, content } = body;

    if (
      !conversationId ||
      !role ||
      typeof content !== "string"
    ) {
      throw new Error("Invalid request body");
    }

    if (role !== "user" && role !== "assistant") {
      throw new Error("Invalid role");
    }

    const message = await prisma.aIMessage.create({
      data: {
        conversationId,
        role,
        content,
      },
    });

    return {
      id: message.id,
      role: message.role,
      content: message.content,
      createdAt: message.createdAt,
    };
  });
};
