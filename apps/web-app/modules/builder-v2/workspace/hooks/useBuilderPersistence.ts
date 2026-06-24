"use client";

import { useCallback, useState } from "react";

import type { BuilderBlueprint } from "../../types/blueprint";

interface SaveOptions {
  pageId: string;
  blueprint: BuilderBlueprint | null;
  reactCode?: string | null;
}

export function useBuilderPersistence({
  pageId,
  blueprint,
  reactCode,
}: SaveOptions) {
  const [saving, setSaving] = useState(false);

  const [lastSavedAt, setLastSavedAt] =
    useState<Date | null>(null);

  const [saveError, setSaveError] =
    useState<string | null>(null);

  const save = useCallback(async () => {
    if (!pageId || !blueprint) return false;

    try {
      setSaving(true);
      setSaveError(null);

      const res = await fetch(
        `/api/pages/${pageId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            blueprint,
            reactCode,
          }),
        }
      );

      if (!res.ok) {
        throw new Error(
          `Failed to save (${res.status})`
        );
      }

      setLastSavedAt(new Date());

      return true;
    } catch (err: any) {
      console.error(err);

      setSaveError(
        err?.message ?? "Failed to save."
      );

      return false;
    } finally {
      setSaving(false);
    }
  }, [pageId, blueprint, reactCode]);

  return {
    save,

    saving,

    saveError,

    lastSavedAt,
  };
}