import Link from "next/link";
import { prisma } from "@buildez/db";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

export const dynamic = "force-dynamic";

function formatDate(value: Date | null) {
  return value ? value.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) : "";
}

export default async function BlogIndexPage() {
  const posts = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    select: { slug: true, title: true, excerpt: true, coverImageUrl: true, authorName: true, publishedAt: true, tags: true },
  });

  return (
    <div className="marketing-info-shell">
      <MarketingHeader />
      <main className="mx-auto w-[min(1080px,calc(100%-40px))] py-24">
        <header className="max-w-2xl">
          <span className="block text-xs font-bold uppercase tracking-[.16em] text-[#1349a3] dark:text-[#7cb5f4]">Blog</span>
          <h1 className="mt-4 text-5xl font-semibold tracking-tight sm:text-6xl">From the BuildEZ team</h1>
          <p className="mt-5 text-lg leading-relaxed text-[#596474] dark:text-[#a4afbe]">
            Product updates, launch stories, and ideas on building websites faster with AI.
          </p>
        </header>

        {!posts.length ? (
          <p className="mt-16 text-sm text-[#778293]">No posts published yet — check back soon.</p>
        ) : (
          <div className="mt-14 grid gap-6 sm:grid-cols-2">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group overflow-hidden rounded-3xl border border-black/10 bg-white/70 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-white/10 dark:bg-white/[0.03]"
              >
                {post.coverImageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={post.coverImageUrl} alt="" className="aspect-video w-full object-cover" />
                )}
                <div className="p-6">
                  {post.publishedAt && (
                    <span className="text-xs font-medium uppercase tracking-wide text-[#778293]">{formatDate(post.publishedAt)}</span>
                  )}
                  <h2 className="mt-2 text-xl font-semibold tracking-tight group-hover:text-[#1349a3] dark:group-hover:text-[#7cb5f4]">{post.title}</h2>
                  {post.excerpt && <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[#596474] dark:text-[#a4afbe]">{post.excerpt}</p>}
                  {post.authorName && <p className="mt-4 text-xs font-medium text-[#8a95a4]">{post.authorName}</p>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <MarketingFooter />
    </div>
  );
}
