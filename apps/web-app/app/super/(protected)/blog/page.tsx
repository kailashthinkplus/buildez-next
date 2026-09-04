"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ImageOff, Newspaper, Plus, Search, Trash2 } from "lucide-react";

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  status: string;
  coverImageUrl: string | null;
  tags: string[];
  publishedAt: string | null;
  createdAt: string;
};

function date(value: string | null) {
  return value ? new Date(value).toLocaleDateString() : "—";
}

export default function BlogListPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/super/blog${query ? `?q=${encodeURIComponent(query)}` : ""}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Request failed");
      setPosts(data.posts || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    const timer = setTimeout(load, 180);
    return () => clearTimeout(timer);
  }, [load]);

  async function remove(id: string) {
    if (!window.confirm("Delete this post? This can't be undone.")) return;
    setBusy(id);
    try {
      const response = await fetch(`/api/super/blog/${id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Delete failed");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setBusy("");
    }
  }

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[.14em] dashboard-faint">
            <Newspaper size={15} /> Marketing
          </div>
          <h1 className="text-3xl font-semibold tracking-[-.035em]">Blog</h1>
          <p className="mt-2 text-sm dashboard-muted">Posts published on the public BuildEZ marketing blog.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/super/blog/new" className="dashboard-primary-button inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white">
            <Plus size={16} /> New post
          </Link>
          <span className="dashboard-card rounded-xl px-4 py-2.5 text-sm font-semibold">{posts.length} posts</span>
        </div>
      </div>

      <div className="relative mt-5 max-w-xl">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 dashboard-muted" size={18} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search posts..."
          className="dashboard-input h-12 w-full rounded-xl pl-11 pr-4 text-sm"
        />
      </div>

      {error && <div className="mt-4 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-600 dark:text-rose-300">{error}</div>}

      <div className="dashboard-card mt-5 overflow-visible rounded-3xl">
        {loading ? (
          <div className="p-12 text-center text-sm dashboard-muted">Loading posts…</div>
        ) : !posts.length ? (
          <div className="p-12 text-center text-sm dashboard-muted">No matching posts found.</div>
        ) : (
          <div className="overflow-x-auto rounded-3xl">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="dashboard-subtle text-[10px] font-semibold uppercase tracking-[.14em] dashboard-faint">
                <tr>
                  {["Post", "Status", "Tags", "Published", ""].map((h) => (
                    <th key={h} className="px-5 py-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id} className="border-t dashboard-border transition dashboard-hover">
                    <td className="px-5 py-4 align-middle">
                      <Link href={`/super/blog/${post.id}`} className="group flex items-center gap-3">
                        <span className="grid h-12 w-16 shrink-0 place-items-center overflow-hidden rounded-lg dashboard-subtle">
                          {post.coverImageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={post.coverImageUrl} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <ImageOff size={16} className="dashboard-faint" />
                          )}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate font-semibold text-[var(--dashboard-text)] group-hover:text-blue-600">{post.title}</span>
                          <span className="block truncate text-xs dashboard-muted">/{post.slug}</span>
                        </span>
                      </Link>
                    </td>
                    <td className="px-5 py-4 align-middle">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${post.status === "PUBLISHED" ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "bg-amber-500/10 text-amber-700 dark:text-amber-300"}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${post.status === "PUBLISHED" ? "bg-emerald-500" : "bg-amber-500"}`} />
                        {post.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 align-middle text-xs dashboard-muted">{post.tags.join(", ") || "—"}</td>
                    <td className="px-5 py-4 align-middle text-sm dashboard-muted">{date(post.publishedAt)}</td>
                    <td className="px-5 py-4 text-right align-middle">
                      <button
                        onClick={() => void remove(post.id)}
                        disabled={busy === post.id}
                        aria-label="Delete post"
                        className="rounded-xl p-2 text-rose-500 dashboard-hover disabled:opacity-40"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
