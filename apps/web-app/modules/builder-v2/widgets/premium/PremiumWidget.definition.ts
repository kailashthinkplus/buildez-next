import type { NodeType } from "../../types/blueprint";
import type { WidgetProperty } from "../../types/property";
import { WidgetDefinition } from "../../core/registry/WidgetRegistry";
import PremiumWidget from "./PremiumWidget";

type PremiumWidgetSeed = {
  type: NodeType;
  name: string;
  category: WidgetDefinition["category"];
  icon: string;
  eyebrow: string;
  title: string;
  body: string;
  primaryCta: string;
  secondaryCta?: string;
  items: string[];
  aiPrompt: string;
};

const sharedProperties: WidgetProperty[] = [
  {
    id: "eyebrow",
    label: "Eyebrow",
    type: "text",
    target: "props",
    category: "content",
    aiEditable: true,
  },
  {
    id: "title",
    label: "Title",
    type: "text",
    target: "props",
    category: "content",
    aiEditable: true,
  },
  {
    id: "body",
    label: "Body",
    type: "textarea",
    target: "props",
    category: "content",
    aiEditable: true,
  },
  {
    id: "primaryCta",
    label: "Primary CTA",
    type: "text",
    target: "props",
    category: "content",
    aiEditable: true,
  },
  {
    id: "secondaryCta",
    label: "Secondary CTA",
    type: "text",
    target: "props",
    category: "content",
    aiEditable: true,
  },
  {
    id: "items",
    label: "Items",
    type: "textarea",
    target: "props",
    category: "content",
    placeholder: "One item per line",
    aiEditable: true,
  },
  {
    id: "variant",
    label: "Variant",
    type: "select",
    target: "props",
    category: "content",
    defaultValue: "default",
    options: [
      { label: "Default", value: "default" },
      { label: "Compact", value: "compact" },
      { label: "Editorial", value: "editorial" },
      { label: "Conversion", value: "conversion" },
    ],
  },
  {
    id: "backgroundColor",
    label: "Background",
    type: "color",
    target: "style",
    category: "style",
    defaultValue: "#ffffff",
  },
  {
    id: "color",
    label: "Text Color",
    type: "color",
    target: "style",
    category: "style",
    defaultValue: "#0f172a",
  },
  {
    id: "borderRadius",
    label: "Radius",
    type: "slider",
    target: "style",
    category: "style",
    defaultValue: 16,
    min: 0,
    max: 40,
    step: 1,
    unit: "px",
  },
  {
    id: "padding",
    label: "Padding",
    type: "spacing",
    target: "style",
    category: "layout",
    responsive: true,
  },
];

const premiumWidgetSeeds: PremiumWidgetSeed[] = [
  {
    type: "smartHeader",
    name: "Smart Header",
    category: "marketing",
    icon: "Menu",
    eyebrow: "Navigation",
    title: "Smart Header",
    body: "Responsive navigation with logo, menu links, CTA, and mobile drawer behavior.",
    primaryCta: "Book a call",
    secondaryCta: "View pages",
    items: ["Logo area", "Menu links", "Primary CTA", "Mobile drawer"],
    aiPrompt: "Use for production-ready navigation with brand, links, and conversion CTA.",
  },
  {
    type: "hero",
    name: "Conversion Hero",
    category: "marketing",
    icon: "Sparkles",
    eyebrow: "Hero",
    title: "Launch a stronger website",
    body: "High-impact intro section with proof, messaging, media, and conversion actions.",
    primaryCta: "Get started",
    secondaryCta: "See examples",
    items: ["Outcome-led headline", "Trust proof", "CTA pair", "Media slot"],
    aiPrompt: "Use for landing page hero sections that need clear offer, trust, and action.",
  },
  {
    type: "leadForm",
    name: "Lead Capture Form",
    category: "forms",
    icon: "FileText",
    eyebrow: "Lead capture",
    title: "Capture qualified leads",
    body: "Validated capture flow for inquiries, quotes, appointments, and waitlists.",
    primaryCta: "Submit request",
    items: ["Name", "Email", "Phone", "Message"],
    aiPrompt: "Use when a page needs contact, quote, booking, appointment, or waitlist collection.",
  },
  {
    type: "cardGrid",
    name: "Feature Card Grid",
    category: "marketing",
    icon: "PanelsTopLeft",
    eyebrow: "Cards",
    title: "Show what makes you different",
    body: "Repeatable cards for services, benefits, programs, or feature sets.",
    primaryCta: "Explore services",
    items: ["Benefit card", "Service card", "Proof card", "Process card"],
    aiPrompt: "Use for repeatable benefit, service, program, or product capability sections.",
  },
  {
    type: "galleryLightbox",
    name: "Gallery Lightbox",
    category: "media",
    icon: "Images",
    eyebrow: "Gallery",
    title: "Showcase visual proof",
    body: "Visual showcase with captions, categories, and immersive viewing.",
    primaryCta: "View gallery",
    items: ["Portfolio", "Properties", "Venues", "Products"],
    aiPrompt: "Use when images are central to trust, inspection, or conversion.",
  },
  {
    type: "faq",
    name: "FAQ Accordion",
    category: "marketing",
    icon: "CircleHelp",
    eyebrow: "FAQ",
    title: "Answer common questions",
    body: "Expandable answers for objections, support questions, and SEO coverage.",
    primaryCta: "Ask a question",
    items: ["Pricing", "Timeline", "Process", "Support"],
    aiPrompt: "Use near conversion points or on complex offer pages to answer objections.",
  },
  {
    type: "testimonials",
    name: "Testimonials",
    category: "marketing",
    icon: "Star",
    eyebrow: "Social proof",
    title: "Trusted by happy customers",
    body: "Trust-building reviews, quotes, ratings, logos, and outcomes.",
    primaryCta: "Read stories",
    items: ["Excellent results", "Fast launch", "Clear process", "Great support"],
    aiPrompt: "Use after offer sections to increase trust with quotes, ratings, and outcomes.",
  },
  {
    type: "pricing",
    name: "Pricing Table",
    category: "commerce",
    icon: "BadgeDollarSign",
    eyebrow: "Pricing",
    title: "Choose the right plan",
    body: "Plan comparison with features, highlights, and conversion routing.",
    primaryCta: "Choose plan",
    items: ["Starter", "Pro", "Business", "Custom"],
    aiPrompt: "Use when the business sells packages, plans, memberships, or subscription tiers.",
  },
  {
    type: "offerGrid",
    name: "Product or Offer Grid",
    category: "commerce",
    icon: "ShoppingBag",
    eyebrow: "Catalog",
    title: "Browse featured offers",
    body: "Merchandising grid for products, listings, programs, or packages.",
    primaryCta: "View offers",
    items: ["Product card", "Package card", "Listing card", "Program card"],
    aiPrompt: "Use when the prompt requires multiple sellable or browsable items.",
  },
  {
    type: "floatingWhatsApp",
    name: "Floating WhatsApp",
    category: "marketing",
    icon: "MessageCircle",
    eyebrow: "Chat",
    title: "Floating WhatsApp",
    body: "Persistent WhatsApp contact action with mobile-first placement controls.",
    primaryCta: "Chat on WhatsApp",
    items: ["Mobile-first", "Fast contact", "Floating action"],
    aiPrompt: "Use for service and local businesses where direct chat is a key conversion path.",
  },
  {
    type: "locationMap",
    name: "Location Map",
    category: "dynamic",
    icon: "MapPin",
    eyebrow: "Visit us",
    title: "Find our location",
    body: "Map section with address, opening hours, contact details, and route CTA.",
    primaryCta: "Get directions",
    items: ["Address", "Hours", "Directions", "Contact"],
    aiPrompt: "Use when a business has a physical location or service area.",
  },
  {
    type: "smartFooter",
    name: "Smart Footer",
    category: "layout",
    icon: "PanelBottom",
    eyebrow: "Footer",
    title: "Smart Footer",
    body: "Site-wide footer with navigation, legal links, social links, and contact details.",
    primaryCta: "Contact us",
    secondaryCta: "Subscribe",
    items: ["Link columns", "Legal links", "Social links", "Newsletter"],
    aiPrompt: "Use as the final site-wide section for navigation, contact, and compliance details.",
  },
];

function createPremiumDefinition(seed: PremiumWidgetSeed): WidgetDefinition {
  return {
    type: seed.type,
    name: seed.name,
    icon: seed.icon,
    category: seed.category,
    canHaveChildren: false,
    render: PremiumWidget,
    aiPrompt: seed.aiPrompt,
    defaultNode: {
      type: seed.type,
      children: [],
      props: {
        eyebrow: seed.eyebrow,
        title: seed.title,
        body: seed.body,
        primaryCta: seed.primaryCta,
        secondaryCta: seed.secondaryCta,
        items: seed.items,
      },
      style: {
        width: "100%",
      },
    },
    properties: sharedProperties,
  };
}

export const PremiumWidgetDefinitions = premiumWidgetSeeds.map(
  createPremiumDefinition
);

export const SmartHeaderDefinition = PremiumWidgetDefinitions[0];
export const ConversionHeroDefinition = PremiumWidgetDefinitions[1];
export const LeadFormDefinition = PremiumWidgetDefinitions[2];
export const CardGridDefinition = PremiumWidgetDefinitions[3];
export const GalleryLightboxDefinition = PremiumWidgetDefinitions[4];
export const FaqAccordionDefinition = PremiumWidgetDefinitions[5];
export const TestimonialsDefinition = PremiumWidgetDefinitions[6];
export const PricingTableDefinition = PremiumWidgetDefinitions[7];
export const OfferGridDefinition = PremiumWidgetDefinitions[8];
export const FloatingWhatsAppDefinition = PremiumWidgetDefinitions[9];
export const LocationMapDefinition = PremiumWidgetDefinitions[10];
export const SmartFooterDefinition = PremiumWidgetDefinitions[11];
