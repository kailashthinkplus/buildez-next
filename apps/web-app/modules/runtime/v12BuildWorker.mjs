import process from "node:process";
import { fileURLToPath } from "node:url";
import { build } from "vite";
import react from "@vitejs/plugin-react";

const [root, outDir, base] = process.argv.slice(2);
if (!root || !outDir || !base) throw new Error("Invalid V12 publish build arguments");

const aliases = {
  react: fileURLToPath(import.meta.resolve("react")),
  "react-dom/client": fileURLToPath(import.meta.resolve("react-dom/client")),
  "react-router-dom": fileURLToPath(import.meta.resolve("react-router-dom")),
  "react/jsx-runtime": fileURLToPath(import.meta.resolve("react/jsx-runtime")),
  "react/jsx-dev-runtime": fileURLToPath(import.meta.resolve("react/jsx-dev-runtime")),
};

await build({
  root,
  base,
  configFile: false,
  plugins: [react()],
  resolve: {
    alias: Object.entries(aliases).map(([find, replacement]) => ({
      find: new RegExp(`^${find.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`),
      replacement,
    })),
    dedupe: ["react", "react-dom"],
  },
  build: { outDir, emptyOutDir: true, sourcemap: false },
  // Prevent postcss-load-config (invoked internally by Vite's CSS plugin even
  // with configFile:false) from searching the tenant project tree for a
  // postcss.config.*/.postcssrc.* and require()-ing/executing it. An empty
  // inline object short-circuits that filesystem search entirely.
  css: { postcss: {} },
});
