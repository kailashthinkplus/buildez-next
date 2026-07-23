import process from "node:process";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";
import react from "@vitejs/plugin-react";

const [root, portValue] = process.argv.slice(2);
const port = Number(portValue);

if (!root || !Number.isInteger(port)) throw new Error("Invalid preview worker arguments");

const runtimeAliases = {
  react: fileURLToPath(import.meta.resolve("react")),
  "react-dom/client": fileURLToPath(import.meta.resolve("react-dom/client")),
  "react/jsx-runtime": fileURLToPath(import.meta.resolve("react/jsx-runtime")),
  "react/jsx-dev-runtime": fileURLToPath(import.meta.resolve("react/jsx-dev-runtime")),
};

const server = await createServer({
  root,
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
    fs: { strict: true, allow: [root, process.cwd()] },
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
