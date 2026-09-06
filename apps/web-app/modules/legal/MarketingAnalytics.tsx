"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { logEvent } from "firebase/analytics";
import { getFirebaseAnalytics, firebaseAnalyticsEnabled } from "@/lib/firebase/client";
import { hasAcceptedCookieConsent } from "./CookieConsentBanner";

const CONSENT_STORAGE_KEY = "buildez_cookie_consent_marketing";
const CONSENT_GRANTED_EVENT = "buildez:analytics-consent-granted";

/** Call from a CookieConsentBanner's onConsent handler to start analytics the moment a visitor accepts, without a reload. */
export function notifyAnalyticsConsentGranted() {
  try {
    window.dispatchEvent(new Event(CONSENT_GRANTED_EVENT));
  } catch {
    // window unavailable — nothing to notify
  }
}

/** Fire-and-forget CTA click tracking for the marketing homepage — a no-op until analytics is actually enabled/consented, same as page_view. */
export function logMarketingCtaClick(ctaId: string, extra?: Record<string, unknown>) {
  if (!firebaseAnalyticsEnabled) return;
  getFirebaseAnalytics().then((analytics) => {
    if (analytics) logEvent(analytics, "cta_click", { cta_id: ctaId, ...extra });
  });
}

/**
 * GA4 (via Firebase Analytics), scoped to BuildEZ's public marketing pages
 * only — mount this in the marketing layout and the standalone homepage,
 * never inside /app or /super, which are behind auth and shouldn't be
 * tracked as marketing traffic.
 *
 * Loads only once analytics is actually allowed: either the visitor already
 * accepted the cookie banner, or they're outside the EU/US region where
 * CookieConsentBanner (see consent-region check there) never shows a banner
 * in the first place — nothing to gate in that case.
 */
export function MarketingAnalytics() {
  return (
    <Suspense fallback={null}>
      <MarketingAnalyticsTracker />
    </Suspense>
  );
}

function MarketingAnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!firebaseAnalyticsEnabled) return;
    let cancelled = false;

    async function tryInit() {
      if (hasAcceptedCookieConsent(CONSENT_STORAGE_KEY)) {
        await getFirebaseAnalytics();
        return;
      }
      try {
        const res = await fetch("/api/geo/consent-region", { cache: "no-store" });
        if (!res.ok) throw new Error("geo lookup failed");
        const data = (await res.json()) as { region: "eu" | "us" | "other" };
        if (!cancelled && data.region !== "eu" && data.region !== "us") {
          await getFirebaseAnalytics();
        }
      } catch {
        // Geo lookup failing should never block the page — analytics simply stays off.
      }
    }

    void tryInit();

    function onConsentGranted() {
      void getFirebaseAnalytics();
    }
    window.addEventListener(CONSENT_GRANTED_EVENT, onConsentGranted);
    return () => {
      cancelled = true;
      window.removeEventListener(CONSENT_GRANTED_EVENT, onConsentGranted);
    };
  }, []);

  useEffect(() => {
    if (!firebaseAnalyticsEnabled || !pathname) return;
    const page_path = searchParams?.toString() ? `${pathname}?${searchParams.toString()}` : pathname;
    getFirebaseAnalytics().then((analytics) => {
      if (analytics) logEvent(analytics, "page_view", { page_path, page_location: window.location.href });
    });
  }, [pathname, searchParams]);

  return null;
}
