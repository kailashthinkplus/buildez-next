import assert from "node:assert/strict";
import test from "node:test";

import { buildBuilderBlueprint } from "../../website-engine/builder-blueprint/BuilderBlueprintEngine";
import { ComponentVariantCompilerRegistry } from "../../website-engine/builder-blueprint/component-recipes";
import { compileSemanticBlueprint } from "../../website-engine/builder-blueprint/SemanticBlueprintCompiler";
import { RecipeRegistry } from "../../website-engine/builder-blueprint/recipes";

const VARIANTS = ["ServiceMatrixCards01", "VehicleServiceMatrix01", "ProductFeatureStack01", "MenuPreviewCards01", "CourseCataloguePreview01"] as const;
type Variant = typeof VARIANTS[number];

const DETAILS: Record<Variant, { category: string; family: string; facts: string[]; assets: string[]; fields: string[] }> = {
  ServiceMatrixCards01: { category: "service", family: "service", facts: ["service list"], assets: [], fields: ["services", "serviceDescriptions", "serviceCtas"] },
  VehicleServiceMatrix01: { category: "service", family: "service", facts: ["vehicle services or inventory"], assets: [], fields: ["serviceItems", "termsCaution", "bookingCta"] },
  ProductFeatureStack01: { category: "product", family: "commerce", facts: ["product features"], assets: [], fields: ["features", "proofNotes", "productCta"] },
  MenuPreviewCards01: { category: "menu", family: "content", facts: ["menu items"], assets: ["food imagery if available"], fields: ["menuItems", "priceCautions", "categoryLabels"] },
  CourseCataloguePreview01: { category: "catalogue", family: "content", facts: ["programs or courses"], assets: [], fields: ["courses", "courseSummaries", "enquiryCta"] },
};

function inputFor(variant: Variant | "UnknownServiceVariant01", options: { itemCount?: number; knownAssets?: string[]; earlyCta?: boolean; conversionGoals?: string[]; family?: string } = {}) {
  const detail = variant === "UnknownServiceVariant01" ? DETAILS.ServiceMatrixCards01 : DETAILS[variant];
  const section = { id: "content", componentId: variant, category: detail.category, family: detail.family, purpose: "Structured offering preview", requiredFacts: detail.facts, requiredAssets: detail.assets, orderHint: 0 };
  return {
    websiteSpec: { id: "spec.content", version: "1", business: { businessName: "Compiler Fixture", family: options.family ?? "professional_services", audience: [], offerings: Array.from({ length: options.itemCount ?? 0 }, (_, index) => `Offering ${index + 1}`), differentiators: [], proofPoints: [], knownFacts: {}, missingFacts: [] }, goals: { primaryGoal: "enquire", secondaryGoals: [], conversionGoals: options.conversionGoals ?? ["enquiry"] }, archetype: "catalogue", sections: [{ id: "content", type: detail.category, purpose: section.purpose, requiredContentFields: detail.fields, requiredAssetIds: detail.assets, editable: true, patternRefs: [`pattern.${detail.category}`], componentVariantRef: variant }], factsUsed: [], missingFacts: [], confidence: 1 },
    compositionResult: { orderedSectionSequence: [section], pageRhythm: { rhythm: "guided", notes: [] }, visualBreathing: { level: "balanced", notes: [] }, sectionWeights: [{ sectionId: "content", weight: "medium", reason: "content" }], mobileStacking: { order: ["content"], stickyActionRecommended: false, notes: ["preserve reading order"] }, densityTransitions: [{ fromSectionId: "content", toSectionId: "next", transition: "steady", notes: [] }], ctaCadence: { earlyCta: options.earlyCta ?? false, finalCta: true, repeatEverySections: 3, notes: [] }, compositionPlan: { mediaContentAlternation: { pattern: detail.assets.length ? "alternating" : "content-led", notes: [] } } },
    componentResult: { recommendedSelections: [{ variant: { id: variant, category: detail.category, family: detail.family, patternIds: [`pattern.${detail.category}`], label: variant, version: "1", metadata: {}, requiredFacts: detail.facts, requiredAssets: detail.assets, editableMappingIntent: { target: "native_builder_component_plan", editableFields: detail.fields, repeatableRegions: [], assetSlots: detail.assets, notes: [] } }, requirements: { componentId: variant, requiredFacts: detail.facts, requiredAssets: detail.assets, missingFacts: [], missingAssets: [] }, editableMappingIntent: { target: "native_builder_component_plan", editableFields: detail.fields, repeatableRegions: [], assetSlots: detail.assets, notes: [] }, rationale: [] }] },
    designResult: { id: "design.content", designLanguage: { name: "Editorial" }, typographyProfile: { headingFamily: "Fraunces", bodyFamily: "Inter" }, colorProfile: { background: "#ffffff", foreground: "#202020", accent: "#8a3e24", muted: "#eee9e3" }, spacingProfile: { sectionY: 88, gutter: 28, gridGap: 22 }, layoutProfile: { maxWidth: "1200px" }, motionProfile: { level: "low", behavior: [] }, responsiveProfile: { mobile: ["stack"], tablet: ["adapt"], desktop: ["expand"] }, themeProfile: { radius: "14px", shadow: "none" }, designTokens: { id: "tokens.content", color: { textSecondary: "#555555", mutedForeground: "#666666" }, typography: {}, spacing: {}, radius: {}, shadow: {} } },
    knownAssets: options.knownAssets ?? [],
  } as never;
}

function seeds(variant: Variant) { return compileSemanticBlueprint(inputFor(variant)).seeds.filter((seed) => seed.sourceSectionId === "content"); }
function adaptiveSeeds(variant: Variant, options: Parameters<typeof inputFor>[1]) { return compileSemanticBlueprint(inputFor(variant, options)).seeds.filter((seed) => seed.sourceSectionId === "content"); }
function signature(variant: Variant) { const local=(id:string|null|undefined)=>id?.replace(/\.content$/,"")??null; return JSON.stringify(seeds(variant).map(seed=>({id:local(seed.id),type:seed.type,parent:local(seed.parentId),children:seed.children?.map(local)??[],display:seed.style?.display,columns:seed.style?.gridTemplateColumns,role:seed.props?.semanticRole}))); }

test("all five exact IDs route through compilers without near-match routing", () => {
  for (const variant of VARIANTS) { const result=compileSemanticBlueprint(inputFor(variant)); const resolved=ComponentVariantCompilerRegistry.resolve(result.sections[0]); assert.equal(resolved?.name,variant); assert.equal(resolved?.compiler.variantId,variant); assert.equal(result.selectedRecipes[0].recipe,variant); }
  const section={...compileSemanticBlueprint(inputFor("ServiceMatrixCards01")).sections[0],componentVariantId:"ServiceMatrixCards01Suffix"}; assert.equal(ComponentVariantCompilerRegistry.resolve(section),undefined);
});

test("all five variants retain distinct meaningful structural signatures",()=>{ assert.equal(new Set(VARIANTS.map(signature)).size,VARIANTS.length); });

test("content density changes Service, Vehicle, and Course hierarchy",()=>{
  const serviceSparse=adaptiveSeeds("ServiceMatrixCards01",{itemCount:3}),serviceBalanced=adaptiveSeeds("ServiceMatrixCards01",{itemCount:6}),serviceDense=adaptiveSeeds("ServiceMatrixCards01",{itemCount:10});
  assert.equal((serviceSparse.find(seed=>seed.type==="section")?.props?.contentDensity as any)?.recommendedLayout,"editorial-feature");
  assert.equal((serviceBalanced.find(seed=>seed.type==="section")?.props?.contentDensity as any)?.recommendedLayout,"balanced-matrix");
  assert.equal((serviceDense.find(seed=>seed.type==="section")?.props?.contentDensity as any)?.recommendedLayout,"grouped-catalogue");
  assert.equal(serviceDense.filter(seed=>String(seed.id).startsWith("column.service-group-")).length,3);
  assert.notEqual(JSON.stringify(serviceSparse),JSON.stringify(serviceDense));

  const vehicleSparse=adaptiveSeeds("VehicleServiceMatrix01",{itemCount:3}),vehicleDense=adaptiveSeeds("VehicleServiceMatrix01",{itemCount:10});
  assert.ok(vehicleSparse.some(seed=>String(seed.id).startsWith("column.service-selector-")));
  assert.equal(vehicleDense.filter(seed=>String(seed.id).startsWith("column.service-group-")).length,3);

  const courseSparse=adaptiveSeeds("CourseCataloguePreview01",{itemCount:3}),courseDense=adaptiveSeeds("CourseCataloguePreview01",{itemCount:10});
  assert.equal(courseSparse.find(seed=>seed.id==="container.course-catalogue.content")?.props?.semanticRole,"featured-programmes");
  assert.equal(courseDense.find(seed=>seed.id==="container.course-catalogue.content")?.props?.semanticRole,"programme-catalogue");
  assert.deepEqual(courseDense.find(seed=>seed.id==="container.programme-list.content")?.style?.gridTemplateColumns,{desktop:"1fr",tablet:"1fr",mobile:"1fr"});
});

test("Product media strategy selects typography, featured, and editorial structures",()=>{
  const none=adaptiveSeeds("ProductFeatureStack01",{}),single=adaptiveSeeds("ProductFeatureStack01",{knownAssets:["product-primary"]}),multiple=adaptiveSeeds("ProductFeatureStack01",{knownAssets:["product-one","product-two","product-three"]});
  assert.equal(none.filter(seed=>seed.type==="image").length,0);
  assert.deepEqual(single.filter(seed=>seed.type==="image").map(seed=>seed.id),["image.featured_product.content"]);
  assert.ok(multiple.filter(seed=>seed.type==="image").length>=3);
  for(const image of multiple.filter(seed=>seed.type==="image")){assert.match(String(image.props?.src),/^\{\{product\./);assert.match(String(image.props?.alt),/\.alt\}\}$/);assert.match(String(image.props?.aiImagePrompt),/\.prompt\}\}$/);}
});

test("CTA cadence changes placement while preserving one editable button",()=>{
  const early=adaptiveSeeds("ServiceMatrixCards01",{earlyCta:true}),late=adaptiveSeeds("ServiceMatrixCards01",{earlyCta:false,conversionGoals:["book consultation"]});
  assert.equal(early.find(seed=>seed.id==="button.services_cta.content")?.parentId,"column.service-intro.content");
  assert.equal(late.find(seed=>seed.id==="button.services_cta.content")?.parentId,"column.service-action.content");
  assert.equal(early.filter(seed=>seed.type==="button").length,1);assert.equal(late.filter(seed=>seed.type==="button").length,1);
});

test("service matrices differ in hierarchy and section-level CTA placement",()=>{
  const service=new Map(seeds("ServiceMatrixCards01").map(seed=>[seed.id,seed])); const vehicle=new Map(seeds("VehicleServiceMatrix01").map(seed=>[seed.id,seed]));
  assert.deepEqual(service.get("container.service-cards.content")?.style?.gridTemplateColumns,{desktop:"repeat(3, minmax(0, 1fr))",tablet:"repeat(2, minmax(0, 1fr))",mobile:"1fr"});
  assert.equal(service.get("button.services_cta.content")?.parentId,"column.service-action.content"); assert.equal(seeds("ServiceMatrixCards01").filter(seed=>seed.type==="button").length,1);
  assert.deepEqual(vehicle.get("container.service-groups.content")?.children,["column.service-group-1.content","column.service-group-2.content"]); assert.equal(vehicle.get("button.booking_cta.content")?.parentId,"column.booking-action.content"); assert.ok(vehicle.has("column.service-caution.content")); assert.equal(seeds("VehicleServiceMatrix01").filter(seed=>seed.type==="button").length,1);
});

test("product is a narrative stack, menu is readable, and catalogue is controlled",()=>{
  const product=new Map(seeds("ProductFeatureStack01").map(seed=>[seed.id,seed])); assert.deepEqual(product.get("column.feature-stage.content")?.children,["container.feature-row-1.content","container.feature-row-2.content","container.feature-row-3.content"]); assert.equal(seeds("ProductFeatureStack01").some(seed=>String(seed.style?.gridTemplateColumns).includes("repeat(")),false); assert.equal(seeds("ProductFeatureStack01").some(seed=>seed.type==="image"),false);
  const menu=new Map(seeds("MenuPreviewCards01").map(seed=>[seed.id,seed])); assert.deepEqual(menu.get("container.menu-categories.content")?.style?.gridTemplateColumns,{desktop:"repeat(2, minmax(0, 1fr))",tablet:"1fr 1fr",mobile:"1fr"}); assert.equal(seeds("MenuPreviewCards01").filter(seed=>seed.type==="button").length,1); assert.equal(seeds("MenuPreviewCards01").filter(seed=>seed.type==="image").length,2);
  const course=new Map(seeds("CourseCataloguePreview01").map(seed=>[seed.id,seed])); assert.deepEqual(course.get("container.programme-list.content")?.style?.gridTemplateColumns,{desktop:"1fr 1fr",tablet:"1fr 1fr",mobile:"1fr"}); assert.equal(course.get("button.enquiry_cta.content")?.parentId,"column.enquiry-action.content");
  for(const variant of VARIANTS) assert.equal(JSON.stringify(seeds(variant)).includes("repeat(4"),false);
});

test("heading hierarchy and semantic placement remain hydration-safe",()=>{
  for(const variant of VARIANTS){const sectionSeeds=seeds(variant);assert.ok(sectionSeeds.filter(seed=>seed.type==="heading"&&seed.props?.level==="h2").length<=1);assert.equal(sectionSeeds.some(seed=>seed.type==="heading"&&seed.props?.level==="h1"),false);assert.ok(sectionSeeds.filter(seed=>seed.type==="heading"&&seed.props?.level!=="h2").every(seed=>["h3","h4"].includes(String(seed.props?.level))));for(const seed of sectionSeeds){const placeholders=JSON.stringify(seed.props).includes("{{");if(placeholders)assert.ok(["heading","text","button","image"].includes(seed.type),`${variant}:${seed.id}`);}}
});

test("all five validate natively and serialize losslessly",()=>{for(const variant of VARIANTS){const result=buildBuilderBlueprint(inputFor(variant));assert.equal(result.validation.valid,true,`${variant}:${JSON.stringify(result.validation.issues)}`);assert.equal(result.nativeCompatibility.compatible,true,variant);const json=JSON.stringify(result.nativeBlueprint);assert.equal(JSON.stringify(JSON.parse(json)),json);}});

test("industry fixtures preserve compiler selection, native nodes, roles, and validation",()=>{
  const fixtures: Array<[string,Variant,string]>=[["automotive","VehicleServiceMatrix01","vehicle-service-matrix"],["food_and_beverage","MenuPreviewCards01","menu-preview"],["education","CourseCataloguePreview01","course-catalogue-preview"],["technology_saas","ProductFeatureStack01","product-feature-stack"],["professional_services","ServiceMatrixCards01","service-matrix"]];
  for(const [family,variant,role] of fixtures){const input=inputFor(variant,{family,itemCount:5,knownAssets:variant==="ProductFeatureStack01"?["product-stage"]:[]});const compiled=compileSemanticBlueprint(input);assert.equal(compiled.selectedRecipes[0].recipe,variant);const result=buildBuilderBlueprint(input);assert.equal(result.validation.valid,true,`${family}:${JSON.stringify(result.validation.issues)}`);assert.equal(result.nativeCompatibility.compatible,true);assert.ok(result.widgets.some(widget=>widget.type==="section"&&widget.props.semanticRole===role));assert.ok(result.widgets.every(widget=>widget.capabilities.canEdit));}
});

test("unknown variants use unchanged legacy fallback and composition order is stable",()=>{const unknown=compileSemanticBlueprint(inputFor("UnknownServiceVariant01"));assert.equal(ComponentVariantCompilerRegistry.resolve(unknown.sections[0]),undefined);assert.equal(unknown.selectedRecipes[0].recipe,RecipeRegistry.resolve(unknown.sections[0]).name);const base=inputFor("ServiceMatrixCards01") as any;base.compositionResult.orderedSectionSequence=[...base.compositionResult.orderedSectionSequence,{...base.compositionResult.orderedSectionSequence[0],id:"second",componentId:"UnknownServiceVariant01",orderHint:1}];const result=compileSemanticBlueprint(base);assert.deepEqual(result.sections.map(section=>section.id),["content","second"]);});
