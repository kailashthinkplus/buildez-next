"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FilePlus2, ImageOff, Loader2, Newspaper, Save, Trash2, Upload, X } from "lucide-react";
import { useWorkspace } from "../../components/WorkspaceContext";
import { DashboardModalPortal } from "../../components/ui/DashboardModalPortal";
import { useMedia } from "@/modules/builder-v2/media/hooks/useMedia";
import DashboardRichTextEditor from "../../components/DashboardRichTextEditor";

const BLOG_COLLECTION_SLUG = "blog";

const BLOG_FIELDS = [
  { id: crypto.randomUUID(), name: "Title", key: "title", type: "text", required: true },
  { id: crypto.randomUUID(), name: "Slug", key: "slug", type: "text", required: true },
  { id: crypto.randomUUID(), name: "Excerpt", key: "excerpt", type: "text" },
  { id: crypto.randomUUID(), name: "Content", key: "content", type: "richText" },
  { id: crypto.randomUUID(), name: "Cover image", key: "coverImage", type: "image" },
  { id: crypto.randomUUID(), name: "Tags", key: "tags", type: "text" },
];

type Collection = { id: string; slug: string; name: string; fields: { key: string; name: string; type: string }[] };
type Entry = { id: string; data: Record<string, any>; status: string; updatedAt: string };

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export default function BlogPage() {
  const { currentWebsite } = useWorkspace();
  const siteId = currentWebsite?.id;

  const [collection, setCollection] = useState<Collection | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Entry | null>(null);
  const [error, setError] = useState("");

  async function ensureCollection() {
    if (!siteId) return null;
    const response = await fetch(`/api/cms/collections?siteId=${siteId}`);
    const body = await response.json();
    const list: Collection[] = body.collections || [];
    const existing = list.find((c) => c.slug === BLOG_COLLECTION_SLUG);
    if (existing) return existing;

    const created = await fetch("/api/cms/collections", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ siteId, name: "Blog Posts", slug: BLOG_COLLECTION_SLUG, description: "Posts shown on this website's blog", fields: BLOG_FIELDS }),
    });
    const createdBody = await created.json();
    if (!created.ok) throw new Error(createdBody.error || "Could not set up the blog");
    return createdBody.collection as Collection;
  }

  async function loadEntries(collectionId: string) {
    const response = await fetch(`/api/cms/entries?collectionId=${collectionId}`);
    const body = await response.json();
    setEntries(body.entries || []);
  }

  async function load() {
    if (!siteId) return;
    setLoading(true);
    setError("");
    try {
      const found = await ensureCollection();
      setCollection(found);
      if (found) await loadEntries(found.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load blog posts");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteId]);

  return (
    <div className="min-h-full bg-transparent">
      <main className="min-w-0 px-6 py-8 md:px-10 lg:px-12">
        <div className="mx-auto mb-7 flex max-w-6xl flex-wrap items-center gap-3">
          <div className="mr-auto">
            <h1 className="flex items-center gap-2 text-2xl font-semibold"><Newspaper className="text-blue-500" />Blog</h1>
            <p className="mt-1 text-sm dashboard-muted">Write and publish posts for this website's blog.</p>
          </div>
          <button
            onClick={() => setEditing({ id: "", data: {}, status: "DRAFT", updatedAt: "" })}
            disabled={!collection}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-500 disabled:opacity-50"
          >
            <FilePlus2 size={16} /> New post
          </button>
        </div>

        {error && <div className="mx-auto max-w-6xl rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-600 dark:text-rose-300">{error}</div>}

        <div className="mx-auto w-full max-w-6xl overflow-hidden rounded-2xl dashboard-card">
          <div className="hidden grid-cols-[80px_minmax(0,1fr)_120px_150px_32px] gap-4 border-b dashboard-border px-6 py-3.5 text-xs font-semibold uppercase dashboard-faint sm:grid">
            <span>Cover</span><span>Post</span><span>Status</span><span>Updated</span><span />
          </div>
          {loading ? (
            <div className="p-16 text-center dashboard-muted"><Loader2 className="mx-auto mb-3 animate-spin opacity-40" /></div>
          ) : entries.length ? (
            entries.map((entry) => (
              <button
                key={entry.id}
                onClick={() => setEditing(entry)}
                className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b dashboard-border px-5 py-4 text-left last:border-0 dashboard-hover sm:grid-cols-[80px_minmax(0,1fr)_120px_150px_32px] sm:gap-4 sm:px-6"
              >
                <span className="hidden h-10 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg dashboard-subtle sm:flex">
                  {entry.data.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={entry.data.coverImage} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <ImageOff size={14} className="dashboard-faint" />
                  )}
                </span>
                <span className="truncate text-sm font-medium">{entry.data.title || "Untitled post"}</span>
                <span className={`hidden w-fit rounded-full px-2.5 py-1 text-[11px] font-medium sm:block ${entry.status === "PUBLISHED" ? "bg-emerald-500/15 text-emerald-500" : "bg-amber-500/15 text-amber-500"}`}>{entry.status}</span>
                <span className="hidden text-xs dashboard-muted sm:block">{new Date(entry.updatedAt).toLocaleDateString()}</span>
                <span className="dashboard-muted">›</span>
              </button>
            ))
          ) : (
            <div className="px-6 py-16 text-center dashboard-muted">
              <Newspaper className="mx-auto mb-3 opacity-40" />
              <p className="text-sm font-medium">No posts yet</p>
              <p className="mt-1 text-xs opacity-70">Write your first post to populate this site's blog.</p>
            </div>
          )}
        </div>

        <p className="mx-auto mt-4 max-w-6xl text-xs dashboard-muted">
          To show these posts on your live site, ask the AI builder to add a blog section connected to the &quot;Blog Posts&quot; content collection.
        </p>
      </main>

      {editing && collection && siteId && (
        <PostEditor
          siteId={siteId}
          collection={collection}
          entry={editing}
          existingEntries={entries}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); void loadEntries(collection.id); }}
        />
      )}
    </div>
  );
}

function PostEditor({
  siteId,
  collection,
  entry,
  existingEntries,
  onClose,
  onSaved,
}: {
  siteId: string;
  collection: Collection;
  entry: Entry;
  existingEntries: Entry[];
  onClose(): void;
  onSaved(): void;
}) {
  const { uploadImage, uploading } = useMedia(siteId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(entry.data.title || "");
  const [slug, setSlug] = useState(entry.data.slug || "");
  const [slugTouched, setSlugTouched] = useState(Boolean(entry.data.slug));
  const [excerpt, setExcerpt] = useState(entry.data.excerpt || "");
  const [content, setContent] = useState(entry.data.content || "");
  const [coverImage, setCoverImage] = useState(entry.data.coverImage || "");
  const [tags, setTags] = useState(entry.data.tags || "");
  const [status, setStatus] = useState(entry.status || "DRAFT");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function updateTitle(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  async function handleUpload(file: File) {
    setError("");
    try {
      const asset = await uploadImage(file);
      setCoverImage(asset.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    }
  }

  async function save() {
    const finalSlug = slug.trim() ? slugify(slug) : slugify(title);
    if (!title.trim()) { setError("Title is required"); return; }
    const conflict = existingEntries.find((other) => other.id !== entry.id && other.data.slug === finalSlug);
    if (conflict) { setError("Another post already uses that slug"); return; }

    setSaving(true);
    setError("");
    try {
      const data = { title, slug: finalSlug, excerpt, content, coverImage, tags };
      const response = await fetch(entry.id ? `/api/cms/entries/${entry.id}` : "/api/cms/entries", {
        method: entry.id ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ collectionId: collection.id, data, status }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Could not save post");
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save post");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!entry.id || !window.confirm("Delete this post?")) return;
    await fetch(`/api/cms/entries/${entry.id}`, { method: "DELETE" });
    onSaved();
  }

  return (
    <DashboardModalPortal onClose={onClose}>
      <div className="fixed inset-0 flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm" onMouseDown={onClose}>
        <div role="dialog" aria-modal="true" aria-label={entry.id ? "Edit post" : "New post"} className="dashboard-modal-surface my-auto max-h-[calc(100dvh-2rem)] w-full max-w-2xl overflow-y-auto rounded-2xl border dashboard-border p-6 shadow-2xl md:p-7" onMouseDown={(e) => e.stopPropagation()}>
          <div className="mb-6 flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold tracking-tight">{entry.id ? "Edit post" : "New post"}</h2>
            <button onClick={onClose} aria-label="Close modal" className="rounded-lg p-2 dashboard-hover"><X size={20} /></button>
          </div>

          <div className="grid gap-5 sm:grid-cols-[1fr_180px]">
            <div className="space-y-4">
              <label className="block text-xs font-medium dashboard-muted">
                Title
                <input value={title} onChange={(e) => updateTitle(e.target.value)} className="mt-1.5 w-full rounded-xl border dashboard-border bg-transparent px-3 py-2.5 text-sm outline-none" />
              </label>
              <label className="block text-xs font-medium dashboard-muted">
                Slug
                <input value={slug} onChange={(e) => { setSlugTouched(true); setSlug(slugify(e.target.value)); }} className="mt-1.5 w-full rounded-xl border dashboard-border bg-transparent px-3 py-2.5 font-mono text-sm outline-none" />
              </label>
              <label className="block text-xs font-medium dashboard-muted">
                Excerpt
                <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={2} className="mt-1.5 w-full resize-none rounded-xl border dashboard-border bg-transparent px-3 py-2.5 text-sm outline-none" />
              </label>
              <label className="block text-xs font-medium dashboard-muted">
                Content
                <div className="mt-1.5">
                  <DashboardRichTextEditor value={content} onChange={setContent} />
                </div>
              </label>
              <label className="block text-xs font-medium dashboard-muted">
                Tags (comma separated)
                <input value={tags} onChange={(e) => setTags(e.target.value)} className="mt-1.5 w-full rounded-xl border dashboard-border bg-transparent px-3 py-2.5 text-sm outline-none" />
              </label>
            </div>

            <div>
              <span className="block text-xs font-medium dashboard-muted">Cover image</span>
              <div className="mt-1.5 flex aspect-video items-center justify-center overflow-hidden rounded-xl dashboard-subtle">
                {coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={coverImage} alt="" className="h-full w-full object-cover" />
                ) : (
                  <ImageOff size={22} className="dashboard-faint" />
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) void handleUpload(file); e.target.value = ""; }} />
              <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border dashboard-border px-3 py-2 text-xs font-semibold dashboard-hover disabled:opacity-50">
                {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                {uploading ? "Uploading…" : coverImage ? "Replace" : "Upload"}
              </button>
            </div>
          </div>

          {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

          <div className="mt-6 flex items-center gap-3 border-t dashboard-border pt-5">
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border dashboard-border bg-transparent px-3 py-2 text-sm">
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
            </select>
            <button onClick={() => void save()} disabled={saving} className="ml-auto flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm text-white disabled:opacity-50">
              <Save size={16} /> {saving ? "Saving…" : "Save"}
            </button>
            {entry.id && <button onClick={() => void remove()} className="rounded-xl p-2 text-red-500 dashboard-hover"><Trash2 size={18} /></button>}
          </div>
        </div>
      </div>
    </DashboardModalPortal>
  );
}
