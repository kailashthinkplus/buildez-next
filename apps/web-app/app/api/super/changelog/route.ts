import { prisma } from "@buildez/db";
import { requireSuperAdmin, superAdminErrorResponse } from "@/lib/superadmin/auth";

export async function GET(req: Request) {
  try {
    await requireSuperAdmin(req);
    const entries = await prisma.changelogEntry.findMany({ orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }] });
    return Response.json({ entries });
  } catch (error) {
    return superAdminErrorResponse(error);
  }
}

export async function POST(req: Request) {
  try {
    await requireSuperAdmin(req);
    const body = await req.json().catch(() => ({})) as Record<string, unknown>;
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const summary = typeof body.summary === "string" ? body.summary.trim() : "";
    if (!title || !summary) return Response.json({ error: "Title and summary are required." }, { status: 400 });
    const bullets = Array.isArray(body.bullets) ? body.bullets.filter((v): v is string => typeof v === "string" && v.trim().length > 0) : [];
    const status = body.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT";

    const entry = await prisma.changelogEntry.create({
      data: {
        title,
        summary,
        bullets,
        status,
        publishedAt: status === "PUBLISHED" ? new Date() : null,
      },
    });
    return Response.json({ entry }, { status: 201 });
  } catch (error) {
    return superAdminErrorResponse(error);
  }
}
