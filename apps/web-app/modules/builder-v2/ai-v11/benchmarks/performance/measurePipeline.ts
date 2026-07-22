import { performance } from "node:perf_hooks";
import { readFileSync } from "node:fs";
import { parseTsx } from "../../ast/parser";
import { normalizeTsx } from "../../ast/normalize";
import { buildDesignGraph } from "../../design-graph/builder";
import { validateDesignGraph } from "../../design-graph/validator";
import { compileDesignGraphToBlueprint } from "../../compiler/blueprintCompiler";
import { validateBlueprint } from "../../../core/validation";
export const OFFLINE_BUDGETS = Object.freeze({
  parseMs: 250,
  interpretMs: 500,
  graphValidationMs: 100,
  compileMs: 250,
  blueprintValidationMs: 100,
  nodeCount: 500,
  cssBytes: 100_000,
  diagnosticCount: 200,
});
export function measureFixturePipeline(file: string) {
  const source = readFileSync(file, "utf8");
  let t = performance.now();
  const parsed = parseTsx(source, file);
  const parseMs = performance.now() - t;
  t = performance.now();
  const graph = buildDesignGraph(normalizeTsx(parsed));
  const interpretMs = performance.now() - t;
  t = performance.now();
  validateDesignGraph(graph);
  const graphValidationMs = performance.now() - t;
  t = performance.now();
  const compilation = compileDesignGraphToBlueprint(graph);
  const compileMs = performance.now() - t;
  t = performance.now();
  validateBlueprint(compilation.blueprint);
  const blueprintValidationMs = performance.now() - t;
  const cssBytes = Object.values(compilation.blueprint.nodes).reduce(
    (sum, node) =>
      sum + String((node.props.advanced as any)?.customCss ?? "").length,
    0,
  );
  return Object.freeze({
    parseMs,
    interpretMs,
    graphValidationMs,
    compileMs,
    blueprintValidationMs,
    nodeCount: Object.keys(compilation.blueprint.nodes).length,
    cssBytes,
    diagnosticCount: compilation.diagnostics.length,
    evaluationOperations: 0,
  });
}
