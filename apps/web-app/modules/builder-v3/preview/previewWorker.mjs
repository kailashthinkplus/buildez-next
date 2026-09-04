import process from "node:process";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";
import react from "@vitejs/plugin-react";
import autoprefixer from "autoprefixer";

const SAFARI_TARGETS = ["last 3 iOS versions", "last 3 Safari versions", "last 2 Chrome versions", "last 2 Firefox versions", "last 2 Edge versions"];

const [root, portValue, sessionId, siteId] = process.argv.slice(2);
const port = Number(portValue);

if (!root || !Number.isInteger(port) || !sessionId || !siteId) throw new Error("Invalid preview worker arguments");

const projectRoot = path.resolve(root);
const projectRequire = createRequire(path.join(projectRoot, "package.json"));
const resolveProjectRuntime = (specifier) => {
  try {
    return projectRequire.resolve(specifier);
  } catch {
    return fileURLToPath(import.meta.resolve(specifier));
  }
};

const runtimeAliases = {
  react: resolveProjectRuntime("react"),
  "react-dom": resolveProjectRuntime("react-dom"),
  "react-dom/client": resolveProjectRuntime("react-dom/client"),
  "react-router-dom": resolveProjectRuntime("react-router-dom"),
  "react/jsx-runtime": resolveProjectRuntime("react/jsx-runtime"),
  "react/jsx-dev-runtime": resolveProjectRuntime("react/jsx-dev-runtime"),
};

const server = await createServer({
  root: projectRoot,
  configFile: false,
  // The session URL this worker is reached at always carries the
  // /_v3preview/<port> prefix (see PreviewSessionManager.ts), and the
  // nginx rule that proxies it forwards the request's full original path
  // unchanged rather than stripping the prefix — so Vite must know about
  // it too. Without this, Vite serves index.html fine (the prefixed
  // request still resolves to this server), but every absolute URL it
  // emits for itself — /@vite/client, /@react-refresh, and its rewritten
  // module imports — comes back rooted at "/" instead of the prefix. The
  // browser then resolves those against the real page origin and gets a
  // 404 from the main app instead of this Vite server: the exact
  // "blank canvas, console 404s on @react-refresh/main.tsx/client" failure.
  base: `/_v3preview/${port}/`,
  // See v12BuildWorker.mjs: an inline object still blocks postcss-load-config's
  // filesystem search for a tenant-writable postcss.config.* that Vite would
  // otherwise require()/execute inside this server-side process, while
  // giving us Safari/iOS Safari vendor prefixing via autoprefixer.
  css: { postcss: { plugins: [autoprefixer({ overrideBrowserslist: SAFARI_TARGETS })] } },
  plugins: [react()],
  resolve: {
    alias: Object.entries(runtimeAliases).map(([find, replacement]) => ({ find: new RegExp(`^${find.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`), replacement })),
    dedupe: ["react", "react-dom"],
  },
  server: {
    host: "127.0.0.1",
    port,
    strictPort: true,
    fs: { strict: true, allow: [projectRoot, process.cwd()] },
    // Reached only via the app's own nginx proxy at /_v3preview/<port>/*
    // (see PreviewSessionManager.ts), which forwards the public Host
    // header through — Vite's dev-server Host check otherwise rejects
    // anything but localhost as a DNS-rebinding guard.
    allowedHosts: true,
    proxy: {
      "/api/public/shopez": {
        target: process.env.BUILDEZ_PREVIEW_API_ORIGIN || "http://127.0.0.1:3000",
        changeOrigin: true,
        headers: {
          "x-buildez-preview-session": sessionId,
          "x-buildez-preview-site": siteId,
        },
      },
    },
  },
});

await server.listen();
process.stdout.write(`${JSON.stringify({ type: "ready", port })}\n`);

async function shutdown() {
  await server.close();
  process.exit(0);
}

process.once("SIGTERM", shutdown);
process.once("SIGINT", shutdown);
