"use client";

import { Globe, Undo2 } from "lucide-react";
import { usePublishPage } from "../hooks/usePublishPage";
import { useUnpublishPage } from "../hooks/useUnpublishPage";

export default function PublishButton({ page }) {
  const { publish, loading: pubLoading } = usePublishPage();
  const { unpublish, loading: unpubLoading } = useUnpublishPage();

  if (page.published) {
    return (
      <button
        onClick={() => unpublish(page.id)}
        disabled={unpubLoading}
        className="
          px-3 py-1.5 rounded-lg text-xs
          bg-gray-200 dark:bg-white/10
          flex items-center gap-1
        "
      >
        <Undo2 className="h-3.5 w-3.5" />
        Unpublish
      </button>
    );
  }

  return (
    <button
      onClick={() => publish(page.id)}
      disabled={pubLoading}
      className="
        px-3 py-1.5 rounded-lg text-xs
        bg-green-600 text-white hover:bg-green-500
        flex items-center gap-1
      "
    >
      <Globe className="h-3.5 w-3.5" />
      Publish
    </button>
  );
}
