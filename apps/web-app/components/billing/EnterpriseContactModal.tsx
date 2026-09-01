"use client";

import { useState } from "react";
import { Building2, CheckCircle2, Loader2, X } from "lucide-react";

export default function EnterpriseContactModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    websites: "100",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!open) return null;

  function close() {
    setError("");
    setSubmitted(false);
    onClose();
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/billing/enterprise-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Your enquiry could not be sent.");
      setSubmitted(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Your enquiry could not be sent.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="dashboard-modal-root fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-4">
      <button aria-label="Close" className="absolute inset-0" onClick={close} />
      <div className="dashboard-modal-surface relative z-10 max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl border dashboard-border p-6 shadow-2xl sm:p-8">
        <button onClick={close} aria-label="Close" className="absolute right-4 top-4 rounded-xl p-2 dashboard-hover">
          <X size={18} />
        </button>

        {submitted ? (
          <div className="py-8 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 size={28} />
            </span>
            <h2 className="mt-5 text-2xl font-semibold">Thank you</h2>
            <p className="mt-2 text-sm dashboard-muted">Our team will contact you shortly.</p>
            <button onClick={close} className="dashboard-primary-button mt-7 rounded-xl px-6 py-2.5 text-sm font-semibold text-white">Done</button>
          </div>
        ) : (
          <form onSubmit={submit}>
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-500/10 text-blue-500"><Building2 size={20} /></span>
            <h2 className="mt-4 text-2xl font-semibold">Enterprise enquiry</h2>
            <p className="mt-2 text-sm dashboard-muted">Tell us about your organisation and requirements.</p>

            {error && <p className="mt-5 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-500">{error}</p>}

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field label="Name" required value={form.name} onChange={(value) => setForm((current) => ({ ...current, name: value }))} />
              <Field label="Work email" required type="email" value={form.email} onChange={(value) => setForm((current) => ({ ...current, email: value }))} />
              <Field label="Company" required value={form.company} onChange={(value) => setForm((current) => ({ ...current, company: value }))} />
              <Field label="Phone" type="tel" value={form.phone} onChange={(value) => setForm((current) => ({ ...current, phone: value }))} />
              <Field label="Websites needed" type="number" value={form.websites} onChange={(value) => setForm((current) => ({ ...current, websites: value }))} />
              <label className="grid gap-1.5 text-sm font-medium sm:col-span-2">
                Requirements
                <textarea
                  value={form.message}
                  onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
                  rows={4}
                  className="dashboard-input resize-none rounded-xl px-4 py-3 text-sm"
                />
              </label>
            </div>

            <button disabled={submitting} className="dashboard-primary-button mt-6 flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">
              {submitting && <Loader2 size={16} className="animate-spin" />}
              {submitting ? "Sending…" : "Contact us"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  type = "text",
  required,
  value,
  onChange,
}: {
  label: string;
  type?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-1.5 text-sm font-medium">
      {label}
      <input
        type={type}
        required={required}
        min={type === "number" ? 1 : undefined}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="dashboard-input rounded-xl px-4 py-3 text-sm"
      />
    </label>
  );
}
