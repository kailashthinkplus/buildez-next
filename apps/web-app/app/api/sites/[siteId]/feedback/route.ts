import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@buildez/db";
import { getUser } from "@/lib/auth/getUser";
import { ApiError } from "@/lib/api/errors";
import { applyRateLimit } from "@/lib/api/rate-limit";
import { assertPromptAllowed } from "@/lib/ai/moderation";

const PRIVATE_HEADERS = { "Cache-Control": "private, no-store, max-age=0", Vary: "Cookie" };
const RATE_LIMIT_PER_HOUR = 20;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> },
) {
  const auth = await getUser();
  if (!auth?.user || !auth.tenant) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: PRIVATE_HEADERS });
  }

  const { siteId } = await params;
  const body = await req.json().catch(() => ({}));

  const rating = Number(body.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "A rating from 1 to 5 is required." }, { status: 400, headers: PRIVATE_HEADERS });
  }
  const comment = typeof body.comment === "string" ? body.comment.trim().slice(0, 2000) : "";
  const pageId = typeof body.pageId === "string" && body.pageId.trim() ? body.pageId.trim() : undefined;

  try {
    await applyRateLimit({
      key: `rl:ai:feedback:user:${auth.user.id}`,
      limit: RATE_LIMIT_PER_HOUR,
      windowSeconds: 3600,
    });
    if (comment) assertPromptAllowed(comment);
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 500;
    const code = error instanceof ApiError ? error.code : undefined;
    const message = error instanceof Error ? error.message : "Request could not be processed.";
    return NextResponse.json({ error: message, code }, { status, headers: PRIVATE_HEADERS });
  }

  const site = await prisma.site.findFirst({
    where: { id: siteId, tenantId: auth.tenant.id, deletedAt: null },
    select: { id: true },
  });
  if (!site) {
    return NextResponse.json({ error: "Site not found." }, { status: 404, headers: PRIVATE_HEADERS });
  }

  const feedback = await prisma.websiteFeedback.create({
    data: {
      siteId: site.id,
      tenantId: auth.tenant.id,
      userId: auth.user.id,
      pageId,
      rating,
      comment: comment || null,
    },
  });

  return NextResponse.json({ feedback: { id: feedback.id } }, { headers: PRIVATE_HEADERS });
}
