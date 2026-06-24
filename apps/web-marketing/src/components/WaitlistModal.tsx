"use client";

import { useEffect, useRef, useState, useCallback } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, options: any) => string;
      reset: (id?: string) => void;
      remove: (id: string) => void;
    };
  }
}

export default function WaitlistModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileReady, setTurnstileReady] = useState(false);

  const turnstileRef = useRef<HTMLDivElement | null>(null);
  const turnstileWidgetId = useRef<string | null>(null);

  // Cleanup on unmount/close
  useEffect(() => {
    return () => {
      if (turnstileWidgetId.current && window.turnstile) {
        window.turnstile.reset(turnstileWidgetId.current);
        window.turnstile.remove(turnstileWidgetId.current);
      }
      setTurnstileToken(null);
      setTurnstileReady(false);
      setError(null);
    };
  }, []);

  /* ESC + SCROLL LOCK */
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (open) {
      document.addEventListener("keydown", onEsc);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", onEsc);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  /* LOAD TURNSTILE SCRIPT */
  useEffect(() => {
    if (!open) return;

    const loadTurnstile = () => {
      if (document.getElementById("cf-turnstile-script")) return;

      const script = document.createElement("script");
      script.id = "cf-turnstile-script";
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.onload = () => setTurnstileReady(true);
      script.onerror = () => setError("Failed to load verification. Please refresh.");
      document.body.appendChild(script);
    };

    loadTurnstile();
  }, [open]);

  /* RENDER TURNSTILE */
  useEffect(() => {
    if (!open || !turnstileRef.current || !turnstileReady || !window.turnstile) return;
    if (turnstileWidgetId.current) return; // Prevent double render

    try {
      turnstileWidgetId.current = window.turnstile.render(turnstileRef.current, {
        sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "",
        theme: "dark",
        callback: (token: string) => {
          setTurnstileToken(token);
          setError(null);
        },
        "error-callback": (error: string) => {
          console.error("Turnstile error:", error);
          setError("Verification failed. Please try again.");
          setTurnstileToken(null);
        },
        "expired-callback": () => {
          setTurnstileToken(null);
          setError("Verification expired. Please verify again.");
        }
      });
    } catch (err) {
      console.error("Turnstile render failed:", err);
      setError("Verification unavailable. Please refresh page.");
    }
  }, [open, turnstileReady]);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!turnstileToken) {
      setError("Please complete the verification step.");
      if (turnstileWidgetId.current && window.turnstile) {
        window.turnstile.reset(turnstileWidgetId.current);
      }
      return;
    }

    setLoading(true);

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form) as any);

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          source: "BuildEZ Home",
          turnstileToken,
        }),
      });

      if (res.ok) {
        setSuccess(true);
        if (turnstileWidgetId.current && window.turnstile) {
          window.turnstile.reset(turnstileWidgetId.current);
        }
        form.reset();
        setTurnstileToken(null);
        return;
      }

      const json = await res.json().catch(() => ({}));
      const apiError = json?.error || "Submission failed. Please try again.";
      
      // Handle specific Google/Turnstile backend errors
      if (apiError.includes("token") || apiError.includes("verification")) {
        setError("Verification invalid. Please complete the challenge again.");
        if (turnstileWidgetId.current && window.turnstile) {
          window.turnstile.reset(turnstileWidgetId.current);
        }
      } else {
        setError(apiError);
      }
    } catch (err) {
      console.error("Submit error:", err);
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] isolate">
      <div
        className="absolute inset-0 bg-[rgba(8,10,16,0.55)] backdrop-blur-xl"
        onMouseDown={onClose}
      />
      <div
        className="relative z-10 flex min-h-full items-center justify-center px-4"
        onMouseDown={onClose}
      >
        <div
          className="relative w-full max-w-lg rounded-3xl p-6
          bg-[linear-gradient(180deg,rgba(255,255,255,0.16),rgba(255,255,255,0.06))]
          backdrop-blur-2xl border border-white/20
          shadow-[0_40px_120px_rgba(0,0,0,0.65)] isolate"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-white/60 hover:text-white"
          >
            ✕
          </button>

          {success ? (
            <>
              <h3 className="text-xl font-semibold">You're on the waitlist ✅</h3>
              <p className="mt-2 text-white/70">
                We'll reach out when BuildEZ access opens.
              </p>
            </>
          ) : (
            <form onSubmit={submit} className="space-y-3">
              <h3 className="text-xl font-semibold">Join BuildEZ Waitlist</h3>
              <p className="text-sm text-white/70">
                We'll contact you via <b>call or WhatsApp</b> once your invite is activated.
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                <input required name="name" placeholder="Full name *" className="glass w-full rounded-xl px-4 py-3" />
                <input required type="email" name="email" placeholder="Work email *" className="glass w-full rounded-xl px-4 py-3" />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <input name="company" placeholder="Company / Brand" className="glass w-full rounded-xl px-4 py-3" />
                <input name="role" placeholder="Role (Founder / Designer / Dev)" className="glass w-full rounded-xl px-4 py-3" />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <input required name="city" placeholder="City *" className="glass w-full rounded-xl px-4 py-3" />
                <input required name="state" placeholder="State *" className="glass w-full rounded-xl px-4 py-3" />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <select name="useCase" defaultValue="" className="glass w-full rounded-xl px-4 py-3 text-white/80">
                  <option value="" disabled>Select use case</option>
                  <option value="marketing">Marketing websites</option>
                  <option value="saas">SaaS landing pages</option>
                  <option value="agency">Agency client websites</option>
                  <option value="docs">Docs / knowledge base</option>
                </select>

                <select name="teamSize" defaultValue="" className="glass w-full rounded-xl px-4 py-3 text-white/80">
                  <option value="" disabled>Select team size</option>
                  <option value="solo">Solo</option>
                  <option value="small">2–5</option>
                  <option value="medium">6–20</option>
                  <option value="large">20+</option>
                </select>
              </div>

              <textarea
                name="notes"
                placeholder="What are you trying to build? (optional)"
                className="glass w-full rounded-xl px-4 py-3 min-h-[96px]"
              />

              <div className="mt-4 flex justify-center">
                <div ref={turnstileRef} />
                {!turnstileReady && (
                  <div className="text-xs text-white/50">Loading verification...</div>
                )}
              </div>

              {error && <div className="text-sm text-red-300 p-3 bg-red-500/10 rounded-xl">{error}</div>}

              <button
                type="submit"
                disabled={loading || !turnstileToken || !turnstileReady}
                className="bg-blue-modal mt-6 w-full font-bold py-3 rounded-xl disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Join Waitlist →"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
