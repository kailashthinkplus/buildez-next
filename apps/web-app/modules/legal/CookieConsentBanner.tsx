"use client";

import { useEffect, useState } from "react";

type ConsentChoice = "accepted" | "rejected";
type StoredConsent = { status: ConsentChoice; region: string; timestamp: string };
type ConsentRegionResponse = { region: "eu" | "us" | "other" };

export type CookieConsentBannerProps = {
  /** localStorage key this banner's choice is stored under — scope per-site for tenant sites so consent doesn't leak across sites sharing a browser. */
  storageKey: string;
  message: string;
  /** Link to the relevant cookie/privacy policy. Omit to hide the link. */
  learnMoreHref?: string;
  learnMoreLabel?: string;
  brandName?: string;
  /** Fired once a visitor accepts or rejects, so callers can gate analytics/marketing scripts. */
  onConsent?: (choice: ConsentChoice) => void;
};

function readStoredConsent(storageKey: string): StoredConsent | null {
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredConsent;
    return parsed?.status ? parsed : null;
  } catch {
    return null;
  }
}

/** A visitor can reopen this banner (e.g. from a "Cookie preferences" footer link) by dispatching this event on `window`. */
export const REOPEN_COOKIE_BANNER_EVENT = "buildez:reopen-cookie-banner";

export function CookieConsentBanner({
  storageKey,
  message,
  learnMoreHref,
  learnMoreLabel = "Learn more",
  brandName,
  onConsent,
}: CookieConsentBannerProps) {
  const [visible, setVisible] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function evaluate() {
      const stored = readStoredConsent(storageKey);
      if (stored) {
        setChecked(true);
        return;
      }
      try {
        const res = await fetch("/api/geo/consent-region", { cache: "no-store" });
        if (!res.ok) throw new Error("geo lookup failed");
        const data = (await res.json()) as ConsentRegionResponse;
        if (cancelled) return;
        if (data.region === "eu" || data.region === "us") {
          setVisible(true);
        }
      } catch {
        // Geo lookup failing should never block the site — simply skip the banner.
      } finally {
        if (!cancelled) setChecked(true);
      }
    }

    void evaluate();

    function onReopen() {
      setVisible(true);
    }
    window.addEventListener(REOPEN_COOKIE_BANNER_EVENT, onReopen);
    return () => {
      cancelled = true;
      window.removeEventListener(REOPEN_COOKIE_BANNER_EVENT, onReopen);
    };
  }, [storageKey]);

  function decide(status: ConsentChoice) {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify({ status, region: "unknown", timestamp: new Date().toISOString() } satisfies StoredConsent));
    } catch {
      // localStorage can throw in private-browsing contexts — the banner still hides for this session.
    }
    setVisible(false);
    onConsent?.(status);
  }

  if (!checked || !visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label={`${brandName ? `${brandName} c` : "C"}ookie consent`}
      className="fixed inset-x-0 bottom-0 z-[2147483200] flex justify-center px-3 pb-3 sm:px-4 sm:pb-4"
    >
      <div className="flex w-full max-w-3xl flex-col gap-3 rounded-xl border border-black/10 bg-white/95 p-4 shadow-lg backdrop-blur-md dark:border-white/10 dark:bg-[#0b1220]/95 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <p className="text-sm leading-6 text-slate-700 dark:text-white/80">
          {message}
          {learnMoreHref ? (
            <>
              {" "}
              <a href={learnMoreHref} className="font-medium underline underline-offset-2 hover:text-slate-900 dark:hover:text-white">
                {learnMoreLabel}
              </a>
            </>
          ) : null}
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => decide("rejected")}
            className="rounded-lg border border-black/10 px-3.5 py-2 text-sm font-medium text-slate-600 transition hover:bg-black/5 dark:border-white/15 dark:text-white/70 dark:hover:bg-white/10"
          >
            Reject
          </button>
          <button
            type="button"
            onClick={() => decide("accepted")}
            className="rounded-lg bg-slate-900 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-white/85"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}

/** True once this browser has recorded an accept/reject choice for the given storage key. */
export function hasCookieConsentChoice(storageKey: string): boolean {
  return readStoredConsent(storageKey) !== null;
}

/** True only if the visitor explicitly accepted — use this to gate non-essential scripts (analytics, pixels). */
export function hasAcceptedCookieConsent(storageKey: string): boolean {
  return readStoredConsent(storageKey)?.status === "accepted";
}
