import { fidelityDiagnostic, type FidelityDiagnostic } from "../diagnostics/fidelity";
import type { DesignGraphNode } from "../design-graph/schema";

export function cssDiagnostic(node: DesignGraphNode, code: string, message: string, feature: string): FidelityDiagnostic {
  return fidelityDiagnostic({ code, severity: "error", message, feature, affectedNode: node.id,
    location: { file: node.provenance.sourceFile, line: node.provenance.line, column: node.provenance.column },
    recommendedLowering: "Use an allowlisted node-local residual property/selector or lower through native BuilderStyle.",
  });
}
