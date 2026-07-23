import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { readProjectFile, listProjectFiles } from "../project-workspace";
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
  for (const projectPath of paths) {
    const target = path.resolve(projectRoot, projectPath);
    if (!target.startsWith(`${projectRoot}${path.sep}`)) throw new Error("Preview file escaped project sandbox");
    await mkdir(path.dirname(target), { recursive: true });
    let content = isBlankProject
      ? BLANK_PROJECT_FILES[projectPath as keyof typeof BLANK_PROJECT_FILES]
      : (await readProjectFile(input.siteId, input.tenantId, projectPath)).content;
    if (/\.[jt]sx$/.test(projectPath)) content = instrumentTsxSource(content, projectPath, projectRevision);
    if (projectPath === "index.html") content = content.replace("</body>", '<script src="/__buildez_editor.js"></script></body>');
    await writeFile(target, content, { encoding: "utf8", flag: "w" });
  }
  await writeFile(path.join(projectRoot, "__buildez_editor.js"), createBuilderRuntimeScript(input.sessionId), "utf8");
  return { projectRoot, fileCount: paths.length };
}
