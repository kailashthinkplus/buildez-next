import { prisma } from "@buildez/db";
import { requireSuperAdmin, superAdminErrorResponse } from "@/lib/superadmin/auth";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "post";
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireSuperAdmin(req);
    const { id } = await params;
    const post = await prisma.blogPost.findUnique({ where: { id } });
    if (!post) return Response.json({ error: "Post not found" }, { status: 404 });
    return Response.json({ post });
  } catch (error) { return superAdminErrorResponse(error); }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireSuperAdmin(req);
    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.blogPost.findUnique({ where: { id } });
    if (!existing) return Response.json({ error: "Post not found" }, { status: 404 });

    const data: Record<string, unknown> = {};
    if (typeof body.title === "string" && body.title.trim()) data.title = body.title.trim();
    if (typeof body.excerpt === "string") data.excerpt = body.excerpt.trim() || null;
    if (typeof body.content === "string") data.content = body.content;
    if (typeof body.coverImageUrl === "string") data.coverImageUrl = body.coverImageUrl.trim() || null;
    if (typeof body.authorName === "string") data.authorName = body.authorName.trim() || null;
    if (Array.isArray(body.tags)) data.tags = body.tags.filter((tag: unknown): tag is string => typeof tag === "string");

    if (typeof body.slug === "string" && body.slug.trim()) {
      const nextSlug = slugify(body.slug);
      if (nextSlug !== existing.slug) {
        const conflict = await prisma.blogPost.findUnique({ where: { slug: nextSlug }, select: { id: true } });
        if (conflict) return Response.json({ error: "That slug is already in use" }, { status: 409 });
        data.slug = nextSlug;
      }
    }

    if (body.status === "DRAFT" || body.status === "PUBLISHED") {
      data.status = body.status;
      if (body.status === "PUBLISHED" && !existing.publishedAt) data.publishedAt = new Date();
      if (body.status === "DRAFT") data.publishedAt = null;
    }

    const post = await prisma.blogPost.update({ where: { id }, data });
    return Response.json({ post });
  } catch (error) { return superAdminErrorResponse(error); }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireSuperAdmin(req);
    const { id } = await params;
    await prisma.blogPost.delete({ where: { id } }).catch(() => null);
    return Response.json({ success: true });
  } catch (error) { return superAdminErrorResponse(error); }
}
