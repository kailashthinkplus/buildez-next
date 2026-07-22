import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { BuilderBlueprint, BuilderNode } from "../../types/blueprint";
import { deserializeBlueprint, serializeBlueprint } from "../../core/serialization";
import { TypedWidgetHydrationSchemas, validateTypedWidgetPatch } from "../../ai-v10/creative/typedWidgetHydration";
import { assignNativeWidgetMedia, discoverNativeWidgetMediaSlots } from "../../ai-v10/media/nativeWidgetMediaSlots";
import { createPrimitiveBlueprint } from "../fixtures/testBlueprintFixtures";

const slide = (id:string,index:number)=>({id,title:`Title ${index}`,body:`Body ${index}`,src:"",prompt:`Editorial subject ${index}`,alt:`Subject ${index}`});
function blueprint(): BuilderBlueprint {
  const carousel: BuilderNode={id:"carousel.1",type:"carousel",name:"Carousel",parentId:"test-section",children:[],props:{eyebrow:"Work",title:"Selected work",body:"A considered selection",primaryCta:"Explore",secondaryCta:"",items:["One","Two","Three"],variant:"default",motionPreset:"none",generationCapability:"carousel",slides:[slide("s1",1),slide("s2",2),slide("s3",3)]},style:{}};
  const base=createPrimitiveBlueprint();
  return {...base,nodes:{...base.nodes,"test-section":{...base.nodes["test-section"],children:[...base.nodes["test-section"].children,carousel.id]},[carousel.id]:carousel}};
}

describe("RC-3.5C typed widget hydration and media",()=>{
  it("publishes schemas for every RC-3.5A native widget",()=>{
    assert.deepEqual(TypedWidgetHydrationSchemas.map((schema)=>schema.widgetType),["hero","carousel","galleryLightbox","faq","leadForm","timeline","logoCloud","smartFooter","floatingWhatsApp","cta"]);
  });

  it("accepts complete nested copy changes while preserving stable IDs",()=>{
    const node=blueprint().nodes["carousel.1"];
    const slides=(node.props.slides as Record<string,unknown>[]).map((item,index)=>({...item,title:`Distinct title ${index}`,body:`Distinct supporting copy ${index}`}));
    assert.deepEqual(validateTypedWidgetPatch(node,{slides}),[]);
  });

  it("rejects unknown fields, identity mutation, malformed URLs, and invalid item counts",()=>{
    const node=blueprint().nodes["carousel.1"];
    const original=node.props.slides as Record<string,unknown>[];
    const unsafe=[{...original[0],id:"changed",src:"javascript:alert(1)",unknown:true}];
    const codes=validateTypedWidgetPatch(node,{slides:unsafe,style:{display:"none"}}).map((issue)=>issue.code);
    assert.ok(codes.includes("unknown-field"));
    assert.ok(codes.includes("item-count"));
  });

  it("discovers and assigns every declared nested slot without changing IDs or order",()=>{
    const before=blueprint(); const slots=discoverNativeWidgetMediaSlots(before);
    assert.equal(slots.length,3); assert.ok(slots.every((slot)=>slot.required && slot.assignmentStatus === "pending"));
    const assigned=assignNativeWidgetMedia(before,slots.map((slot,index)=>({widgetId:slot.widgetId,slotPath:slot.slotPath,url:`https://cdn.example.test/${index}.jpg`})));
    assert.equal(assigned.rejected.length,0); assert.equal(assigned.applied.length,3);
    const afterSlides=assigned.blueprint.nodes["carousel.1"].props.slides as Record<string,unknown>[];
    assert.deepEqual(afterSlides.map((item)=>item.id),["s1","s2","s3"]);
    assert.ok(afterSlides.every((item)=>String(item.src).startsWith("https://")));
  });

  it("rejects unsafe media URLs and preserves nested props through serialization",()=>{
    const original=blueprint(); const rejected=assignNativeWidgetMedia(original,[{widgetId:"carousel.1",slotPath:"props.slides[0].src",url:"data:text/html,bad"}]);
    assert.equal(rejected.rejected.length,1);
    const serialized=serializeBlueprint(original); assert.equal(serialized.ok,true,JSON.stringify(serialized));
    if (!serialized.ok) return;
    const restored=deserializeBlueprint(serialized.value); assert.equal(restored.ok,true);
    if (restored.ok) assert.deepEqual(restored.value.nodes["carousel.1"].props.slides,original.nodes["carousel.1"].props.slides);
  });

  it("uses the same contract across five industries without embedding industry copy",()=>{
    const families=["real_estate","healthcare","technology_saas","hospitality","automotive"];
    for (const family of families) assert.equal(discoverNativeWidgetMediaSlots(blueprint()).length,3, family);
  });
});
