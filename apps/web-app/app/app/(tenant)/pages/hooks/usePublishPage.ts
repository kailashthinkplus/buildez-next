"use client";

import { useState } from "react";
import { useSWRConfig } from "swr";

export function usePublishPage(siteSlug: string) {
  const { mutate } = useSWRConfig();
  const [loading, setLoading] = useState(false);

  async function publish(pageId: string) {
    setLoading(true);

    try {
      const res = await fetch(`/api/pages/${pageId}/publish`, {
        method: "POST",
        credentials: "include", // ✅ cookie + tenant-id handled by middleware
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to publish");
      }

      // 🔒 Revalidate ONLY the active site's pages
      mutate(
        (key) =>
          typeof key === "string" &&
          key.startsWith(`/api/pages?siteSlug=${siteSlug}`)
      );

      return { success: true };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unknown publish error";

      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }

  return { publish, loading };
}
