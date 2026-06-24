"use client";

import { useParams } from "next/navigation";
import PagesView from "../../components/PagesView";

export default function SitePagesPage() {
  const params = useParams();

  const siteSlug =
    typeof params?.siteSlug === "string"
      ? params.siteSlug
      : null;

  if (!siteSlug) return null;

  return <PagesView siteSlug={siteSlug} />;
}
