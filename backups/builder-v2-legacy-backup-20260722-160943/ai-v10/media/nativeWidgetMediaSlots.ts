import type { BuilderBlueprint, BuilderNode } from "../../types/blueprint";
import { WidgetPopulationRegistry } from "../../website-engine/builder-blueprint/widget-population";

export type NativeWidgetMediaSlot = Readonly<{ widgetId:string;widgetType:string;slotPath:string;mediaRole:string;required:boolean;prompt:string;aspectRatio:string;cropFamily:string;altIntent:string;assignmentStatus:"pending"|"assigned"|"missing-prompt" }>;

function entriesFor(node: BuilderNode, path: string, role: string, required: boolean): NativeWidgetMediaSlot[] {
  const array = path.match(/^([^.[]+)\[\]\.(.+)$/);
  if (array) return (Array.isArray(node.props?.[array[1]]) ? node.props[array[1]] as Record<string,unknown>[] : []).map((item,index)=>({widgetId:node.id,widgetType:node.type,slotPath:`props.${array[1]}[${index}].${array[2]}`,mediaRole:role,required,prompt:String(item.prompt ?? ""),aspectRatio:node.type === "galleryLightbox" ? "4:3" : "3:2",cropFamily:"editorial",altIntent:String(item.alt ?? ""),assignmentStatus:item[array[2]] ? "assigned" : item.prompt ? "pending" : "missing-prompt"}));
  const object = path.match(/^([^.]+)\.(.+)$/); const item = object && node.props?.[object[1]] as Record<string,unknown> | undefined;
  return object && item ? [{widgetId:node.id,widgetType:node.type,slotPath:`props.${path}`,mediaRole:role,required,prompt:String(item.prompt ?? ""),aspectRatio:"4:3",cropFamily:"editorial",altIntent:String(item.alt ?? ""),assignmentStatus:item[object[2]] ? "assigned" : item.prompt ? "pending" : "missing-prompt"}] : [];
}

export function discoverNativeWidgetMediaSlots(blueprint: BuilderBlueprint): NativeWidgetMediaSlot[] {
  return Object.values(blueprint.nodes).flatMap((node)=>{
    const contract = WidgetPopulationRegistry.get(node.type); if (!contract) return [];
    return Object.entries(contract.imageAssignmentSchema).flatMap(([path,role])=>entriesFor(node,path,role,contract.requiredMediaSlots.includes(path)));
  });
}

export function assignNativeWidgetMedia(blueprint: BuilderBlueprint, assignments: readonly Readonly<{widgetId:string;slotPath:string;url:string}>[]) {
  const nodes = {...blueprint.nodes}; const applied: string[] = []; const rejected: string[] = [];
  for (const assignment of assignments) {
    if (!/^https:\/\//.test(assignment.url)) { rejected.push(`${assignment.widgetId}:${assignment.slotPath}:unsafe-url`); continue; }
    const node = nodes[assignment.widgetId]; const match = assignment.slotPath.match(/^props\.([^.[]+)(?:\[(\d+)\])?\.([^.]+)$/);
    if (!node || !match) { rejected.push(`${assignment.widgetId}:${assignment.slotPath}:unknown-slot`); continue; }
    const [,root,index,key] = match; const props = structuredClone(node.props ?? {});
    if (index === undefined) { const target = props[root]; if (!target || typeof target !== "object" || Array.isArray(target)) { rejected.push(`${assignment.widgetId}:${assignment.slotPath}:shape`); continue; } (target as Record<string,unknown>)[key]=assignment.url; }
    else { const target = props[root]; if (!Array.isArray(target) || !target[Number(index)] || typeof target[Number(index)] !== "object") { rejected.push(`${assignment.widgetId}:${assignment.slotPath}:shape`); continue; } (target[Number(index)] as Record<string,unknown>)[key]=assignment.url; }
    nodes[node.id]={...node,props}; applied.push(`${assignment.widgetId}:${assignment.slotPath}`);
  }
  return {blueprint:{...blueprint,nodes},applied,rejected};
}
