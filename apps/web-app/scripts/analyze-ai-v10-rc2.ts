import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { classifyOverflow, compilerForNode, duplicateFingerprint, semanticPurposeClass } from "../modules/builder-v2/ai-v10/forensics/rc2Diagnostics";
import type { BuilderBlueprint } from "../modules/builder-v2/types/blueprint";
import { evaluateLayoutFeasibility } from "../modules/builder-v2/website-engine/layout-archetypes/layoutFeasibility";

const runId = process.argv[2] ?? "sanjeevini-group-seed-104729";
const directory = join(process.cwd(), "test-results", "ai-v10-forensic", runId);
const read = <T>(name: string): T => JSON.parse(readFileSync(join(directory, name), "utf8"));
const write = (name: string, value: unknown) => writeFileSync(join(directory, name), `${JSON.stringify(value, null, 2)}\n`, { flag: "wx" });

const experience = read<any>("04-experience-strategy.json");
const patterns = read<any>("05-pattern-intelligence.json");
const selectionArtifact = read<any>("09-component-selection.json");
const selections = selectionArtifact.sectionSelections as any[];
const anatomyBySectionId = new Map((selectionArtifact.anatomyDiagnostics ?? []).map((item: any) => [item.sectionId, item]));
const composition = read<any>("10-composition-result.json").orderedSectionSequence as any[];
const spec = read<any>("11-website-spec.json").sectionSpecs as any[];
const semantic = read<any>("12-semantic-compilation.json");
const blueprint = read<BuilderBlueprint>("18-final-blueprint.json");
const styleContract = read<any>("19-rendered-style-contract.json");
const runtime = Object.fromEntries((["desktop", "tablet", "mobile"] as const).map((viewport) => [viewport, read<any[]>(`${viewport}-runtime-geometry.json`)]));
const canvas = Object.fromEntries((["desktop", "tablet", "mobile"] as const).map((viewport) => [viewport, read<any[]>(`${viewport}-canvas-geometry.json`)]));

const selectionById = new Map(selections.map((item) => [item.section.id, item]));
const compositionById = new Map(composition.map((item, order) => [item.id, { ...item, order }]));
const specById = new Map(spec.map((item) => [item.id, item]));
const patternById = new Map(patterns.selectedPatterns.map((item: any) => [item.patternId, item]));

const provenance = semantic.sections.map((compiled: any) => {
  const sourceSectionId = compiled.sourceSectionId;
  const selected: any = selectionById.get(sourceSectionId);
  const composed: any = compositionById.get(sourceSectionId);
  const sectionSpec: any = specById.get(sourceSectionId);
  const sectionNode = blueprint.nodes[compiled.rootWidgetId];
  const contentRoles = compiled.widgets.filter((widget: any) => ["heading", "text", "button"].includes(widget.type)).map((widget: any) => widget.name ?? widget.props?.semanticRole ?? widget.type);
  const fingerprint = duplicateFingerprint({
    purpose: compiled.purpose, headlineIntent: contentRoles.find((role: string) => /headline|heading|title/.test(role)),
    ctaIntent: contentRoles.find((role: string) => /cta|button|action/.test(role)), contentRoles,
    componentCategory: selected?.selection.variant.category, archetype: selected?.layoutArchetypeId,
    sourcePattern: selected?.section.patternId, conversionPurpose: composed?.category,
  });
  return {
    finalSectionNodeId: compiled.rootWidgetId, finalRole: sectionNode?.props.role ?? compiled.role,
    sourceSectionId, sourcePurpose: compiled.purpose, patternId: selected?.section.patternId,
    websiteSpecPatternRefs: sectionSpec?.patternRefs, selectedComponentId: selected?.selection.variant.id,
    compilerCoverage: selected?.compilerCoverage, selectedArchetype: selected?.layoutArchetypeId ?? "legacy-recipe-fallback",
    compositionOrder: composed?.order, experienceStep: selected?.section.experienceGoal,
    experienceJourneyStage: experience.journeyStages[composed?.order % experience.journeyStages.length],
    duplicateFingerprint: (anatomyBySectionId.get(sourceSectionId) as any)?.anatomyFingerprint ?? fingerprint, semanticPurposeClass: semanticPurposeClass(compiled.purpose), contentRoles,
  };
});

const semanticClusters = new Map<string, typeof provenance>();
for (const item of provenance) {
  const key = item.duplicateFingerprint;
  semanticClusters.set(key, [...(semanticClusters.get(key) ?? []), item]);
}
const duplicates = [...semanticClusters.entries()].filter(([, items]) => items.length > 1).map(([fingerprint, items]) => ({
  fingerprint, sectionIds: items.map((item) => item.sourceSectionId), finalNodeIds: items.map((item) => item.finalSectionNodeId),
  firstEquivalentStage: "ComponentEngine.sectionSelections", sameSourceCompiledTwice: new Set(items.map((item) => item.sourceSectionId)).size !== items.length,
  evidence: items.map((item) => ({ purpose: item.sourcePurpose, patternId: item.patternId, component: item.selectedComponentId, archetype: item.selectedArchetype })),
}));
write("section-provenance.json", { runId, sections: provenance, duplicates, websiteSpecIndexAssociationDefect: spec.map((item: any) => ({ sectionId: item.id, actualPatternRefs: item.patternRefs, expectedPatternId: (selectionById.get(item.id) as any)?.section.patternId, mismatch: item.patternRefs?.[0] !== (selectionById.get(item.id) as any)?.section.patternId })) });

const contractById = new Map(styleContract.nodes.map((item: any) => [item.id, item]));
const anomalies: any[] = [];
for (const viewport of ["desktop", "tablet", "mobile"] as const) {
  for (const observed of runtime[viewport]) {
    const node = blueprint.nodes[observed.id]; if (!node) continue;
    const narrow = (node.type === "heading" && observed.width < 220) || (node.type === "text" && observed.width < 160);
    const overflow = observed.scrollWidth > observed.width + 1 || observed.scrollHeight > observed.height + 1;
    if (!narrow && !overflow) continue;
    const sectionId = observed.id.match(/section_[a-z0-9_]+_\d+$/)?.[0]?.replace(/^/, "section.").replaceAll("_", ".");
    const section = provenance.find((item) => observed.id.endsWith(item.finalSectionNodeId.replace(/^section\./, "")) || item.finalSectionNodeId === sectionId);
    const parent = node.parentId ? blueprint.nodes[node.parentId] : undefined;
    const compiler = compilerForNode(node, section?.selectedArchetype);
    anomalies.push({
      nodeId: node.id, nodeType: node.type, viewport, renderedWidth: observed.width, scrollWidth: observed.scrollWidth,
      renderedHeight: observed.height, scrollHeight: observed.scrollHeight, parentId: node.parentId,
      parentLayout: parent?.style.display, parentTracks: parent?.style.gridTemplateColumns,
      rawStyle: node.style, resolvedStyle: (contractById.get(node.id) as any)?.resolved?.[viewport],
      archetype: section?.selectedArchetype, archetypeParameters: { parentGap: parent?.style.gap, parentPadding: parent?.style.padding },
      ...compiler, classification: overflow ? classifyOverflow(observed) : "narrow-without-overflow",
      rootCauseGroup: /metric_/.test(node.id) ? "floating-proof-nested-three-track-metrics" : /masonry|gallery/.test(node.id) ? "fixed-track-gallery-anatomy" : observed.scrollHeight - observed.height <= 3 ? "measurement-rounding" : "compiled-text-track-or-content-height",
    });
  }
}
const groups = Object.entries(Object.groupBy(anomalies, (item) => item.rootCauseGroup)).map(([id, items]) => ({ id, observationCount: items?.length ?? 0, nodeIds: [...new Set((items ?? []).map((item) => item.nodeId))], classifications: [...new Set((items ?? []).map((item) => item.classification))] }));
write("anomaly-provenance.json", { runId, observationCount: anomalies.length, uniqueRootCauseCount: groups.length, groups, anomalies });

const desktopWidth = 1072;
const feasibility = provenance.map((section) => {
  const root = blueprint.nodes[`container.archetype.${section.finalSectionNodeId.replace(/^section\./, "")}`] ?? blueprint.nodes[blueprint.nodes[section.finalSectionNodeId]?.children[0]];
  const observedRoot = runtime.desktop.find((item) => item.id === root?.id);
  const descendants = runtime.desktop.filter((item) => item.id.endsWith(section.finalSectionNodeId.replace(/^section\./, "")));
  const textTracks = descendants.filter((item) => /^(heading|text)\./.test(item.id)).map((item) => ({ nodeId: item.id, width: item.width, belowHeadingContract: item.id.startsWith("heading.") && item.width < 220, belowBodyContract: item.id.startsWith("text.") && item.width < 260 }));
  return { sectionId: section.sourceSectionId, finalSectionNodeId: section.finalSectionNodeId, archetype: section.selectedArchetype, availableContentWidth: observedRoot?.width ?? desktopWidth, containerPadding: root?.style.padding ?? 0, gaps: root?.style.gap, tracks: root?.style.gridTemplateColumns, textTracks, feasible: !textTracks.some((item) => item.belowHeadingContract || item.belowBodyContract) };
});
const proofContract = (width: number, outer: readonly number[], outerGap: number) => evaluateLayoutFeasibility({
  estimatedContainerWidth: width,
  outerTrackAllocation: outer,
  outerTrackIndex: outer.length - 1,
  outerGap,
  innerGap: 12,
  childCount: 3,
  childPadding: 20,
  declaredMinimumCardWidth: 260,
  declaredMinimumTextContentWidth: 220,
});
const floatingProofSections = provenance.filter((section) => section.selectedArchetype === "floatingProofSection");
const parity = (["desktop", "tablet", "mobile"] as const).flatMap((viewport) => floatingProofSections.flatMap((section) => {
  const suffix = section.finalSectionNodeId.replace(/^section\./, "");
  return runtime[viewport].filter((item) => item.id.endsWith(suffix) && /^(container\.metrics|column\.metric_|heading\.metric_)/.test(item.id)).map((runtimeNode) => {
    const canvasNode = canvas[viewport].find((item) => item.id === runtimeNode.id);
    return { viewport, nodeId: runtimeNode.id, runtimeWidth: runtimeNode.width, canvasWidth: canvasNode?.width, widthDelta: canvasNode ? Number(Math.abs(runtimeNode.width - canvasNode.width).toFixed(2)) : undefined };
  });
}));
write("archetype-feasibility.json", {
  runId,
  desktopViewportWidth: 1440,
  sectionContentWidth: desktopWidth,
  sections: feasibility,
  floatingProofSectionsSelected: floatingProofSections.length,
  canvasRuntimeMetricParity: parity,
  floatingProofContract: {
    before: {
      outerAvailableWidth: 1072,
      outerGap: 48,
      outerTrackRatio: "1.15fr / .85fr",
      metricsTrackWidth: 435.2,
      innerTracks: 3,
      innerGap: 12,
      cardOuterWidth: 137.06,
      cardHorizontalPadding: 40,
      metricHeadingContentWidth: 97.06,
      feasible: false,
    },
    after: {
      nestedDesktop: proofContract(1072, [1.15, 0.85], 48),
      stackedDesktop: proofContract(1072, [1], 0),
      stackedTablet: proofContract(786, [1], 0),
      stackedMobile: proofContract(342, [1], 0),
      wideNestedDesktop: proofContract(1952, [1.15, 0.85], 48),
      placementWhenNestedInfeasible: "metrics-below-proof",
    },
    compilerFile: "website-engine/layout-archetypes/archetypeCompilers.ts",
    compilerFunction: "compileFloatingProof",
  },
});

process.stdout.write(`${directory}\n`);
