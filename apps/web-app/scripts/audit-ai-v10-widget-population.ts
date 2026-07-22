import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { auditWidgetPopulation, rendererPopulationContract } from "../modules/builder-v2/ai-v10/forensics/widgetPopulationAudit";
import { selectVisualCapability } from "../modules/builder-v2/website-engine/components/visualCapabilitySelection";

const runId = process.argv[2] ?? "sanjeevini-group-seed-104729";
const directory = join(process.cwd(), "test-results", "ai-v10-forensic", runId);
const read = <T>(name: string): T => JSON.parse(readFileSync(join(directory, name), "utf8"));
const finalArtifact = existsSync(join(directory,"18-final-blueprint.json")) ? "18-final-blueprint.json" : "18-final-blueprint-rejected.json";

const business = read<any>("01-business-profile.json");
const specification = read<any>("11-website-spec.json");
const capabilityTrace = read<any>("09-native-visual-capabilities.json");
const result = auditWidgetPopulation({
  stages: {
    compiled: read("14-blueprint-before-enrichment.json"),
    enriched: read("15-blueprint-after-enrichment.json"),
    images: read("16-blueprint-after-images.json"),
    final: read(finalArtifact),
  },
  sectionTraces: capabilityTrace.sections,
  sectionSpecs: specification.sectionSpecs,
  businessFamily: business.businessFamily,
  industry: business.industryId ?? business.businessFamily,
});

const rootCauseGroups = [
  {
    id: "shared-flat-native-adapter",
    firstBadStage: "incomplete-compiler-props",
    affectedWidgets: result.records.filter((record) => record.firstBadStage === "incomplete-compiler-props").map((record) => record.widgetType),
    evidence: "One generic adapter emits eyebrow/title/body/CTA/items for every widget; widget-specific questions, answers, fields, steps, links, logos, and slide media are absent.",
  },
  {
    id: "premium-media-outside-image-discovery",
    firstBadStage: "media-slot-not-discovered",
    affectedWidgets: result.records.filter((record) => record.emptyMediaSlots.length).map((record) => record.widgetType),
    evidence: "runV10ImageGeneration discovers only image nodes. The RC-3 premium nodes contain no image child nodes or discoverable nested prompts.",
  },
  {
    id: "renderer-demo-content-and-shape",
    firstBadStage: "renderer-prop-shape-mismatch",
    affectedWidgets: result.records.filter((record) => record.rendererExpectedPropShape.hardcodedFallbacks.length).map((record) => record.widgetType),
    evidence: "ProductionWidgetView supplies DEFAULT_MEDIA, generic answers/descriptions, fixed form fields, BZ/footer copy, and an empty WhatsApp destination internally rather than reading populated nested props.",
  },
  {
    id: "verified-data-not-gated",
    firstBadStage: "unsafe-required-data-missing",
    affectedWidgets: result.records.filter((record) => ["wrong-capability-selected", "unsafe-required-data-missing"].includes(record.firstBadStage)).map((record) => record.widgetType),
    evidence: "Capability selection activates logoCloud and floatingWhatsApp without verified logo/partner facts or a WhatsApp destination.",
  },
  {
    id: "forensic-enrichment-collapses-specificity",
    firstBadStage: "nested-hydration-not-supported",
    affectedWidgets: result.records.map((record) => record.widgetType),
    evidence: "The deterministic forensic fixture replaces every semantic token in premium props with the business name. This proves the stage can traverse arrays, but it cannot be used as evidence of production LLM copy quality.",
    fixtureOnly: true,
  },
  {
    id: "persistence-not-contributing",
    firstBadStage: "no-failure",
    affectedWidgets: [],
    evidence: `Nested prop persistence exact=${result.persistenceExact}.`,
  },
];

const provenance = {
  runId,
  generatedAt: new Date().toISOString(),
  records: result.records,
  crossSectionDuplication: result.crossSectionDuplication,
  persistenceExact: result.persistenceExact,
  rootCauseGroups,
  productionVsForensicComparison: {
    invariantProductionBehavior: [
      "nativeVisualCapabilityCompiler emits the same shared flat prop schema in normal and forensic runs",
      "runV10ImageGeneration scans only image nodes in normal and forensic runs",
      "ProductionWidgetView reads the same flat props and hard-coded fallbacks in normal and forensic renders",
      "serialization is identical in normal and forensic runs",
    ],
    forensicOnlyBehavior: "run-ai-v10-forensic-fixture.ts replaces all semantic tokens recursively with Sanjeevini Group; normal production uses runV10CreativeEnrichment.",
    conclusion: "Shape, media-discovery, renderer, safety, and persistence findings are production-invariant. The fixture's content-specificity score is not a measurement of production LLM quality.",
  },
};

const syntheticContexts = [
  { id:"healthcare-clinic", industry:"healthcare", sections:[
    { id:"clinic.hero",purpose:"Appointment-oriented clinic introduction",category:"hero",patternId:"appointment_hero",mediaRole:"dominant" as const },
    { id:"clinic.faq",purpose:"Patient objection and preparation FAQ",category:"FAQ",patternId:"faq_objection_handling",mediaRole:"supporting" as const },
    { id:"clinic.contact",purpose:"Appointment lead capture",category:"form",patternId:"contact_lead_capture",mediaRole:"none" as const },
  ] },
  { id:"saas-product", industry:"technology_saas", sections:[
    { id:"saas.hero",purpose:"Product value orientation hero",category:"hero",patternId:"product_value_hero",mediaRole:"dominant" as const },
    { id:"saas.comparison",purpose:"Compare product capabilities",category:"comparison",patternId:"comparison_section",mediaRole:"supporting" as const },
    { id:"saas.trust",purpose:"Customer trust band",category:"proof",patternId:"trust_band",mediaRole:"supporting" as const },
  ] },
  { id:"hospitality-resort", industry:"hospitality", sections:[
    { id:"resort.hero",purpose:"Immersive resort orientation hero",category:"hero",patternId:"editorial_hero",mediaRole:"dominant" as const },
    { id:"resort.gallery",purpose:"Lifestyle and property gallery",category:"gallery",patternId:"lifestyle_gallery",mediaRole:"dominant" as const },
    { id:"resort.contact",purpose:"Reservation enquiry capture",category:"form",patternId:"contact_lead_capture",mediaRole:"none" as const },
  ] },
  { id:"automotive-service", industry:"automotive", sections:[
    { id:"auto.hero",purpose:"Service-center orientation hero",category:"hero",patternId:"editorial_hero",mediaRole:"dominant" as const },
    { id:"auto.timeline",purpose:"Vehicle service process timeline",category:"process",patternId:"process_timeline",mediaRole:"supporting" as const },
    { id:"auto.faq",purpose:"Service objection FAQ",category:"FAQ",patternId:"faq_objection_handling",mediaRole:"supporting" as const },
  ] },
];

const crossIndustryAudit = syntheticContexts.map((context) => ({
  contextId: context.id,
  industry: context.industry,
  sections: context.sections.map((section) => {
    const selected = selectVisualCapability(section);
    const renderer = selected.selectedWidgetType ? rendererPopulationContract(selected.selectedWidgetType) : undefined;
    return {
      sectionId: section.id,
      selectedWidgetType: selected.selectedWidgetType,
      compilerCoverage: selected.compilerCoverage,
      sharedFlatCompilerRisk: Boolean(renderer?.nested.length),
      missingNestedFamilies: renderer?.nested ?? [],
      premiumMediaDiscoveryRisk: Boolean(renderer?.media.length),
      verifiedDataRisk: selected.selectedWidgetType === "logoCloud" || selected.selectedWidgetType === "floatingWhatsApp",
    };
  }),
}));

writeFileSync(join(directory, "widget-population-provenance.json"), `${JSON.stringify(provenance, null, 2)}\n`);
writeFileSync(join(directory, "widget-population-cross-industry.json"), `${JSON.stringify({ contexts: crossIndustryAudit }, null, 2)}\n`);
process.stdout.write(`${directory}\n`);
