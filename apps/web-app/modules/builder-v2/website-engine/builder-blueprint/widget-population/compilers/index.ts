import type { NodeType } from "../../../../types/blueprint";
import type { ProductionWidgetPopulationContract, WidgetPopulationCompiler, WidgetPopulationContext } from "../contracts";
import { validateWidgetPopulation } from "../populationValidation";

const token = (context: WidgetPopulationContext, role: string) => `{{${context.sectionIntent.id.toLowerCase().replace(/[^a-z0-9]+/g,"_")}.${context.selectedWidgetType}.${role}}}`;
const seededVariant = (context: WidgetPopulationContext) => {
  const hash = [...`${context.generationSeed}:${context.sectionIntent.id}:${context.selectedWidgetType}`].reduce((value,char)=>((value * 31) + char.charCodeAt(0)) >>> 0, 2166136261);
  const variants = context.selectedWidgetType === "hero" ? ["editorial","default"] : context.selectedWidgetType === "cta" || context.selectedWidgetType === "leadForm" ? ["conversion","compact"] : ["default","compact"];
  return variants[hash % variants.length];
};

class NativePopulationCompiler implements WidgetPopulationCompiler {
  constructor(readonly widgetType: NodeType) {}
  compile(context: WidgetPopulationContext, contract: ProductionWidgetPopulationContract) {
    const itemCount = Math.max(contract.minimumItems, Math.min(contract.maximumItems, this.widgetType === "galleryLightbox" ? 6 : this.widgetType === "faq" ? 5 : 4));
    const ids = Array.from({length:itemCount},(_,index)=>`${context.sectionIntent.id}.${this.widgetType}.${index+1}`.replace(/[^a-zA-Z0-9_.-]/g,"_"));
    const nested: Record<string, unknown> = {};
    if (this.widgetType === "hero") nested.media = { id:ids[0],src:"",prompt:token(context,"media_prompt"),alt:token(context,"media_alt"),role:"dominant" };
    if (this.widgetType === "carousel") nested.slides = ids.map((id,index)=>({id,title:token(context,`slide_${index+1}_title`),body:token(context,`slide_${index+1}_body`),src:"",prompt:token(context,`slide_${index+1}_media_prompt`),alt:token(context,`slide_${index+1}_alt`)}));
    if (this.widgetType === "galleryLightbox") nested.galleryItems = ids.map((id,index)=>({id,title:token(context,`image_${index+1}_title`),caption:token(context,`image_${index+1}_caption`),src:"",prompt:token(context,`image_${index+1}_media_prompt`),alt:token(context,`image_${index+1}_alt`)}));
    if (this.widgetType === "faq") nested.questions = ids.map((id,index)=>({id,question:token(context,`question_${index+1}`),answer:token(context,`answer_${index+1}`)}));
    if (this.widgetType === "leadForm") nested.fields = ids.slice(0,Math.min(4,ids.length)).map((id,index)=>({id,name:["name","email","phone","message"][index],label:token(context,`field_${index+1}_label`),type:["text","email","tel","textarea"][index],required:index < 2}));
    if (this.widgetType === "timeline") nested.steps = ids.map((id,index)=>({id,label:token(context,`step_${index+1}_label`),title:token(context,`step_${index+1}_title`),description:token(context,`step_${index+1}_description`)}));
    if (this.widgetType === "smartFooter") Object.assign(nested,{navItems:ids.map((id,index)=>({id,label:token(context,`nav_${index+1}_label`),href:`#${index ? `section-${index+1}` : "top"}`})),copyright:token(context,"copyright")});
    if (this.widgetType === "cta") nested.actions = ids.slice(0,2).map((id,index)=>({id,label:token(context,index ? "secondary_cta" : "primary_cta"),href:index ? "#details" : "#contact"}));
    const props = Object.freeze({
      eyebrow:token(context,"eyebrow"), title:token(context,"headline"), body:token(context,"supporting_copy"), primaryCta:token(context,"primary_cta"),
      secondaryCta:this.widgetType === "hero" || this.widgetType === "cta" ? token(context,"secondary_cta") : "",
      items:Object.freeze(Array.from({length:itemCount},(_,index)=>token(context,`item_${index+1}`))),
      variant:seededVariant(context),
      ariaLabel:token(context,"accessible_label"), motionPreset:"none", generationCapability:this.widgetType,
      ...nested,
    });
    const diagnostics = validateWidgetPopulation(contract, context, props);
    return Object.freeze({ ok:!diagnostics.some((item)=>item.severity === "error"), widgetType:this.widgetType, props, style:{}, diagnostics,
      replacementRecommendation:diagnostics.some((item)=>item.code === "verified-fact-missing") && contract.fallbackPolicy.replacementWidget ? { widgetType:contract.fallbackPolicy.replacementWidget,reason:contract.fallbackPolicy.reason } : undefined });
  }
}

export const HeroPopulationCompiler = new NativePopulationCompiler("hero");
export const CarouselPopulationCompiler = new NativePopulationCompiler("carousel");
export const GalleryLightboxPopulationCompiler = new NativePopulationCompiler("galleryLightbox");
export const FaqPopulationCompiler = new NativePopulationCompiler("faq");
export const LeadFormPopulationCompiler = new NativePopulationCompiler("leadForm");
export const TimelinePopulationCompiler = new NativePopulationCompiler("timeline");
export const LogoCloudPopulationCompiler = new NativePopulationCompiler("logoCloud");
export const SmartFooterPopulationCompiler = new NativePopulationCompiler("smartFooter");
export const FloatingWhatsAppPopulationCompiler = new NativePopulationCompiler("floatingWhatsApp");
export const CtaPopulationCompiler = new NativePopulationCompiler("cta");

export const DedicatedPopulationCompilers: readonly WidgetPopulationCompiler[] = Object.freeze([HeroPopulationCompiler,CarouselPopulationCompiler,GalleryLightboxPopulationCompiler,FaqPopulationCompiler,LeadFormPopulationCompiler,TimelinePopulationCompiler,LogoCloudPopulationCompiler,SmartFooterPopulationCompiler,FloatingWhatsAppPopulationCompiler,CtaPopulationCompiler]);
