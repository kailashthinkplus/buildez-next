import type { BuilderBlueprint, BuilderNode } from "../../types/blueprint";
import type { RenderedVisualRepairAction } from "./RenderedVisualQualityGate";

function responsiveNumber(value:unknown,factor:number){if(typeof value==="number")return Math.round(value*factor);if(value&&typeof value==="object"&&!Array.isArray(value))return Object.fromEntries(Object.entries(value as Record<string,unknown>).map(([key,item])=>[key,typeof item==="number"?Math.round(item*factor):item]));return value;}
export function compileRenderedVisualRepairs(blueprint:BuilderBlueprint,actions:readonly RenderedVisualRepairAction[]):BuilderBlueprint{
  const nodes=Object.fromEntries(Object.entries(blueprint.nodes).map(([id,node])=>[id,{...node,props:{...node.props},style:{...node.style},children:[...node.children]}])) as Record<string,BuilderNode>;
  for(const action of actions){
    const targets=action.nodeIds.map((id)=>nodes[id]).filter(Boolean);
    if(action.type==="increase_hero_scale")for(const node of targets.filter((item)=>item.type==="heading")){node.style={...node.style,fontSize:responsiveNumber(node.style.fontSize,1.14),lineHeight:1.02};}
    if(action.type==="increase_whitespace")for(const node of targets.filter((item)=>item.type==="section")){node.style={...node.style,paddingTop:responsiveNumber(node.style.paddingTop??node.style.padding,1.12),paddingBottom:responsiveNumber(node.style.paddingBottom??node.style.padding,1.12)};}
    if(action.type==="replace_repetitive_grid")targets.filter((item)=>item.type==="container"&&item.style.display==="grid").forEach((node,index)=>{node.style={...node.style,gridTemplateColumns:{desktop:index%2?"minmax(0, 1.35fr) minmax(0, .65fr)":"repeat(12, minmax(0, 1fr))",tablet:"repeat(2, minmax(0, 1fr))",mobile:"1fr"}};});
    if(action.type==="change_section_archetype"&&action.sectionId&&nodes[action.sectionId]){const section=nodes[action.sectionId];section.props={...section.props,visualRepairArchetype:"asymmetricStorySection"};const container=section.children.map((id)=>nodes[id]).find((node)=>node?.type==="container");if(container)container.style={...container.style,display:"grid",gridTemplateColumns:{desktop:".72fr 1.28fr",tablet:"1fr 1fr",mobile:"1fr"},alignItems:"start"};}
    if(action.type==="adjust_media_dominance")for(const [index,node] of targets.filter((item)=>item.type==="image").entries()){node.style={...node.style,aspectRatio:index%3===0?"4 / 5":index%3===1?"16 / 9":"1 / 1",minHeight:{desktop:index===0?520:280,tablet:260,mobile:220}};}
    if(action.type==="improve_typography_hierarchy")for(const node of targets.filter((item)=>item.type==="heading")){const level=String(node.props.level??"h3");node.style={...node.style,fontSize:responsiveNumber(node.style.fontSize,level==="h1"?1.12:level==="h2"?1.06:.98),lineHeight:level==="h1"?1.02:1.08};}
  }
  return Object.freeze({...blueprint,nodes:Object.freeze(nodes)});
}
