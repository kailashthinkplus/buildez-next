import { headers } from "next/headers";

interface GetPreviewBlueprintArgs {
  siteSlug: string;
  pageSlugWithId: string;
  host: string;
}

export async function getPreviewBlueprint({
  pageSlugWithId,
  host,
}: GetPreviewBlueprintArgs) {
  // Extract pageId from slug-id
  const pageId = pageSlugWithId.split("-").pop();
  if (!pageId) return null;

  const protocol =
    process.env.NODE_ENV === "development" ? "http" : "https";

  const baseUrl = `${protocol}://${host}`;

  const res = await fetch(`${baseUrl}/api/preview/${pageId}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    console.error("[Preview] API failed", res.status);
    return null;
  }

  const data = await res.json();

  /**
   * API RETURNS:
   * {
   *   blueprint: BlueprintNode (page),
   *   css: string
   * }
   */
  return {
    page: data.blueprint,
    css: data.css,
  };
}
