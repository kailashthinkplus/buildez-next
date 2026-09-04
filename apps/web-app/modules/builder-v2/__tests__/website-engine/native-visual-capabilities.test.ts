import assert from "node:assert/strict";
import test from "node:test";

import {
  NativeVisualCapabilityRegistry,
  ProductionGenerationCapabilityCatalog,
} from "../../website-engine/native-visual-capabilities";
import { selectVisualCapability } from "../../website-engine/components/visualCapabilitySelection";
import { runComponentEngine } from "../../website-engine/components/ComponentEngine";
import { compileNativeVisualCapability } from "../../website-engine/builder-blueprint/nativeVisualCapabilityCompiler";
import { buildWidgetBlueprints } from "../../website-engine/builder-blueprint/widgetBlueprint";
import { buildNativeWidgetIntents } from "../../website-engine/builder-blueprint/nativeWidgetAdapter";
import type { RecipeContext } from "../../website-engine/builder-blueprint/recipes";

const section = (id: string, purpose: string, category: string, patternId: string) => ({
  id, purpose, category, patternId, mediaRole: /hero|gallery|project/.test(patternId) ? "dominant" as const : "supporting" as const,
});

function context(): RecipeContext {
  return {
    input: {
      designResult: {
        id: "design.test",
        designLanguage: { name: "Editorial" },
        spacingProfile: { sectionY: 88, gutter: 24, gridGap: 20 },
        colorProfile: { background: "#fff", foreground: "#111", accent: "#765432", muted: "#f4efe7" },
        themeProfile: { radius: 16, shadow: "none" },
      },
    } as unknown as RecipeContext["input"],
    section: { id: "section.lifestyle_gallery.1", type: "gallery", purpose: "Lifestyle exploration", patternIds: ["lifestyle_gallery"], order: 0 },
    sectionNodeId: "section.section_lifestyle_gallery_1",
    key: "section_lifestyle_gallery_1",
  };
}

test("native capability inventory is derived from registered editable widget contracts", () => {
  const inventory = NativeVisualCapabilityRegistry.all();
  for (const type of ["hero", "cardGrid", "featureGrid", "offerGrid", "gallery", "masonryGallery", "galleryLightbox", "carousel", "testimonials", "tabs", "accordion", "faq", "beforeAfter", "video", "statsCounter", "logoCloud", "timeline", "leadForm", "contactForm", "smartHeader", "smartFooter", "floatingWhatsApp"]) {
    const capability = inventory.find((entry) => entry.widgetType === type);
    assert.ok(capability, `missing ${type}`);
    assert.equal(capability.registered, true);
    assert.equal(capability.native, true);
  }
  assert.equal(NativeVisualCapabilityRegistry.get("embed")?.runtimeSupported, false);
  assert.equal(NativeVisualCapabilityRegistry.get("popupModal")?.canvasSupported, false);
});

test("production catalog exposes only capabilities that pass every generation gate", () => {
  assert.ok(ProductionGenerationCapabilityCatalog.all().length >= 12);
  for (const entry of ProductionGenerationCapabilityCatalog.all()) {
    const verified = NativeVisualCapabilityRegistry.get(entry.widgetType);
    assert.ok(verified);
    assert.equal(verified.registered && verified.native && verified.editable && verified.inspectorSupported && verified.responsiveSupported && verified.runtimeSupported && verified.canvasSupported && verified.serializable, true, entry.widgetType);
  }
  assert.equal(ProductionGenerationCapabilityCatalog.has("embed"), false);
  assert.equal(ProductionGenerationCapabilityCatalog.has("popupModal"), false);
  assert.equal(ProductionGenerationCapabilityCatalog.has("countdown"), false);
});

test("purpose-aware capability selection uses appropriate native interactions", () => {
  assert.equal(selectVisualCapability(section("faq", "Handle buyer objections", "FAQ", "faq_objection_handling")).selectedWidgetType, "faq");
  assert.equal(selectVisualCapability(section("gallery", "Lifestyle exploration", "gallery", "lifestyle_gallery")).selectedWidgetType, "galleryLightbox");
  assert.equal(selectVisualCapability(section("project", "Property discovery", "portfolio", "project_showcase")).selectedWidgetType, "carousel");
  assert.equal(selectVisualCapability(section("footer", "Trust closure", "footer", "footer_trust_closure")).selectedWidgetType, "smartFooter");
});

test("native adapter preserves premium node type, Inspector metadata, responsiveness, and serialization", () => {
  const recipeContext = context();
  const seeds = compileNativeVisualCapability(recipeContext, "galleryLightbox", "fullBleed");
  assert.ok(seeds);
  assert.equal(seeds[1].type, "galleryLightbox");
  assert.equal(seeds[0].props?.container, "full");
  assert.deepEqual(seeds[0].props?.layoutIntent, { containerMode: "fullBleed" });

  const widgets = buildWidgetBlueprints(recipeContext.input, seeds);
  const premium = widgets.find((widget) => widget.type === "galleryLightbox");
  assert.ok(premium);
  assert.ok(premium.propertyDefinitions.some((property) => property.propertyPath === "props.items"));
  assert.ok(premium.responsiveBindings.length > 0);
  assert.equal(buildNativeWidgetIntents(widgets).some((intent) => intent.widgetType === "galleryLightbox"), true);

  const reloaded = JSON.parse(JSON.stringify(widgets));
  const restored = reloaded.find((widget: { type: string }) => widget.type === "galleryLightbox");
  assert.equal(restored.type, "galleryLightbox");
  assert.deepEqual(restored.props, premium.props);
  assert.deepEqual(restored.style, premium.style);
  assert.deepEqual(restored.responsiveBindings, JSON.parse(JSON.stringify(premium.responsiveBindings)));
});

test("Sanjeevini seed 104729 activates diverse supported native capabilities deterministically", () => {
  const narrativeSections = [
    section("section.editorial_hero.6", "Editorial orientation hero", "hero", "editorial_hero"),
    section("section.footer_trust_closure.4", "Footer trust closure", "footer", "footer_trust_closure"),
    section("section.trust_band.5", "Inline trust band", "proof", "trust_band"),
    section("section.project_showcase.9", "Property project discovery", "portfolio", "project_showcase"),
    section("section.lifestyle_gallery.10", "Lifestyle exploration", "gallery", "lifestyle_gallery"),
    section("section.locality_map_narrative.8", "Locality journey narrative", "process", "locality_map_narrative"),
    section("section.faq_objection_handling.7", "Buyer objection handling", "FAQ", "faq_objection_handling"),
    section("section.contact_lead_capture.1", "Consultation lead capture", "form", "contact_lead_capture"),
    section("section.sticky_mobile_cta.2", "Sticky mobile CTA", "sticky-action", "sticky_mobile_cta"),
    section("section.final_conversion_block.3", "Final conversion action", "conversion-block", "final_conversion_block"),
  ];
  const first = runComponentEngine({ narrativeSections, explorationSeed: 104729 }).data;
  const second = runComponentEngine({ narrativeSections, explorationSeed: 104729 }).data;
  assert.deepEqual(first.visualCapabilityDiagnostics, second.visualCapabilityDiagnostics);
  const diagnostics = first.visualCapabilityDiagnostics ?? [];
  assert.equal(diagnostics.length, 10);
  assert.equal(diagnostics.every((item) => item.compilerCoverage === "native-adapter" && item.selectedWidgetType), true);
  assert.ok(new Set(diagnostics.map((item) => item.selectedWidgetType)).size >= 3);
  assert.ok(diagnostics.some((item) => item.interactionLevel === "interactive"));
  assert.ok(diagnostics.filter((item) => item.containerMode === "fullWidth" || item.containerMode === "fullBleed").length >= 2);
});
