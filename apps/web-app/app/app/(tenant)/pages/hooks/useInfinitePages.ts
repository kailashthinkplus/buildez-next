// /app/app/(tenant)/pages/hooks/useInfinitePages.ts
"use client";

import useSWRInfinite from "swr/infinite";

const fetcher = (url: string) =>
  fetch(url, { credentials: "include" }).then((r) => r.json());

export function useInfinitePages({
  search,
  sort = "createdAt_desc",
  pageSize = 10,
}) {
  const getKey = (pageIndex: number, previous: any) => {
    if (previous && previous.pages.length === 0) return null;

    return `/api/pages?skip=${pageIndex * pageSize}&take=${pageSize}&search=${encodeURIComponent(
      search
    )}&sort=${sort}`;
  };

  const { data, size, setSize, mutate, isValidating } = useSWRInfinite(
    getKey,
    fetcher
  );

  const pages = data ? data.flatMap((d) => d.pages) : [];
  const total = data?.[0]?.total || 0;

  const hasMore = pages.length < total;

  return {
    pages,
    total,
    isLoading: !data && !isValidating,
    isValidating,
    loadMore: () => setSize(size + 1),
    mutate,
    hasMore,
  };
}
