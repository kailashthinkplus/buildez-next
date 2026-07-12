import { request } from "@playwright/test";
import path from "node:path";

import { DISPOSABLE_PAGE_PREFIX } from "../helpers/builderFixture";

type PageRecord = {
  id: string;
  title: string;
  slug: string;
  status: string;
  site?: { slug?: string };
};

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";
const siteSlug = process.env.E2E_SITE_SLUG ?? "home";
const authFile = path.resolve(process.cwd(), "playwright/.auth/builder-user.json");

function pagesFrom(payload: any): PageRecord[] {
  return payload?.data?.data?.pages ?? payload?.data?.pages ?? payload?.pages ?? [];
}

function isDisposable(page: PageRecord) {
  return page.title.startsWith(DISPOSABLE_PAGE_PREFIX) &&
    page.slug.startsWith("rc-t3b-disposable-") &&
    page.slug !== "home" &&
    page.status === "DRAFT" &&
    (!page.site?.slug || page.site.slug === siteSlug);
}

async function listDisposable(api: Awaited<ReturnType<typeof request.newContext>>) {
  const response = await api.get(`/api/pages?take=200&siteSlug=${encodeURIComponent(siteSlug)}`);
  if (!response.ok()) throw new Error(`Disposable-page listing failed with HTTP ${response.status()}`);
  return pagesFrom(await response.json()).filter(isDisposable);
}

async function main() {
  const api = await request.newContext({ baseURL, storageState: authFile });
  try {
    const matches = await listDisposable(api);
    console.log(`Disposable pages found: ${matches.length}`);
    for (const page of matches) {
      const response = await api.delete(`/api/pages/${page.id}`);
      if (!response.ok()) throw new Error(`Cleanup failed for ${page.id} with HTTP ${response.status()}`);
      console.log(`Cleaned disposable page: ${page.id}`);
    }
    const remaining = await listDisposable(api);
    console.log(`Disposable pages cleaned: ${matches.length}`);
    console.log(`Disposable pages remaining: ${remaining.length}`);
    if (remaining.length) process.exitCode = 1;
  } finally {
    await api.dispose();
  }
}

void main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
