"use client";

import useSWR from "swr";

/* ============================================================
   TYPES
============================================================ */
export type PagesQuery = {
  siteSlug?: string;
  search?: string;
  page?: number;
  limit?: number;
};

/* ============================================================
   🔑 SINGLE SOURCE OF TRUTH — SWR KEY BUILDER
============================================================ */
export function getPagesKey({
  siteSlug,
  search = "",
  page = 1,
  limit = 10,
}: PagesQuery) {
  const params = new URLSearchParams();

  if (siteSlug) params.set("siteSlug", siteSlug);
  if (search) params.set("search", search);

  params.set("skip", String((page - 1) * limit));
  params.set("take", String(limit));

  const key = `/api/pages?${params.toString()}`;

  console.log("🔑 [usePages] getPagesKey →", {
    siteSlug,
    search,
    page,
    limit,
    key,
  });

  return key;
}

/* ============================================================
   FETCHER (AUTH-SAFE + NORMALIZED)
============================================================ */
const fetcher = async (url: string) => {
  console.log("🌐 [usePages] FETCH →", url);

  const res = await fetch(url, {
    credentials: "include",
  });

  console.log("🌐 [usePages] RESPONSE ←", {
    url,
    status: res.status,
    ok: res.ok,
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("❌ [usePages] FETCH ERROR:", {
      url,
      response: text,
    });
    throw new Error(text || "Failed to fetch pages");
  }

  const json = await res.json();

  console.log("📦 [usePages] RAW RESPONSE ←", json);

  /*
    apiHandler response shape:
    {
      success: true,
      data: {
        data: {
          pages: Page[],
          total: number
        }
      },
      error: null
    }
  */

  return json?.data?.data ?? { pages: [], total: 0 };
};


/* ============================================================
   HOOK
============================================================ */
export function usePages({
  siteSlug,
  search = "",
  page = 1,
  limit = 10,
}: PagesQuery) {
  console.log("🧩 [usePages] INIT →", {
    siteSlug,
    search,
    page,
    limit,
  });

  const key = getPagesKey({ siteSlug, search, page, limit });

  const { data, error, isLoading, mutate } = useSWR(key, fetcher, {
    keepPreviousData: true,
    revalidateOnFocus: false,
  });

  console.log("📊 [usePages] STATE →", {
    key,
    isLoading,
    hasData: !!data,
    error,
  });

  return {
    pages: data?.pages ?? [],
    total: data?.total ?? 0,
    isLoading,
    isError: error,
    mutate,
    key, // 🔍 exposed for mutation matching
  };
}
