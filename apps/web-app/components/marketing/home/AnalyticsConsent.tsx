"use client";

import { MarketingAnalytics, notifyAnalyticsConsentGranted } from "@/modules/legal/MarketingAnalytics";
import { CookieConsentBanner } from "@/modules/legal/CookieConsentBanner";

/**
 * Bundles the two analytics/consent mounts together so the onConsent
 * callback (a function value) never has to cross the server->client
 * boundary from the now-server-component page.tsx.
 */
export function AnalyticsConsent() {
  return (
    <>
      <MarketingAnalytics />
      <CookieConsentBanner
        storageKey="buildez_cookie_consent_marketing"
        brandName="BuildEzy"
        message="BuildEzy uses cookies for essential functionality, security, and (with your consent) analytics."
        learnMoreHref="/cookies"
        learnMoreLabel="Cookie Policy"
        onConsent={(choice) => choice === "accepted" && notifyAnalyticsConsentGranted()}
      />
    </>
  );
}
