import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { relative, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const evidence = resolve(root, "docs/v12/evidence");
mkdirSync(evidence, { recursive: true });

function rg(args) {
  try {
    return execFileSync("rg", args, { cwd: root, encoding: "utf8" }).trim();
  } catch (error) {
    if (error.status === 1) return "";
    throw error;
  }
}

function files(paths) {
  const output = rg(["--files", ...paths]);
  return output ? output.split("\n").sort() : [];
}

function appPath(file, leaf) {
  return "/" + relative("apps/web-app/app", file)
    .replace(/\\/g, "/")
    .replace(/\([^/]+\)\//g, "")
    .replace(new RegExp(`/${leaf.replace(".", "\\.")}$`), "")
    .replace(/\[\.\.\.([^\]]+)\]/g, ":$1*")
    .replace(/\[([^\]]+)\]/g, ":$1");
}

const appFiles = files(["apps/web-app/app"]);
const webFiles = files(["apps/web-app"]);
const routes = appFiles
  .filter((file) => file.endsWith("/page.tsx"))
  .map((file) => ({ route: appPath(file, "page.tsx"), source: file }));
const apis = appFiles
  .filter((file) => file.endsWith("/route.ts"))
  .map((file) => ({ route: appPath(file, "route.ts"), source: file }));

writeFileSync(resolve(evidence, "current-route-map.json"), JSON.stringify({ generatedAt: new Date().toISOString(), count: routes.length, routes }, null, 2) + "\n");
writeFileSync(resolve(evidence, "current-api-map.json"), JSON.stringify({ generatedAt: new Date().toISOString(), count: apis.length, routes: apis }, null, 2) + "\n");

const importArgs = ["-n", "--no-heading", "--color", "never"];
const builderImports = rg([...importArgs, "@/modules/builder-v2|modules/builder-v2|/api/builder-v2", "apps/web-app/app", "apps/web-app/modules", "-g", "!modules/_legacy/**"]);
const v11Imports = rg([...importArgs, "ai-v11|generate-v11|preflight-v11", "apps/web-app/app", "apps/web-app/modules", "-g", "!modules/_legacy/**"]);
writeFileSync(resolve(evidence, "builder-v2-imports.txt"), builderImports + "\n");
writeFileSync(resolve(evidence, "ai-v11-imports.txt"), v11Imports + "\n");

const tests = webFiles.filter((file) => /\.(test|spec)\.tsx?$/.test(file));
writeFileSync(resolve(evidence, "current-tests.txt"), tests.join("\n") + "\n");

const envMatches = rg(["-o", "--no-filename", "process\\.env\\.[A-Z0-9_]+", "apps/web-app", "-g", "!node_modules/**", "-g", "!.next/**"]);
const envNames = [...new Set(envMatches.split("\n").filter(Boolean).map((value) => value.slice("process.env.".length)))].sort();
writeFileSync(resolve(evidence, "current-env-names.txt"), envNames.join("\n") + "\n");

console.log(JSON.stringify({ routeCount: routes.length, apiCount: apis.length, testCount: tests.length, envCount: envNames.length }));
