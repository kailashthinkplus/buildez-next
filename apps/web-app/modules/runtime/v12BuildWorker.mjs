import process from "node:process";
import { fileURLToPath } from "node:url";
import { build } from "vite";
import react from "@vitejs/plugin-react";
import autoprefixer from "autoprefixer";

const SAFARI_TARGETS = ["last 3 iOS versions", "last 3 Safari versions", "last 2 Chrome versions", "last 2 Firefox versions", "last 2 Edge versions"];

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
  // An inline `css.postcss` object (rather than a path) makes Vite use it
  // directly, which prevents postcss-load-config from searching the tenant
  // project tree for a postcss.config.*/.postcssrc.* and require()-ing it —
  // still true here since we supply the one plugin we need (autoprefixer)
  // inline instead of leaving this empty. Explicit targets guarantee Safari/
  // iOS Safari get vendor-prefixed properties (backdrop-filter, mask,
  // background-clip, etc.) regardless of ambient browserslist config, since
  // this monorepo has none.
  css: { postcss: { plugins: [autoprefixer({ overrideBrowserslist: SAFARI_TARGETS })] } },
});
