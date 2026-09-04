"use client";

import { useEffect, useState } from "react";
import { Plus, Ticket, Trash2 } from "lucide-react";

type Coupon = {
  id: string;
  code: string;
  description: string | null;
  type: "PERCENTAGE" | "FLAT";
  amount: number;
  currency: string | null;
  planCodes: string[];
  billingCycles: string[];
  minAmount: number | null;
  usageLimit: number | null;
  timesUsed: number;
  perUserLimit: number | null;
  firstTimeOnly: boolean;
  expiresAt: string | null;
  isActive: boolean;
};

type PlanOption = { code: string; name: string };

const EMPTY_FORM = {
  code: "",
  description: "",
  type: "PERCENTAGE" as "PERCENTAGE" | "FLAT",
  amount: "",
  currency: "INR",
  planCodes: [] as string[],
  billingCycles: [] as string[],
  minAmount: "",
  usageLimit: "",
  perUserLimit: "1",
  firstTimeOnly: false,
  expiresAt: "",
};

function discountLabel(c: Coupon) {
  return c.type === "PERCENTAGE" ? `${(c.amount / 100).toLocaleString()}% off` : `${c.amount.toLocaleString()} ${c.currency || ""} off`;
}

export default function CouponsPanel() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [plans, setPlans] = useState<PlanOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    const [couponsRes, plansRes] = await Promise.all([
      fetch("/api/super/coupons", { cache: "no-store" }),
      fetch("/api/super/plans", { cache: "no-store" }),
    ]);
    const couponsData = await couponsRes.json().catch(() => ({ coupons: [] }));
    const plansData = await plansRes.json().catch(() => ({ plans: [] }));
    setCoupons(couponsData.coupons || []);
    setPlans((plansData.plans || []).map((p: { code: string; name: string }) => ({ code: p.code, name: p.name })));
    setLoading(false);
  }

  useEffect(() => { void load(); }, []);

  async function createCoupon(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/super/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          amount: Number(form.amount),
          minAmount: form.minAmount || null,
          usageLimit: form.usageLimit || null,
          perUserLimit: form.perUserLimit || null,
          expiresAt: form.expiresAt || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not create coupon.");
      setOpen(false);
      setForm(EMPTY_FORM);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create coupon.");
    } finally {
      setBusy(false);
    }
  }

  async function toggleActive(coupon: Coupon) {
    await fetch(`/api/super/coupons/${coupon.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !coupon.isActive }),
    });
    await load();
  }

  async function remove(coupon: Coupon) {
    if (!confirm(`Delete coupon ${coupon.code}?`)) return;
    const res = await fetch(`/api/super/coupons/${coupon.id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { alert(data.error || "Could not delete coupon."); return; }
    await load();
  }

  function toggleListValue(key: "planCodes" | "billingCycles", value: string) {
    setForm((f) => ({
      ...f,
      [key]: f[key].includes(value) ? f[key].filter((v) => v !== value) : [...f[key], value],
    }));
  }

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[.14em] dashboard-faint">
          <Ticket size={15} /> Discount coupons
        </div>
        <button onClick={() => setOpen(true)} className="dashboard-primary-button inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white">
          <Plus size={16} /> New coupon
        </button>
      </div>

      <div className="dashboard-card mt-4 overflow-x-auto rounded-2xl">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead>
            <tr className="dashboard-faint text-xs uppercase tracking-wide">
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Discount</th>
              <th className="px-4 py-3">Plans</th>
              <th className="px-4 py-3">Usage</th>
              <th className="px-4 py-3">Expires</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-6 text-center dashboard-muted">Loading…</td></tr>
            ) : coupons.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-6 text-center dashboard-muted">No coupons yet.</td></tr>
            ) : coupons.map((c) => (
              <tr key={c.id} className="border-t border-black/5 dark:border-white/5">
                <td className="px-4 py-3 font-mono font-semibold">{c.code}</td>
                <td className="px-4 py-3">{discountLabel(c)}</td>
                <td className="px-4 py-3">{c.planCodes.length ? c.planCodes.join(", ") : "All plans"}</td>
                <td className="px-4 py-3">{c.timesUsed}{c.usageLimit ? ` / ${c.usageLimit}` : ""}</td>
                <td className="px-4 py-3">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "—"}</td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleActive(c)} className={`rounded-full px-3 py-1 text-xs font-semibold ${c.isActive ? "bg-emerald-500/15 text-emerald-500" : "bg-slate-500/15 text-slate-500"}`}>
                    {c.isActive ? "Active" : "Inactive"}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => remove(c)} className="dashboard-faint hover:text-red-500" aria-label="Delete coupon"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 px-4" onClick={() => setOpen(false)}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={createCoupon} className="dashboard-card max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl p-6">
            <h2 className="mb-4 text-lg font-semibold">New coupon</h2>

            <div className="grid grid-cols-2 gap-3">
              <label className="col-span-2 text-xs font-medium dashboard-muted">
                Code
                <input required value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="LAUNCH20" className="mt-1 w-full rounded-lg border-0 bg-black/5 px-3 py-2 text-sm dark:bg-white/10" />
              </label>
              <label className="col-span-2 text-xs font-medium dashboard-muted">
                Description (internal)
                <input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="mt-1 w-full rounded-lg border-0 bg-black/5 px-3 py-2 text-sm dark:bg-white/10" />
              </label>
              <label className="text-xs font-medium dashboard-muted">
                Type
                <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as "PERCENTAGE" | "FLAT" }))} className="onboarding-select mt-1 w-full rounded-lg border-0 bg-black/5 px-3 py-2 text-sm dark:bg-white/10">
                  <option value="PERCENTAGE">Percentage</option>
                  <option value="FLAT">Flat amount</option>
                </select>
              </label>
              <label className="text-xs font-medium dashboard-muted">
                {form.type === "PERCENTAGE" ? "Percent off" : `Amount off (${form.currency})`}
                <input required type="number" min="0" step="0.01" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} className="mt-1 w-full rounded-lg border-0 bg-black/5 px-3 py-2 text-sm dark:bg-white/10" />
              </label>

              {form.type === "FLAT" && (
                <label className="text-xs font-medium dashboard-muted">
                  Currency
                  <input value={form.currency} onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value.toUpperCase() }))} className="mt-1 w-full rounded-lg border-0 bg-black/5 px-3 py-2 text-sm dark:bg-white/10" />
                </label>
              )}
              <label className="text-xs font-medium dashboard-muted">
                Min order amount (optional)
                <input type="number" min="0" value={form.minAmount} onChange={(e) => setForm((f) => ({ ...f, minAmount: e.target.value }))} className="mt-1 w-full rounded-lg border-0 bg-black/5 px-3 py-2 text-sm dark:bg-white/10" />
              </label>

              <label className="text-xs font-medium dashboard-muted">
                Total usage limit
                <input type="number" min="1" value={form.usageLimit} onChange={(e) => setForm((f) => ({ ...f, usageLimit: e.target.value }))} placeholder="Unlimited" className="mt-1 w-full rounded-lg border-0 bg-black/5 px-3 py-2 text-sm dark:bg-white/10" />
              </label>
              <label className="text-xs font-medium dashboard-muted">
                Per-user limit
                <input type="number" min="1" value={form.perUserLimit} onChange={(e) => setForm((f) => ({ ...f, perUserLimit: e.target.value }))} className="mt-1 w-full rounded-lg border-0 bg-black/5 px-3 py-2 text-sm dark:bg-white/10" />
              </label>
              <label className="col-span-2 text-xs font-medium dashboard-muted">
                Expires
                <input type="date" value={form.expiresAt} onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))} className="mt-1 w-full rounded-lg border-0 bg-black/5 px-3 py-2 text-sm dark:bg-white/10" />
              </label>

              <div className="col-span-2 text-xs font-medium dashboard-muted">
                Applies to plans (none checked = all plans)
                <div className="mt-1 flex flex-wrap gap-2">
                  {plans.map((p) => (
                    <button type="button" key={p.code} onClick={() => toggleListValue("planCodes", p.code)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${form.planCodes.includes(p.code) ? "bg-blue-600 text-white" : "bg-black/5 dark:bg-white/10"}`}>
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="col-span-2 text-xs font-medium dashboard-muted">
                Billing cycle (none checked = both)
                <div className="mt-1 flex gap-2">
                  {["monthly", "yearly"].map((cycle) => (
                    <button type="button" key={cycle} onClick={() => toggleListValue("billingCycles", cycle)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${form.billingCycles.includes(cycle) ? "bg-blue-600 text-white" : "bg-black/5 dark:bg-white/10"}`}>
                      {cycle}
                    </button>
                  ))}
                </div>
              </div>

              <label className="col-span-2 flex items-center gap-2 text-xs font-medium dashboard-muted">
                <input type="checkbox" checked={form.firstTimeOnly} onChange={(e) => setForm((f) => ({ ...f, firstTimeOnly: e.target.checked }))} />
                First-time customers only
              </label>
            </div>

            {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setOpen(false)} className="rounded-xl px-4 py-2 text-sm font-semibold dashboard-muted">Cancel</button>
              <button type="submit" disabled={busy} className="dashboard-primary-button rounded-xl px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">
                {busy ? "Creating…" : "Create coupon"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
