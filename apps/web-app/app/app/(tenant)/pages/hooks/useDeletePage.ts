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

      if (!res.ok) throw new Error("Failed to delete");

      mutate("/api/pages");
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }

  return { deletePage, loading };
}
