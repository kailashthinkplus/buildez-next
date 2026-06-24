"use client";

import { useSWRConfig } from "swr";
import { getPagesKey } from "./usePages";

/* ============================================================
   Unified API helper
============================================================ */
async function call(
  url: string,
  body?: any,
  method: "POST" | "PUT" | "DELETE" = "POST"
) {
  console.log("🌐 API CALL →", {
    url,
    method,
    body,
  });

  const res = await fetch(url, {
    method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: method === "DELETE" ? undefined : JSON.stringify(body ?? {}),
  });

  console.log("🌐 API RESPONSE ←", {
    url,
    status: res.status,
    ok: res.ok,
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("❌ API ERROR:", {
      url,
      method,
      body,
      response: text,
    });
    throw new Error(text || "Request failed");
  }

  return res.json().catch(() => ({}));
}

/* ============================================================
   PAGE MUTATIONS — SITE LOCKED (FINAL)
============================================================ */
export function usePageMutations(siteSlug: string) {
  const { mutate } = useSWRConfig();

  console.log("🧩 usePageMutations INIT → siteSlug:", siteSlug);

  if (!siteSlug) {
    console.error("🟥 usePageMutations called WITHOUT siteSlug");
    throw new Error("usePageMutations requires siteSlug");
  }

  /* ============================================================
     🔄 Revalidate ALL page lists for this site
  ============================================================ */
  const refreshPages = async () => {
    console.log("🔄 Revalidating ALL pages for site:", siteSlug);

    await mutate((key) => {
      if (typeof key !== "string") return false;
      if (!key.startsWith("/api/pages")) return false;

      try {
        const url = new URL(key, window.location.origin);
        const keySiteSlug = url.searchParams.get("siteSlug");

        const match = keySiteSlug === siteSlug;

        if (match) {
          console.log("♻️ Revalidating key:", key);
        }

        return match;
      } catch (err) {
        console.warn("⚠️ Failed to parse SWR key:", key);
        return false;
      }
    });
  };

  return {
    /* -------------------------------------------
       CREATE
    ------------------------------------------- */
    create: {
      mutate: async ({ title }: { title: string }) => {
        if (!title?.trim()) {
          console.warn("🟨 CREATE blocked — empty title");
          throw new Error("Title is required");
        }

        console.log("🟩 CREATE PAGE MUTATION →", {
          title,
          siteSlug,
        });

        await call("/api/pages", {
          title,
          siteSlug,
        });

        console.log("🟩 CREATE SUCCESS — refreshing pages");
        await refreshPages();
      },
    },

    /* -------------------------------------------
       PUBLISH
    ------------------------------------------- */
    publish: {
      mutate: async ({ pageId }: { pageId: string }) => {
        console.log("🟦 PUBLISH PAGE MUTATION →", {
          pageId,
          siteSlug,
        });

        await call(`/api/pages/${pageId}/publish`);
        await refreshPages();
      },
    },

    /* -------------------------------------------
       UNPUBLISH
    ------------------------------------------- */
    unpublish: {
      mutate: async ({ pageId }: { pageId: string }) => {
        console.log("🟨 UNPUBLISH PAGE MUTATION →", {
          pageId,
          siteSlug,
        });

        await call(`/api/pages/${pageId}/unpublish`);
        await refreshPages();
      },
    },

    /* -------------------------------------------
       DELETE
    ------------------------------------------- */
    remove: {
      mutate: async ({ pageId }: { pageId: string }) => {
        console.log("🟥 DELETE PAGE MUTATION →", {
          pageId,
          siteSlug,
        });

        await call(`/api/pages/${pageId}`, undefined, "DELETE");
        await refreshPages();
      },
    },
  };
}
