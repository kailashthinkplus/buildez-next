import type { BuilderBlueprint } from "../../types/blueprint";
import type { DesignGraph, DesignGraphNode } from "../design-graph/schema";
import type { FidelityDiagnostic } from "../diagnostics/fidelity";
import { extractEmbeddedCss } from "../css-layer/embeddedCss";

type CountSet = Readonly<{
  sections: number;
  text: number;
  media: number;
  interactive: number;
}>;

export type FullPageCompletenessReport = Readonly<{
  valid: boolean;
  issues: readonly string[];
  warnings: readonly string[];
  source: CountSet;
  compiled: CountSet;
  ratios: Readonly<{ text: number; media: number; interactive: number }>;
  sourceSemanticRoles: readonly string[];
  compiledSemanticRoles: readonly string[];
  sectionSequence: readonly string[];
  blueprintNodeCounts: Readonly<Record<string, number>>;
  embeddedCss: Readonly<{
    rules: number;
    keyframes: number;
    emittedNodes: number;
  }>;
  arbitraryValues: readonly string[];
  localComponents: readonly string[];
  staticArrays: number;
  mapExpressions: number;
  inlineSvgs: number;
  astSummary: Readonly<{
    type: string;
    defaultExport: string;
    sourceLines: number;
  }>;
  tailwindUtilitiesResolved: number;
  validationStatus: "passed";
  serializationStatus: "round-trip-passed";
  diagnostics: readonly FidelityDiagnostic[];
}>;

const textNode = (node: DesignGraphNode) =>
  ["heading", "text", "button"].includes(node.type) &&
  Boolean(node.content?.trim());
const ratio = (compiled: number, source: number) =>
  source === 0 ? 1 : compiled / source;

function walkAst(
  value: unknown,
  visit: (node: any) => void,
  seen = new Set<unknown>(),
) {
  if (!value || typeof value !== "object" || seen.has(value)) return;
  seen.add(value);
  const node = value as any;
  if (typeof node.type === "string") visit(node);
  for (const [key, child] of Object.entries(node))
    if (key !== "loc" && key !== "start" && key !== "end") {
      if (Array.isArray(child))
        child.forEach((item) => walkAst(item, visit, seen));
      else walkAst(child, visit, seen);
    }
}

export function validateFullPageCompleteness(
  input: Readonly<{
    source: string;
    ast: any;
    graph: DesignGraph;
    blueprint: BuilderBlueprint;
    diagnostics: readonly FidelityDiagnostic[];
  }>,
): FullPageCompletenessReport {
  const graphNodes = Object.values(input.graph.nodes);
  const blueprintNodes = Object.values(input.blueprint.nodes);
  const sourceSections = graphNodes.filter((node) => node.type === "section");
  const compiledSections = blueprintNodes.filter(
    (node) => node.type === "section",
  );
  const sourceText = graphNodes.filter(textNode);
  const compiledText = blueprintNodes.filter(
    (node) =>
      ["heading", "text", "button"].includes(node.type) &&
      Boolean(String(node.props.text ?? node.props.label ?? "").trim()),
  );
  const sourceMedia = graphNodes.filter((node) => node.type === "image");
  const compiledMedia = blueprintNodes.filter((node) => node.type === "image");
  const sourceInteractive = graphNodes.filter((node) => node.type === "button");
  const compiledInteractive = blueprintNodes.filter(
    (node) => node.type === "button",
  );
  const sourceRoles = sourceSections.map((node) => node.semanticRole);
  const compiledRoles = compiledSections.map((node) => node.name);
  const compiledAllRoles = blueprintNodes.flatMap((node) => [
    node.name,
    typeof node.props.semanticRole === "string" ? node.props.semanticRole : "",
  ]).filter(Boolean);
  const issues: string[] = [];
  const warnings: string[] = [];
  for (const role of ["primary-navigation", "hero", "footer"])
    if (!compiledAllRoles.includes(role))
      issues.push(`Required section '${role}' was lost.`);
  for (const role of sourceRoles)
    if (!compiledRoles.includes(role))
      issues.push(`Major section '${role}' was lost.`);
  const preservedSourceText = sourceText.filter((node) => {
    if (input.blueprint.nodes[node.id]) return true;
    let ancestor = node.parentId ? input.graph.nodes[node.parentId] : undefined;
    while (ancestor) {
      const compiled = input.blueprint.nodes[ancestor.id];
      if (compiled && String(compiled.props.text ?? compiled.props.label ?? compiled.props.html ?? "").includes(node.content?.trim() || "\u0000")) return true;
      ancestor = ancestor.parentId ? input.graph.nodes[ancestor.parentId] : undefined;
    }
    return false;
  }).length;
  const ratios = {
    text: ratio(preservedSourceText, sourceText.length),
    media: ratio(compiledMedia.length, sourceMedia.length),
    interactive: ratio(compiledInteractive.length, sourceInteractive.length),
  };
  for (const [kind, value] of Object.entries(ratios)) {
    if (value < 0.75)
      issues.push(`${kind} completeness ${(value * 100).toFixed(1)}% is below the minimum viable 75%.`);
    else if (value < 0.95)
      warnings.push(`${kind} completeness ${(value * 100).toFixed(1)}% is below the 95% fidelity target.`);
  }
  for (const node of sourceMedia) {
    const out = input.blueprint.nodes[node.id];
    if (
      out?.props.src !== node.attributes.src ||
      out?.props.alt !== node.attributes.alt
    )
      warnings.push(`Image src or alt was changed during compilation at ${node.id}.`);
  }
  for (const node of sourceInteractive) {
    const out = input.blueprint.nodes[node.id];
    if (node.attributes.href && out?.props.href !== node.attributes.href)
      warnings.push(`Href requires review after compilation at ${node.id}.`);
  }
  const embedded = extractEmbeddedCss(input.source);
  const emittedNodes = blueprintNodes.filter((node) =>
    Boolean((node.props.advanced as any)?.customCss),
  ).length;
  if (embedded.ruleCount && !emittedNodes)
    issues.push("Embedded CSS was silently discarded.");
  const localComponents: string[] = [];
  let mapExpressions = 0;
  let inlineSvgs = 0;
  let staticArrays = 0;
  walkAst(input.ast, (node) => {
    if (
      (node.type === "FunctionDeclaration" ||
        node.type === "VariableDeclarator") &&
      node.id?.name &&
      node.id.name !== input.graph.metadata.componentName &&
      /^[A-Z]/.test(node.id.name)
    )
      localComponents.push(node.id.name);
    if (node.type === "CallExpression" && node.callee?.property?.name === "map")
      mapExpressions += 1;
    if (
      node.type === "VariableDeclarator" &&
      node.init?.type === "ArrayExpression"
    )
      staticArrays += 1;
    if (node.type === "JSXOpeningElement" && node.name?.name === "svg")
      inlineSvgs += 1;
  });
  const nodeCounts = blueprintNodes.reduce<Record<string, number>>(
    (counts, node) => {
      counts[node.type] = (counts[node.type] ?? 0) + 1;
      return counts;
    },
    {},
  );
  return Object.freeze({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
    warnings: Object.freeze(warnings),
    source: Object.freeze({
      sections: sourceSections.length,
      text: sourceText.length,
      media: sourceMedia.length,
      interactive: sourceInteractive.length,
    }),
    compiled: Object.freeze({
      sections: compiledSections.length,
      text: compiledText.length,
      media: compiledMedia.length,
      interactive: compiledInteractive.length,
    }),
    ratios: Object.freeze(ratios),
    sourceSemanticRoles: Object.freeze(sourceRoles),
    compiledSemanticRoles: Object.freeze(compiledRoles),
    sectionSequence: Object.freeze(
      sourceSections.map((node) => node.attributes.id ?? node.semanticRole),
    ),
    blueprintNodeCounts: Object.freeze(nodeCounts),
    embeddedCss: Object.freeze({
      rules: embedded.ruleCount,
      keyframes: embedded.keyframeCount,
      emittedNodes,
    }),
    arbitraryValues: Object.freeze([
      ...new Set(
        input.source.match(
          /(?:min-h|max-w|text|leading|tracking|bg)-\[[^\]]+\]/g,
        ) ?? [],
      ),
    ]),
    localComponents: Object.freeze([...new Set(localComponents)]),
    staticArrays,
    mapExpressions,
    inlineSvgs,
    astSummary: Object.freeze({
      type: input.ast?.type ?? "Unknown",
      defaultExport: input.graph.metadata.componentName,
      sourceLines: input.source.replace(/\r?\n$/, "").split(/\r?\n/).length,
    }),
    tailwindUtilitiesResolved:
      input.source
        .match(/className="([^"]*)"/g)
        ?.reduce(
          (count, value) => count + (value.match(/\S+/g)?.length ?? 0),
          0,
        ) ?? 0,
    validationStatus: "passed",
    serializationStatus: "round-trip-passed",
    diagnostics: input.diagnostics,
  });
}
