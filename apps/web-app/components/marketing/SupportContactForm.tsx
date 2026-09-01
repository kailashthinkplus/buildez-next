"use client";

import { useState } from "react";
import Script from "next/script";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

type FormType = "SUPPORT" | "BUG" | "ABUSE";

const COPY: Record<FormType, { heading: string; subjectLabel: string; messageLabel: string; messagePlaceholder: string; submitLabel: string }> = {
  SUPPORT: {
    heading: "Send us a message",
    subjectLabel: "What is this about?",
    messageLabel: "Describe the issue",
    messagePlaceholder: "Tell us what's happening, which website or page is involved, and what you expected instead.",
    submitLabel: "Send message",
  },
  BUG: {
    heading: "Submit a bug report",
    subjectLabel: "Short summary",
    messageLabel: "Steps to reproduce",
    messagePlaceholder: "What did you do, what did you expect, and what happened instead? Include the affected website or page if relevant.",
    submitLabel: "Submit bug report",
  },
  ABUSE: {
    heading: "Submit an abuse report",
    subjectLabel: "BuildEzy URL involved",
    messageLabel: "What happened",
    messagePlaceholder: "Describe the content or conduct, why it violates the Terms, and any context that helps us review it.",
    submitLabel: "Submit report",
  },
};

export function SupportContactForm({ type }: { type: FormType }) {
  const copy = COPY[type];
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const email = String(data.get("email") || "").trim();
    const message = String(data.get("message") || "").trim();

    const captchaToken = String(data.get("cf-turnstile-response") || "");

    if (!email || !message) {
      setStatus("error");
      setError("Please fill in your email and a description before submitting.");
      return;
    }
    if (TURNSTILE_SITE_KEY && !captchaToken) {
      setStatus("error");
      setError("Please complete the verification check before submitting.");
      return;
    }

    setStatus("loading");
    setError("");

    try {
      const response = await fetch("/api/public/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          name: data.get("name"),
          email,
          subject: data.get("subject"),
          message,
          severity: data.get("severity") || null,
          pageUrl: typeof window !== "undefined" ? window.location.href : null,
          captchaToken: captchaToken || null,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.error || "This could not be submitted. Please try again.");
      setStatus("success");
      form.reset();
    } catch (reason) {
      setStatus("error");
      setError(reason instanceof Error ? reason.message : "This could not be submitted. Please try again.");
      const turnstile = (window as unknown as { turnstile?: { reset: () => void } }).turnstile;
      turnstile?.reset();
    }
  }

  if (status === "success") {
    return (
      <div className="marketing-contact-form marketing-contact-success">
        <h2>Thanks — that's on its way.</h2>
        <p>We've received your submission and will follow up at the email you provided if a response is needed.</p>
        <button type="button" onClick={() => setStatus("idle")}>Submit another</button>
      </div>
    );
  }

  return (
    <form className="marketing-contact-form" onSubmit={handleSubmit}>
      <h2>{copy.heading}</h2>
      <div className="marketing-contact-row">
        <label>
          <span>Name</span>
          <input type="text" name="name" autoComplete="name" placeholder="Your name" />
        </label>
        <label>
          <span>Email *</span>
          <input type="email" name="email" autoComplete="email" required placeholder="you@example.com" />
        </label>
      </div>
      <label>
        <span>{copy.subjectLabel}</span>
        <input type="text" name="subject" placeholder={type === "ABUSE" ? "https://" : undefined} />
      </label>
      {type === "BUG" ? (
        <label>
          <span>Severity</span>
          <select name="severity" defaultValue="normal">
            <option value="low">Low — minor or cosmetic</option>
            <option value="normal">Normal — affects my work</option>
            <option value="high">High — blocks a core task</option>
            <option value="critical">Critical — site down or data at risk</option>
          </select>
        </label>
      ) : null}
      <label>
        <span>{copy.messageLabel} *</span>
        <textarea name="message" required minLength={10} rows={5} placeholder={copy.messagePlaceholder} />
      </label>
      {TURNSTILE_SITE_KEY ? (
        <>
          <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer strategy="afterInteractive" />
          <div className="cf-turnstile" data-sitekey={TURNSTILE_SITE_KEY} data-theme="auto" />
        </>
      ) : null}
      {status === "error" ? <p className="marketing-contact-error">{error}</p> : null}
      <button type="submit" disabled={status === "loading"}>{status === "loading" ? "Sending…" : copy.submitLabel}</button>
      <small>Do not include passwords, one-time codes, or full payment details in this form.</small>
    </form>
  );
}
