"use client";

import { useEffect, useState } from "react";
import { Loader2, Rocket, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { useWorkspace } from "./WorkspaceContext";
import { DashboardModalPortal } from "./ui/DashboardModalPortal";

export type CreateSiteIntent = "dashboard" | "ai";

export type CreatedSite = {
 id: string;
 name: string;
 slug: string;
 status?: string;
};

type Props = {
 open: boolean;
 onClose: () => void;
 intent?: CreateSiteIntent;
 onCreated?: (
 site: CreatedSite,
 intent: CreateSiteIntent,
 ) => void | Promise<void>;
};

export default function CreateSiteModal({
 open,
 onClose,
 intent = "dashboard",
 onCreated,
}: Props) {
 const { plan, websites } = useWorkspace();

 const [name, setName] = useState("");
 const [slug, setSlug] = useState("");
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState<string | null>(null);
 const [success, setSuccess] = useState(false);

 const planLimits = (
 plan?.plan as { limits?: { sites?: number } } | undefined
 )?.limits;

 const siteLimit =
 planLimits?.sites ?? (plan?.planCode === "starter" ? 1 : 999);

 const usedSites = websites.length;
 const remaining = Math.max(siteLimit - usedSites, 0);
 const canCreate = remaining > 0;
 const usagePercent =
 siteLimit > 0
 ? Math.min(100, Math.round((usedSites / siteLimit) * 100))
 : 0;

 const planName =
 plan?.plan?.name ??
 plan?.planCode ??
 "Trial";

 useEffect(() => {
 if (!open) {
 setName("");
 setSlug("");
 setError(null);
 setSuccess(false);
 setLoading(false);
 }
 }, [open]);

 function autoSlug(value: string) {
 return value
 .toLowerCase()
 .trim()
 .replace(/[^a-z0-9]+/g, "-")
 .replace(/(^-|-$)+/g, "");
 }

 async function handleCreate() {
 const cleanName = name.trim();
 const cleanSlug = autoSlug(slug);

 if (!cleanName || !cleanSlug) {
 setError("Site name and slug are required");
 return;
 }

 if (!canCreate || loading) {
 return;
 }

 try {
 setLoading(true);
 setError(null);
 setSuccess(false);

 const response = await fetch("/api/sites", {
 method: "POST",
 credentials: "include",
 headers: {
 "Content-Type": "application/json",
 },
 body: JSON.stringify({
 name: cleanName,
 slug: cleanSlug,
 }),
 });

 const payload = await response.json().catch(() => null);

 if (!response.ok) {
 throw new Error(payload?.error || "Failed to create site");
 }

 const createdSite =
 payload?.site ??
 payload?.data?.site ??
 payload?.data ??
 payload;

 if (
 !createdSite ||
 typeof createdSite.id !== "string" ||
 typeof createdSite.slug !== "string"
 ) {
 throw new Error(
 "Website was created, but the server returned an invalid response.",
 );
 }

 const site: CreatedSite = {
 id: createdSite.id,
 name:
 typeof createdSite.name === "string"
 ? createdSite.name
 : cleanName,
 slug: createdSite.slug,
 status:
 typeof createdSite.status === "string"
 ? createdSite.status
 : undefined,
 };

 setSuccess(true);

 if (onCreated) {
 await onCreated(site, intent);
 return;
 }

 window.location.assign(
 intent === "ai"
 ? `/app/builder-v3/${site.id}?panel=ai`
 : `/app/${site.slug}/dashboard`,
 );
 } catch (reason: unknown) {
 setError(
 reason instanceof Error
 ? reason.message
 : "Failed to create site",
 );
 } finally {
 setLoading(false);
 }
 }

 if (!open) {
 return null;
 }

 return (
 <AnimatePresence>
 <DashboardModalPortal onClose={onClose}>
 <motion.div
 className="fixed inset-0 z-[120] flex items-center justify-center overflow-y-auto bg-white/10 p-4 backdrop-blur-xl dark:bg-black/25 sm:p-6"
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 onClick={() => {
 if (!loading) onClose();
 }}
 >
 <motion.div
 onClick={(event) => event.stopPropagation()}
 initial={{ opacity: 0, y: 12 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: 12 }}
 transition={{ duration: 0.2, ease: "easeOut" }}
 className="dashboard-modal-surface relative w-full max-w-5xl overflow-hidden rounded-3xl border dashboard-border shadow-2xl backdrop-blur-2xl"
 >
 <div className="flex items-center justify-between border-b dashboard-border px-6 py-4 md:px-8">
 <div>
 <div className="text-xs font-semibold uppercase tracking-[0.08em] text-[#7C5CFC]">
 Website setup
 </div>
 <h2 className="mt-1 text-2xl font-semibold">
 {intent === "ai"
 ? "Create website with AI"
 : "Create new website"}
 </h2>
 </div>

 <button
 type="button"
 onClick={onClose}
 disabled={loading}
 className="rounded-xl border dashboard-border p-2.5 dashboard-hover disabled:opacity-50"
 aria-label="Close create website"
 >
 <X size={18} />
 </button>
 </div>

 <div className="w-full p-5 md:p-6">
 <div className="grid w-full items-stretch gap-5 lg:grid-cols-[0.82fr_1.18fr]">
 <aside className="dashboard-card flex flex-col rounded-2xl border dashboard-border p-6">
 <div className="flex items-start justify-between gap-4">
 <div>
 <div className="text-xs font-semibold uppercase tracking-wide dashboard-faint">
 Current plan
 </div>

 <h3 className="mt-1 text-2xl font-semibold">
 {planName}
 </h3>
 </div>

 <div className="dashboard-subtle flex h-10 w-10 items-center justify-center rounded-xl text-[#7C5CFC]">
 <Rocket size={20} />
 </div>
 </div>

 <p className="mt-3 text-sm leading-6 dashboard-muted">
 {intent === "ai"
 ? "Your website will open in Builder 3 with the AI panel ready."
 : "Create a new website workspace under your current subscription."}
 </p>

 <div className="dashboard-subtle mt-5 rounded-2xl p-4">
 <div className="flex items-end justify-between gap-4">
 <div>
 <div className="text-xs dashboard-muted">
 Websites used
 </div>

 <div className="mt-1 text-2xl font-semibold">
 {usedSites}
 <span className="ml-1 text-sm font-normal dashboard-muted">
 of {siteLimit}
 </span>
 </div>
 </div>

 <div className="text-right">
 <div className="text-xs dashboard-muted">
 Remaining
 </div>

 <div className="mt-1 text-2xl font-semibold text-[#7C5CFC]">
 {remaining}
 </div>
 </div>
 </div>

 <div className="mt-4 h-2 overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
 <div
 className="h-full rounded-full bg-[#7C5CFC] transition-[width]"
 style={{ width: `${usagePercent}%` }}
 />
 </div>

 <div className="mt-2 flex justify-between text-xs dashboard-faint">
 <span>{usagePercent}% used</span>
 <span>{remaining} available</span>
 </div>
 </div>

 {!canCreate ? (
 <div className="dashboard-subtle mt-4 rounded-xl border dashboard-border p-3 text-sm dashboard-muted">
 You’ve reached your website limit. Change your plan to create more websites.
 </div>
 ) : (
 <div className="dashboard-subtle mt-4 rounded-xl border dashboard-border p-3 text-sm dashboard-muted">
 You can create {remaining} more {remaining === 1 ? "website" : "websites"} on this plan.
 </div>
 )}

 <button
 type="button"
 onClick={() => {
 window.location.assign("/app/workspace/billing");
 }}
 disabled={loading}
 className="mt-5 flex w-full items-center justify-center rounded-xl border border-[#7C5CFC]/35 bg-[#7C5CFC]/[0.06] px-4 py-2.5 text-sm font-semibold text-[#7C5CFC] transition hover:bg-[#7C5CFC]/[0.11] disabled:opacity-50"
 >
 Change plan
 </button>
 </aside>

 <section className="dashboard-card rounded-2xl border dashboard-border p-6">
 <div className="mb-5">
 <div className="text-xs font-semibold uppercase tracking-wide dashboard-faint">
 Website details
 </div>
 <h3 className="mt-1 text-xl font-semibold">
 Choose a name and address
 </h3>
 </div>

 <div className="space-y-5">
 <div>
 <label
 htmlFor="create-site-name"
 className="text-xs dashboard-muted"
 >
 Website name
 </label>

 <input
 id="create-site-name"
 value={name}
 disabled={loading}
 onChange={(event) => {
 const value = event.target.value;
 setName(value);
 setSlug(autoSlug(value));
 }}
 onKeyDown={(event) => {
 if (event.key === "Enter") {
 event.preventDefault();
 void handleCreate();
 }
 }}
 placeholder="My Startup"
 className="dashboard-input mt-1 w-full rounded-xl px-3 py-2"
 autoFocus
 />
 </div>

 <div>
 <label
 htmlFor="create-site-slug"
 className="text-xs dashboard-muted"
 >
 Site slug
 </label>

 <input
 id="create-site-slug"
 value={slug}
 disabled={loading}
 onChange={(event) =>
 setSlug(autoSlug(event.target.value))
 }
 onKeyDown={(event) => {
 if (event.key === "Enter") {
 event.preventDefault();
 void handleCreate();
 }
 }}
 placeholder="my-startup"
 className="dashboard-input mt-1 w-full rounded-xl px-3 py-2"
 />

 <p className="mt-2 text-xs dashboard-faint">
 {slug
 ? `${slug}.buildez.site`
 : "your-site.buildez.site"}
 </p>
 </div>
 </div>

 {error ? (
 <div className="mt-4 text-sm text-rose-500">
 {error}
 </div>
 ) : null}

 {success ? (
 <div className="mt-4 text-sm font-medium text-[#7C5CFC]">
 Website created successfully.
 </div>
 ) : null}

 <div className="mt-6 flex justify-end gap-3 border-t dashboard-border pt-5">
 <button
 type="button"
 onClick={onClose}
 disabled={loading}
 className="dashboard-subtle rounded-xl px-4 py-2 text-sm dashboard-hover disabled:opacity-50"
 >
 Cancel
 </button>

 <button
 type="button"
 onClick={() => void handleCreate()}
 disabled={
 !canCreate ||
 loading ||
 !name.trim() ||
 !slug.trim()
 }
 className="flex items-center gap-2 rounded-xl bg-[#7C5CFC] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#6947E8] disabled:opacity-50"
 >
 {loading ? (
 <Loader2 size={16} className="animate-spin" />
 ) : (
 <Rocket size={16} />
 )}

 {loading
 ? "Creating…"
 : intent === "ai"
 ? "Create and open AI"
 : "Create website"}
 </button>
 </div>
 </section>
 </div>
 </div>
 </motion.div>
 </motion.div>
 </DashboardModalPortal>
 </AnimatePresence>
 );
}
