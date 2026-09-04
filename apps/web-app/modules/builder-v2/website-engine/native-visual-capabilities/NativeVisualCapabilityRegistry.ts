import type { NodeType } from "../../types/blueprint";
import { REGISTERED_WIDGET_DEFINITIONS, buildWidgetCapabilities } from "../../widgets/widgetCapabilities";
import { buildWidgetInspectorSupport } from "../../widgets/widgetInspectorSupport";
import { buildWidgetSerializationSupport } from "../../widgets/widgetSerializationSupport";
import type { LayoutArchetypeId } from "../layout-archetypes";

export type NativeVisualCapability = Readonly<{
  widgetType: NodeType;
  registered: boolean;
  native: boolean;
  editable: boolean;
  inspectorSupported: boolean;
  responsiveSupported: boolean;
  runtimeSupported: boolean;
  canvasSupported: boolean;
  serializable: boolean;
  supportsChildren: boolean;
  mediaCapabilities: readonly string[];
  interactionCapabilities: readonly string[];
  motionCapabilities: readonly string[];
  supportedContentRoles: readonly string[];
  supportedLayoutArchetypes: readonly LayoutArchetypeId[];
  compilerCoverage: "native-adapter" | "primitive" | "unavailable";
}>;

const primitiveTypes = new Set<NodeType>([
  "page", "section", "container", "column", "heading", "text", "button", "image", "video", "icon", "divider", "spacer",
]);
const gatedTypes = new Set<NodeType>(["embed", "popupModal"]);
const interactiveTypes = new Set<NodeType>([
  "smartHeader", "leadForm", "contactForm", "galleryLightbox", "faq", "accordion", "tabs", "floatingWhatsApp", "carousel",
]);
const mediaTypes = new Set<NodeType>([
  "image", "video", "hero", "gallery", "galleryLightbox", "masonryGallery", "carousel", "beforeAfter", "offerGrid", "portfolio", "features",
]);

const roleMap: Partial<Record<NodeType, readonly string[]>> = {
  hero: ["opening", "orientation", "conversion"],
  cardGrid: ["features", "comparison", "discovery"],
  featureGrid: ["features", "amenities", "services"],
  offerGrid: ["offer", "project-discovery", "catalogue"],
  gallery: ["gallery", "visual-proof", "lifestyle"],
  masonryGallery: ["gallery", "portfolio", "visual-story"],
  galleryLightbox: ["gallery", "project-discovery", "visual-proof"],
  carousel: ["project-discovery", "featured-media", "story"],
  testimonials: ["trust", "social-proof", "reviews"],
  tabs: ["comparison", "grouped-discovery", "details"],
  accordion: ["faq", "objection-handling", "details"],
  faq: ["faq", "objection-handling"],
  beforeAfter: ["transformation", "comparison"],
  video: ["media-story", "demonstration"],
  statsCounter: ["metrics", "trust", "proof"],
  logoCloud: ["trust", "partners", "certifications"],
  timeline: ["process", "journey", "narrative"],
  leadForm: ["lead-capture", "consultation"],
  contactForm: ["contact", "lead-capture"],
  smartHeader: ["navigation", "opening"],
  smartFooter: ["footer", "closure", "navigation"],
  floatingWhatsApp: ["sticky-action", "contact"],
};

const archetypeMap: Partial<Record<NodeType, readonly LayoutArchetypeId[]>> = {
  hero: ["editorialSplitHero", "cinematicFullBleedHero"],
  gallery: ["galleryJourney", "imageStoryNarrative"],
  masonryGallery: ["galleryJourney", "architecturalProjectShowcase"],
  galleryLightbox: ["galleryJourney", "architecturalProjectShowcase"],
  carousel: ["galleryJourney", "architecturalProjectShowcase", "imageStoryNarrative"],
  tabs: ["bentoShowcase", "architecturalProjectShowcase"],
  faq: ["asymmetricStorySection", "framedCTA"],
  accordion: ["asymmetricStorySection", "framedCTA"],
  testimonials: ["quoteInterlude", "floatingProofSection"],
  statsCounter: ["floatingProofSection"],
  logoCloud: ["floatingProofSection", "quoteInterlude"],
  timeline: ["imageStoryNarrative", "asymmetricStorySection"],
  leadForm: ["framedCTA"],
  contactForm: ["framedCTA"],
  smartFooter: ["framedCTA"],
  floatingWhatsApp: ["framedCTA"],
};

function inventory(): NativeVisualCapability[] {
  const widgetCapabilities = new Map(buildWidgetCapabilities().map((item) => [String(item.type), item]));
  const inspector = new Map(buildWidgetInspectorSupport().map((item) => [item.type, item]));
  const serialization = new Map(buildWidgetSerializationSupport().map((item) => [item.type, item]));

  return REGISTERED_WIDGET_DEFINITIONS.map((definition) => {
    const type = definition.type;
    const capability = widgetCapabilities.get(type);
    const inspectorSupport = inspector.get(type);
    const serializationSupport = serialization.get(type);
    const gated = gatedTypes.has(type);
    const primitive = primitiveTypes.has(type);
    return Object.freeze({
      widgetType: type,
      registered: true,
      native: true,
      editable: Boolean(capability && capability.editableProps.length + capability.editableStyles.length > 0),
      inspectorSupported: Boolean(inspectorSupport?.hasContentControls && inspectorSupport.hasDesignControls && inspectorSupport.hasAdvancedControls),
      responsiveSupported: Boolean(inspectorSupport?.hasResponsiveControls),
      runtimeSupported: !gated,
      canvasSupported: !gated,
      serializable: Boolean(serializationSupport?.requiresNativeEditableShape && !serializationSupport.opaqueOutputAllowed),
      supportsChildren: definition.canHaveChildren,
      mediaCapabilities: mediaTypes.has(type) ? [type === "video" ? "video-source-and-poster" : "native-media-presentation"] : [],
      interactionCapabilities: interactiveTypes.has(type) ? [type] : [],
      motionCapabilities: definition.properties.some((property) => property.category === "animation") ? ["shared-motion-preset"] : [],
      supportedContentRoles: roleMap[type] ?? [definition.category],
      supportedLayoutArchetypes: archetypeMap[type] ?? [],
      compilerCoverage: gated ? "unavailable" : primitive ? "primitive" : "native-adapter",
    });
  });
}

const entries = Object.freeze(inventory());

export const NativeVisualCapabilityRegistry = Object.freeze({
  all: () => entries,
  get: (widgetType: NodeType | string) => entries.find((entry) => entry.widgetType === widgetType),
  has: (widgetType: NodeType | string) => entries.some((entry) => entry.widgetType === widgetType),
});

