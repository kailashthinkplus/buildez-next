"use client";

export function usePreviewPage() {
  return async function preview(pageId: string) {
    const res = await fetch(`/api/pages/${pageId}/preview`, {
      credentials: "include",
    });

    if (!res.ok) {
      console.error("Preview failed");
      return;
    }

    const data = await res.json();
    if (data?.previewUrl) {
      window.open(data.previewUrl, "_blank");
    }
  };
}
