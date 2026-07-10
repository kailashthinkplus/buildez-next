// /Users/kailash/buildez/apps/web-app/app/app/(builder)/[siteSlug]/[pageSlugWithId]/layout.tsx

import "./builder-ui.css"; // ✅ Builder-only styles

export default function BuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
