import { prisma } from "@buildez/db";
import { requireSuperAdmin, superAdminErrorResponse } from "@/lib/superadmin/auth";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireSuperAdmin(req);
    const { id } = await params;
    const body = await req.json().catch(() => ({})) as Record<string, unknown>;
    const entry = await prisma.changelogEntry.findUnique({ where: { id } });
    if (!entry) return Response.json({ error: "Entry not found." }, { status: 404 });

    const nextStatus = body.status === "PUBLISHED" || body.status === "DRAFT" ? body.status : undefined;
    const updated = await prisma.changelogEntry.update({
      where: { id },
      data: {
        title: typeof body.title === "string" ? body.title.trim() : undefined,
        summary: typeof body.summary === "string" ? body.summary.trim() : undefined,
        bullets: Array.isArray(body.bullets) ? body.bullets.filter((v): v is string => typeof v === "string" && v.trim().length > 0) : undefined,
        status: nextStatus,
        publishedAt: nextStatus === "PUBLISHED" && !entry.publishedAt ? new Date() : nextStatus === "DRAFT" ? null : undefined,
      },
    });
    return Response.json({ entry: updated });
  } catch (error) {
    return superAdminErrorResponse(error);
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireSuperAdmin(req);
    const { id } = await params;
    await prisma.changelogEntry.delete({ where: { id } }).catch(() => undefined);
    return Response.json({ ok: true });
  } catch (error) {
    return superAdminErrorResponse(error);
  }
}
