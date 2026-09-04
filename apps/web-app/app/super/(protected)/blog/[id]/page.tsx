"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ExternalLink, ImageOff, Loader2, Trash2, Upload } from "lucide-react";

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImageUrl: string | null;
  authorName: string | null;
  status: string;
  tags: string[];
};

const EMPTY: BlogPost = {
  id: "",
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  coverImageUrl: null,
  authorName: "",
  status: "DRAFT",
  tags: [],
};

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export default function BlogEditorPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const isNew = params.id === "new";
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [post, setPost] = useState<BlogPost>(EMPTY);
  const [tagsInput, setTagsInput] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isNew) return;
    let cancelled = false;
    fetch(`/api/super/blog/${params.id}`, { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => {
        if (cancelled) return;
        if (data.post) {
          setPost(data.post);
          setTagsInput((data.post.tags || []).join(", "));
          setSlugTouched(true);
        } else {
          setError(data.error || "Post not found");
        }
      })
      .catch(() => { if (!cancelled) setError("Could not load post"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [isNew, params.id]);

  function updateTitle(title: string) {
    setPost((current) => ({ ...current, title, slug: slugTouched ? current.slug : slugify(title) }));
  }

  async function uploadCover(file: File) {
    setUploading(true);
    setError("");
    try {
      const form = new FormData();
      form.set("file", file);
      const response = await fetch("/api/super/blog/upload-cover", { method: "POST", body: form });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Upload failed");
      setPost((current) => ({ ...current, coverImageUrl: data.url }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function save(nextStatus?: "DRAFT" | "PUBLISHED") {
    if (!post.title.trim()) { setError("Title is required"); return; }
    setSaving(true);
    setError("");
    try {
      const body = {
        title: post.title,
        slug: post.slug || slugify(post.title),
        excerpt: post.excerpt,
        content: post.content,
        coverImageUrl: post.coverImageUrl,
        authorName: post.authorName,
        tags: tagsInput.split(",").map((tag) => tag.trim()).filter(Boolean),
        status: nextStatus || post.status,
      };
      const response = await fetch(isNew ? "/api/super/blog" : `/api/super/blog/${post.id}`, {
        method: isNew ? "POST" : "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Save failed");
      if (isNew) {
        router.replace(`/super/blog/${data.post.id}`);
      } else {
        setPost(data.post);
        setSlugTouched(true);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (isNew || !window.confirm("Delete this post? This can't be undone.")) return;
    setSaving(true);
    try {
      await fetch(`/api/super/blog/${post.id}`, { method: "DELETE" });
      router.push("/super/blog");
    } catch {
      setError("Delete failed");
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="dashboard-card mt-6 flex h-40 items-center justify-center rounded-3xl"><Loader2 className="animate-spin dashboard-muted" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/super/blog" className="rounded-xl p-2 dashboard-hover"><ArrowLeft size={18} /></Link>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[.14em] dashboard-faint">{isNew ? "New post" : "Edit post"}</p>
            <h1 className="text-2xl font-semibold tracking-[-.02em]">{isNew ? "Untitled post" : post.title || "Untitled post"}</h1>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {!isNew && post.status === "PUBLISHED" && (
            <a href={`/blog/${post.slug}`} target="_blank" rel="noreferrer" className="dashboard-card inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold">
              <ExternalLink size={15} /> View live
            </a>
          )}
          {!isNew && (
            <button onClick={() => void remove()} disabled={saving} className="inline-flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-2.5 text-sm font-semibold text-rose-600 disabled:opacity-50 dark:text-rose-300">
              <Trash2 size={15} /> Delete
            </button>
          )}
        </div>
      </div>

      {error && <div className="mt-4 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-600 dark:text-rose-300">{error}</div>}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="dashboard-card space-y-5 rounded-3xl p-5 sm:p-6">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold dashboard-muted">Title</span>
            <input value={post.title} onChange={(e) => updateTitle(e.target.value)} className="dashboard-input w-full rounded-xl px-4 py-3 text-sm" placeholder="How BuildEZ helps you launch faster" />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold dashboard-muted">Slug</span>
            <input value={post.slug} onChange={(e) => { setSlugTouched(true); setPost((c) => ({ ...c, slug: slugify(e.target.value) })); }} className="dashboard-input w-full rounded-xl px-4 py-3 text-sm font-mono" placeholder="how-buildez-helps-you-launch-faster" />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold dashboard-muted">Excerpt</span>
            <textarea value={post.excerpt || ""} onChange={(e) => setPost((c) => ({ ...c, excerpt: e.target.value }))} rows={2} className="dashboard-input w-full rounded-xl px-4 py-3 text-sm" placeholder="A short summary shown on the blog index" />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold dashboard-muted">Content (Markdown)</span>
            <textarea value={post.content} onChange={(e) => setPost((c) => ({ ...c, content: e.target.value }))} rows={18} className="dashboard-input w-full rounded-xl px-4 py-3 font-mono text-sm" placeholder={"## Heading\n\nWrite your post in Markdown."} />
          </label>
        </div>

        <div className="space-y-5">
          <div className="dashboard-card rounded-3xl p-5">
            <span className="mb-2 block text-xs font-semibold dashboard-muted">Cover image</span>
            <div className="flex aspect-video items-center justify-center overflow-hidden rounded-xl dashboard-subtle">
              {post.coverImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={post.coverImageUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <ImageOff className="dashboard-faint" size={28} />
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="hidden"
              onChange={(e) => { const file = e.target.files?.[0]; if (file) void uploadCover(file); e.target.value = ""; }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border dashboard-border px-4 py-2.5 text-sm font-semibold dashboard-hover disabled:opacity-50"
            >
              {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
              {uploading ? "Uploading…" : post.coverImageUrl ? "Replace image" : "Upload image"}
            </button>
          </div>

          <div className="dashboard-card space-y-4 rounded-3xl p-5">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold dashboard-muted">Author</span>
              <input value={post.authorName || ""} onChange={(e) => setPost((c) => ({ ...c, authorName: e.target.value }))} className="dashboard-input w-full rounded-xl px-4 py-3 text-sm" placeholder="BuildEZ Team" />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-semibold dashboard-muted">Tags (comma separated)</span>
              <input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} className="dashboard-input w-full rounded-xl px-4 py-3 text-sm" placeholder="product, launch" />
            </label>
          </div>

          <div className="dashboard-card space-y-3 rounded-3xl p-5">
            <button onClick={() => void save()} disabled={saving} className="w-full rounded-xl border dashboard-border px-4 py-2.5 text-sm font-semibold dashboard-hover disabled:opacity-50">
              {saving ? "Saving…" : "Save draft"}
            </button>
            <button onClick={() => void save("PUBLISHED")} disabled={saving} className="dashboard-primary-button w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
              {post.status === "PUBLISHED" ? "Update & keep published" : "Publish"}
            </button>
            {post.status === "PUBLISHED" && (
              <button onClick={() => void save("DRAFT")} disabled={saving} className="w-full rounded-xl px-4 py-2 text-xs font-semibold text-amber-600 dashboard-hover dark:text-amber-300">
                Unpublish
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
