import type { ParsedTsx } from "../../ast/parser";
import type { BlueprintCompilation } from "../../compiler/blueprintCompiler";
import type { DesignGraph } from "../../design-graph/schema";
import { scoreFidelity, type FidelityReport } from "../scoring/fidelityScorer";
import { captureRenderContracts, type RenderContractCapture } from "../renderHarness";

export type V11BenchmarkReport = Readonly<{
  fixture: string;
  ast: Readonly<{ type: string; statements: number }>;
  designGraph: DesignGraph;
  blueprint: BlueprintCompilation["blueprint"];
  diagnostics: BlueprintCompilation["diagnostics"];
  captures: readonly RenderContractCapture[];
  fidelity: FidelityReport;
  visualCertification: "render-contract-only";
}>;

export function createBenchmarkReport(parsed: ParsedTsx, graph: DesignGraph, compilation: BlueprintCompilation): V11BenchmarkReport {
  const captures = captureRenderContracts(compilation.blueprint);
  return Object.freeze({ fixture: parsed.file, ast: Object.freeze({ type: parsed.ast.type, statements: parsed.ast.program.body.length }),
    designGraph: graph, blueprint: compilation.blueprint, diagnostics: compilation.diagnostics, captures,
    fidelity: scoreFidelity(graph, compilation, captures), visualCertification: "render-contract-only" });
}
