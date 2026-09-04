"use client";

import "./marketing-pages.css";
import "./unique-marketing-pages.css";

import { CookieConsentBanner } from "@/modules/legal/CookieConsentBanner";
import { MarketingAnalytics, notifyAnalyticsConsentGranted } from "@/modules/legal/MarketingAnalytics";

export default function MarketingPagesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
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
