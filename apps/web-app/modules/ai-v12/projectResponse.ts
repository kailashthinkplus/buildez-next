import { validatePreviewFilePaths, validatePreviewProjectPaths } from "../builder-v3/preview/previewContract";

type ProjectFile = { path: string; content: string };
export class TruncatedResponseError extends Error {}

/** Validate patches before merging, and validate completeness only after merging. */
export function parseProjectResponse(text: string, requireFiles: boolean, baseFiles?: readonly ProjectFile[]) {
  let value: { message?: unknown; files?: unknown };
  try {
    value = JSON.parse(text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim());
  } catch {
    throw new TruncatedResponseError("The generated project response was cut off before it finished.");
  }
  if (!value || typeof value !== "object") throw new Error("The agent returned an invalid project file set.");
  const rawFiles = Array.isArray(value.files) ? value.files : [];
  if ((requireFiles && !rawFiles.length) || rawFiles.some(file =>
    !file || typeof file.path !== "string" || !file.path.trim() ||
    typeof file.content !== "string" || !file.content.trim()
  )) throw new Error("The agent returned an invalid project file set.");
  const paths = validatePreviewFilePaths(rawFiles.map(file => file.path));
  if (new Set(paths).size !== paths.length) throw new Error("The agent returned duplicate project paths.");
  let files: ProjectFile[] = rawFiles.map((file, index) => ({ path: paths[index], content: file.content }));
  if (files.length) {
    if (baseFiles) {
      const basePaths = validatePreviewFilePaths(baseFiles.map(file => file.path));
      const merged = new Map(baseFiles.map((file, index) => [basePaths[index], { ...file, path: basePaths[index] }]));
      for (const file of files) merged.set(file.path, file);
      files = [...merged.values()];
    }
    // index.html is Vite's small, deterministic boot document. Restore it
    // only when a real entry module exists; never mask missing application code.
    if (!files.some(file => file.path === "index.html")) {
      const entry = files.find(file => file.path === "src/main.tsx");
      if (entry) {
        const rootId = entry.content.match(/getElementById\(\s*["']([\w-]+)["']\s*\)/)?.[1] || "root";
        files.push({ path: "index.html", content: `<!doctype html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><title>BuildEZ</title></head><body><div id="${rootId}"></div><script type="module" src="/src/main.tsx"></script></body></html>` });
      }
    }
    validatePreviewProjectPaths(files.map(file => file.path));
  }
  return { message: typeof value.message === "string" ? value.message : "Your page is ready to review.", files };
}
