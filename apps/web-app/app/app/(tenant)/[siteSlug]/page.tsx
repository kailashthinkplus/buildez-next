// app/app/(tenant)/[siteSlug]/page.tsx

import Link from "next/link";

export default function SiteRootPage({ params }: { params: { siteSlug: string } }) {
  return (
    <div className="max-w-5xl mx-auto py-12">
      <h1 className="text-2xl font-semibold">
        {params.siteSlug}
      </h1>

      <p className="mt-2 opacity-70">
        Choose where you want to go.
      </p>

      <div className="mt-6 flex gap-4">
        <Link
          href={`/app/${params.siteSlug}/dashboard`}
          className="bez-card px-6 py-4"
        >
          Dashboard
        </Link>

        <Link
          href={`/app/${params.siteSlug}/pages`}
          className="bez-card px-6 py-4"
        >
          Pages
        </Link>
      </div>
    </div>
  );
}
