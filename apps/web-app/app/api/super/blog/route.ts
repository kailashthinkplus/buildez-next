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

async function uniqueSlug(base: string) {
  let slug = base;
  let suffix = 1;
  while (await prisma.blogPost.findUnique({ where: { slug }, select: { id: true } })) {
    suffix += 1;
    slug = `${base}-${suffix}`;
  }
  return slug;
}

export async function GET(req: Request) {
  try {
    await requireSuperAdmin(req);
    const query = (new URL(req.url).searchParams.get("q") || "").trim();
    const posts = await prisma.blogPost.findMany({
      where: query
        ? { OR: [{ title: { contains: query, mode: "insensitive" } }, { slug: { contains: query, mode: "insensitive" } }, { tags: { has: query } }] }
        : {},
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    return Response.json({ posts });
  } catch (error) { return superAdminErrorResponse(error); }
}

export async function POST(req: Request) {
  try {
    await requireSuperAdmin(req);
    const body = await req.json();
    const title = typeof body.title === "string" ? body.title.trim() : "";
    if (!title) return Response.json({ error: "Title is required" }, { status: 400 });

    const requestedSlug = typeof body.slug === "string" && body.slug.trim() ? slugify(body.slug) : slugify(title);
    const slug = await uniqueSlug(requestedSlug);
    const status = body.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT";

    const post = await prisma.blogPost.create({
      data: {
        title,
        slug,
        excerpt: typeof body.excerpt === "string" ? body.excerpt.trim() || null : null,
        content: typeof body.content === "string" ? body.content : "",
        coverImageUrl: typeof body.coverImageUrl === "string" ? body.coverImageUrl.trim() || null : null,
        authorName: typeof body.authorName === "string" ? body.authorName.trim() || null : null,
        tags: Array.isArray(body.tags) ? body.tags.filter((tag: unknown): tag is string => typeof tag === "string") : [],
        status,
        publishedAt: status === "PUBLISHED" ? new Date() : null,
      },
    });
    return Response.json({ post });
  } catch (error) { return superAdminErrorResponse(error); }
}
