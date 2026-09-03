"use client";
import { useState } from "react";
import { ChevronLeft, Loader2, LogOut, MapPin, Package, Plus, Trash2, User } from "lucide-react";

export type Address = {
  firstName?: string; lastName?: string; address1?: string; city?: string; state?: string; postalCode?: string; country?: string; phone?: string;
};
export type CustomerOrder = {
  id: string; orderNumber: number; currency: string; total: string | number; status: string; paymentStatus: string; createdAt: string;
  items: { id: string; title: string; variantTitle?: string | null; quantity: number; total: string | number }[];
};
export type Customer = {
  id: string; email: string; firstName?: string | null; lastName?: string | null; phone?: string | null;
  addresses?: Address[] | null; orders: CustomerOrder[];
};

type Props = {
  siteId: string;
  currency: string;
  view: "login" | "register" | "account";
  customer?: Customer;
  onAuthed: (customer: Customer) => void;
  onLogout: () => void;
  goLogin: () => void;
  goRegister: () => void;
  close: () => void;
};

const inputClass = "w-full rounded-xl border p-3 outline-none focus:ring-2" as const;
const inputStyle = { borderColor: "var(--shop-border)", background: "var(--shop-bg)", color: "var(--shop-text)" };

export default function CustomerAccount({ siteId, currency, view, customer, onAuthed, onLogout, goLogin, goRegister, close }: Props) {
  if (view === "account" && customer) return <AccountDashboard siteId={siteId} currency={currency} customer={customer} onAuthed={onAuthed} onLogout={onLogout} close={close} />;
  return <AuthForm siteId={siteId} mode={view === "register" ? "register" : "login"} onAuthed={onAuthed} goLogin={goLogin} goRegister={goRegister} close={close} />;
}

function AuthForm({ siteId, mode, onAuthed, goLogin, goRegister, close }: { siteId: string; mode: "login" | "register"; onAuthed: (c: Customer) => void; goLogin: () => void; goRegister: () => void; close: () => void }) {
  const [form, setForm] = useState({ email: "", password: "", firstName: "", lastName: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError("");
    const endpoint = mode === "login" ? "/api/public/shopez/account/login" : "/api/public/shopez/account/register";
    const r = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ siteId, ...form }),
    });
    const body = await r.json();
    setBusy(false);
    if (!r.ok) { setError(body.error || "Something went wrong."); return; }
    onAuthed(body.customer);
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ background: "var(--shop-bg)" }}>
      <div className="mx-auto max-w-md p-5 py-10">
        <button onClick={close} className="flex items-center gap-2 text-sm" style={{ color: "var(--shop-text-muted)" }}><ChevronLeft size={16} />Back to shop</button>
        <h2 className="mt-6 text-3xl font-black" style={{ color: "var(--shop-text)" }}>{mode === "login" ? "Sign in" : "Create your account"}</h2>
        <p className="mt-2 text-sm" style={{ color: "var(--shop-text-muted)" }}>{mode === "login" ? "Track orders and check out faster." : "Save your details for faster checkout and order tracking."}</p>
        <form onSubmit={submit} className="mt-7 space-y-3">
          {mode === "register" && (
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="First name" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} className={inputClass} style={inputStyle} />
              <input placeholder="Last name" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} className={inputClass} style={inputStyle} />
            </div>
          )}
          <input required type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className={inputClass} style={inputStyle} />
          <input required type="password" minLength={8} placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className={inputClass} style={inputStyle} />
          {error && <p className="text-sm" style={{ color: "var(--shop-error)" }}>{error}</p>}
          <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-full py-3 font-bold" style={{ background: "var(--shop-primary)", color: "var(--shop-on-primary)" }}>
            {busy && <Loader2 className="animate-spin" size={16} />}{mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>
        <p className="mt-5 text-center text-sm" style={{ color: "var(--shop-text-muted)" }}>
          {mode === "login" ? (
            <>New here? <button onClick={goRegister} className="font-semibold" style={{ color: "var(--shop-primary)" }}>Create an account</button></>
          ) : (
            <>Already have an account? <button onClick={goLogin} className="font-semibold" style={{ color: "var(--shop-primary)" }}>Sign in</button></>
          )}
        </p>
      </div>
    </div>
  );
}

function AccountDashboard({ siteId, currency, customer, onAuthed, onLogout, close }: { siteId: string; currency: string; customer: Customer; onAuthed: (c: Customer) => void; onLogout: () => void; close: () => void }) {
  const [tab, setTab] = useState<"orders" | "addresses" | "profile">("orders");
  const tabs: { id: typeof tab; label: string; icon: typeof Package }[] = [
    { id: "orders", label: "Orders", icon: Package },
    { id: "addresses", label: "Addresses", icon: MapPin },
    { id: "profile", label: "Profile", icon: User },
  ];
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ background: "var(--shop-bg)" }}>
      <div className="mx-auto max-w-3xl p-5 py-10">
        <div className="flex items-center">
          <button onClick={close} className="flex items-center gap-2 text-sm" style={{ color: "var(--shop-text-muted)" }}><ChevronLeft size={16} />Back to shop</button>
          <button onClick={onLogout} className="ml-auto flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--shop-error)" }}><LogOut size={15} />Sign out</button>
        </div>
        <h2 className="mt-6 text-3xl font-black" style={{ color: "var(--shop-text)" }}>My account</h2>
        <p className="mt-1 text-sm" style={{ color: "var(--shop-text-muted)" }}>{customer.email}</p>
        <div className="mt-6 flex gap-2 border-b" style={{ borderColor: "var(--shop-border)" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className="flex items-center gap-2 border-b-2 px-3 py-3 text-sm font-semibold" style={{ borderColor: tab === t.id ? "var(--shop-primary)" : "transparent", color: tab === t.id ? "var(--shop-primary)" : "var(--shop-text-muted)" }}>
              <t.icon size={15} />{t.label}
            </button>
          ))}
        </div>
        <div className="mt-6">
          {tab === "orders" && <OrdersTab customer={customer} currency={currency} />}
          {tab === "addresses" && <AddressesTab siteId={siteId} customer={customer} onAuthed={onAuthed} />}
          {tab === "profile" && <ProfileTab siteId={siteId} customer={customer} onAuthed={onAuthed} />}
        </div>
      </div>
    </div>
  );
}

function OrdersTab({ customer, currency }: { customer: Customer; currency: string }) {
  if (!customer.orders.length) return <p className="py-16 text-center" style={{ color: "var(--shop-text-muted)" }}>You haven&apos;t placed any orders yet.</p>;
  return (
    <div className="space-y-4">
      {customer.orders.map(order => (
        <div key={order.id} className="rounded-2xl border p-5" style={{ borderColor: "var(--shop-border)", background: "var(--shop-surface)" }}>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-bold" style={{ color: "var(--shop-text)" }}>Order #{order.orderNumber}</p>
            <span className="rounded-full px-2.5 py-1 text-xs font-semibold" style={{ background: "var(--shop-primary-soft)", color: "var(--shop-primary)" }}>{order.status}</span>
            <span className="ml-auto text-sm" style={{ color: "var(--shop-text-muted)" }}>{new Date(order.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="mt-3 space-y-1">
            {order.items.map(item => (
              <div key={item.id} className="flex justify-between text-sm" style={{ color: "var(--shop-text-muted)" }}>
                <span>{item.quantity} × {item.title}{item.variantTitle ? ` (${item.variantTitle})` : ""}</span>
                <span>{currency} {Number(item.total).toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex justify-between border-t pt-3 font-bold" style={{ borderColor: "var(--shop-border)", color: "var(--shop-text)" }}>
            <span>Total</span><span>{order.currency} {Number(order.total).toLocaleString()}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function AddressesTab({ siteId, customer, onAuthed }: { siteId: string; customer: Customer; onAuthed: (c: Customer) => void }) {
  const [addresses, setAddresses] = useState<Address[]>(customer.addresses || []);
  const [busy, setBusy] = useState(false);

  function update(index: number, patch: Partial<Address>) {
    setAddresses(list => list.map((a, i) => i === index ? { ...a, ...patch } : a));
  }
  function remove(index: number) {
    setAddresses(list => list.filter((_, i) => i !== index));
  }
  async function save(next = addresses) {
    setBusy(true);
    const r = await fetch("/api/public/shopez/account/profile", {
      method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include",
      body: JSON.stringify({ siteId, addresses: next }),
    });
    const body = await r.json();
    setBusy(false);
    if (r.ok) onAuthed(body.customer);
  }

  const fields: [keyof Address, string][] = [["firstName", "First name"], ["lastName", "Last name"], ["address1", "Address"], ["city", "City"], ["state", "State"], ["postalCode", "PIN / postal code"], ["country", "Country"], ["phone", "Phone"]];

  return (
    <div className="space-y-4">
      {addresses.map((address, index) => (
        <div key={index} className="rounded-2xl border p-5" style={{ borderColor: "var(--shop-border)", background: "var(--shop-surface)" }}>
          <div className="grid gap-3 sm:grid-cols-2">
            {fields.map(([key, label]) => (
              <input key={key} placeholder={label} value={address[key] || ""} onChange={e => update(index, { [key]: e.target.value })} className={inputClass} style={inputStyle} />
            ))}
          </div>
          <button onClick={() => remove(index)} className="mt-3 flex items-center gap-1.5 text-sm font-semibold" style={{ color: "var(--shop-error)" }}><Trash2 size={14} />Remove address</button>
        </div>
      ))}
      <button onClick={() => setAddresses(list => [...list, {}])} className="flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold" style={{ borderColor: "var(--shop-border)", color: "var(--shop-text)" }}><Plus size={15} />Add address</button>
      <button disabled={busy} onClick={() => save()} className="flex items-center gap-2 rounded-full px-6 py-3 font-bold" style={{ background: "var(--shop-primary)", color: "var(--shop-on-primary)" }}>
        {busy && <Loader2 className="animate-spin" size={16} />}Save addresses
      </button>
    </div>
  );
}

function ProfileTab({ siteId, customer, onAuthed }: { siteId: string; customer: Customer; onAuthed: (c: Customer) => void }) {
  const [form, setForm] = useState({ firstName: customer.firstName || "", lastName: customer.lastName || "", phone: customer.phone || "" });
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setSaved(false);
    const r = await fetch("/api/public/shopez/account/profile", {
      method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include",
      body: JSON.stringify({ siteId, ...form }),
    });
    const body = await r.json();
    setBusy(false);
    if (r.ok) { onAuthed(body.customer); setSaved(true); }
  }

  return (
    <form onSubmit={save} className="max-w-md space-y-3 rounded-2xl border p-5" style={{ borderColor: "var(--shop-border)", background: "var(--shop-surface)" }}>
      <div className="grid grid-cols-2 gap-3">
        <input placeholder="First name" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} className={inputClass} style={inputStyle} />
        <input placeholder="Last name" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} className={inputClass} style={inputStyle} />
      </div>
      <input placeholder="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className={inputClass} style={inputStyle} />
      <input disabled value={customer.email} className={inputClass} style={{ ...inputStyle, opacity: 0.6 }} />
      <button disabled={busy} className="flex items-center gap-2 rounded-full px-6 py-3 font-bold" style={{ background: "var(--shop-primary)", color: "var(--shop-on-primary)" }}>
        {busy && <Loader2 className="animate-spin" size={16} />}Save profile
      </button>
      {saved && <p className="text-sm" style={{ color: "var(--shop-primary)" }}>Saved.</p>}
    </form>
  );
}
