// /app/api/pages/[pageId]/preview/route.ts
import { apiHandler } from "@/lib/api/apiHandler";
import { NotFoundError } from "@/lib/api/errors";
import { prisma } from "@buildez/db";
import { requirePermission } from "@/lib/auth/permissions";
import crypto from "crypto";

export const GET = apiHandler(async ({ req, auth, params }) => {
  const pageId = params?.pageId;
  if (!pageId) throw new NotFoundError();

  requirePermission();

  const page = await prisma.page.findFirst({
    where: { id: pageId, site: { tenantId: auth.tenant.id } },
  });

  if (!page) throw new NotFoundError();

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
