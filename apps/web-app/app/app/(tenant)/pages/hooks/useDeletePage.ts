"use client";

import { useState } from "react";
import { useSWRConfig } from "swr";

export function useDeletePage() {
  const { mutate } = useSWRConfig();
  const [loading, setLoading] = useState(false);

  async function deletePage(pageId: string) {
    setLoading(true);

    try {
      const res = await fetch(`/api/pages/${pageId}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "x-tenant-id": localStorage.getItem("tenantId") || "",
        },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to delete page");
      }

      await mutate((key) => (
        typeof key === "string" && key.startsWith("/api/pages")
      ));
      return { success: true };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Failed to delete page",
      };
    } finally {
      setLoading(false);
    }
  }

  return { deletePage, loading };
}
