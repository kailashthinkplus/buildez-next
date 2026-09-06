import { spawn } from "node:child_process";
import { mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";

import { prisma } from "@buildez/db";

import { listProjectFiles, normalizeGeneratedProjectFile, readProjectFile } from "../builder-v3/project-workspace";

const globalBuilds = globalThis as typeof globalThis & { __buildezV12PublishedBuilds?: Map<string, Promise<string>> };
const activeBuilds = globalBuilds.__buildezV12PublishedBuilds ?? new Map<string, Promise<string>>();
globalBuilds.__buildezV12PublishedBuilds = activeBuilds;
const PUBLISHED_BOOTSTRAP_VERSION = "3";

function publishedBase(siteId: string) {
  return `/api/runtime/v12/${encodeURIComponent(siteId)}/`;
}

function addRouterBasename(content: string, siteId: string) {
  if (!content.includes("<BrowserRouter") || /<BrowserRouter\s+[^>]*\bbasename=/.test(content)) return content;
  return content.replace(/<BrowserRouter(?=\s|>)/g, `<BrowserRouter basename=${JSON.stringify(publishedBase(siteId).replace(/\/$/, ""))}`);
}

/*
 * Sites built with react-router's <BrowserRouter> get a working basename
 * baked into their bundle by addRouterBasename above, so react-router itself
 * already strips the "/api/runtime/v12/<id>" prefix before matching routes.
 * Sites that hand-roll their own routing (reading location.pathname and
 * comparing it against literal route strings like "/" or "/about", which is
 * common in AI-generated projects) have no such awareness — served from that
 * subpath, pathname never equals "/", every route compare fails, and the
 * app falls through to its own not-found view on first load. Internal
 * navigation still "works" afterward only because it sets state directly
 * rather than re-deriving it from the URL.
 *
 * A basename prop can't be retrofitted onto code we didn't write, so instead
 * this checks whether react-router's basename actually made it into the
 * built bundle (the literal basename string is expected to survive
 * minification as-is, since it's just a string literal), and if not, the
 * injected bootstrap below strips the subpath from location.pathname itself
 * via history.replaceState before the app's own module script runs — same
 * effect, applied at the browser rather than the router.
 */
async function hasWorkingRouterBasename(outputRoot: string, siteId: string): Promise<boolean> {
  const needle = publishedBase(siteId).replace(/\/$/, "");
  try {
    const assetsDir = path.join(outputRoot, "assets");
    const entries = await readdir(assetsDir);
    for (const name of entries) {
      if (!name.endsWith(".js")) continue;
      const content = await readFile(path.join(assetsDir, name), "utf8");
      if (content.includes(needle)) return true;
    }
  } catch {
    // No assets directory or unreadable — treat as no basename present.
  }
  return false;
}

/*
 * The published V12 output is a single client-routed SPA shell — there is no
 * per-request server render to inject page-specific <head> tags into. Instead
 * this bootstraps a tiny client script that, on every route change, fetches
 * that page's saved custom CSS/JS (kept live via /api/runtime/v12-custom-code,
 * decoupled from this build's own revision cache) and applies it. Best-effort
 * and defensive throughout — it must never be able to break a live site.
 */
async function injectCustomCodeBootstrap(outputRoot: string, siteId: string) {
  const indexPath = path.join(outputRoot, "index.html");
  let html: string;
  try {
    html = await readFile(indexPath, "utf8");
  } catch {
    return;
  }
  const bootstrapMarker = `data-buildez-custom-code="${PUBLISHED_BOOTSTRAP_VERSION}"`;
  if (html.includes(bootstrapMarker)) return;

  // Upgrade the runtime bootstrap for already-published bundles when the
  // platform ships a routing fix; customers should not need to republish.
  html = html.replace(/<script\s+data-buildez-custom-code(?:=(?:"[^"]*"|'[^']*'|[^\s>]+))?[^>]*>[\s\S]*?<\/script>/i, "");

  const basename = publishedBase(siteId).replace(/\/$/, "");
  const api = `/api/runtime/v12-custom-code/${encodeURIComponent(siteId)}`;
  const hasBasename = await hasWorkingRouterBasename(outputRoot, siteId);
  const normalizeEntryPathSnippet = hasBasename ? "" : `(function normalizeEntryPath(){
try{
var p=location.pathname,stripped=null;
if(p===base)stripped="/";
else if(p.indexOf(base+"/")===0)stripped=p.slice(base.length)||"/";
if(stripped&&stripped!==p)history.replaceState(history.state,"",stripped+location.search+location.hash);
}catch(e){}
})();
`;
  const script = `<script ${bootstrapMarker}>(function(){
try{
var base=${JSON.stringify(basename)};
var api=${JSON.stringify(api)};
${normalizeEntryPathSnippet}function normalizeInternalLinks(root){
try{
var links=[];
if(root&&root.matches&&root.matches("a[href]"))links.push(root);
if(root&&root.querySelectorAll)links=links.concat(Array.prototype.slice.call(root.querySelectorAll("a[href]")));
links.forEach(function(link){
var href=link.getAttribute("href");
if(!href||href.charAt(0)!=="/"||href.indexOf("//")===0||href.indexOf(base)===0)return;
if(/^\\/(?:api|_next|app)(?:\\/|$)/.test(href))return;
link.setAttribute("href",base+(href==="/"?"":href));
});
}catch(e){}
}
function slugFor(pathname){
var trimmed=pathname.indexOf(base)===0?pathname.slice(base.length):pathname;
trimmed=trimmed.replace(/^\\/+|\\/+$/g,"");
return trimmed||"home";
}
var lastSlug=null;
function apply(){
try{
var slug=slugFor(location.pathname);
if(slug===lastSlug)return;
lastSlug=slug;
try{if(window.parent&&window.parent!==window)window.parent.postMessage({type:"BUILDEZ_PUBLISHED_NAV",slug:slug},"*");}catch(e){}
fetch(api+"?slug="+encodeURIComponent(slug),{cache:"no-store"}).then(function(r){return r.ok?r.json():null;}).then(function(data){
if(!data)return;
var existingStyle=document.getElementById("buildez-custom-css");
if(existingStyle)existingStyle.remove();
if(data.customCss){
var style=document.createElement("style");
style.id="buildez-custom-css";
style.textContent=data.customCss;
document.head.appendChild(style);
}
var existingScript=document.getElementById("buildez-custom-js");
if(existingScript)existingScript.remove();
if(data.customJs){
var custom=document.createElement("script");
custom.id="buildez-custom-js";
custom.textContent=data.customJs;
document.body.appendChild(custom);
}
}).catch(function(){});
}catch(e){}
}
var pushState=history.pushState;
history.pushState=function(){pushState.apply(this,arguments);setTimeout(apply,0);};
var replaceState=history.replaceState;
history.replaceState=function(){replaceState.apply(this,arguments);setTimeout(apply,0);};
window.addEventListener("popstate",apply);
window.addEventListener("load",apply);
normalizeInternalLinks(document);
if(typeof MutationObserver!=="undefined")new MutationObserver(function(records){records.forEach(function(record){Array.prototype.forEach.call(record.addedNodes,function(node){if(node&&node.nodeType===1)normalizeInternalLinks(node);});});}).observe(document.documentElement,{childList:true,subtree:true});
if(document.readyState==="complete")apply();
}catch(e){}
})();</script>`;

  const injected = html.includes("</body>") ? html.replace("</body>", `${script}</body>`) : `${html}${script}`;
  await writeFile(indexPath, injected, "utf8");
}

async function buildPublishedProject(siteId: string, tenantId: string) {
  const project = await prisma.v12Project.findFirst({ where: { siteId, tenantId }, select: { publishedRevision: true } });
  if (!project) throw new Error("Published project not found");
  if (project.publishedRevision == null) throw new Error("Project has not been published yet");
  const root = path.join(process.cwd(), "tmp", "v12-published", siteId);
  const sourceRoot = path.join(root, "source");
  const outputRoot = path.join(root, "dist");
  const markerPath = path.join(root, "revision.txt");
  try {
    const [marker] = await Promise.all([readFile(markerPath, "utf8"), stat(path.join(outputRoot, "index.html"))]);
    if (marker.trim() === String(project.publishedRevision)) {
      await injectCustomCodeBootstrap(outputRoot, siteId);
      return outputRoot;
    }
  } catch {
    // Missing or stale output is rebuilt below.
  }

  // Reads live file content — safe here because this only rebuilds when the
  // marker doesn't yet match publishedRevision, which is true only right
  // after a fresh publish (called eagerly from publishPageNow, before any
  // further edit could land) or on first-ever request for a given revision.
  const files = await listProjectFiles(siteId, tenantId);
  if (!files.length) throw new Error("Published project has no files");
  await rm(sourceRoot, { recursive: true, force: true });
  await rm(outputRoot, { recursive: true, force: true });
  await mkdir(sourceRoot, { recursive: true });
  for (const file of files) {
    const target = path.resolve(sourceRoot, file.path);
    if (!target.startsWith(`${sourceRoot}${path.sep}`)) throw new Error("Published project path escaped its workspace");
    await mkdir(path.dirname(target), { recursive: true });
    let content = (await readProjectFile(siteId, tenantId, file.path)).content;
    content = normalizeGeneratedProjectFile(content, file.path);
    if (/\.[jt]sx$/i.test(file.path)) {
      content = addRouterBasename(content, siteId);
    }
    await writeFile(target, content, "utf8");
  }

  const worker = path.join(process.cwd(), "modules", "runtime", "v12BuildWorker.mjs");
  await new Promise<void>((resolve, reject) => {
    const child = spawn(process.execPath, [worker, sourceRoot, outputRoot, publishedBase(siteId)], {
      cwd: process.cwd(), env: process.env, stdio: ["ignore", "pipe", "pipe"],
    });
    let output = "";
    child.stdout?.on("data", data => { output = `${output}${String(data)}`.slice(-12_000); });
    child.stderr?.on("data", data => { output = `${output}${String(data)}`.slice(-12_000); });
    child.once("error", reject);
    child.once("exit", code => code === 0 ? resolve() : reject(new Error(`Published website build failed (${code ?? "signal"}): ${output.trim()}`)));
  });
  await injectCustomCodeBootstrap(outputRoot, siteId);
  await mkdir(root, { recursive: true });
  await writeFile(markerPath, String(project.publishedRevision), "utf8");
  return outputRoot;
}

export async function ensureV12PublishedBundle(siteId: string, tenantId: string) {
  const key = `${tenantId}:${siteId}`;
  const existing = activeBuilds.get(key);
  if (existing) return existing;
  const build = buildPublishedProject(siteId, tenantId).finally(() => activeBuilds.delete(key));
  activeBuilds.set(key, build);
  return build;
}

export function publishedAssetPath(outputRoot: string, parts: readonly string[]) {
  const requested = parts.length ? parts.join("/") : "index.html";
  const candidate = path.resolve(outputRoot, requested);
  if (!candidate.startsWith(`${outputRoot}${path.sep}`)) throw new Error("Invalid published asset path");
  return candidate;
}
