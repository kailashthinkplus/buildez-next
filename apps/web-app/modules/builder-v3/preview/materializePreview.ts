import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import { readProjectFile, listProjectFiles, normalizeGeneratedProjectFile } from "../project-workspace";
import { validatePreviewProjectPaths } from "./previewContract";
import { createBuilderRuntimeScript, instrumentTsxSource } from "../visual-editor";

const BLANK_PROJECT_FILES = {
  "package.json": JSON.stringify({ private: true, type: "module", dependencies: { "@vitejs/plugin-react": "latest", vite: "latest", react: "latest", "react-dom": "latest" } }, null, 2),
  "index.html": '<!doctype html><html><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>BuildEZ Page</title></head><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>',
  "src/main.tsx": `import React from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

function App() {
  return <main className="blank-page"><section><span>NEW PAGE</span><h1>Start building something remarkable.</h1><p>Use AI or open Blocks to add your first section.</p></section></main>;
}

createRoot(document.getElementById("root")!).render(<App />);`,
  "src/styles.css": `*{box-sizing:border-box}body{margin:0;font-family:Inter,ui-sans-serif,system-ui;color:#172033;background:#fff}.blank-page{min-height:100vh;display:grid;place-items:center;padding:48px}.blank-page section{max-width:680px;text-align:center}.blank-page span{font-size:12px;letter-spacing:.2em;color:#2563eb}.blank-page h1{margin:18px 0 12px;font-size:clamp(40px,7vw,76px);line-height:.98;letter-spacing:-.055em}.blank-page p{font-size:18px;color:#64748b}`,
} as const;

/*
 * The live preview sandbox is a persistent directory reused in place
 * across regenerations (see PreviewSessionManager.ts) — this function
 * only ever writes/overwrites the current canonical file set into it, it
 * never removed anything. A generation that renames or drops a file
 * (e.g. src/lib/shopez.ts becoming src/lib/shopez.tsx) left the old file
 * sitting on disk alongside the new one, where Node/Vite's module
 * resolution could still pick it up ahead of the new file and silently
 * serve stale, mismatched code — no thrown error, just a broken/blank
 * render. Delete anything on disk that is not part of the new file set
 * before writing it, mirroring the cleanup checkpoint-restore already
 * does in syncActivePreviewProjectSnapshot(). node_modules (never
 * managed by this writer) and the injected editor runtime are preserved.
 */
async function removeStaleSandboxFiles(projectRoot: string, keepPaths: ReadonlySet<string>) {
  let entries;
  try {
    entries = await readdir(projectRoot, { recursive: true, withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const entryDir = "parentPath" in entry && typeof entry.parentPath === "string" ? entry.parentPath : entry.path;
    const relativePath = path.relative(projectRoot, path.join(entryDir, entry.name)).split(path.sep).join("/");
    if (relativePath.startsWith("node_modules/") || relativePath === "__buildez_editor.js") continue;
    if (keepPaths.has(relativePath)) continue;
    await rm(path.join(projectRoot, relativePath), { force: true });
  }
}

export async function materializePreviewProject(input: {
  siteId: string;
  tenantId: string;
  sandboxRoot: string;
  sessionId: string;
}) {
  const files = await listProjectFiles(input.siteId, input.tenantId);
  const isBlankProject = files.length === 0;
  const paths = validatePreviewProjectPaths(isBlankProject ? Object.keys(BLANK_PROJECT_FILES) : files.map((file) => file.path));
  const projectRoot = path.resolve(input.sandboxRoot, input.siteId);
  const sandboxRoot = path.resolve(input.sandboxRoot);
  if (!projectRoot.startsWith(`${sandboxRoot}${path.sep}`)) throw new Error("Preview sandbox escape rejected");

  const projectRevision = files.reduce((maximum, file) => Math.max(maximum, file.revision), 0);
  await removeStaleSandboxFiles(projectRoot, new Set(paths));
  for (const projectPath of paths) {
    const target = path.resolve(projectRoot, projectPath);
    if (!target.startsWith(`${projectRoot}${path.sep}`)) throw new Error("Preview file escaped project sandbox");
    await mkdir(path.dirname(target), { recursive: true });
    let content = isBlankProject
      ? BLANK_PROJECT_FILES[projectPath as keyof typeof BLANK_PROJECT_FILES]
      : (await readProjectFile(input.siteId, input.tenantId, projectPath)).content;
    content = normalizeGeneratedProjectFile(content, projectPath);
    if (/\.[jt]sx$/.test(projectPath)) {
      content = instrumentTsxSource(content, projectPath, projectRevision);
    }
    if (projectPath === "index.html") content = content.replace("</body>", '<script src="/__buildez_editor.js"></script></body>');
    await writeFile(target, content, { encoding: "utf8", flag: "w" });
  }
  await writeFile(path.join(projectRoot, "__buildez_editor.js"), createBuilderRuntimeScript(input.sessionId), "utf8");
  return { projectRoot, fileCount: paths.length };
}
