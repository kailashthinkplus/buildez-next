"use client";

import { useEffect, useRef, useState } from "react";
import { Image as ImageIcon, Loader2, Save, Sparkles } from "lucide-react";

const EMPTY = { companyName: "", industry: "", audience: "", offer: "", tone: "", websiteUrl: "" };

export default function BrandIntelligenceSettings({ siteId, compact = false }: { siteId: string; compact?: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState(EMPTY);
  const [logoUrl, setLogoUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => { void fetch(`/api/sites/${siteId}/branding`).then(r => r.json()).then(data => {
    setProfile({ ...EMPTY, ...(data.profile || {}), companyName: data.profile?.companyName || data.name || "" });
    setLogoUrl(data.logoUrl || "");
  }); }, [siteId]);

  async function upload(file?: File) {
    if (!file) return;
    setBusy(true); setMessage("");
    const form = new FormData(); form.append("file", file);
    const response = await fetch(`/api/sites/${siteId}/branding/logo?overwrite=true`, { method: "POST", credentials: "include", body: form });
    const data = await response.json();
    if (response.ok) { setLogoUrl(data.logoUrl || ""); setMessage("Logo updated across the site."); window.dispatchEvent(new CustomEvent("brand:updated", { detail: data })); }
    else setMessage(data.error || "Logo upload failed.");
    setBusy(false);
  }

  async function save() {
    setBusy(true); setMessage("");
    const response = await fetch(`/api/sites/${siteId}/branding`, { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(profile) });
    setMessage(response.ok ? "Brand intelligence saved." : "Unable to save brand intelligence.");
    setBusy(false);
  }

  return <div className={compact ? "space-y-4" : "mx-auto max-w-3xl space-y-6"}>
    <div><div className="flex items-center gap-2 text-sm font-semibold"><Sparkles size={16} className="text-blue-400" /> Brand Intelligence</div><p className="mt-1 text-xs opacity-55">One source for your logo, identity, AI generation, header and footer.</p></div>
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
      <div className="flex items-center gap-4">{logoUrl ? <img src={logoUrl} alt="Brand logo" className="h-16 w-28 rounded-lg bg-white object-contain p-2" /> : <div className="flex h-16 w-28 items-center justify-center rounded-lg border border-dashed border-white/20"><ImageIcon size={22} /></div>}<div><button type="button" onClick={() => inputRef.current?.click()} disabled={busy} className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-500 disabled:opacity-50">Upload logo</button><p className="mt-1 text-[11px] opacity-45">PNG, JPG, WebP or SVG</p></div></div>
      <input ref={inputRef} hidden type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={e => void upload(e.target.files?.[0])} />
    </div>
    <div className="grid gap-3 sm:grid-cols-2">{Object.entries({ companyName: "Company name", industry: "Industry", audience: "Primary audience", offer: "Primary offer", tone: "Brand tone", websiteUrl: "Official website" }).map(([key,label]) => <label key={key} className={key === "websiteUrl" ? "sm:col-span-2" : ""}><span className="mb-1 block text-xs opacity-60">{label}</span><input value={profile[key as keyof typeof profile]} onChange={e => setProfile(p => ({ ...p, [key]: e.target.value }))} className="h-10 w-full rounded-lg border border-white/10 bg-black/20 px-3 text-sm outline-none focus:border-blue-400/60" /></label>)}</div>
    {message && <p className="text-xs text-blue-300">{message}</p>}
    <button type="button" onClick={() => void save()} disabled={busy} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50">{busy ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Save brand</button>
  </div>;
}
