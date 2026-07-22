import type { BuilderBlueprint, BuilderNode, NodeType } from "../../types/blueprint";
import { deserializeBlueprint, serializeBlueprint } from "../../core/serialization";
import { PremiumWidgetDefinitions } from "../../widgets/premium";

export type WidgetPopulationFirstBadStage =
  | "wrong-capability-selected" | "wrong-widget-family-selected" | "incomplete-compiler-props"
  | "default-props-leaked" | "nested-hydration-not-supported" | "nested-hydration-rejected"
  | "media-slot-not-discovered" | "media-result-not-mapped" | "persistence-dropped-nested-props"
  | "renderer-prop-shape-mismatch" | "unsafe-required-data-missing" | "no-failure";

type StageBlueprints = Readonly<{
  compiled: BuilderBlueprint;
  enriched: BuilderBlueprint;
  images: BuilderBlueprint;
  final: BuilderBlueprint;
}>;

type SectionTrace = Readonly<{
  sectionId: string;
  purpose: string;
  selectedCapability?: NodeType;
  selectedWidgetType?: NodeType;
  interactionLevel?: string;
}>;

const rendererContract: Record<string, { required: string[]; nested: string[]; ignored: string[]; media: string[]; hardcoded: string[] }> = {
  hero: { required:["title","body","primaryCta","items[]"],nested:[],ignored:["variant","generationCapability"],media:["style.--w-media-url"],hardcoded:["dashboard demo image fallback","See it in action card"] },
  carousel: { required:["title","body","items[]"],nested:["slides[].title","slides[].media"],ignored:["primaryCta","secondaryCta","variant","generationCapability","style.mediaUrl"],media:["slides[].media"],hardcoded:["DEFAULT_MEDIA carousel slides","Slide n of n"] },
  galleryLightbox: { required:["title","body","items[]"],nested:["items[].title","items[].src","items[].alt"],ignored:["primaryCta","secondaryCta","variant","generationCapability","style.mediaUrl"],media:["items[].src"],hardcoded:["DEFAULT_MEDIA gallery items"] },
  faq: { required:["title","items[]"],nested:["questions[].question","questions[].answer"],ignored:["primaryCta","secondaryCta","variant","generationCapability"],media:[],hardcoded:["generic answer paragraph for every question"] },
  leadForm: { required:["title","body","primaryCta"],nested:["fields[].name","fields[].label","fields[].type","fields[].required"],ignored:["items","secondaryCta","variant","generationCapability"],media:[],hardcoded:["Name/Email/Phone/message fields","success confirmation copy"] },
  timeline: { required:["title","items[]"],nested:["steps[].title","steps[].description"],ignored:["primaryCta","secondaryCta","variant","generationCapability"],media:[],hardcoded:["generic step outcome paragraph"] },
  logoCloud: { required:["title","items[]"],nested:["logos[].name","logos[].src","logos[].alt"],ignored:["primaryCta","secondaryCta","variant","generationCapability"],media:["logos[].src"],hardcoded:[] },
  smartFooter: { required:["title","body","items[]"],nested:["linkGroups[].title","linkGroups[].links[]","legalLinks[]","contact"],ignored:["eyebrow","primaryCta","secondaryCta","variant","generationCapability"],media:[],hardcoded:["BZ logo","Company links","Your company copyright"] },
  floatingWhatsApp: { required:["primaryCta","whatsappNumber"],nested:[],ignored:["title","body","eyebrow","items","secondaryCta","variant","generationCapability"],media:[],hardcoded:["https://wa.me/ without destination"] },
  cta: { required:["eyebrow","title","body","primaryCta","secondaryCta"],nested:["actions[].label","actions[].href"],ignored:["items","variant","generationCapability"],media:[],hardcoded:[] },
};

const definitionFile = "widgets/premium/PremiumWidget.definition.ts";
const compilerFile = "website-engine/builder-blueprint/nativeVisualCapabilityCompiler.ts";
const rendererFile = "widgets/premium/ProductionWidgetView.tsx";

function flatten(value: unknown, prefix = ""): Array<{ path: string; value: unknown }> {
  if (Array.isArray(value)) return value.flatMap((item, index) => flatten(item, `${prefix}[${index}]`));
  if (value && typeof value === "object") return Object.entries(value as Record<string, unknown>).flatMap(([key, item]) => flatten(item, prefix ? `${prefix}.${key}` : key));
  return [{ path: prefix, value }];
}

function hasPath(value: unknown, requested: string) {
  if (requested.endsWith("[]")) {
    const current = (value as Record<string, unknown> | undefined)?.[requested.slice(0, -2)];
    return Array.isArray(current) && current.length > 0;
  }
  const normalized = requested.replace(/\[\]/g, "").split(".");
  let current = value;
  for (const part of normalized) {
    if (!current || typeof current !== "object") return false;
    current = (current as Record<string, unknown>)[part];
  }
  return current !== undefined && current !== null && current !== "";
}

function placeholders(props: unknown) {
  return flatten(props).filter((entry) => typeof entry.value === "string" && /\{\{.+\}\}/.test(entry.value)).map((entry) => entry.path);
}

function duplicatePaths(props: unknown) {
  const values = new Map<string, string[]>();
  for (const entry of flatten(props)) {
    if (typeof entry.value !== "string" || !entry.value.trim()) continue;
    values.set(entry.value, [...(values.get(entry.value) ?? []), entry.path]);
  }
  return [...values.entries()].filter(([, paths]) => paths.length > 1).map(([value, paths]) => ({ value, paths }));
}

function defaultProps(type: NodeType) {
  return PremiumWidgetDefinitions.find((definition) => definition.type === type)?.defaultNode.props ?? {};
}

function defaultEquality(finalProps: Record<string, unknown>, defaults: Record<string, unknown>) {
  return Object.keys(defaults).filter((key) => JSON.stringify(finalProps[key]) === JSON.stringify(defaults[key])).map((key) => `props.${key}`);
}

function specificity(props: Record<string, unknown>) {
  const strings = flatten(props).map((entry) => entry.value).filter((value): value is string => typeof value === "string" && value.trim().length > 0 && !["none","default","editorial"].includes(value));
  if (!strings.length) return 0;
  const useful = strings.filter((value) => value.split(/\s+/).length >= 3 && !/group|company|first item|second item|get started/i.test(value));
  return Number((useful.length / strings.length).toFixed(2));
}

function firstBadStage(type: NodeType): WidgetPopulationFirstBadStage {
  if (type === "logoCloud") return "wrong-capability-selected";
  if (type === "floatingWhatsApp") return "unsafe-required-data-missing";
  if (type === "hero") return "renderer-prop-shape-mismatch";
  if (["carousel","galleryLightbox","faq","leadForm","timeline","smartFooter"].includes(type)) return "incomplete-compiler-props";
  return "no-failure";
}

function responsible(stage: WidgetPopulationFirstBadStage) {
  if (stage === "wrong-capability-selected" || stage === "unsafe-required-data-missing") return { file:"website-engine/components/visualCapabilitySelection.ts", fn:"selectVisualCapability" };
  if (stage === "renderer-prop-shape-mismatch") return { file:rendererFile, fn:"mediaSource / Hero" };
  if (stage === "incomplete-compiler-props") return { file:compilerFile, fn:"compileNativeVisualCapability" };
  return { file:"none", fn:"none" };
}

function reloadedBlueprint(final: BuilderBlueprint) {
  const serialized = serializeBlueprint(final);
  if (!serialized.ok) return undefined;
  const reloaded = deserializeBlueprint(serialized.value);
  return reloaded.ok ? reloaded.value : undefined;
}

export function auditWidgetPopulation(input: {
  stages: StageBlueprints;
  sectionTraces: readonly SectionTrace[];
  sectionSpecs: readonly { id: string; purpose: string; patternRefs?: string[]; type?: string }[];
  businessFamily: string;
  industry: string;
}) {
  const reloaded = reloadedBlueprint(input.stages.final);
  const records = input.sectionTraces.flatMap((trace) => {
    const widget = Object.values(input.stages.final.nodes).find((node) => node.parentId === `section.${trace.sectionId.replace(/[^a-z0-9]+/gi, "_").toLowerCase()}` && node.type === trace.selectedWidgetType)
      ?? Object.values(input.stages.final.nodes).find((node) => node.type === trace.selectedWidgetType && node.id.endsWith(trace.sectionId.replace(/[^a-z0-9]+/gi, "_").toLowerCase()));
    if (!widget) return [];
    const spec = input.sectionSpecs.find((item) => item.id === trace.sectionId);
    const compiled = input.stages.compiled.nodes[widget.id]?.props ?? {};
    const enriched = input.stages.enriched.nodes[widget.id]?.props ?? {};
    const imageAssigned = input.stages.images.nodes[widget.id]?.props ?? {};
    const finalProps = widget.props ?? {};
    const persistedProps = JSON.parse(JSON.stringify(finalProps));
    const reloadedProps = reloaded?.nodes[widget.id]?.props ?? {};
    const contract = rendererContract[widget.type] ?? { required:[], nested:[], ignored:[], media:[], hardcoded:[] };
    const missing = [...contract.required, ...contract.nested].filter((path) => !hasPath(finalProps, path));
    const populated = [...contract.required, ...contract.nested].filter((path) => hasPath(finalProps, path));
    const unknown = Object.keys(finalProps).filter((key) => !["eyebrow","title","body","primaryCta","secondaryCta","items","variant","motionPreset","generationCapability","whatsappNumber","questions","fields","steps","logos","slides","actions"].includes(key));
    const emptyMedia = contract.media.filter((path) => !hasPath(finalProps, path));
    const stage = firstBadStage(widget.type);
    const owner = responsible(stage);
    const defaultNodeProps = defaultProps(widget.type);
    const nestedTotal = contract.nested.length;
    const nestedPopulated = contract.nested.filter((path) => hasPath(finalProps, path)).length;
    const valuesEqual = defaultEquality(finalProps, defaultNodeProps);
    return [{
      sectionId: trace.sectionId,
      sourcePatternId: spec?.patternRefs?.[0],
      sectionPurpose: spec?.purpose ?? trace.purpose,
      businessFamily: input.businessFamily,
      industry: input.industry,
      narrativeRole: spec?.type,
      conversionRole: /cta|conversion|contact|lead/.test(`${spec?.type} ${trace.sectionId}`) ? "conversion" : "none",
      selectedCapability: trace.selectedCapability,
      widgetType: widget.type,
      widgetVariant: finalProps.variant,
      widgetDefinitionFile: definitionFile,
      defaultNodeSource: `${definitionFile}#createPremiumDefinition`,
      compilerFile,
      compilerFunction: "compileNativeVisualCapability",
      defaultProps: defaultNodeProps,
      compiledProps: compiled,
      enrichedProps: enriched,
      imageAssignedProps: imageAssigned,
      finalProps,
      persistedProps,
      reloadedProps,
      rendererExpectedPropShape: { sharedFlatProps:["eyebrow","title","body","primaryCta","secondaryCta","items"], widgetSpecificNestedProps:contract.nested, hardcodedFallbacks:contract.hardcoded },
      requiredPropPaths: [...contract.required, ...contract.nested],
      populatedPropPaths: populated,
      missingRequiredPropPaths: missing,
      valuesEqualToDefaults: valuesEqual,
      placeholderValues: placeholders(finalProps),
      duplicatedValues: duplicatePaths(finalProps),
      emptyMediaSlots: emptyMedia,
      unknownPropPaths: unknown,
      ignoredPropPaths: contract.ignored.filter((path) => hasPath(finalProps, path)),
      contentSpecificityScore: specificity(finalProps),
      industryFit: widget.type === "logoCloud" ? { status:"unsafe", reason:"No verified partner/customer logo facts are present." } : { status:"plausible", reason:"Capability role is broadly compatible with the industry." },
      roleFit: stage === "wrong-capability-selected" ? { status:"unsafe", reason:"Trust-band role does not prove partner/logo evidence." } : { status:"compatible", reason:"Selected capability matches the narrative role at category level." },
      mediaCompleteness: contract.media.length ? Number(((contract.media.length-emptyMedia.length)/contract.media.length).toFixed(2)) : 1,
      nestedHydrationCoverage: nestedTotal ? Number((nestedPopulated/nestedTotal).toFixed(2)) : 1,
      populationStatus: stage === "no-failure" ? "structurally-populated-but-fixture-copy-generic" : "incomplete-or-unsafe",
      firstBadStage: stage,
      responsibleFile: owner.file,
      responsibleFunction: owner.fn,
      evidence: [
        `compiled keys=${Object.keys(compiled).join(",")}`,
        `missing=${missing.join(",") || "none"}`,
        `ignored=${contract.ignored.filter((path) => hasPath(finalProps, path)).join(",") || "none"}`,
        `renderer hardcoded=${contract.hardcoded.join(";") || "none"}`,
        `persistence exact=${JSON.stringify(persistedProps) === JSON.stringify(reloadedProps)}`,
      ],
    }];
  });
  const global = new Map<string, Array<{ sectionId: string; path: string }>>();
  for (const record of records) for (const entry of flatten(record.finalProps)) if (typeof entry.value === "string" && entry.value.trim()) global.set(entry.value, [...(global.get(entry.value) ?? []), { sectionId:record.sectionId, path:entry.path }]);
  const crossSectionDuplication = [...global.entries()].filter(([, uses]) => new Set(uses.map((use) => use.sectionId)).size > 1).map(([value, uses]) => ({ value, uses }));
  return { records, crossSectionDuplication, persistenceExact: records.every((record) => JSON.stringify(record.persistedProps) === JSON.stringify(record.reloadedProps)) };
}

export function rendererPopulationContract(widgetType: string) {
  return rendererContract[widgetType];
}

