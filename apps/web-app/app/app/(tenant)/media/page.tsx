"use client";

import MediaLibrary from "@/modules/builder-v2/media/components/MediaLibrary";
import { useWorkspace } from "../components/WorkspaceContext";

export default function MediaPage() {
  const { currentWebsite, loading } = useWorkspace();

  if (loading) {
    return (
      <div className="flex min-h-[480px] items-center justify-center dashboard-muted">
        Loading media library...
      </div>
    );
  }

  if (!currentWebsite) {
    return (
      <div className="rounded-lg dashboard-card p-8 text-center dashboard-muted">
        Create or select a website to manage media.
      </div>
    );
  }

  return (
    <MediaLibrary
      siteId={currentWebsite.id}
      description="All uploads for the selected website. Images are converted to WebP and stored in Cloudflare R2."
    />
  );
}
