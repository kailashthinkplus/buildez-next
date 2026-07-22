import assert from "node:assert/strict";
import test from "node:test";

import { runComponentEngine } from "../../website-engine/components";
import { compileCreativeDirection } from "../../website-engine/creative-director";
import { createGoldenWebsiteCase } from "../../website-engine/golden-websites";
import { goldenWebsiteInput } from "../../website-engine/golden-websites/framework/GoldenWebsiteRunner";

function input(seed: string | number = "stable-seed") {
  const golden = goldenWebsiteInput(createGoldenWebsiteCase("phase-three", "real_estate"));
  const artDirectionBrief = compileCreativeDirection(golden).artDirectionBrief;
  return {
    artDirectionBrief,
    explorationSeed: seed,
    businessProfile: { id:"business.phase-three",businessFamily:"real_estate",conversionGoals:["enquiry"] } as never,
    narrativeSections: [
      { id:"hero",purpose:"Architectural opening promise",category:"hero",mediaRole:"dominant" as const },
      { id:"offers",purpose:"Residential offer showcase",category:"service",mediaRole:"supporting" as const },
      { id:"projects",purpose:"Architectural project portfolio",category:"portfolio",mediaRole:"dominant" as const },
      { id:"proof",purpose:"Developer proof and outcomes",category:"proof",mediaRole:"none" as const },
      { id:"close",purpose:"Focused enquiry conversion",category:"conversion-block",mediaRole:"none" as const },
    ],
  };
}

test("section-scoped candidates expose the complete Phase 3 score", () => {
  const result = runComponentEngine(input()).data;
  assert.equal(result.sectionCandidates?.length, 5);
  for (const group of result.sectionCandidates ?? []) {
    assert.ok(group.candidates.length > 0, group.section.id);
    const score = group.candidates[0].score;
    for (const key of ["purposeFit","geometryCompatibility","archetypeCompatibility","visualVariety","brandFit","mediaRoleCompatibility","repetitionPenalty","silhouetteDiversity","exploration","overall"] as const) assert.equal(typeof score[key], "number", `${group.section.id}:${key}`);
    assert.equal(group.candidates[0].section.id, group.section.id);
  }
});

test("page-level selection avoids repeated card-grid silhouettes", () => {
  const selections = runComponentEngine(input()).data.sectionSelections ?? [];
  assert.equal(selections.length, 5);
  for (let index=2;index<selections.length;index++) assert.notDeepEqual(selections.slice(index-2,index+1).map((item)=>item.silhouette),["card-grid","card-grid","card-grid"]);
  assert.ok(new Set(selections.map((item)=>item.silhouette)).size >= 4);
});

test("archetype compatibility and compiler coverage are explicit", () => {
  const result=runComponentEngine(input()).data;
  const projectCandidates=result.sectionCandidates?.find((group)=>group.section.id==="projects")?.candidates??[];
  const project=projectCandidates.find((item)=>item.candidate.variant.id==="ProjectShowcaseEditorial01");
  assert.equal(project?.layoutArchetypeId,"architecturalProjectShowcase");
  assert.equal(project?.compilerCoverage,"archetype-fallback");
  assert.match(project?.fallbackReason??"",/no dedicated compiler/);
  assert.ok((result.compilerCoverage??[]).every((item)=>item.coverage!==undefined));
});

test("exploration is reproducible for one seed and varies deterministically across seeds", () => {
  const first=runComponentEngine(input("seed-a")).data,second=runComponentEngine(input("seed-a")).data,other=runComponentEngine(input("seed-b")).data;
  const signature=(result:typeof first)=>result.sectionSelections?.map((item)=>`${item.section.id}:${item.selection.variant.id}:${item.score.exploration}`);
  assert.deepEqual(signature(first),signature(second));
  assert.notDeepEqual(signature(first),signature(other));
  assert.equal(first.explorationSeed,"seed-a");
  assert.equal(other.explorationSeed,"seed-b");
});

function roleRecoveryInput(seed = 104729) {
  return {
    ...input(seed),
    narrativeSections: [
      { id:"section.editorial_hero.1",patternId:"editorial_hero",purpose:"Editorial Hero fits orientation",category:"hero",mediaRole:"dominant" as const },
      { id:"section.sticky_mobile_cta.2",patternId:"sticky_mobile_cta",purpose:"Sticky Mobile CTA fits conversion",category:"conversion-block",mediaRole:"supporting" as const },
      { id:"section.footer_trust_closure.3",patternId:"footer_trust_closure",purpose:"Footer Trust Closure fits closure",category:"proof",mediaRole:"supporting" as const },
      { id:"section.trust_band.4",patternId:"trust_band",purpose:"Trust Band fits trust-building",category:"proof",mediaRole:"supporting" as const },
      { id:"section.contact_lead_capture.5",patternId:"contact_lead_capture",purpose:"Contact Lead Capture fits conversion",category:"conversion-block",mediaRole:"supporting" as const },
    ],
  };
}

test("hard semantic roles prevent sticky, footer, and trust anatomy collapse", () => {
  const result=runComponentEngine(roleRecoveryInput()).data;
  const byId=new Map((result.sectionSelections??[]).map((item)=>[item.section.id,item]));
  assert.equal(byId.get("section.editorial_hero.1")?.selection.variant.id,"HeroEditorialSplit01");
  assert.equal(byId.get("section.editorial_hero.1")?.layoutArchetypeId,"editorialSplitHero");
  assert.equal(byId.get("section.sticky_mobile_cta.2")?.selection.variant.id,"StickyMobileCTA01");
  assert.equal(byId.get("section.sticky_mobile_cta.2")?.layoutArchetypeId,"framedCTA");
  assert.equal(byId.get("section.footer_trust_closure.3")?.selection.variant.id,"FooterTrustClosure01");
  assert.equal(byId.get("section.footer_trust_closure.3")?.layoutArchetypeId,"framedCTA");
  assert.equal(byId.get("section.trust_band.4")?.selection.variant.id,"TrustBandInline01");
  assert.equal(byId.get("section.trust_band.4")?.layoutArchetypeId,"quoteInterlude");
  const diagnostics=result.anatomyDiagnostics??[];
  assert.equal(new Set(diagnostics.map((item)=>item.anatomyFingerprint)).size,diagnostics.length);
});

test("intentional framed motif reuse remains allowed when semantic placement differs", () => {
  const result=runComponentEngine(roleRecoveryInput()).data;
  const diagnostics=result.anatomyDiagnostics??[];
  const footer=diagnostics.find((item)=>item.sectionId.includes("footer_trust"))!;
  const contact=diagnostics.find((item)=>item.sectionId.includes("contact_lead"))!;
  assert.equal(footer.selectedArchetype,"framedCTA");
  assert.equal(contact.selectedArchetype,"framedCTA");
  assert.notEqual(footer.anatomyFingerprint,contact.anatomyFingerprint);
});

test("semantic anatomy selection is reproducible for the fixed seed", () => {
  const first=runComponentEngine(roleRecoveryInput()).data,second=runComponentEngine(roleRecoveryInput()).data;
  assert.deepEqual(first.anatomyDiagnostics,second.anatomyDiagnostics);
  assert.deepEqual(first.sectionSelections,second.sectionSelections);
});
