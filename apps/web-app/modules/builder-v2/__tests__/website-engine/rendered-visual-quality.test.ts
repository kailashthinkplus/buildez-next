import assert from "node:assert/strict";
import test from "node:test";

import { buildGoldenWebsitePreview } from "../../website-engine/golden-websites/preview/GoldenWebsitePreview";
import { compileRenderedVisualRepairs, evaluateRenderedVisualQuality, runRenderedVisualQualityLoop, type RenderedScreenshot } from "../../website-engine/visual-quality";

function screenshot(viewport:RenderedScreenshot["viewport"],quality:"flat"|"varied"):RenderedScreenshot{
  const [width,height]=viewport==="desktop"?[1200,720]:viewport==="tablet"?[900,760]:[390,780];const pixels=new Uint8Array(width*height*4);
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){const index=(y*width+x)*4;if(quality==="flat"){pixels[index]=pixels[index+1]=pixels[index+2]=232;}else{const band=Math.floor(y/Math.max(1,height/7));pixels[index]=(x*3+band*41)%256;pixels[index+1]=(y*2+band*67)%256;pixels[index+2]=((x+y)*2+band*29)%256;}pixels[index+3]=255;}
  return Object.freeze({viewport,width,height,pixels,pixelFormat:"rgba" as const,source:`test:${quality}`});
}
const captures=(quality:"flat"|"varied")=>(["desktop","tablet","mobile"] as const).map((viewport)=>screenshot(viewport,quality));
const blueprint=()=>buildGoldenWebsitePreview("luxury-residential-developer")!.blueprint;

test("RenderedVisualQualityGate inspects pixels across all three viewports",()=>{
  const flat=evaluateRenderedVisualQuality({blueprint:blueprint(),screenshots:captures("flat")});const varied=evaluateRenderedVisualQuality({blueprint:blueprint(),screenshots:captures("varied")});
  assert.equal(flat.pixelInspected,true);assert.deepEqual(flat.viewports,["desktop","tablet","mobile"]);assert.ok(flat.issues.length>0);assert.ok(flat.repairActions.length>0);
  assert.ok(varied.imageryScore>flat.imageryScore);assert.ok(varied.typographyScore>flat.typographyScore);assert.ok(varied.originalityScore>flat.originalityScore);
  assert.throws(()=>evaluateRenderedVisualQuality({blueprint:blueprint(),screenshots:captures("flat").slice(0,2)}),/RENDERED_SCREENSHOT_MISSING/);
});

test("visual repair compiler preserves native schema and source immutability",()=>{
  const source=blueprint();const before=JSON.stringify(source);const evaluation=evaluateRenderedVisualQuality({blueprint:source,screenshots:captures("flat")});const repaired=compileRenderedVisualRepairs(source,evaluation.repairActions);
  assert.equal(JSON.stringify(source),before);assert.notEqual(repaired,source);assert.equal(repaired.root,source.root);assert.deepEqual(Object.keys(repaired.nodes),Object.keys(source.nodes));assert.deepEqual(Object.keys(repaired.metadata),Object.keys(source.metadata));
  assert.ok(Object.values(repaired.nodes).every((node)=>node.id&&node.type&&Array.isArray(node.children)));
});

test("rendered quality loop repairs and rerenders with a maximum of three iterations",async()=>{
  const source=blueprint(),before=JSON.stringify(source);let renders=0;const result=await runRenderedVisualQualityLoop({blueprint:source,render:async(_candidate,iteration)=>{renders++;return iteration===1?captures("flat"):captures("varied");}});
  assert.ok(renders>=2&&renders<=3);assert.equal(result.iterations[0].iteration,1);assert.ok(result.iterations[0].actionIds.length>0);assert.equal(result.sourceBlueprintMutated,false);assert.equal(result.maxIterations,3);assert.equal(JSON.stringify(source),before);
});

test("rendered quality loop stops deterministically at iteration three",async()=>{
  const source=blueprint();const first=await runRenderedVisualQualityLoop({blueprint:source,render:async()=>captures("flat")});const second=await runRenderedVisualQualityLoop({blueprint:source,render:async()=>captures("flat")});
  assert.equal(first.iterations.length,3);assert.equal(first.status,"max-iterations");assert.deepEqual(first.iterations,second.iterations);assert.deepEqual(first.blueprint,second.blueprint);
});
