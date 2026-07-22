import assert from "node:assert/strict";
import test from "node:test";

import { buildBuilderBlueprint } from "../../website-engine/builder-blueprint/BuilderBlueprintEngine";
import { runComponentEngine } from "../../website-engine/components";
import { runCompositionEngine } from "../../website-engine/composition";
import { compileCreativeDirection } from "../../website-engine/creative-director";
import { createGoldenWebsiteCase } from "../../website-engine/golden-websites";
import { goldenWebsiteInput } from "../../website-engine/golden-websites/framework/GoldenWebsiteRunner";

test("Creative Director emits an immutable executable ArtDirectionBrief", () => {
  const plan = compileCreativeDirection(goldenWebsiteInput(createGoldenWebsiteCase("phase-one-luxury", "real_estate")));
  assert.equal(plan.executable, true);
  assert.equal(plan.metadataOnly, false);
  assert.equal(plan.artDirectionBrief.version, "1");
  assert.equal(plan.artDirectionBrief.compositionStyle, "luxury");
  assert.equal(plan.artDirectionBrief.blueprintStrategy.headingScale, "dramatic");
  assert.ok(Object.isFrozen(plan.artDirectionBrief));
  assert.ok(Object.isFrozen(plan.artDirectionBrief.componentStrategy.preferredTags));
});

test("ComponentEngine consumes art direction without changing legacy behavior", () => {
  const input = goldenWebsiteInput(createGoldenWebsiteCase("phase-one-components", "real_estate"));
  const brief = compileCreativeDirection(input).artDirectionBrief;
  const legacy = runComponentEngine().data;
  const directed = runComponentEngine({ artDirectionBrief: brief }).data;
  const legacyGallery = legacy.rankedCandidates.find((item) => item.variant.id === "GalleryMasonryEditorial01")!;
  const directedGallery = directed.rankedCandidates.find((item) => item.variant.id === "GalleryMasonryEditorial01")!;
  assert.notEqual(directedGallery.score.designFit, legacyGallery.score.designFit);
  assert.ok(directed.explanations.some((item) => item.includes(brief.id)));
  assert.doesNotThrow(() => runComponentEngine());
});

test("CompositionEngine turns art direction into executable rhythm metadata", () => {
  const input = goldenWebsiteInput(createGoldenWebsiteCase("phase-one-composition", "real_estate"));
  const brief = compileCreativeDirection(input).artDirectionBrief;
  const result = runCompositionEngine({ componentResult: input.componentResult, artDirectionBrief: brief }).data;
  assert.equal(result.pageRhythm.rhythm, brief.compositionStrategy.rhythm);
  assert.equal(result.visualBreathing.level, brief.compositionStrategy.breathing);
  assert.equal(result.compositionPlan.mediaContentAlternation.pattern, brief.compositionStrategy.mediaRhythm);
  assert.ok(result.explanations.some((item) => item.includes(brief.id)));
});

test("BuilderBlueprintInput carries art direction into recipe styles", () => {
  const input = goldenWebsiteInput(createGoldenWebsiteCase("phase-one-blueprint", "real_estate"));
  const brief = compileCreativeDirection(input).artDirectionBrief;
  const directed = buildBuilderBlueprint({ ...input, artDirectionBrief: brief });
  const legacy = buildBuilderBlueprint(input);
  const directedHeading = directed.widgets.find((widget) => widget.type === "heading" && widget.regenerationMetadata.sectionRole === "hero")!;
  const legacyHeading = legacy.widgets.find((widget) => widget.id === directedHeading.id)!;
  assert.notDeepEqual(directedHeading.style.fontSize, legacyHeading.style.fontSize);
  assert.equal((directedHeading.style.fontSize as Record<string, number>).desktop, 80);
});

