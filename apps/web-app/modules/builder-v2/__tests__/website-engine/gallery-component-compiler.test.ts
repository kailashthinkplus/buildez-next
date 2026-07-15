import assert from "node:assert/strict";
import test from "node:test";

import { applyCreativeEnrichment, type Enrichment } from "../../ai-v10/creative/runV10CreativeEnrichment";
import { assertSemanticHydrationComplete, collectCreativeNodeIds } from "../../ai-v10/creative/semanticHydrationValidation";
import { buildBuilderBlueprint } from "../../website-engine/builder-blueprint/BuilderBlueprintEngine";
import { ComponentVariantCompilerRegistry } from "../../website-engine/builder-blueprint/component-recipes";
import { compileSemanticBlueprint } from "../../website-engine/builder-blueprint/SemanticBlueprintCompiler";
import { RecipeRegistry } from "../../website-engine/builder-blueprint/recipes";

const GALLERY_VARIANTS = ["GalleryMasonryEditorial01", "GalleryLifestyleRail01"] as const;

function galleryInput(componentVariantId: typeof GALLERY_VARIANTS[number] | "GalleryUnknown01") {
  const sequence = [{ id: "gallery", componentId: componentVariantId, category: "gallery", family: "gallery", purpose: "Visual story", requiredFacts: [], requiredAssets: ["gallery images"], orderHint: 0 }];
  return {
    websiteSpec: {
      id: "spec.gallery", version: "1", business: { businessName: "Gallery Fixture", family: "hospitality", audience: [], offerings: [], differentiators: [], proofPoints: [], knownFacts: {}, missingFacts: [], sourceNotes: [] },
      goals: { primaryGoal: "explore", secondaryGoals: [], conversionGoals: [] }, archetype: "brochure",
      sections: [{ id: "gallery", type: "gallery", purpose: "Visual story", requiredContentFields: [], requiredAssetIds: ["gallery images"], editable: true, patternRefs: ["lifestyle_gallery"], componentVariantRef: componentVariantId }],
      factsUsed: [], missingFacts: [], confidence: 1,
    },
    compositionResult: {
      orderedSectionSequence: sequence,
      pageRhythm: { rhythm: "editorial", notes: ["visual sequence"] }, visualBreathing: { level: "airy", notes: ["media breathing"] },
      sectionWeights: [{ sectionId: "gallery", weight: "heavy", reason: "media-led" }], mobileStacking: { order: ["gallery"], stickyActionRecommended: false, notes: ["preserve gallery order"] },
      compositionPlan: { mediaContentAlternation: { pattern: "media-led", notes: ["gallery"] } },
    },
    componentResult: { recommendedSelections: [{ variant: { id: componentVariantId, category: "gallery", family: "gallery", patternIds: ["lifestyle_gallery"], label: "Gallery", version: "1", metadata: {}, requiredFacts: [], requiredAssets: ["gallery images"], editableMappingIntent: {} } }] },
    designResult: {
      id: "design.gallery", designLanguage: { name: "Editorial" }, typographyProfile: { headingFamily: "Cormorant Garamond", bodyFamily: "Inter" },
      colorProfile: { background: "#faf8f4", foreground: "#211e1a", accent: "#8b5138", muted: "#e9e2d8" }, spacingProfile: { sectionY: 96, gutter: 28, gridGap: 22 },
      layoutProfile: { maxWidth: "1240px" }, motionProfile: { level: "low", behavior: ["reveal"] }, responsiveProfile: { mobile: ["swipe-safe"], tablet: ["adapt"], desktop: ["expand"] },
      themeProfile: { radius: "16px", shadow: "none" }, designTokens: { id: "tokens.gallery", color: {}, typography: {}, spacing: {}, radius: {}, shadow: {} },
    },
    mediaStrategy: {
      assetReadiness: { score: .5, knownAssetCount: 0, missingRequiredCount: 1, requiredCount: 1, reasons: [] }, substitutionPolicy: { defaultAction: "provider_candidate", byRequirementId: {}, notes: [] },
      missingAssets: ["gallery images"],
    },
  } as never;
}

function gallerySeeds(variant: typeof GALLERY_VARIANTS[number]) {
  return compileSemanticBlueprint(galleryInput(variant)).seeds.filter((seed) => seed.sourceSectionId === "gallery");
}

function signature(variant: typeof GALLERY_VARIANTS[number]) {
  const local = (id: string | null | undefined) => id?.replace(/\.gallery$/, "") ?? null;
  return JSON.stringify(gallerySeeds(variant).map((seed) => ({ id: local(seed.id), type: seed.type, parent: local(seed.parentId), children: seed.children?.map(local) ?? [], display: seed.style?.display, columns: seed.style?.gridTemplateColumns, overflow: seed.style?.overflow, role: seed.props?.semanticRole })));
}

test("every catalogued Gallery ID routes to its exact native compiler", () => {
  for (const variant of GALLERY_VARIANTS) {
    const result = compileSemanticBlueprint(galleryInput(variant));
    const resolved = ComponentVariantCompilerRegistry.resolve(result.sections[0]);
    assert.equal(resolved?.name, variant);
    assert.equal(resolved?.compiler.variantId, variant);
    assert.equal(result.selectedRecipes[0].recipe, variant);
  }
  assert.equal(ComponentVariantCompilerRegistry.resolve({ ...compileSemanticBlueprint(galleryInput("GalleryMasonryEditorial01")).sections[0], componentVariantId: "GalleryMasonryEditorial01Suffix" }), undefined);
});

test("masonry and rail lock genuinely different hierarchy and responsive behavior", () => {
  assert.notEqual(signature("GalleryMasonryEditorial01"), signature("GalleryLifestyleRail01"));
  const masonry = new Map(gallerySeeds("GalleryMasonryEditorial01").map((seed) => [seed.id, seed]));
  assert.deepEqual(masonry.get("container.masonry.gallery")?.children, ["column.masonry-lane-1.gallery", "column.masonry-lane-2.gallery", "column.masonry-lane-3.gallery"]);
  assert.deepEqual(masonry.get("container.masonry.gallery")?.style?.gridTemplateColumns, { desktop: "repeat(3, minmax(0, 1fr))", tablet: "repeat(2, minmax(0, 1fr))", mobile: "1fr" });
  assert.equal(masonry.get("image.item_1.gallery")?.parentId, "container.masonry-item-1.gallery");
  assert.deepEqual(masonry.get("column.masonry-lane-2.gallery")?.style?.paddingTop, { desktop: 36, tablet: 28, mobile: 0 });

  const rail = new Map(gallerySeeds("GalleryLifestyleRail01").map((seed) => [seed.id, seed]));
  assert.equal(rail.get("column.rail-viewport.gallery")?.style?.overflow, "auto");
  assert.deepEqual(rail.get("container.rail-track.gallery")?.style?.gridTemplateColumns, { desktop: "repeat(4, minmax(250px, 1fr))", tablet: "repeat(4, minmax(230px, 1fr))", mobile: "repeat(4, 82%)" });
  assert.equal(rail.get("image.item_1.gallery")?.parentId, "column.rail-item-1.gallery");
  assert.equal(rail.get("container.lifestyle-rail.gallery")?.props?.mobileInteraction, "horizontal-swipe");
});

test("Gallery compilers emit hydratable image, alt, prompt, caption, and heading placeholders", () => {
  for (const variant of GALLERY_VARIANTS) {
    const result = buildBuilderBlueprint(galleryInput(variant));
    const images = result.widgets.filter((widget) => widget.sourceComponentVariantId === variant && widget.type === "image");
    assert.ok(images.length >= 4);
    for (const image of images) {
      assert.match(String(image.props.src), /^\{\{gallery\.item_\d+\}\}$/);
      assert.match(String(image.props.alt), /^\{\{gallery\.item_\d+\.alt\}\}$/);
      assert.match(String(image.props.aiImagePrompt), /^\{\{gallery\.item_\d+\.prompt\}\}$/);
    }
    assert.ok(result.widgets.some((widget) => widget.sourceComponentVariantId === variant && widget.type === "text" && /_caption\}\}/.test(String(widget.props.text))));
  }
});

test("Gallery Blueprints validate, map natively, hydrate, and serialize", () => {
  for (const variant of GALLERY_VARIANTS) {
    const result = buildBuilderBlueprint(galleryInput(variant));
    assert.equal(result.validation.valid, true, JSON.stringify(result.validation.issues));
    assert.equal(result.nativeCompatibility.compatible, true);
    const enrichment: Enrichment = { nodes: {} };
    for (const nodeId of collectCreativeNodeIds(result.nativeBlueprint)) {
      const node = result.nativeBlueprint.nodes[nodeId];
      enrichment.nodes![nodeId] = node.type === "image"
        ? { props: { src: "", alt: "Hydrated gallery image", aiImagePrompt: "Editorial gallery image appropriate to supplied business context" } }
        : { props: { text: node.type === "heading" ? "A considered visual story" : "Hydrated gallery content" } };
    }
    const hydrated = applyCreativeEnrichment(result.nativeBlueprint, enrichment);
    assertSemanticHydrationComplete(hydrated);
    const serialized = JSON.stringify(hydrated);
    assert.equal(JSON.stringify(JSON.parse(serialized)), serialized);
  }
});

test("unknown Gallery variants retain legacy GalleryRecipe fallback", () => {
  const result = compileSemanticBlueprint(galleryInput("GalleryUnknown01"));
  assert.equal(ComponentVariantCompilerRegistry.resolve(result.sections[0]), undefined);
  assert.equal(result.selectedRecipes[0].recipe, RecipeRegistry.resolve(result.sections[0]).name);
});
