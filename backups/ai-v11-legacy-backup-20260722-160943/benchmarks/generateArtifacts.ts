import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { parseTsx } from "../ast/parser";
import { normalizeTsx } from "../ast/normalize";
import { buildDesignGraph } from "../design-graph/builder";
import { compileDesignGraphToBlueprint } from "../compiler/blueprintCompiler";
import { createBenchmarkReport } from "./reports/benchmarkReport";

const root = dirname(fileURLToPath(import.meta.url));
const fixtures = ["luxury-real-estate", "modern-saas"] as const;

for (const fixture of fixtures) {
  const sourceFile = resolve(root, "../fixtures", `${fixture}.tsx`);
  const parsed = parseTsx(readFileSync(sourceFile, "utf8"), sourceFile);
  const graph = buildDesignGraph(normalizeTsx(parsed));
  const compilation = compileDesignGraphToBlueprint(graph);
  const report = createBenchmarkReport(parsed, graph, compilation);
  writeJson(resolve(root, "expected-graphs", `${fixture}.json`), graph);
  writeJson(resolve(root, "expected-blueprints", `${fixture}.json`), compilation.blueprint);
  writeJson(resolve(root, "reports", `${fixture}.compilation.json`), { diagnostics: compilation.diagnostics, provenance: compilation.provenance });
  writeJson(resolve(root, "reports", `${fixture}.fidelity.json`), report.fidelity);
  for (const capture of report.captures) writeJson(resolve(root, "captures", fixture, `${capture.viewport}.json`), capture);
}

function writeJson(file: string, value: unknown) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}
