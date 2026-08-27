"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Clock3, Loader2, MailPlus, ShieldCheck, Trash2, UserRound, Users } from "lucide-react";

type Role = "ADMIN" | "EDITOR" | "VIEWER";
type Person = { id: string; name: string | null; email: string | null; avatarUrl: string | null; lastLoginAt: string | null };
type Member = { id: string; role: Role; userId: string; user: Person };
type Invite = { id: string; email: string; role: Role; expiresAt: string | null; createdAt: string };
type TeamData = {
  team: { id: string; name: string } | null;
  owner: Person | null;
  members: Member[];
  invites: Invite[];
  limits: { used: number; total: number };
  canManage: boolean;
  currentUserId: string;
};

const roles: Role[] = ["ADMIN", "EDITOR", "VIEWER"];

export default function TeamPage() {
  const [data, setData] = useState<TeamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("VIEWER");
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/tenant/team", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Could not load your team.");
      setData(payload);
    } catch (error) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Could not load your team." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function invite(event: FormEvent) {
    event.preventDefault(); setWorking("invite"); setMessage(null);
    try {
      const response = await fetch("/api/tenant/team", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, role }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Invitation could not be created.");
      setEmail(""); setRole("VIEWER");
      setMessage({ kind: "ok", text: payload.kind === "member" ? "Existing BuildEZ user added to the team." : "Invitation created and valid for 7 days." });
      await load();
    } catch (error) { setMessage({ kind: "error", text: error instanceof Error ? error.message : "Invitation failed." }); }
    finally { setWorking(""); }
  }

  async function changeRole(kind: "member" | "invite", id: string, nextRole: Role) {
    setWorking(id); setMessage(null);
    const response = await fetch("/api/tenant/team", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(kind === "member" ? { memberId: id, role: nextRole } : { inviteId: id, role: nextRole }) });
    const payload = await response.json();
    if (!response.ok) setMessage({ kind: "error", text: payload.error || "Role could not be updated." });
    await load(); setWorking("");
  }

  async function remove(kind: "member" | "invite", id: string) {
    setWorking(id); setMessage(null);
    const response = await fetch(`/api/tenant/team?${kind === "member" ? "memberId" : "inviteId"}=${encodeURIComponent(id)}`, { method: "DELETE" });
    const payload = await response.json();
    if (!response.ok) setMessage({ kind: "error", text: payload.error || "The item could not be removed." });
    else setMessage({ kind: "ok", text: kind === "member" ? "Team member removed." : "Invitation revoked." });
    await load(); setWorking("");
  }

  if (loading) return <div className="grid min-h-[55vh] place-items-center"><Loader2 className="animate-spin dashboard-muted" /></div>;
  const full = Boolean(data && data.limits.total > 0 && data.limits.used >= data.limits.total);

  return <div className="mx-auto max-w-6xl pb-12">
    <header className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-medium text-blue-600 dark:text-blue-400">Workspace access</p><h1 className="mt-1 text-3xl font-semibold tracking-[-.04em]">Team</h1><p className="mt-2 text-sm dashboard-muted">Invite collaborators and control what they can manage.</p></div><div className="rounded-xl border dashboard-border px-4 py-2 text-sm"><strong>{data?.limits.used ?? 0}</strong><span className="dashboard-muted"> / {data?.limits.total ?? 0} seats used</span></div></header>
    {message ? <div role="status" className={`mt-5 rounded-xl border px-4 py-3 text-sm ${message.kind === "error" ? "border-rose-500/20 bg-rose-500/10 text-rose-500" : "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"}`}>{message.text}</div> : null}

    {data?.canManage ? <form onSubmit={invite} className="dashboard-card mt-6 grid gap-4 rounded-3xl p-5 md:grid-cols-[1fr_180px_auto] md:items-end sm:p-6"><label><span className="mb-2 block text-sm font-medium">Invite by email</span><div className="dashboard-input flex items-center gap-2 rounded-xl px-3"><MailPlus size={16} className="dashboard-faint"/><input required type="email" value={email} onChange={(event)=>setEmail(event.target.value)} placeholder="colleague@company.com" className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none"/></div></label><RoleField value={role} onChange={setRole}/><button disabled={working === "invite" || full} className="dashboard-primary-button flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-white disabled:opacity-50">{working === "invite" ? <Loader2 size={16} className="animate-spin"/> : <MailPlus size={16}/>} {full ? "Seat limit reached" : "Invite member"}</button></form> : null}

    <section className="dashboard-card mt-6 overflow-hidden rounded-3xl"><div className="flex items-center gap-3 border-b dashboard-border p-5 sm:p-6"><span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-500/10 text-blue-500"><Users size={19}/></span><div><h2 className="font-semibold">Workspace members</h2><p className="mt-0.5 text-xs dashboard-muted">Owner and active collaborators</p></div></div><div className="divide-y dashboard-divide">
      {data?.owner ? <MemberRow person={data.owner} role="OWNER" owner /> : null}
      {data?.members.map((member)=><MemberRow key={member.id} person={member.user} role={member.role} disabled={working===member.id} canManage={data.canManage} onRole={(next)=>changeRole("member",member.id,next)} onRemove={()=>remove("member",member.id)}/>)}
      {!data?.owner && !data?.members.length ? <p className="p-8 text-center text-sm dashboard-muted">No members found.</p> : null}
    </div></section>

    {data?.invites.length ? <section className="dashboard-card mt-6 overflow-hidden rounded-3xl"><div className="flex items-center gap-3 border-b dashboard-border p-5 sm:p-6"><Clock3 size={18} className="text-amber-500"/><div><h2 className="font-semibold">Pending invitations</h2><p className="mt-0.5 text-xs dashboard-muted">Invitations expire after seven days</p></div></div><div className="divide-y dashboard-divide">{data.invites.map((invite)=><div key={invite.id} className="flex flex-wrap items-center gap-3 p-4 sm:px-6"><span className="grid h-10 w-10 place-items-center rounded-full bg-amber-500/10 text-amber-500"><MailPlus size={17}/></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{invite.email}</p><p className="mt-0.5 text-xs dashboard-muted">Pending · expires {invite.expiresAt ? new Date(invite.expiresAt).toLocaleDateString() : "soon"}</p></div>{data.canManage ? <><select disabled={working===invite.id} value={invite.role} onChange={(event)=>changeRole("invite",invite.id,event.target.value as Role)} className="dashboard-input rounded-xl px-3 py-2 text-xs">{roles.map((item)=><option key={item}>{item}</option>)}</select><button disabled={working===invite.id} onClick={()=>remove("invite",invite.id)} className="rounded-xl p-2 text-rose-500 dashboard-hover" aria-label="Revoke invitation">{working===invite.id?<Loader2 size={16} className="animate-spin"/>:<Trash2 size={16}/>}</button></> : null}</div>)}</div></section> : null}

    <section className="mt-6 grid gap-4 md:grid-cols-3">{[["Admin","Billing, team and workspace settings"],["Editor","Websites, pages, content and AI tools"],["Viewer","Read-only access to workspace data"]].map(([title,text])=><div key={title} className="dashboard-card rounded-2xl p-5"><ShieldCheck size={18} className="text-blue-500"/><h3 className="mt-3 text-sm font-semibold">{title}</h3><p className="mt-1 text-xs leading-5 dashboard-muted">{text}</p></div>)}</section>
  </div>;
}

function RoleField({value,onChange}:{value:Role;onChange:(role:Role)=>void}) { return <label><span className="mb-2 block text-sm font-medium">Role</span><select value={value} onChange={(event)=>onChange(event.target.value as Role)} className="dashboard-input h-11 w-full rounded-xl px-3 text-sm">{roles.map((item)=><option key={item}>{item}</option>)}</select></label>; }
function MemberRow({person,role,owner,canManage,onRole,onRemove,disabled}:{person:Person;role:Role|"OWNER";owner?:boolean;canManage?:boolean;onRole?:(role:Role)=>void;onRemove?:()=>void;disabled?:boolean}) { const initials=(person.name||person.email||"User").split(/\s+/).map(x=>x[0]).slice(0,2).join("").toUpperCase(); return <div className="flex flex-wrap items-center gap-3 p-4 sm:px-6">{person.avatarUrl?<img src={person.avatarUrl} alt="" className="h-10 w-10 rounded-full object-cover"/>:<span className="grid h-10 w-10 place-items-center rounded-full bg-blue-500/10 text-xs font-semibold text-blue-600"><UserRound size={17}/><span className="sr-only">{initials}</span></span>}<div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{person.name||"Unnamed member"}</p><p className="truncate text-xs dashboard-muted">{person.email||"No email"}</p></div>{owner?<span className="rounded-full bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-500">OWNER</span>:canManage?<><select disabled={disabled} value={role} onChange={(event)=>onRole?.(event.target.value as Role)} className="dashboard-input rounded-xl px-3 py-2 text-xs">{roles.map(item=><option key={item}>{item}</option>)}</select><button disabled={disabled} onClick={onRemove} className="rounded-xl p-2 text-rose-500 dashboard-hover" aria-label="Remove member">{disabled?<Loader2 size={16} className="animate-spin"/>:<Trash2 size={16}/>}</button></>:<span className="text-xs dashboard-muted">{role}</span>}</div>; }
