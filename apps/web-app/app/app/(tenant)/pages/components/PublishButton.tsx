"use client";

import { useState } from "react";
import { Globe, Undo2 } from "lucide-react";
import { usePageMutations } from "../hooks/usePageMutations";

export default function PublishButton({ page, onClick, onChanged }) {
  const siteSlug = page.site?.slug;
  const { publish, unpublish } = usePageMutations(siteSlug);
  const isPublished = page.status === "PUBLISHED";
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleUnpublish() {
    onClick?.();
    setPending(true);
    setError("");
    try {
      await unpublish.mutate({ pageId: page.id });
      onChanged?.();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not unpublish this page.");
    } finally {
      setPending(false);
    }
  }

  async function handlePublish() {
    onClick?.();
    setPending(true);
    setError("");
    try {
      await publish.mutate({ pageId: page.id });
      onChanged?.();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not publish this page.");
    } finally {
      setPending(false);
    }
  }

  if (isPublished) {
    return (
      <div className="flex flex-col items-end gap-1">
        <button
          disabled={pending}
          onClick={() => void handleUnpublish()}
          className="
            px-3 py-1.5 rounded-lg text-xs
            dashboard-subtle
            flex items-center gap-1
            disabled:opacity-60
          "
        >
          <Undo2 className="h-3.5 w-3.5" />
          {pending ? "Unpublishing…" : "Unpublish"}
        </button>
        {error && <span className="text-[11px] text-rose-500">{error}</span>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        disabled={pending}
        onClick={() => void handlePublish()}
        className="
          px-3 py-1.5 rounded-lg text-xs
          bg-green-600 text-white hover:bg-green-500
          flex items-center gap-1
          disabled:opacity-60
        "
      >
        <Globe className="h-3.5 w-3.5" />
        {pending ? "Publishing…" : "Publish"}
      </button>
      {error && <span className="text-[11px] text-rose-500">{error}</span>}
    </div>
  );
}
