export type PageCanvasState = "page" | "blank" | "generating";

export function projectManifestHasPageRoute(
  manifest: unknown,
  slug?: string,
) {
  if (!slug) return true;

  const pages =
    Array.isArray(manifest)
      ? manifest
      : manifest &&
          typeof manifest === "object" &&
          "pages" in manifest &&
          Array.isArray((manifest as { pages?: unknown }).pages)
        ? (manifest as { pages: unknown[] }).pages
        : [];

  const expectedRoute =
    slug === "home"
      ? "/"
      : `/${slug.replace(/^\/+|\/+$/g, "")}`;

  return pages.some(
    (entry) =>
      entry &&
      typeof entry === "object" &&
      "route" in entry &&
      (entry as { route?: unknown }).route === expectedRoute,
  );
}

export function resolvePageCanvasState(input: {
  workspaceLoaded: boolean;
  workspaceError?: string;
  pageId?: string;
  hasProjectRoute: boolean;
  agentRunning: boolean;
}): PageCanvasState {
  const missingSelectedPageRoute =
    input.workspaceLoaded &&
    !input.workspaceError &&
    Boolean(input.pageId) &&
    !input.hasProjectRoute;

  if (!missingSelectedPageRoute) return "page";
  return input.agentRunning ? "generating" : "blank";
}
