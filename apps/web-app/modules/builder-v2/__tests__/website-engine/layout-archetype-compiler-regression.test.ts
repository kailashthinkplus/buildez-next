import assert from "node:assert/strict";
import test from "node:test";

import { compileSemanticBlueprint } from "../../website-engine/builder-blueprint/SemanticBlueprintCompiler";
import { compileCreativeDirection } from "../../website-engine/creative-director";
import { createGoldenWebsiteCase } from "../../website-engine/golden-websites";
import { goldenWebsiteInput } from "../../website-engine/golden-websites/framework/GoldenWebsiteRunner";

test("exact component compilers retain precedence over archetypes", () => {
  const base = goldenWebsiteInput(createGoldenWebsiteCase("phase-two-component-precedence", "real_estate"));
  const brief = compileCreativeDirection(base).artDirectionBrief;
  const result = compileSemanticBlueprint({ ...base, artDirectionBrief: brief });
  const exact = result.sections.filter((section) => section.componentVariantId === "HeroEditorialSplit01");
  if (exact.length) {
    assert.ok(result.selectedRecipes.some((item) => item.sectionId === exact[0].id && item.recipe === "HeroEditorialSplit01"));
    assert.ok(!result.selectedArchetypes.some((item) => item.sectionId === exact[0].id));
  }
});

test("archetype compilation is deterministic and structurally varied", () => {
  const base = goldenWebsiteInput(createGoldenWebsiteCase("phase-two-determinism", "architecture_interiors"));
  const brief = compileCreativeDirection(base).artDirectionBrief;
  const sections = [{ id:"story",type:"about",purpose:"Studio story",requiredContentFields:[],requiredAssetIds:[],editable:true },{ id:"showcase",type:"service",purpose:"Design service showcase",requiredContentFields:[],requiredAssetIds:[],editable:true },{ id:"projects",type:"portfolio",purpose:"Architectural project showcase",requiredContentFields:[],requiredAssetIds:[],editable:true }];
  const input = { ...base, artDirectionBrief: brief, websiteSpec: { ...base.websiteSpec!, sections }, compositionResult: undefined, componentResult: undefined };
  const first=compileSemanticBlueprint(input as never),second=compileSemanticBlueprint(input as never);
  assert.deepEqual(first.seeds,second.seeds);
  const signatures=first.selectedArchetypes.map(({sectionId,archetype})=>({archetype,count:first.seeds.filter((seed)=>seed.sourceSectionId===sectionId).length,grid:first.seeds.filter((seed)=>seed.sourceSectionId===sectionId).map((seed)=>seed.style?.gridTemplateColumns).filter(Boolean)}));
  assert.equal(new Set(signatures.map((item)=>JSON.stringify(item))).size,3);
});

