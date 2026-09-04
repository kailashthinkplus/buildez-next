import type { NormalizedTsx } from "../ast/normalize";
import type { DesignGraph, DesignGraphNode } from "./schema";
import { interpretStaticDom } from "../interpreter/domInterpreter";
import type { EvaluationBudgets } from "../interpreter/staticEvaluator";

export function buildDesignGraph(source: NormalizedTsx, budgets: Partial<EvaluationBudgets> = {}): DesignGraph {
  const interpreted = interpretStaticDom(source, budgets);
  const rootId = "dg.page";
  const page: DesignGraphNode = Object.freeze({
    id: rootId,
    type: "page",
    semanticRole: "page",
    parentId: null,
    children: interpreted.rootIds,
    layout: Object.freeze({ ...(interpreted.rootPresentation?.layout ?? {}) }) as DesignGraphNode["layout"],
    style: Object.freeze({ ...(interpreted.rootPresentation?.style ?? {}) }) as DesignGraphNode["style"],
    responsive: Object.freeze({ ...(interpreted.rootPresentation?.responsive ?? {}) }) as DesignGraphNode["responsive"],
    effects: Object.freeze([]),
    embeddedCss: interpreted.rootPresentation?.embeddedCss,
    attributes: Object.freeze({}),
    provenance: Object.freeze({
      sourceFile: source.file,
      line: source.root.loc?.start?.line ?? 1,
      column: (source.root.loc?.start?.column ?? 0) + 1,
      sourceElement: source.componentName,
    }),
  });
  const nodes = { [rootId]: page, ...interpreted.nodes };
  for (const childId of interpreted.rootIds) {
    const child = nodes[childId];
    nodes[childId] = Object.freeze({ ...child, parentId: rootId });
  }
  const helpers = (source.ast?.program?.body ?? []).flatMap(
    (statement: any) => {
      const node = statement.declaration ?? statement;
      if (
        node?.type === "FunctionDeclaration" &&
        node.id?.name !== source.componentName &&
        /^[A-Z]/.test(node.id?.name ?? "")
      )
        return [
          {
            name: node.id.name,
            start: node.loc?.start?.line ?? 0,
            end: node.loc?.end?.line ?? 0,
          },
        ];
      return [];
    },
  );
  for (const [id, original] of Object.entries(nodes)) {
    if (id === rootId) continue;
    let ancestor = original.parentId ? nodes[original.parentId] : undefined;
    while (ancestor && ancestor.type !== "section")
      ancestor = ancestor.parentId ? nodes[ancestor.parentId] : undefined;
    const helper = helpers.find(
      (candidate) =>
        original.provenance.line >= candidate.start &&
        original.provenance.line <= candidate.end,
    );
    nodes[id] = Object.freeze({
      ...original,
      provenance: Object.freeze({
        ...original.provenance,
        nearestSemanticSection: ancestor?.semanticRole,
        localComponentOrigin: helper?.name,
      }),
    });
  }
  return Object.freeze({
    version: "0",
    id: `design-graph:${source.componentName}`,
    rootId,
    nodes: Object.freeze(nodes),
    diagnostics: interpreted.diagnostics,
    metadata: Object.freeze({
      sourceFile: source.file,
      componentName: source.componentName,
    }),
  });
}
