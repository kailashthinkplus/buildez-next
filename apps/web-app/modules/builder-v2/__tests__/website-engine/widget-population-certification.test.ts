import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe,it } from "node:test";

type Artifact={passed:boolean;distinctWidgetSequences:number;noFixtureSpecificLogic:boolean;noFakeVerifiedFacts:boolean;contexts:Array<{businessFamily:string;selectedWidgetSequence:string[];fullyPopulatedCount:number;missingRequiredMediaCount:number;defaultLeakCount:number;unsafeFactCount:number;industryFitFailures:number;roleFitFailures:number;duplicateCopyCount:number;terminologyLeakCount:number;deterministic:boolean;passed:boolean}>};
const load=()=>JSON.parse(readFileSync(join(process.cwd(),"test-results/ai-v10-forensic/cross-industry-population-certification.json"),"utf8")) as Artifact;

describe("RC-3.5D cross-industry population certification",()=>{
  it("certifies eight distinct deterministic contract/gate sequences",()=>{const artifact=load();assert.equal(artifact.contexts.length,8);assert.equal(artifact.distinctWidgetSequences,8);assert.equal(artifact.passed,true);assert.ok(artifact.contexts.every((context)=>context.deterministic&&context.passed));});
  it("has no missing media, defaults, unsafe facts, fit failures, duplicate copy, or terminology leaks",()=>{for(const context of load().contexts){assert.equal(context.missingRequiredMediaCount,0,context.businessFamily);assert.equal(context.defaultLeakCount,0,context.businessFamily);assert.equal(context.unsafeFactCount,0,context.businessFamily);assert.equal(context.industryFitFailures,0,context.businessFamily);assert.equal(context.roleFitFailures,0,context.businessFamily);assert.equal(context.duplicateCopyCount,0,context.businessFamily);assert.equal(context.terminologyLeakCount,0,context.businessFamily);assert.equal(context.fullyPopulatedCount,context.selectedWidgetSequence.length);}});
  it("does not rely on fixture logic or fake verified facts",()=>{const artifact=load();assert.equal(artifact.noFixtureSpecificLogic,true);assert.equal(artifact.noFakeVerifiedFacts,true);});
});
