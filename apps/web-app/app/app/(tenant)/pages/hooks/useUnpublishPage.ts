"use client";

import { useState } from "react";
import { useSWRConfig } from "swr";

export function useUnpublishPage() {
  const { mutate } = useSWRConfig();
  const [loading, setLoading] = useState(false);

  async function unpublish(pageId: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/pages/${pageId}/unpublish`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-tenant-id": localStorage.getItem("tenantId") || "",
        },
      });

      if (!res.ok) throw new Error("Failed to unpublish");

      mutate("/api/pages");
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }

  return { unpublish, loading };
}
