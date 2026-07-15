import { createEngineResult, type EngineResult } from "../sdk";
import type { BuilderBlueprint as NativeBuilderBlueprint, BuilderTheme } from "../../types/blueprint";
import type { BuilderBlueprint, BuilderBlueprintInput, BuilderBlueprintMetrics, BuilderBlueprintResult, BuilderBlueprintWarning } from "./builderBlueprint";
import { widgetBlueprintToTree } from "./containerBlueprint";
import { expandComponentRecipes } from "./recipeExpander";
import { createSemanticBuilderTheme } from "./SemanticBlueprintCompiler";
import { buildSectionBlueprints } from "./sectionBlueprint";
import { buildWidgetBlueprints } from "./widgetBlueprint";
import { BUILDER_BLUEPRINT_ENGINE_VERSION_STRING } from "./version";
import { validateBuilderBlueprint } from "./blueprintValidation";
import { validateNativeBlueprintCompatibility } from "./nativeBlueprintCompatibility";

function buildTrace(input: BuilderBlueprintInput) {
  return [
    "builder-blueprint.local-only",
    ...(input.websiteSpec ? ["website-spec"] : []),
    ...(input.websiteDNA ? ["website-dna"] : []),
    ...(input.compiledPlan ? ["compiled-website-plan"] : []),
    ...(input.designResult ? ["design-engine"] : []),
    ...(input.componentResult ? ["component-engine"] : []),
    ...(input.compositionResult ? ["composition-engine"] : []),
    "editable-native-primitives-only",
    "no-builder-store-insert",
    "no-mapper",
    "no-rendering",
    "no-react-css-html-js",
  ];
}

function buildNativeBlueprint(input: BuilderBlueprintInput, widgets: ReturnType<typeof buildWidgetBlueprints>, theme: BuilderTheme): NativeBuilderBlueprint {
  const now = new Date().toISOString();
  const nodes = Object.fromEntries(widgets.map((widget) => [widget.id, {
    id: widget.id,
    type: widget.type,
    name: widget.name,
    parentId: widget.parentId,
    children: widget.children,
    props: widget.props,
    style: widget.style,
  }]));
  return Object.freeze({
    metadata: {
      version: 2 as const,
      title: input.websiteSpec?.business.businessName ?? "Website Engine Blueprint",
      createdAt: now,
      updatedAt: now,
      aiGenerated: true,
      industry: input.websiteSpec?.business.industryId,
      template: "website-engine-builder-blueprint",
    },
    theme,
    root: "page.root",
    nodes,
  });
}

function collectMetrics(result: Omit<BuilderBlueprintResult, "metrics">): BuilderBlueprintMetrics {
  return Object.freeze({
    sectionCount: result.sections.length,
    widgetCount: result.blueprint.widgets.length,
    inspectorCount: result.inspectorBlueprints.length,
    propertyDefinitionCount: result.propertyDefinitions.length,
    propertyBindingCount: result.blueprint.propertyBindings.length,
    responsiveBindingCount: result.responsiveBindings.length,
    warningCount: result.warnings.length,
    missingFactCount: result.blueprint.missingFacts.length,
    missingAssetCount: result.blueprint.missingAssets.length,
  });
}

/**
 * Builds a mapper-ready editable BuilderBlueprint contract without inserting it into Builder.
 *
 * @example
 * const blueprint = buildBuilderBlueprint({ websiteSpec, compiledPlan });
 */
export function buildBuilderBlueprint(input: BuilderBlueprintInput = {}): BuilderBlueprint {
  const seeds = expandComponentRecipes(input);
  const widgets = buildWidgetBlueprints(input, seeds);
  const page = widgets.find((widget) => widget.type === "page") ?? widgets[0];
  const sections = buildSectionBlueprints(input, widgets);
  const theme = createSemanticBuilderTheme(input);
  const propertyDefinitions = widgets.flatMap((widget) => widget.propertyDefinitions);
  const propertyBindings = widgets.flatMap((widget) => widget.propertyBindings);
  const editablePropertyBindings = widgets.flatMap((widget) => widget.editablePropertyBindings);
  const responsiveBindings = widgets.flatMap((widget) => widget.responsiveBindings);
  const styleBindings = widgets.flatMap((widget) => widget.styleBindings);
  const motionBindings = widgets.flatMap((widget) => widget.motionBindings);
  const widgetCapabilities = Object.fromEntries(widgets.map((widget) => [widget.id, widget.capabilities]));
  const sectionCapabilities = Object.fromEntries(sections.map((section) => [section.id, section.capabilities]));
  const nativeCompatibility = validateNativeBlueprintCompatibility(widgets);
  const blueprintWithoutValidation: Omit<BuilderBlueprint, "validation"> = Object.freeze({
    id: "builder-blueprint.local",
    version: BUILDER_BLUEPRINT_ENGINE_VERSION_STRING,
    nativeBlueprint: buildNativeBlueprint(input, widgets, theme),
    rootWidgetId: "page.root",
    widgetTree: page ? widgetBlueprintToTree(page, new Map(widgets.map((widget) => [widget.id, widget]))) : Object.freeze({ id: "page.root", type: "page" as const, parentId: null, children: [] }),
    sections,
    widgets,
    inspectorBlueprints: widgets.map((widget) => widget.inspector),
    propertyDefinitions,
    propertyBindings,
    editablePropertyBindings,
    responsiveBindings,
    styleBindings,
    motionBindings,
    widgetCapabilities,
    sectionCapabilities,
    regenerationMetadata: page.regenerationMetadata,
    nativeCompatibility,
    nativeNodeIntents: nativeCompatibility.nodeIntents,
    nativeWidgetIntents: nativeCompatibility.widgetIntents,
    nativeInspectorBindingIntents: nativeCompatibility.inspectorBindingIntents,
    nativeCommandIntents: nativeCompatibility.commandIntents,
    missingFacts: [...(input.websiteSpec?.missingFacts ?? []), ...(input.missingFacts ?? [])],
    missingAssets: [...(input.compiledPlan?.missingAssets ?? []), ...(input.mediaStrategy?.missingAssets ?? []), ...(input.missingAssets?.map((fact) => fact.label) ?? [])],
    metadata: {
      sourceWebsiteSpecId: input.websiteSpec ? String(input.websiteSpec.id) : undefined,
      sourceCompiledPlanId: input.compiledPlan ? String(input.compiledPlan.id) : undefined,
      featureFlags: input.featureFlags ?? {},
      trace: buildTrace(input),
    },
  });
  const provisional = { ...blueprintWithoutValidation, validation: Object.freeze({ valid: true, issues: [] }) } satisfies BuilderBlueprint;
  return Object.freeze({ ...blueprintWithoutValidation, validation: validateBuilderBlueprint(provisional) });
}

/**
 * Runs the local deterministic Builder Blueprint Engine.
 *
 * @example
 * const result = runBuilderBlueprintEngine({ websiteSpec, compiledPlan });
 */
export function runBuilderBlueprintEngine(input: BuilderBlueprintInput = {}): EngineResult<BuilderBlueprintResult> {
  const blueprint = buildBuilderBlueprint(input);
  const warnings: BuilderBlueprintWarning[] = blueprint.validation.issues.map((item) => Object.freeze({ code: item.code, message: `${item.path}: ${item.message}`, module: "builder-blueprint", severity: "major" as const }));
  const partial = Object.freeze({
    blueprint,
    sections: blueprint.sections,
    widgetTree: blueprint.widgetTree,
    inspectorBlueprints: blueprint.inspectorBlueprints,
    propertyDefinitions: blueprint.propertyDefinitions,
    editablePropertyBindings: blueprint.editablePropertyBindings,
    responsiveBindings: blueprint.responsiveBindings,
    styleBindings: blueprint.styleBindings,
    motionBindings: blueprint.motionBindings,
    widgetCapabilities: blueprint.widgetCapabilities,
    sectionCapabilities: blueprint.sectionCapabilities,
    aiWidgetMetadata: blueprint.widgets.map((widget) => widget.aiMetadata),
    regenerationMetadata: blueprint.widgets.map((widget) => widget.regenerationMetadata),
    nativeCompatibility: blueprint.nativeCompatibility,
    nativeNodeIntents: blueprint.nativeNodeIntents,
    nativeWidgetIntents: blueprint.nativeWidgetIntents,
    nativeInspectorBindingIntents: blueprint.nativeInspectorBindingIntents,
    nativeCommandIntents: blueprint.nativeCommandIntents,
    validation: blueprint.validation,
    warnings,
    trace: blueprint.metadata.trace,
  });
  const result: BuilderBlueprintResult = Object.freeze({ ...partial, metrics: collectMetrics(partial) });
  return createEngineResult({
    module: "builder-blueprint",
    stage: "build-blueprint",
    status: blueprint.validation.valid && warnings.length === 0 ? "ok" : "warning",
    warnings,
    data: result,
    metadata: { localOnly: true, widgetCount: result.metrics.widgetCount, sectionCount: result.metrics.sectionCount, noBuilderStoreInsert: true },
  });
}

export { expandComponentRecipes, buildWidgetBlueprints, buildSectionBlueprints, validateBuilderBlueprint, validateNativeBlueprintCompatibility };
export * from "./SemanticBlueprintCompiler";
export * from "./recipes";
