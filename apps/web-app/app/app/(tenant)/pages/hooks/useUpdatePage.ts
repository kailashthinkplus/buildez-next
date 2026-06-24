"use client";

import { useState } from "react";
import { useSWRConfig } from "swr";

export function useUpdatePage() {
  const { mutate } = useSWRConfig();
  const [loading, setLoading] = useState(false);

  async function updatePage(pageId: string, data: any) {
    setLoading(true);
    try {
      const res = await fetch(`/api/pages/${pageId}/settings`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-tenant-id": localStorage.getItem("tenantId") || "",
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to update");

      mutate("/api/pages");
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }

  return { updatePage, loading };
}
