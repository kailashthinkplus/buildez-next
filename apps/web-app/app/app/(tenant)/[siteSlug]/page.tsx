// app/app/(tenant)/[siteSlug]/page.tsx

import Link from "next/link";

export default async function SiteRootPage({ params }: { params: Promise<{ siteSlug: string }> }) {
  const { siteSlug } = await params;
  return (
    <div className="max-w-5xl mx-auto py-12">
      <h1 className="text-2xl font-semibold">
        {siteSlug}
      </h1>

      <p className="mt-2 opacity-70">
        Choose where you want to go.
      </p>

      <div className="mt-6 flex gap-4">
        <Link
          href={`/app/${siteSlug}/dashboard`}
          className="bez-card px-6 py-4"
        >
          Dashboard
        </Link>

        <Link
          href={`/app/${siteSlug}/pages`}
          className="bez-card px-6 py-4"
        >
          Pages
        </Link>
      </div>
    </div>
  );
}
