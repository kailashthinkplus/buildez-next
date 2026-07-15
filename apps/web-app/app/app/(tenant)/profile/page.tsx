"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Briefcase, Camera, Check, KeyRound, Loader2, MapPin, Pencil, UserRound } from "lucide-react";

type Profile = {
  name: string | null; email: string | null; phone: string | null; avatarUrl: string | null;
  bio: string | null; jobTitle: string | null; company: string | null; website: string | null;
  city: string | null; country: string | null; timezone: string | null;
  isEmailVerified: boolean; isPhoneVerified: boolean; createdAt: string;
};

const empty: Profile = { name: "", email: "", phone: "", avatarUrl: "", bio: "", jobTitle: "", company: "", website: "", city: "", country: "", timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, isEmailVerified: false, isPhoneVerified: false, createdAt: "" };
const errorMessage = (error: unknown, fallback: string) => error instanceof Error ? error.message : fallback;

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile>(empty);
  const [saved, setSaved] = useState<Profile>(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  useEffect(() => { fetch("/api/profile").then(async r => { if (!r.ok) throw new Error("Could not load your profile"); return r.json(); }).then(({ profile }) => { setProfile(profile); setSaved(profile); }).catch(e => setMessage({ type: "error", text: e.message })).finally(() => setLoading(false)); }, []);
  const set = (key: keyof Profile, value: string) => setProfile(p => ({ ...p, [key]: value }));

  async function submit(event: FormEvent) {
    event.preventDefault(); setSaving(true); setMessage(null);
    try {
      const response = await fetch("/api/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(profile) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save profile");
      setProfile(data.profile); setSaved(data.profile); setMessage({ type: "ok", text: "Profile saved successfully" });
      setEditing(false);
    } catch (error: unknown) { setMessage({ type: "error", text: errorMessage(error, "Could not save profile") }); } finally { setSaving(false); }
  }

  if (loading) return <div className="flex min-h-[55vh] items-center justify-center"><Loader2 className="h-7 w-7 animate-spin dashboard-muted" /></div>;
  const initials = (profile.name || "Account").split(" ").map(v => v[0]).slice(0, 2).join("").toUpperCase();

  async function uploadAvatar(file?: File) {
    if (!file) return; setUploading(true); setMessage(null);
    try { const form = new FormData(); form.set("file", file); const response = await fetch("/api/profile/avatar", { method: "POST", body: form }); const data = await response.json(); if (!response.ok) throw new Error(data.error); setProfile(p => ({ ...p, avatarUrl: data.avatarUrl })); setSaved(p => ({ ...p, avatarUrl: data.avatarUrl })); setMessage({ type: "ok", text: "Profile photo updated" }); }
    catch (error: unknown) { setMessage({ type: "error", text: errorMessage(error, "Upload failed") }); } finally { setUploading(false); if (fileRef.current) fileRef.current.value = ""; }
  }

  async function updatePassword(event: FormEvent) {
    event.preventDefault(); setPasswordSaving(true); setMessage(null);
    try { const response = await fetch("/api/profile/password", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(passwords) }); const data = await response.json(); if (!response.ok) throw new Error(data.error); setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" }); setMessage({ type: "ok", text: "Password updated successfully" }); }
    catch (error: unknown) { setMessage({ type: "error", text: errorMessage(error, "Could not update password") }); } finally { setPasswordSaving(false); }
  }

  return <div className="mx-auto max-w-5xl pb-12">
    <div className="mb-7 flex items-end justify-between gap-4"><div><p className="text-sm font-medium text-blue-600 dark:text-blue-400">Account settings</p><h1 className="mt-1 text-2xl font-semibold tracking-tight">Your profile</h1><p className="mt-2 dashboard-muted">Keep your personal and professional details up to date.</p></div>{!editing && <button onClick={() => setEditing(true)} className="dashboard-primary-button flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white"><Pencil className="h-4 w-4" /> Edit profile</button>}</div>
    {message && !editing && <div role="status" className={`mb-5 rounded-xl border px-4 py-3 text-sm ${message.type === "error" ? "border-red-500/20 bg-red-500/10 text-red-600" : "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"}`}>{message.text}</div>}
    <form onSubmit={submit} className="space-y-6">
      <section className="dashboard-card-strong rounded-3xl p-5 sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          {profile.avatarUrl ? <><img src={profile.avatarUrl} alt="Profile" className="h-24 w-24 rounded-2xl object-cover ring-4 ring-white/50" />{/* eslint-disable-line @next/next/no-img-element */}</> : <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-2xl font-semibold text-white">{initials}</div>}
          <div className="flex-1"><h2 className="text-xl font-semibold">Profile photo</h2><p className="mb-3 mt-1 text-sm dashboard-muted">JPG, PNG, WebP, or AVIF. Maximum 5 MB.</p><input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={e => uploadAvatar(e.target.files?.[0])} className="hidden" /><button type="button" disabled={uploading} onClick={() => fileRef.current?.click()} className="flex items-center gap-2 rounded-xl border dashboard-border px-4 py-2.5 text-sm font-medium dashboard-hover disabled:opacity-60">{uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />} {profile.avatarUrl ? "Change photo" : "Upload photo"}</button></div>
        </div>
      </section>
      <Section icon={<UserRound />} title="Personal information" description="The core details associated with your BuildEZ account.">
        <Field disabled={!editing} label="Full name" required value={profile.name} onChange={v => set("name", v)} placeholder="Your full name" />
        <Field disabled={!editing} label="Email address" type="email" value={profile.email} onChange={v => set("email", v)} placeholder="you@company.com" hint={profile.isEmailVerified ? "Verified" : "Changing this requires verification"} />
        <Field disabled={!editing} label="Phone number" type="tel" value={profile.phone} onChange={v => set("phone", v)} placeholder="+91 98765 43210" hint={profile.isPhoneVerified ? "Verified" : "Changing this requires verification"} />
        <label className="sm:col-span-2"><span className="mb-2 block text-sm font-medium">Bio</span><textarea disabled={!editing} value={profile.bio || ""} onChange={e => set("bio", e.target.value)} maxLength={500} rows={4} placeholder="A short introduction about you" className="dashboard-input w-full resize-none rounded-xl px-3 py-2.5 disabled:cursor-not-allowed disabled:opacity-60" /><span className="mt-1 block text-right text-xs dashboard-muted">{(profile.bio || "").length}/500</span></label>
      </Section>
      <Section icon={<Briefcase />} title="Professional details" description="Tell your team a little about your work.">
        <Field disabled={!editing} label="Job title" value={profile.jobTitle} onChange={v => set("jobTitle", v)} placeholder="Product Designer" />
        <Field disabled={!editing} label="Company" value={profile.company} onChange={v => set("company", v)} placeholder="Company name" />
        <Field disabled={!editing} label="Website" type="url" value={profile.website} onChange={v => set("website", v)} placeholder="https://yourwebsite.com" className="sm:col-span-2" />
      </Section>
      <Section icon={<MapPin />} title="Location & locale" description="Used to personalize dates, times, and regional settings.">
        <Field disabled={!editing} label="City" value={profile.city} onChange={v => set("city", v)} placeholder="Bengaluru" />
        <Field disabled={!editing} label="Country" value={profile.country} onChange={v => set("country", v)} placeholder="India" />
        <Field disabled={!editing} label="Timezone" value={profile.timezone} onChange={v => set("timezone", v)} placeholder="Asia/Kolkata" className="sm:col-span-2" />
      </Section>
      {editing && <div className="sticky bottom-3 flex flex-col gap-3 rounded-2xl border dashboard-border dashboard-card-strong p-3 sm:flex-row sm:items-center sm:justify-between">
        <div aria-live="polite" className={`text-sm ${message?.type === "error" ? "text-red-500" : "text-emerald-600 dark:text-emerald-400"}`}>{message?.text}</div>
        <div className="flex gap-2"><button type="button" onClick={() => { setProfile(saved); setMessage(null); setEditing(false); }} className="rounded-xl px-4 py-2.5 text-sm font-medium dashboard-hover">Cancel</button><button disabled={saving} className="dashboard-primary-button flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Save changes</button></div>
      </div>}
    </form>
    <form onSubmit={updatePassword} className="mt-6"><Section icon={<KeyRound />} title="Password" description="Use a strong, unique password to protect your account.">
      <Field label="Current password" type="password" value={passwords.currentPassword} onChange={v => setPasswords(p => ({ ...p, currentPassword: v }))} placeholder="Required if a password is already set" />
      <div />
      <Field required label="New password" type="password" value={passwords.newPassword} onChange={v => setPasswords(p => ({ ...p, newPassword: v }))} placeholder="At least 8 characters" />
      <Field required label="Confirm new password" type="password" value={passwords.confirmPassword} onChange={v => setPasswords(p => ({ ...p, confirmPassword: v }))} placeholder="Repeat new password" />
      <div className="sm:col-span-2 flex justify-end"><button disabled={passwordSaving} className="dashboard-primary-button flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{passwordSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />} Update password</button></div>
    </Section></form>
  </div>;
}

function Section({ icon, title, description, children }: { icon: React.ReactNode; title: string; description: string; children: React.ReactNode }) { return <section className="dashboard-card rounded-3xl p-5 sm:p-7"><div className="mb-6 flex gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 [&>svg]:h-5 [&>svg]:w-5">{icon}</div><div><h2 className="font-semibold">{title}</h2><p className="mt-1 text-sm dashboard-muted">{description}</p></div></div><div className="grid gap-5 sm:grid-cols-2">{children}</div></section> }
function Field({ label, value, onChange, required, disabled, type = "text", placeholder, hint, className = "" }: { label: string; value: string | null; onChange: (v: string) => void; required?: boolean; disabled?: boolean; type?: string; placeholder?: string; hint?: string; className?: string }) { return <label className={className}><span className="mb-2 block text-sm font-medium">{label}{required && <span className="text-red-500"> *</span>}</span><input disabled={disabled} required={required} type={type} value={value || ""} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="dashboard-input w-full rounded-xl px-3 py-2.5 disabled:cursor-not-allowed disabled:opacity-60" />{hint && <span className="mt-1.5 block text-xs dashboard-muted">{hint}</span>}</label> }
