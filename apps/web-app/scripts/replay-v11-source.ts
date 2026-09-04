import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  compileGeneratedSource,
  sanitizeGeneratedTsx,
} from "../modules/builder-v2/ai-v11/production/generateV11Website";
import { structuredDiagnostics } from "../modules/builder-v2/ai-v11/production/sourceArtifact";

const target = process.argv[2];
if (!target) throw new Error("Usage: node --import tsx scripts/replay-v11-source.ts <artifact-directory-or-tsx>");
const absolute = resolve(target);
const normalizedPath = absolute.endsWith(".tsx") ? absolute : resolve(absolute, "normalized.tsx");
const rawPath = absolute.endsWith(".tsx") ? absolute : resolve(absolute, "raw.tsx");
const inputPath = existsSync(normalizedPath) ? normalizedPath : rawPath;
const source = inputPath === normalizedPath
  ? readFileSync(inputPath, "utf8")
  : sanitizeGeneratedTsx(readFileSync(inputPath, "utf8"));

let report: Record<string, unknown>;
try {
  const result = compileGeneratedSource(source);
  report = {
    status: "compiled",
    inputPath,
    nodeCount: Object.keys(result.blueprint.nodes).length,
    diagnostics: result.metadata.diagnostics ?? [],
  };
} catch (error) {
  report = {
    status: "failed",
    inputPath,
    diagnostics: structuredDiagnostics(error),
    error: error instanceof Error ? error.message : String(error),
  };
}
const outputPath = absolute.endsWith(".tsx")
  ? `${absolute}.replay.json`
  : resolve(absolute, "replay.json");
writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
process.stdout.write(`${JSON.stringify({ ...report, outputPath }, null, 2)}\n`);
if (report.status !== "compiled") process.exitCode = 1;
