import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { prisma } from "@buildez/db";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

export const dynamic = "force-dynamic";

function formatDate(value: Date | null) {
  return value ? value.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) : "";
}

async function getPost(slug: string) {
  return prisma.blogPost.findFirst({ where: { slug, status: "PUBLISHED" } });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  return {
    title: `${post.title} — BuildEZ Blog`,
    description: post.excerpt || undefined,
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  return (
    <div className="marketing-info-shell">
      <MarketingHeader />
      <main className="mx-auto w-[min(760px,calc(100%-40px))] py-24">
        <Link href="/blog" className="text-sm font-semibold text-[#1349a3] hover:underline dark:text-[#7cb5f4]">
          ← Back to blog
        </Link>

        <header className="mt-8">
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-[#1349a3]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#1349a3] dark:text-[#7cb5f4]">
                  {tag}
                </span>
              ))}
            </div>
          )}
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">{post.title}</h1>
          <p className="mt-4 text-sm text-[#778293]">
            {post.authorName ? `${post.authorName} · ` : ""}
            {formatDate(post.publishedAt)}
          </p>
        </header>

        {post.coverImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.coverImageUrl} alt="" className="mt-8 aspect-video w-full rounded-3xl object-cover" />
        )}

        <article className="prose prose-slate mt-10 max-w-none dark:prose-invert prose-headings:tracking-tight prose-a:text-[#1349a3] dark:prose-a:text-[#7cb5f4]">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </article>
      </main>
      <MarketingFooter />
    </div>
  );
}
