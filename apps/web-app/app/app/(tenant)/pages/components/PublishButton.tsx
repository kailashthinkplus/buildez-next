"use client";

import { Globe, Undo2 } from "lucide-react";
import { usePageMutations } from "../hooks/usePageMutations";

export default function PublishButton({ page, onClick, onChanged }) {
  const siteSlug = page.site?.slug;
  const { publish, unpublish } = usePageMutations(siteSlug);
  const isPublished = page.status === "PUBLISHED";

  async function handleUnpublish() {
    onClick?.();
    await unpublish.mutate({ pageId: page.id });
    onChanged?.();
  }

  async function handlePublish() {
    onClick?.();
    await publish.mutate({ pageId: page.id });
    onChanged?.();
  }

  if (isPublished) {
    return (
      <button
        onClick={() => void handleUnpublish()}
        className="
          px-3 py-1.5 rounded-lg text-xs
          dashboard-subtle
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
      onClick={() => void handlePublish()}
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
