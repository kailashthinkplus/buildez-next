import "./marketing-pages.css";
import "./unique-marketing-pages.css";

import { CookieConsentBanner } from "@/modules/legal/CookieConsentBanner";

export default function MarketingPagesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <CookieConsentBanner
        storageKey="buildez_cookie_consent_marketing"
        brandName="BuildEzy"
        message="BuildEzy uses cookies for essential functionality, security, and (with your consent) analytics."
        learnMoreHref="/cookies"
        learnMoreLabel="Cookie Policy"
      />
    </>
  );
}
