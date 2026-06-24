// /Users/kailash/buildez/apps/web-app/app/app/(builder)/[siteSlug]/[pageSlugWithId]/layout.tsx

import Script from "next/script";
import "./builder-ui.css"; // ✅ Builder-only styles

export default function BuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* ✅ Load Tailwind CSS for AI-generated components */}
      <Script 
        src="https://cdn.tailwindcss.com"
        strategy="beforeInteractive"
      />
      {children}
    </>
  );
}
