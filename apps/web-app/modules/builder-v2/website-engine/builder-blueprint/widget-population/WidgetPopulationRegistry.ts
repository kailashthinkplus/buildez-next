import type { NodeType } from "../../../types/blueprint";
import { ProductionGenerationCapabilityCatalog } from "../../native-visual-capabilities";
import type { ProductionWidgetPopulationContract } from "./contracts";

const editable = ["props.eyebrow","props.title","props.body","props.primaryCta","props.secondaryCta","props.items","props.variant","style.mediaUrl"] as const;
const roles: Record<string, readonly string[]> = {
  hero:["opening","orientation"], carousel:["project-discovery","featured-media"], galleryLightbox:["gallery","visual-proof"], faq:["faq","objection-handling"], leadForm:["lead-capture","consultation"], timeline:["process","journey","narrative"], logoCloud:["trust","partners","certifications"], smartFooter:["footer","closure"], floatingWhatsApp:["sticky-action","contact"], cta:["conversion","closing-action"],
};
const verified: Partial<Record<NodeType, readonly string[]>> = { logoCloud:["logoAssets"], floatingWhatsApp:["whatsappDestination"] };
const media = new Set<NodeType>(["hero","carousel","galleryLightbox"]);
const replacement: Partial<Record<NodeType, NodeType>> = { logoCloud:"cta", floatingWhatsApp:"cta" };

const contracts = Object.freeze(Object.keys(roles).map((widgetType) => {
  const type = widgetType as NodeType;
  const capability = ProductionGenerationCapabilityCatalog.get(type);
  return Object.freeze({
    widgetType:type, supportedNarrativeRoles:roles[type] ?? [], supportedConversionRoles:type === "cta" || type === "leadForm" || type === "floatingWhatsApp" ? ["conversion","contact"] : ["none"], preferredBusinessFamilies:(capability?.preferredIndustries ?? []).map(String), disallowedBusinessFamilies:[],
    requiredProps:capability?.requiredContent ?? ["title","items"], optionalProps:["eyebrow","secondaryCta","variant","ariaLabel"], nestedCollections:{ items:["text"] }, minimumItems:capability?.minimumItemCount ?? 1, maximumItems:capability?.maximumItemCount ?? 6,
    requiredMediaSlots:media.has(type) ? [type === "hero" ? "media.src" : type === "carousel" ? "slides[].src" : "galleryItems[].src"] : [], optionalMediaSlots:[], requiredVerifiedFacts:verified[type] ?? [], editablePropertyPaths:editable,
    hydrationSchema:{ eyebrow:"text",title:"text",body:"text",primaryCta:"text",secondaryCta:"text",items:"text-list" }, imageAssignmentSchema:media.has(type) ? { [type === "hero" ? "media.src" : type === "carousel" ? "slides[].src" : "galleryItems[].src"]:type === "hero" ? "dominant" : "supporting" } : {}, rendererPropShape:["eyebrow","title","body","primaryCta","secondaryCta","items"],
    fallbackPolicy:{ mode:"recommend", replacementWidget:replacement[type] ?? capability?.fallbackWidget, reason:"Use a role-correct registered widget when required facts or content are unavailable." },
  } satisfies ProductionWidgetPopulationContract);
}));

export const WidgetPopulationRegistry = Object.freeze({ all:()=>contracts, get:(type: NodeType | string)=>contracts.find((contract)=>contract.widgetType === type), has:(type: NodeType | string)=>contracts.some((contract)=>contract.widgetType === type) });
