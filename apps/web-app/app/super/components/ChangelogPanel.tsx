"use client";

import { useEffect, useState } from "react";
import { Megaphone, Plus, Trash2 } from "lucide-react";

type Entry = {
  id: string;
  title: string;
  summary: string;
  bullets: string[];
  status: "DRAFT" | "PUBLISHED";
  publishedAt: string | null;
};

const EMPTY_FORM = { title: "", summary: "", bulletsText: "" };

export default function ChangelogPanel() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/super/changelog", { cache: "no-store" });
    const data = await res.json().catch(() => ({ entries: [] }));
    setEntries(data.entries || []);
    setLoading(false);
  }

  useEffect(() => { void load(); }, []);

  async function createEntry(e: React.FormEvent, status: "DRAFT" | "PUBLISHED") {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/super/changelog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          summary: form.summary,
          bullets: form.bulletsText.split("\n").map((line) => line.trim()).filter(Boolean),
          status,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not save entry.");
      setOpen(false);
      setForm(EMPTY_FORM);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save entry.");
    } finally {
      setBusy(false);
    }
  }

  async function toggleStatus(entry: Entry) {
    await fetch(`/api/super/changelog/${entry.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: entry.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED" }),
    });
    await load();
  }

  async function remove(entry: Entry) {
    if (!confirm(`Delete "${entry.title}"?`)) return;
    await fetch(`/api/super/changelog/${entry.id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div>
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[.14em] dashboard-faint">
        <Megaphone size={15} /> Global administration
      </div>
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-3xl font-semibold tracking-[-.035em]">Changelog</h1>
          <p className="mt-2 text-sm dashboard-muted">Publish product updates to the public changelog page.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setOpen(true)} className="dashboard-primary-button inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white">
            <Plus size={16} /> New entry
          </button>
          <span className="dashboard-card rounded-xl px-4 py-2.5 text-sm font-semibold">{entries.length} entries</span>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {loading ? (
          <div className="dashboard-card rounded-2xl p-6 text-center text-sm dashboard-muted">Loading…</div>
        ) : entries.length === 0 ? (
          <div className="dashboard-card rounded-2xl p-6 text-center text-sm dashboard-muted">No changelog entries yet.</div>
        ) : entries.map((entry) => (
          <div key={entry.id} className="dashboard-card rounded-2xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold">{entry.title}</h2>
                  <button onClick={() => toggleStatus(entry)} className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${entry.status === "PUBLISHED" ? "bg-emerald-500/15 text-emerald-500" : "bg-slate-500/15 text-slate-500"}`}>
                    {entry.status === "PUBLISHED" ? "Published" : "Draft"}
                  </button>
                </div>
                <p className="mt-1 text-sm dashboard-muted">{entry.summary}</p>
                {entry.bullets.length > 0 && (
                  <ul className="mt-2 list-disc space-y-0.5 pl-4 text-xs dashboard-muted">
                    {entry.bullets.map((b) => <li key={b}>{b}</li>)}
                  </ul>
                )}
              </div>
              <button onClick={() => remove(entry)} className="dashboard-faint hover:text-red-500 shrink-0" aria-label="Delete entry"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 px-4" onClick={() => setOpen(false)}>
          <form onClick={(e) => e.stopPropagation()} className="dashboard-card max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl p-6">
            <h2 className="mb-4 text-lg font-semibold">New changelog entry</h2>
            <div className="space-y-3">
              <label className="block text-xs font-medium dashboard-muted">
                Title
                <input required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="4 September 2026 — Production launch" className="mt-1 w-full rounded-lg border-0 bg-black/5 px-3 py-2 text-sm dark:bg-white/10" />
              </label>
              <label className="block text-xs font-medium dashboard-muted">
                Summary
                <textarea required value={form.summary} onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))} rows={3} className="mt-1 w-full rounded-lg border-0 bg-black/5 px-3 py-2 text-sm dark:bg-white/10" />
              </label>
              <label className="block text-xs font-medium dashboard-muted">
                Highlights (one per line)
                <textarea value={form.bulletsText} onChange={(e) => setForm((f) => ({ ...f, bulletsText: e.target.value }))} rows={4} className="mt-1 w-full rounded-lg border-0 bg-black/5 px-3 py-2 text-sm dark:bg-white/10" />
              </label>
            </div>
            {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setOpen(false)} className="rounded-xl px-4 py-2 text-sm font-semibold dashboard-muted">Cancel</button>
              <button type="button" disabled={busy} onClick={(e) => createEntry(e, "DRAFT")} className="dashboard-subtle rounded-xl px-4 py-2 text-sm font-semibold disabled:opacity-50">Save draft</button>
              <button type="button" disabled={busy} onClick={(e) => createEntry(e, "PUBLISHED")} className="dashboard-primary-button rounded-xl px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">
                {busy ? "Publishing…" : "Publish"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
