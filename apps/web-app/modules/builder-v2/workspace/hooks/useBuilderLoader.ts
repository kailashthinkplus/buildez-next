"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { useCanvasStore } from "../../store/useCanvasStore";

import type { BuilderBlueprint } from "../../types/blueprint";

interface BrandContext {
  logoUrl?: string | null;
  colors?: any;
}

interface UseBuilderLoaderResult {
  loading: boolean;
  error: string | null;

  blueprint: BuilderBlueprint | null;
  setBlueprint: React.Dispatch<
    React.SetStateAction<BuilderBlueprint | null>
  >;

  reactCode: string | null;
  setReactCode: React.Dispatch<
    React.SetStateAction<string | null>
  >;

  pageId: string;
  siteId: string | null;

  siteSlug: string;

  brandContext: BrandContext | null;
  setBrandContext: React.Dispatch<
    React.SetStateAction<BrandContext | null>
  >;
}

export function useBuilderLoader(): UseBuilderLoaderResult {
  /* ==========================================================
     Route Params
  ========================================================== */

  const params = useParams();

  const pageSlugWithId =
    params?.pageSlugWithId as string;

  const pageId =
    pageSlugWithId?.split("-").pop() || "";

  const siteSlug =
    params?.siteSlug as string;

  /* ==========================================================
     Canvas Store
  ========================================================== */

  const setDesignTokens = useCanvasStore(
    (s) => s.setDesignTokens
  );

  /* ==========================================================
     State
  ========================================================== */

  const [loading, setLoading] = useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [blueprint, setBlueprint] =
    useState<BuilderBlueprint | null>(null);

  const [reactCode, setReactCode] =
    useState<string | null>(null);

  const [siteId, setSiteId] =
    useState<string | null>(null);

  const [brandContext, setBrandContext] =
    useState<BrandContext | null>(null);

  /* ==========================================================
     Load Blueprint
  ========================================================== */

  useEffect(() => {
    if (!pageId) {
      setError("Missing pageId");
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadBlueprint() {
      try {
        const res = await fetch(
          `/api/pages/${pageId}`,
          {
            credentials: "include",
          }
        );

        if (!res.ok) {
          throw new Error(
            `Failed to load page (${res.status})`
          );
        }

        const json = await res.json();

        const payload = json?.data ?? json;

        if (cancelled) return;

        /**
         * NOTE:
         * Temporary until BuilderRoot is fully migrated.
         * The API still returns the legacy blueprint shape.
         */
        setBlueprint(payload.blueprint ?? null);

        if (
          typeof payload.reactCode === "string"
        ) {
          setReactCode(payload.reactCode);
        }

        if (
          payload.blueprint?.theme?.tokens
        ) {
          setDesignTokens(
            payload.blueprint.theme.tokens
          );
        }

        setLoading(false);

        setError(null);
      } catch (err: any) {
        if (cancelled) return;

        console.error(err);

        setLoading(false);

        setError(
          err?.message ??
            "Failed to load page."
        );
      }
    }

    loadBlueprint();

    return () => {
      cancelled = true;
    };
  }, [pageId, setDesignTokens]);

  /* ==========================================================
     Load Site
  ========================================================== */

  useEffect(() => {
    if (!pageId) return;

    fetch(`/api/sites/by-page/${pageId}`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((json) => {
        if (!json?.site) return;

        setSiteId(json.site.id);

        setBrandContext({
          logoUrl: json.site.logoUrl ?? null,
          colors:
            json.site.designTokens?.colors ??
            null,
        });

        if (json.site.designTokens) {
          setDesignTokens(
            json.site.designTokens
          );
        }
      });
  }, [pageId, setDesignTokens]);

  /* ==========================================================
     Return
  ========================================================== */

  return {
    loading,
    error,

    blueprint,
    setBlueprint,

    reactCode,
    setReactCode,

    pageId,
    siteId,
    siteSlug,

    brandContext,
    setBrandContext,
  };
}