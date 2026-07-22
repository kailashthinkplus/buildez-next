import assert from "node:assert/strict";
import test from "node:test";

import { buildBuilderBlueprint } from "../../website-engine/builder-blueprint/BuilderBlueprintEngine";
import { compileSemanticBlueprint } from "../../website-engine/builder-blueprint/SemanticBlueprintCompiler";
import { compileCreativeDirection } from "../../website-engine/creative-director";
import { LayoutArchetypeRegistry } from "../../website-engine/layout-archetypes";
import { createGoldenWebsiteCase } from "../../website-engine/golden-websites";
import { goldenWebsiteInput } from "../../website-engine/golden-websites/framework/GoldenWebsiteRunner";

test("all ten premium archetypes publish complete immutable contracts", () => {
  const archetypes = LayoutArchetypeRegistry.all();
  assert.equal(archetypes.length, 10);
  assert.deepEqual(LayoutArchetypeRegistry.ids(), ["editorialSplitHero","cinematicFullBleedHero","asymmetricStorySection","bentoShowcase","imageStoryNarrative","floatingProofSection","galleryJourney","quoteInterlude","framedCTA","architecturalProjectShowcase"]);
  for (const item of archetypes) {
    assert.ok(item.semanticPurpose.length > 20, item.id);
    assert.ok(item.allowedWidgetAnatomy.includes("section"), item.id);
    assert.ok(item.allowedWidgetAnatomy.includes("container"), item.id);
    assert.ok(item.layoutStructure.length > 15, item.id);
    assert.ok(item.responsiveTransformation.length > 15, item.id);
    assert.ok(item.spacingBehavior.length > 10, item.id);
    assert.ok(item.mediaRole.length > 10, item.id);
    assert.ok(item.typographyIntent.length > 10, item.id);
    assert.ok(item.supportedIndustries.length > 0, item.id);
    assert.ok(Object.isFrozen(item), item.id);
  }
});

test("ArtDirectionBrief and section intent select archetypes before fallback", () => {
  const base = goldenWebsiteInput(createGoldenWebsiteCase("phase-two-selection", "real_estate"));
  const brief = compileCreativeDirection(base).artDirectionBrief;
  const sections = [
    ["opening", "hero", "Cinematic brand opening"], ["story", "about", "Founder story"], ["offers", "service", "Service showcase"],
    ["process", "process", "Customer journey"], ["proof", "proof", "Trusted outcomes"], ["gallery", "gallery", "Lifestyle gallery"],
    ["quote", "testimonial", "Customer quote"], ["close", "conversion-block", "Final CTA"], ["projects", "portfolio", "Architectural projects"],
  ] as const;
  const input = { ...base, artDirectionBrief: { ...brief, compositionStyle: "cinematic" as const, blueprintStrategy: { ...brief.blueprintStrategy, mediaTreatment: "immersive" as const } }, websiteSpec: { ...base.websiteSpec!, sections: sections.map(([id,type,purpose]) => ({ id, type, purpose, requiredContentFields: [], requiredAssetIds: [], editable: true })) }, compositionResult: undefined, componentResult: undefined };
  const result = compileSemanticBlueprint(input as never);
  assert.deepEqual(result.selectedArchetypes.map((item) => item.archetype), ["cinematicFullBleedHero","asymmetricStorySection","bentoShowcase","imageStoryNarrative","floatingProofSection","galleryJourney","quoteInterlude","framedCTA","architecturalProjectShowcase"]);
  assert.ok(result.selectedRecipes.every((item) => item.recipe.startsWith("archetype:")));
});

test("archetype output remains native, editable, responsive, inspectable, and serializable", () => {
  const base = goldenWebsiteInput(createGoldenWebsiteCase("phase-two-native", "real_estate"));
  const brief = compileCreativeDirection(base).artDirectionBrief;
  const input = { ...base, artDirectionBrief: brief, websiteSpec: { ...base.websiteSpec!, sections: [{ id:"story",type:"about",purpose:"Studio story",requiredContentFields:[],requiredAssetIds:[],editable:true },{ id:"work",type:"portfolio",purpose:"Architectural project showcase",requiredContentFields:[],requiredAssetIds:[],editable:true },{ id:"close",type:"conversion-block",purpose:"Final CTA",requiredContentFields:[],requiredAssetIds:[],editable:true }] }, compositionResult: undefined, componentResult: undefined };
  const blueprint = buildBuilderBlueprint(input as never);
  assert.equal(blueprint.validation.valid, true, blueprint.validation.issues.map((item) => item.message).join("; "));
  assert.equal(blueprint.nativeCompatibility.compatible, true);
  assert.ok(blueprint.widgets.every((widget) => widget.capabilities.canEdit));
  assert.ok(blueprint.widgets.every((widget) => widget.inspector.tabs.includes("responsive")));
  assert.ok(blueprint.widgets.every((widget) => widget.propertyBindings.length > 0));
  assert.equal(Object.keys(blueprint.nativeBlueprint.nodes).length, blueprint.widgets.length);
  assert.ok(blueprint.responsiveBindings.length > 0);
});

test("legacy recipes remain the fallback without an explicit ArtDirectionBrief", () => {
  const base = goldenWebsiteInput(createGoldenWebsiteCase("phase-two-fallback", "professional_services"));
  const input = { ...base, artDirectionBrief: undefined, websiteSpec: { ...base.websiteSpec!, sections: [{ id:"faq",type:"faq",purpose:"Frequently asked questions",requiredContentFields:[],requiredAssetIds:[],editable:true }] }, compositionResult: undefined, componentResult: undefined };
  const result = compileSemanticBlueprint(input as never);
  assert.deepEqual(result.selectedArchetypes, []);
  assert.equal(result.selectedRecipes[0].recipe, "faq");
});

