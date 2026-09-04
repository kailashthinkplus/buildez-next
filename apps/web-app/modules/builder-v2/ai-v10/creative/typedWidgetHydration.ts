import type { BuilderNode, NodeType } from "../../types/blueprint";
import { WidgetPopulationRegistry } from "../../website-engine/builder-blueprint/widget-population";

type CollectionSchema = Readonly<{ key: string; requiredKeys: readonly string[]; immutableKeys: readonly string[]; allowedKeys: readonly string[]; min: number; max: number }>;
export type TypedWidgetHydrationSchema = Readonly<{ id: string; widgetType: NodeType; allowedProps: readonly string[]; immutableProps: readonly string[]; collections: readonly CollectionSchema[] }>;
export type TypedPatchIssue = Readonly<{ path: string; code: string; message: string }>;

const collections: Partial<Record<NodeType, readonly CollectionSchema[]>> = {
  carousel:[{key:"slides",requiredKeys:["id","title","body","src","prompt","alt"],immutableKeys:["id"],allowedKeys:["id","title","body","src","prompt","alt"],min:3,max:6}],
  galleryLightbox:[{key:"galleryItems",requiredKeys:["id","title","caption","src","prompt","alt"],immutableKeys:["id"],allowedKeys:["id","title","caption","src","prompt","alt"],min:4,max:8}],
  faq:[{key:"questions",requiredKeys:["id","question","answer"],immutableKeys:["id"],allowedKeys:["id","question","answer"],min:4,max:8}],
  timeline:[{key:"steps",requiredKeys:["id","label","title","description"],immutableKeys:["id"],allowedKeys:["id","label","title","description"],min:3,max:6}],
  leadForm:[{key:"fields",requiredKeys:["id","name","label","type","required"],immutableKeys:["id","name","type"],allowedKeys:["id","name","label","type","required"],min:3,max:6}],
  smartFooter:[{key:"navItems",requiredKeys:["id","label","href"],immutableKeys:["id","href"],allowedKeys:["id","label","href"],min:3,max:8}],
  cta:[{key:"actions",requiredKeys:["id","label","href"],immutableKeys:["id","href"],allowedKeys:["id","label","href"],min:1,max:2}],
};
const base = ["eyebrow","title","body","primaryCta","secondaryCta","items","variant","ariaLabel","motionPreset","generationCapability"];

export const TypedWidgetHydrationSchemas: readonly TypedWidgetHydrationSchema[] = Object.freeze(WidgetPopulationRegistry.all().map((contract)=>Object.freeze({
  id:`native-widget/${contract.widgetType}/v1`,widgetType:contract.widgetType,
  allowedProps:Object.freeze([...base,...(collections[contract.widgetType]?.map((item)=>item.key) ?? []),...(contract.widgetType === "hero" ? ["media"] : []),...(contract.widgetType === "smartFooter" ? ["copyright"] : [])]),
  immutableProps:["variant","motionPreset","generationCapability"],collections:collections[contract.widgetType] ?? [],
})));

const record = (value: unknown): value is Record<string,unknown> => Boolean(value) && typeof value === "object" && !Array.isArray(value);
const safeUrl = (value: unknown) => typeof value === "string" && (value === "" || /^(https:\/\/|#|\/)/.test(value));

export function validateTypedWidgetPatch(node: BuilderNode, patch: Record<string,unknown>): TypedPatchIssue[] {
  const schema = TypedWidgetHydrationSchemas.find((item)=>item.widgetType === node.type);
  if (!schema) return [];
  const issues: TypedPatchIssue[] = [];
  for (const key of Object.keys(patch)) if (!schema.allowedProps.includes(key)) issues.push({path:`props.${key}`,code:"unknown-field",message:`${key} is not allowed by ${schema.id}.`});
  for (const key of schema.immutableProps) if (key in patch && patch[key] !== node.props?.[key]) issues.push({path:`props.${key}`,code:"immutable-field",message:`${key} may not be changed during hydration.`});
  for (const collection of schema.collections) if (collection.key in patch) {
    const next = patch[collection.key]; const before = node.props?.[collection.key];
    if (!Array.isArray(next) || next.length < collection.min || next.length > collection.max) { issues.push({path:`props.${collection.key}`,code:"item-count",message:`Expected ${collection.min}-${collection.max} items.`}); continue; }
    const ids = new Set<string>();
    next.forEach((item,index)=>{
      if (!record(item)) { issues.push({path:`props.${collection.key}[${index}]`,code:"invalid-item",message:"Item must be an object."}); return; }
      for (const key of Object.keys(item)) if (!collection.allowedKeys.includes(key)) issues.push({path:`props.${collection.key}[${index}].${key}`,code:"unknown-field",message:"Nested field is not allowed."});
      for (const key of collection.requiredKeys) if (!(key in item) || (item[key] === "" && key !== "src")) issues.push({path:`props.${collection.key}[${index}].${key}`,code:"required-field",message:"Required nested field is missing."});
      const id = String(item.id ?? ""); if (ids.has(id)) issues.push({path:`props.${collection.key}[${index}].id`,code:"duplicate-id",message:"Nested item IDs must be unique."}); ids.add(id);
      const original = Array.isArray(before) ? before[index] : undefined;
      for (const key of collection.immutableKeys) if (record(original) && item[key] !== original[key]) issues.push({path:`props.${collection.key}[${index}].${key}`,code:"immutable-field",message:"Stable identity and structural fields may not change."});
      for (const [key,value] of Object.entries(item)) if (typeof value === "string" && value.length > 800) issues.push({path:`props.${collection.key}[${index}].${key}`,code:"string-limit",message:"Nested strings are limited to 800 characters."});
      for (const key of ["href","src"]) if (key in item && !safeUrl(item[key])) issues.push({path:`props.${collection.key}[${index}].${key}`,code:"malformed-url",message:"URL must be empty, HTTPS, root-relative, or an anchor."});
    });
  }
  if ("media" in patch) {
    const media = patch.media;
    if (!record(media) || Object.keys(media).some((key)=>!["id","src","prompt","alt","role"].includes(key))) issues.push({path:"props.media",code:"invalid-media",message:"Hero media must use the declared shape."});
    else if (!safeUrl(media.src)) issues.push({path:"props.media.src",code:"malformed-url",message:"Media src must be empty or a safe URL."});
  }
  return issues;
}

export function buildWidgetHydrationDiagnostics(before: Readonly<{nodes:Record<string,BuilderNode>}>, enrichment: Readonly<{nodes?:Record<string,{props?:Record<string,unknown>}>}> | undefined, after: Readonly<{nodes:Record<string,BuilderNode>}>) {
  return Object.values(before.nodes).filter((node)=>TypedWidgetHydrationSchemas.some((schema)=>schema.widgetType === node.type)).map((node)=>{
    const proposedPatch=enrichment?.nodes?.[node.id]?.props ?? Object.fromEntries(Object.entries(after.nodes[node.id]?.props ?? {}).filter(([key,value])=>JSON.stringify(value)!==JSON.stringify(node.props?.[key]))); const rejectedFields=validateTypedWidgetPatch(node,proposedPatch); const rejectedRoots=new Set(rejectedFields.map((item)=>item.path.replace(/^props\./,"").split(/[.[]/)[0])); const schema=TypedWidgetHydrationSchemas.find((item)=>item.widgetType === node.type)!;
    return {widgetId:node.id,widgetType:node.type,schemaId:schema.id,fieldsBefore:node.props,proposedPatch,acceptedFields:Object.keys(proposedPatch).filter((key)=>!rejectedRoots.has(key)),rejectedFields,fieldsAfter:after.nodes[node.id]?.props,missingRequiredFields:Object.entries(after.nodes[node.id]?.props ?? {}).filter(([,value])=>value === "" || value === undefined).map(([key])=>`props.${key}`),duplicateCopyFlags:[],factualSafetyFlags:[],validationStatus:rejectedFields.length ? "rejected" : "accepted"};
  });
}
