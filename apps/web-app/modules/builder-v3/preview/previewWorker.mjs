import process from "node:process";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";
import react from "@vitejs/plugin-react";

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
