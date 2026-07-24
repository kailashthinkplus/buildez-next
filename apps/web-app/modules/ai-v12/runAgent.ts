import { getOrCreateProject, importProjectFiles, listProjectFiles, readProjectFile } from "../builder-v3/project-workspace";
import { validatePreviewProjectPaths } from "../builder-v3/preview";
import { IMAGE_CLARIFICATION_MESSAGE, imageRequestNeedsClarification } from "./imageIntent";
import { buildShopezPrompt } from "./shopezPrompt";
import { prisma } from "@buildez/db";

type AgentFile = { path: string; content: string };

function object(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function outputText(payload: unknown) {
  const root = object(payload);
  if (typeof root.output_text === "string") return root.output_text.trim();
  return (Array.isArray(root.output) ? root.output : []).flatMap(item => Array.isArray(object(item).content) ? object(item).content as unknown[] : [])
    .map(item => typeof object(item).text === "string" ? String(object(item).text) : "").filter(Boolean).join("\n").trim();
}

function parseResult(text: string, requireFiles: boolean) {
  const value = object(JSON.parse(text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim()));
  const files: AgentFile[] = Array.isArray(value.files) ? value.files.map(object).map(item => ({ path: String(item.path || ""), content: String(item.content || "") })) : [];
  if ((requireFiles && !files.length) || files.some(file => !file.path || !file.content)) throw new Error("The agent returned an invalid project file set.");
  if (files.length) validatePreviewProjectPaths(files.map(file => file.path));
  return { message: typeof value.message === "string" ? value.message : "Your page is ready to review.", files };
}

export async function runV12Agent(input: { siteId: string; tenantId: string; userId: string; prompt: string; mode: "auto" | "discuss"; attachments: File[]; signal: AbortSignal; onProgress?(title: string, detail?: string): void }) {
  if (imageRequestNeedsClarification(input.prompt)) {
    input.onProgress?.("Image details needed", "Waiting for subject and visual direction before generation");
    return { message: IMAGE_CLARIFICATION_MESSAGE, files: [], revision: 0, fileCount: 0, model: "clarification" };
  }
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OpenAI is not configured.");
  const project = await getOrCreateProject(input.siteId, input.tenantId);
  const site = await prisma.site.findFirst({ where: { id: input.siteId, tenantId: input.tenantId }, select: { slug: true, shop: { select: { id: true, isPublished: true } } } });
  const commercePrompt = site?.shop
    ? buildShopezPrompt(site.slug)
    : "";
  const metadata = await listProjectFiles(input.siteId, input.tenantId);
  const currentFiles = await Promise.all(metadata.map(async file => ({ path: file.path, content: (await readProjectFile(input.siteId, input.tenantId, file.path)).content })));
  input.onProgress?.("Workspace loaded", `${currentFiles.length} existing files · revision ${project.currentRevision}`);
  const references = await Promise.all(input.attachments.map(async file => {
    const pdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    const data = Buffer.from(await file.arrayBuffer()).toString("base64");
    return pdf ? { type: "input_file", filename: file.name, file_data: `data:application/pdf;base64,${data}` } : { type: "input_image", image_url: `data:${file.type};base64,${data}`, detail: "high" };
  }));
  if (references.length) input.onProgress?.("References prepared", `${references.length} high-detail design reference${references.length === 1 ? "" : "s"}`);
  const currentProject = currentFiles.length ? currentFiles.map(file => `--- ${file.path}\n${file.content}`).join("\n\n") : "No project files exist yet.";
  const action = input.mode === "discuss" ? "Respond thoughtfully, but if the user requests a change, implement it." : "Build or modify the website now.";
  const requestSignal = AbortSignal.any([input.signal, AbortSignal.timeout(240_000)]);
  input.onProgress?.("Designing and coding", `${process.env.OPENAI_V12_MODEL || "gpt-5.6-sol"} is generating the project`);
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model: process.env.OPENAI_V12_MODEL || "gpt-5.6-sol", reasoning: { effort: "high" }, max_output_tokens: 30000, text: { format: { type: "json_schema", name: "buildez_agent_result", strict: true, schema: { type: "object", additionalProperties: false, properties: { message: { type: "string" }, files: { type: "array", items: { type: "object", additionalProperties: false, properties: { path: { type: "string" }, content: { type: "string" } }, required: ["path", "content"] } } }, required: ["message", "files"] } } }, input: [{ role: "user", content: [
      ...references,
      { type: "input_text", text: `You are BuildEZ, an autonomous senior website designer and frontend engineer. ${action} Reproduce attached designs with high visual fidelity: hierarchy, geometry, typography, color, spacing, imagery placement, interaction and responsive behavior. For complete-site requests, create all materially required pages, shared navigation, real routes, and src/buildez.pages.json as the canonical page registry with stable id, name, slug, route, sourceFile, componentName, title, description, status, order, includeInNavigation, isHomepage, createdAt, and updatedAt for every page. Never return phantom registry entries or dead navigation links. ${commercePrompt}\n\nUSER REQUEST:\n${input.prompt || "Recreate the attached design."}\n\nCURRENT PROJECT:\n${currentProject}\n\nReturn JSON only: {"message":"specific completion summary","files":[{"path":"package.json","content":"..."},{"path":"index.html","content":"..."},{"path":"src/main.tsx","content":"..."}, ...]}. Return a complete runnable Vite React TypeScript project, never patches or markdown. Required: package.json, index.html, src/main.tsx. Keep dependencies minimal and produce polished responsive UI.` },
    ] }] }),
    cache: "no-store",
    signal: requestSignal,
  });
  const raw = await response.text();
  let payload: unknown;
  try { payload = JSON.parse(raw); } catch { throw new Error("OpenAI returned an unreadable response."); }
  if (!response.ok) throw new Error(String(object(object(payload).error).message || `OpenAI request failed (${response.status}).`));
  input.onProgress?.("Model response received", "Validating the generated project before applying it");
  const result = parseResult(outputText(payload), input.mode === "auto");
  const committed = result.files.length
    ? await importProjectFiles({ siteId: input.siteId, tenantId: input.tenantId, userId: input.userId, files: result.files, expectedRevision: project.currentRevision, label: "AI V12 generation" })
    : { revision: project.currentRevision, fileCount: 0 };
  input.onProgress?.(result.files.length ? "Project committed" : "Discussion completed", result.files.length ? `${committed.fileCount} files saved atomically` : "No project files were changed");
  return { ...result, ...committed, model: process.env.OPENAI_V12_MODEL || "gpt-5.6-sol" };
}
