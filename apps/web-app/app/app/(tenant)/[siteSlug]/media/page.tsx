"use client";

import MediaLibrary from "@/modules/builder-v2/media/components/MediaLibrary";
import { useWorkspace } from "../../components/WorkspaceContext";
import { useParams } from "next/navigation";

export default function SiteMediaPage() {
  const params = useParams<{ siteSlug: string }>();
  const { websites, currentWebsite, loading } = useWorkspace();
  const site =
    websites.find((website) => website.slug === params.siteSlug) ??
    currentWebsite;

  if (loading) {
    return (
      <div className="flex min-h-[480px] items-center justify-center dashboard-muted">
        Loading media library...
      </div>
    );
  }

  if (!site) {
    return (
      <div className="rounded-lg dashboard-card p-8 text-center dashboard-muted">
        Website not found.
      </div>
    );
  }

  return (
    <MediaLibrary
      siteId={site.id}
      title={`${site.name} Media`}
      description="All uploads for this website. Drag in new images, search existing assets, and delete anything you no longer need."
    />
  );
}
