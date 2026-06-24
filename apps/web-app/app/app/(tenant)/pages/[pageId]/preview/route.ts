// /app/api/pages/[pageId]/preview/route.ts
import { NextRequest } from "next/server";
import { apiHandler, ApiError } from "@/lib/api/apiHandler";
import { prisma } from "@buildez/db";
import { requirePermission } from "@/lib/auth/permissions";
import crypto from "crypto";

export const GET = apiHandler(async (req: NextRequest, { params }) => {
  const { pageId } = await ctx.params;

  await verifyPermission(req, "editPage");

  const tenantId = req.headers.get("x-tenant-id");

  const page = await prisma.page.findFirst({
    where: { id: pageId, tenantId },
  });

  if (!page) throw new ApiError("NOT_FOUND");

  // 1️⃣ Generate signed preview token
  const token = crypto.randomBytes(20).toString("hex");
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await prisma.previewToken.create({
    data: {
      token,
      pageId,
      expiresAt,
    },
  });

  // 2️⃣ Return preview URL
  return {
    success: true,
    previewUrl: `/render/${page.slug}?preview=1&token=${token}`,
  };
});
