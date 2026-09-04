import type { NodeType } from "../../types/blueprint";
import type { BusinessFamily } from "../sdk";
import type { LayoutArchetypeId } from "../layout-archetypes";
import { NativeVisualCapabilityRegistry } from "./NativeVisualCapabilityRegistry";

export type ProductionGenerationCapability = Readonly<{
  widgetType: NodeType;
  semanticRoles: readonly string[];
  preferredIndustries: readonly (BusinessFamily | "government")[];
  compatibleArchetypes: readonly LayoutArchetypeId[];
  requiredContent: readonly string[];
  minimumItemCount: number;
  maximumItemCount: number;
  visualSilhouette: string;
  interactionLevel: "static" | "low" | "interactive";
  fallbackWidget: NodeType;
}>;

const allIndustries: readonly (BusinessFamily | "government")[] = ["unknown"];
const entry = (value: ProductionGenerationCapability) => Object.freeze(value);

const declared: readonly ProductionGenerationCapability[] = [
  entry({ widgetType:"hero",semanticRoles:["opening","orientation"],preferredIndustries:allIndustries,compatibleArchetypes:["editorialSplitHero","cinematicFullBleedHero"],requiredContent:["title","body","primaryCta"],minimumItemCount:2,maximumItemCount:4,visualSilhouette:"media-split-hero",interactionLevel:"low",fallbackWidget:"container" }),
  entry({ widgetType:"galleryLightbox",semanticRoles:["lifestyle","visual-proof","project-discovery"],preferredIndustries:["real_estate","hospitality","architecture_interiors","creative_portfolio"],compatibleArchetypes:["galleryJourney","architecturalProjectShowcase"],requiredContent:["title","items"],minimumItemCount:4,maximumItemCount:6,visualSilhouette:"interactive-media-mosaic",interactionLevel:"interactive",fallbackWidget:"gallery" }),
  entry({ widgetType:"masonryGallery",semanticRoles:["portfolio","visual-story"],preferredIndustries:["real_estate","architecture_interiors","creative_portfolio"],compatibleArchetypes:["galleryJourney","architecturalProjectShowcase"],requiredContent:["title","items"],minimumItemCount:4,maximumItemCount:6,visualSilhouette:"masonry-media-field",interactionLevel:"low",fallbackWidget:"gallery" }),
  entry({ widgetType:"gallery",semanticRoles:["gallery","visual-proof"],preferredIndustries:allIndustries,compatibleArchetypes:["galleryJourney","imageStoryNarrative"],requiredContent:["title","items"],minimumItemCount:3,maximumItemCount:6,visualSilhouette:"media-gallery",interactionLevel:"low",fallbackWidget:"image" }),
  entry({ widgetType:"carousel",semanticRoles:["project-discovery","featured-media"],preferredIndustries:["real_estate","hospitality","ecommerce_d2c","automotive"],compatibleArchetypes:["galleryJourney","architecturalProjectShowcase"],requiredContent:["title","items"],minimumItemCount:3,maximumItemCount:5,visualSilhouette:"interactive-media-rail",interactionLevel:"interactive",fallbackWidget:"gallery" }),
  entry({ widgetType:"faq",semanticRoles:["faq","objection-handling"],preferredIndustries:allIndustries,compatibleArchetypes:["asymmetricStorySection","framedCTA"],requiredContent:["title","items"],minimumItemCount:3,maximumItemCount:6,visualSilhouette:"accordion-stack",interactionLevel:"interactive",fallbackWidget:"accordion" }),
  entry({ widgetType:"accordion",semanticRoles:["faq","details"],preferredIndustries:allIndustries,compatibleArchetypes:["asymmetricStorySection","framedCTA"],requiredContent:["title","items"],minimumItemCount:2,maximumItemCount:6,visualSilhouette:"accordion-stack",interactionLevel:"interactive",fallbackWidget:"text" }),
  entry({ widgetType:"tabs",semanticRoles:["comparison","grouped-discovery","details"],preferredIndustries:allIndustries,compatibleArchetypes:["bentoShowcase","architecturalProjectShowcase"],requiredContent:["title","items"],minimumItemCount:2,maximumItemCount:5,visualSilhouette:"interactive-tabbed-panel",interactionLevel:"interactive",fallbackWidget:"cardGrid" }),
  entry({ widgetType:"testimonials",semanticRoles:["trust","social-proof"],preferredIndustries:allIndustries,compatibleArchetypes:["quoteInterlude","floatingProofSection"],requiredContent:["title","items"],minimumItemCount:2,maximumItemCount:3,visualSilhouette:"testimonial-triptych",interactionLevel:"static",fallbackWidget:"text" }),
  entry({ widgetType:"statsCounter",semanticRoles:["metrics","trust","proof"],preferredIndustries:allIndustries,compatibleArchetypes:["floatingProofSection"],requiredContent:["title","items"],minimumItemCount:3,maximumItemCount:4,visualSilhouette:"metric-band",interactionLevel:"low",fallbackWidget:"text" }),
  entry({ widgetType:"logoCloud",semanticRoles:["trust","partners","certifications"],preferredIndustries:allIndustries,compatibleArchetypes:["floatingProofSection","quoteInterlude"],requiredContent:["title","items"],minimumItemCount:4,maximumItemCount:6,visualSilhouette:"logo-band",interactionLevel:"static",fallbackWidget:"text" }),
  entry({ widgetType:"timeline",semanticRoles:["process","journey","narrative"],preferredIndustries:allIndustries,compatibleArchetypes:["imageStoryNarrative","asymmetricStorySection"],requiredContent:["title","items"],minimumItemCount:3,maximumItemCount:5,visualSilhouette:"linear-timeline",interactionLevel:"static",fallbackWidget:"text" }),
  entry({ widgetType:"leadForm",semanticRoles:["lead-capture","consultation"],preferredIndustries:allIndustries,compatibleArchetypes:["framedCTA"],requiredContent:["title","body","primaryCta"],minimumItemCount:3,maximumItemCount:4,visualSilhouette:"form-panel",interactionLevel:"interactive",fallbackWidget:"contactForm" }),
  entry({ widgetType:"contactForm",semanticRoles:["contact","lead-capture"],preferredIndustries:allIndustries,compatibleArchetypes:["framedCTA"],requiredContent:["title","body","primaryCta"],minimumItemCount:3,maximumItemCount:4,visualSilhouette:"form-panel",interactionLevel:"interactive",fallbackWidget:"container" }),
  entry({ widgetType:"smartFooter",semanticRoles:["footer","closure"],preferredIndustries:allIndustries,compatibleArchetypes:["framedCTA"],requiredContent:["title","items"],minimumItemCount:3,maximumItemCount:6,visualSilhouette:"navigation-closure",interactionLevel:"low",fallbackWidget:"container" }),
  entry({ widgetType:"floatingWhatsApp",semanticRoles:["sticky-action","contact"],preferredIndustries:["real_estate","hospitality","healthcare","professional_services","automotive"],compatibleArchetypes:["framedCTA"],requiredContent:["primaryCta"],minimumItemCount:1,maximumItemCount:3,visualSilhouette:"floating-action",interactionLevel:"interactive",fallbackWidget:"button" }),
  entry({ widgetType:"cta",semanticRoles:["conversion","closing-action"],preferredIndustries:allIndustries,compatibleArchetypes:["framedCTA"],requiredContent:["title","body","primaryCta"],minimumItemCount:1,maximumItemCount:3,visualSilhouette:"conversion-frame",interactionLevel:"low",fallbackWidget:"button" }),
  entry({ widgetType:"cardGrid",semanticRoles:["comparison","features","discovery"],preferredIndustries:allIndustries,compatibleArchetypes:["bentoShowcase"],requiredContent:["title","items"],minimumItemCount:3,maximumItemCount:6,visualSilhouette:"card-grid",interactionLevel:"static",fallbackWidget:"container" }),
];

const entries = Object.freeze(declared.filter((capability) => {
  const verified = NativeVisualCapabilityRegistry.get(capability.widgetType);
  return Boolean(verified?.registered && verified.native && verified.editable && verified.inspectorSupported && verified.responsiveSupported && verified.runtimeSupported && verified.canvasSupported && verified.serializable && verified.compilerCoverage === "native-adapter");
}));

export const ProductionGenerationCapabilityCatalog = Object.freeze({
  all: () => entries,
  get: (widgetType: NodeType | string) => entries.find((entry) => entry.widgetType === widgetType),
  has: (widgetType: NodeType | string) => entries.some((entry) => entry.widgetType === widgetType),
});

