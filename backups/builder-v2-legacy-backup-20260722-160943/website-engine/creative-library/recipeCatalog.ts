import { CREATIVE_LIBRARY_VERSION_STRING } from "./version";
import type { CreativeRecipe, CreativeRecipeFamily } from "./creativeRecipe";
import { GENERIC_ARCHETYPES, GENERIC_INDUSTRIES } from "./creativeRecipe";

type RecipeSeries = Readonly<{
  prefix: string;
  label: string;
  family: CreativeRecipeFamily;
  variant: string;
  count: number;
  purpose: string;
  conversionRole: string;
  rhythm: CreativeRecipe["compositionIntent"]["rhythm"];
  industries?: string[];
  archetypes?: CreativeRecipe["compatibility"]["supportedArchetypes"];
  density?: CreativeRecipe["metadata"]["contentDensity"];
  mediaRatio?: CreativeRecipe["metadata"]["mediaRatio"];
  whitespace?: CreativeRecipe["metadata"]["whitespaceLevel"];
  cta?: CreativeRecipe["metadata"]["ctaProminence"];
  luxury?: CreativeRecipe["metadata"]["luxuryLevel"];
  editorial?: CreativeRecipe["metadata"]["editorialLevel"];
  trust?: CreativeRecipe["metadata"]["trustLevel"];
}>;

const healthcare = ["healthcare", "professional-services", "education"];
const realEstate = ["real-estate", "hospitality", "interior-design"];
const restaurant = ["restaurant", "hospitality", "d2c"];
const automotive = ["automotive", "professional-services", "d2c"];
const education = ["education", "professional-services", "technology-saas"];
const d2c = ["d2c", "ecommerce", "technology-saas"];

const series: RecipeSeries[] = [
  { prefix: "HeroEditorialSplit", label: "Editorial Split Hero", family: "hero", variant: "editorial-split", count: 10, purpose: "Open with balanced message, CTA, and media metadata.", conversionRole: "primary introduction", rhythm: "opening", mediaRatio: "balanced", editorial: "high" },
  { prefix: "HeroLuxuryImmersive", label: "Luxury Immersive Hero", family: "hero", variant: "luxury-immersive", count: 10, purpose: "Open with premium image-led atmosphere and restrained copy.", conversionRole: "aspirational lead", rhythm: "opening", mediaRatio: "dominant", whitespace: "expansive", luxury: "high" },
  { prefix: "HeroCenteredMinimal", label: "Centered Minimal Hero", family: "hero", variant: "centered-minimal", count: 10, purpose: "Open with focused value and quiet composition.", conversionRole: "clarity lead", rhythm: "opening", mediaRatio: "low", whitespace: "spacious" },
  { prefix: "HeroProductShowcase", label: "Product Showcase Hero", family: "hero", variant: "product-showcase", count: 10, purpose: "Open with product value, proof slots, and clear CTA.", conversionRole: "product conversion", rhythm: "opening", industries: d2c, archetypes: ["ecommerce", "catalogue", "product_launch", "landing_page"], mediaRatio: "high", cta: "strong" },
  { prefix: "HeroAppointmentFocused", label: "Appointment Focused Hero", family: "hero", variant: "appointment-focused", count: 8, purpose: "Prioritize appointment intent while keeping availability facts explicit.", conversionRole: "appointment booking", rhythm: "opening", industries: healthcare, archetypes: ["appointment", "lead_generation"], trust: "high", cta: "dominant" },
  { prefix: "HeroRestaurantExperience", label: "Restaurant Experience Hero", family: "hero", variant: "restaurant-experience", count: 8, purpose: "Introduce menu, ambience, and reservation paths without inventing hours.", conversionRole: "reservation intent", rhythm: "opening", industries: restaurant, archetypes: ["restaurant_menu", "booking"], mediaRatio: "dominant" },
  { prefix: "HeroSaaSGlass", label: "SaaS Glass Hero", family: "hero", variant: "saas-glass", count: 8, purpose: "Present technical clarity with product narrative and proof slots.", conversionRole: "trial or demo intent", rhythm: "opening", industries: ["technology-saas", "professional-services", "d2c"], archetypes: ["saas", "landing_page"], mediaRatio: "balanced" },
  { prefix: "HeroArchitecturePortfolio", label: "Architecture Portfolio Hero", family: "hero", variant: "architecture-portfolio", count: 8, purpose: "Lead with spatial craft, project tone, and consultation path.", conversionRole: "portfolio inquiry", rhythm: "opening", industries: ["interior-design", "real-estate", "hospitality"], archetypes: ["portfolio", "property_showcase"], mediaRatio: "dominant", whitespace: "expansive" },
  { prefix: "HeroAutomotivePerformance", label: "Automotive Performance Hero", family: "hero", variant: "automotive-performance", count: 8, purpose: "Frame vehicle/service intent with energetic action metadata.", conversionRole: "booking or inquiry", rhythm: "opening", industries: automotive, archetypes: ["lead_generation", "booking", "catalogue"], mediaRatio: "high" },
  { prefix: "HeroEducationTrust", label: "Education Trust Hero", family: "hero", variant: "education-trust", count: 8, purpose: "Introduce programs and admissions without fabricating outcomes.", conversionRole: "admissions inquiry", rhythm: "opening", industries: education, archetypes: ["brochure", "catalogue", "lead_generation"], trust: "high" },

  { prefix: "GalleryMasonryEditorial", label: "Masonry Editorial Gallery", family: "gallery", variant: "masonry-editorial", count: 8, purpose: "Show visual variety with editorial rhythm.", conversionRole: "visual inspection", rhythm: "support", mediaRatio: "dominant" },
  { prefix: "GalleryLifestyleRail", label: "Lifestyle Rail Gallery", family: "gallery", variant: "lifestyle-rail", count: 6, purpose: "Show horizontal lifestyle media with caption metadata.", conversionRole: "desire building", rhythm: "support", mediaRatio: "high" },
  { prefix: "GalleryFullscreenImmersive", label: "Fullscreen Immersive Gallery", family: "gallery", variant: "fullscreen-immersive", count: 6, purpose: "Create a cinematic visual inspection moment.", conversionRole: "visual immersion", rhythm: "support", mediaRatio: "dominant", luxury: "high" },
  { prefix: "GalleryProductGrid", label: "Product Grid Gallery", family: "gallery", variant: "product-grid", count: 6, purpose: "Show product imagery in comparable groups.", conversionRole: "product inspection", rhythm: "support", industries: d2c, archetypes: ["ecommerce", "catalogue"], mediaRatio: "high" },
  { prefix: "GalleryArchitecturePortfolio", label: "Architecture Portfolio Gallery", family: "gallery", variant: "architecture-portfolio", count: 6, purpose: "Show craft, spaces, materials, and visual proof.", conversionRole: "portfolio proof", rhythm: "support", industries: realEstate, archetypes: ["portfolio", "property_showcase"], mediaRatio: "dominant" },
  { prefix: "GalleryBeforeAfter", label: "Before After Gallery", family: "gallery", variant: "before-after", count: 4, purpose: "Compare real before-after assets only when provided.", conversionRole: "visual proof", rhythm: "proof", industries: ["automotive", "interior-design", "beauty-wellness"], mediaRatio: "high", trust: "high" },

  { prefix: "CTAFinalConversionBlock", label: "Final Conversion Block", family: "cta", variant: "final-conversion", count: 8, purpose: "Close with a direct action and reassurance metadata.", conversionRole: "final conversion", rhythm: "closure", cta: "dominant" },
  { prefix: "CTAInlineTrustLead", label: "Inline Trust Lead CTA", family: "cta", variant: "inline-trust-lead", count: 6, purpose: "Pair action metadata with adjacent trust proof.", conversionRole: "trust-led conversion", rhythm: "conversion", cta: "strong", trust: "high" },
  { prefix: "CTABookingPanel", label: "Booking Panel CTA", family: "cta", variant: "booking-panel", count: 6, purpose: "Group booking path, contact, and next-step metadata.", conversionRole: "booking conversion", rhythm: "conversion", industries: ["healthcare", "restaurant", "hospitality", "automotive"], archetypes: ["booking", "appointment"], cta: "dominant" },
  { prefix: "CTAStickyMobile", label: "Sticky Mobile CTA", family: "cta", variant: "sticky-mobile", count: 4, purpose: "Keep mobile conversion action reachable.", conversionRole: "mobile conversion", rhythm: "conversion", cta: "dominant" },
  { prefix: "CTAEditorialMinimal", label: "Editorial Minimal CTA", family: "cta", variant: "editorial-minimal", count: 6, purpose: "Use restrained conversion metadata for premium pages.", conversionRole: "soft conversion", rhythm: "closure", cta: "subtle", editorial: "high" },
  { prefix: "CTAQuoteRequest", label: "Quote Request CTA", family: "cta", variant: "quote-request", count: 5, purpose: "Handle unknown pricing or scope through quote request metadata.", conversionRole: "quote request", rhythm: "conversion", cta: "strong" },

  { prefix: "TrustCredentialBand", label: "Credential Trust Band", family: "trust", variant: "credential-band", count: 6, purpose: "Declare verified credentials only when provided.", conversionRole: "trust support", rhythm: "proof", trust: "high" },
  { prefix: "TrustLogoLedger", label: "Logo Ledger Trust", family: "trust", variant: "logo-ledger", count: 6, purpose: "Show provided partner, client, or credential marks.", conversionRole: "trust proof", rhythm: "proof", trust: "high" },
  { prefix: "TrustLocalAssurance", label: "Local Assurance Trust", family: "trust", variant: "local-assurance", count: 5, purpose: "Explain locality and service presence without fake claims.", conversionRole: "local trust", rhythm: "proof", trust: "high" },
  { prefix: "ClinicTrustBand", label: "Clinic Trust Band", family: "trust", variant: "clinic-trust-band", count: 4, purpose: "Provide healthcare reassurance without inventing credentials.", conversionRole: "care reassurance", rhythm: "proof", industries: healthcare, archetypes: ["appointment", "lead_generation"], trust: "high" },

  { prefix: "ProofMetricLedger", label: "Metric Ledger Proof", family: "proof", variant: "metric-ledger", count: 6, purpose: "Display only provided metrics and proof.", conversionRole: "proof support", rhythm: "proof", trust: "high" },
  { prefix: "ProofReviewStack", label: "Review Stack Proof", family: "proof", variant: "review-stack", count: 6, purpose: "Show reviews only when provided with attribution metadata.", conversionRole: "social proof", rhythm: "proof", trust: "high" },
  { prefix: "ProofCaseStudyTeaser", label: "Case Study Teaser Proof", family: "proof", variant: "case-study-teaser", count: 6, purpose: "Preview case outcomes without inventing numbers.", conversionRole: "case proof", rhythm: "proof", editorial: "high" },
  { prefix: "ProofCertificationPanel", label: "Certification Panel Proof", family: "proof", variant: "certification-panel", count: 4, purpose: "Show certifications only when provided.", conversionRole: "credential proof", rhythm: "proof", trust: "high" },
  { prefix: "OutcomeProofGuarded", label: "Outcome Proof Guarded", family: "proof", variant: "outcome-proof-guarded", count: 4, purpose: "Represent education or service outcomes only with proof.", conversionRole: "guarded proof", rhythm: "proof", industries: education, trust: "high" },

  { prefix: "ServiceMatrixCards", label: "Service Matrix Cards", family: "service", variant: "matrix-cards", count: 10, purpose: "Make services comparable and scannable.", conversionRole: "service selection", rhythm: "support" },
  { prefix: "ServiceEditorialList", label: "Editorial Service List", family: "service", variant: "editorial-list", count: 6, purpose: "Explain services with premium prose metadata.", conversionRole: "service education", rhythm: "support", editorial: "high" },
  { prefix: "VehicleServiceMatrix", label: "Vehicle Service Matrix", family: "service", variant: "vehicle-service-matrix", count: 5, purpose: "Organize automotive services without claiming warranty terms.", conversionRole: "service booking", rhythm: "support", industries: automotive },
  { prefix: "ServiceSafetyFAQ", label: "Service Safety FAQ", family: "service", variant: "service-safety-faq", count: 4, purpose: "Explain sensitive service requirements without unsupported claims.", conversionRole: "service reassurance", rhythm: "support", industries: healthcare, trust: "high" },

  { prefix: "ProductFeatureStack", label: "Product Feature Stack", family: "product", variant: "feature-stack", count: 10, purpose: "Explain product value through editable feature groups.", conversionRole: "product education", rhythm: "support", industries: d2c },
  { prefix: "ProductShowcaseCards", label: "Product Showcase Cards", family: "product", variant: "showcase-cards", count: 7, purpose: "Show product categories without fake prices.", conversionRole: "product inspection", rhythm: "support", industries: d2c },
  { prefix: "CategoryGrid", label: "Category Grid", family: "product", variant: "category-grid", count: 8, purpose: "Organize categories for ecommerce and catalogue journeys.", conversionRole: "category navigation", rhythm: "support", industries: d2c, archetypes: ["ecommerce", "catalogue"] },

  { prefix: "ArchitecturePortfolio", label: "Architecture Portfolio", family: "portfolio", variant: "architecture-portfolio", count: 8, purpose: "Show spatial project metadata and consultation path.", conversionRole: "portfolio inquiry", rhythm: "support", industries: realEstate },
  { prefix: "ProjectShowcase", label: "Project Showcase", family: "portfolio", variant: "project-showcase", count: 8, purpose: "Display projects without inventing awards or availability.", conversionRole: "project inspection", rhythm: "support", industries: realEstate, archetypes: ["property_showcase", "portfolio"] },
  { prefix: "CaseStudyPortfolio", label: "Case Study Portfolio", family: "portfolio", variant: "case-study-portfolio", count: 9, purpose: "Preview work, process, and result proof safely.", conversionRole: "case study proof", rhythm: "proof" },

  { prefix: "ProcessTimeline", label: "Process Timeline", family: "process", variant: "timeline", count: 8, purpose: "Explain stages as editable process metadata.", conversionRole: "process clarity", rhythm: "support" },
  { prefix: "AppointmentPath", label: "Appointment Path", family: "process", variant: "appointment-path", count: 6, purpose: "Explain appointment request path without promising availability.", conversionRole: "appointment clarity", rhythm: "support", industries: healthcare, archetypes: ["appointment"] },
  { prefix: "AdmissionsPath", label: "Admissions Path", family: "process", variant: "admissions-path", count: 6, purpose: "Explain admissions stages without guarantees.", conversionRole: "admissions clarity", rhythm: "support", industries: education },

  { prefix: "FAQObjectionAccordion", label: "Objection FAQ Accordion", family: "faq", variant: "objection-accordion", count: 6, purpose: "Answer conversion objections clearly.", conversionRole: "objection handling", rhythm: "support" },
  { prefix: "FAQCompactSupport", label: "Compact FAQ Support", family: "faq", variant: "compact-support", count: 4, purpose: "Provide concise answers near conversion.", conversionRole: "support clarity", rhythm: "support" },
  { prefix: "FAQCategoryTabs", label: "FAQ Category Tabs", family: "faq", variant: "category-tabs", count: 4, purpose: "Group FAQs by visitor intent.", conversionRole: "information clarity", rhythm: "support" },
  { prefix: "ServiceSafetyFAQPanel", label: "Service Safety FAQ Panel", family: "faq", variant: "service-safety-panel", count: 3, purpose: "Handle safety and compliance questions safely.", conversionRole: "care reassurance", rhythm: "support", industries: healthcare },
  { prefix: "AdmissionsFAQ", label: "Admissions FAQ", family: "faq", variant: "admissions-faq", count: 3, purpose: "Explain course/admissions questions without outcome claims.", conversionRole: "education reassurance", rhythm: "support", industries: education },

  { prefix: "ContactLeadCaptureForm", label: "Lead Capture Contact", family: "contact", variant: "lead-capture", count: 5, purpose: "Collect lead details with clear consent metadata.", conversionRole: "lead capture", rhythm: "conversion" },
  { prefix: "ContactSplitMap", label: "Split Map Contact", family: "contact", variant: "split-map", count: 5, purpose: "Pair contact details with location context.", conversionRole: "local contact", rhythm: "conversion" },
  { prefix: "ContactAppointmentRequest", label: "Appointment Request Contact", family: "contact", variant: "appointment-request", count: 5, purpose: "Collect appointment requests without promising availability.", conversionRole: "appointment request", rhythm: "conversion", industries: healthcare },
  { prefix: "ContactMinimalEditorial", label: "Minimal Editorial Contact", family: "contact", variant: "minimal-editorial", count: 5, purpose: "Close premium pages with restrained contact metadata.", conversionRole: "soft lead", rhythm: "closure", editorial: "high" },

  { prefix: "FooterTrustClosure", label: "Trust Closure Footer", family: "footer", variant: "trust-closure", count: 5, purpose: "Close with navigation and trust reminders.", conversionRole: "closure", rhythm: "closure" },
  { prefix: "FooterMegaEditorial", label: "Mega Editorial Footer", family: "footer", variant: "mega-editorial", count: 5, purpose: "Provide rich navigation and brand closure.", conversionRole: "navigation closure", rhythm: "closure", editorial: "high" },
  { prefix: "FooterLocalBusiness", label: "Local Business Footer", family: "footer", variant: "local-business", count: 5, purpose: "Surface local details and contact paths.", conversionRole: "local closure", rhythm: "closure" },
  { prefix: "FooterMinimalBrand", label: "Minimal Brand Footer", family: "footer", variant: "minimal-brand", count: 5, purpose: "Use quiet closure for portfolio/editorial sites.", conversionRole: "brand closure", rhythm: "closure" },

  { prefix: "TestimonialQuoteStack", label: "Quote Stack Testimonials", family: "testimonial", variant: "quote-stack", count: 7, purpose: "Show testimonials only if provided.", conversionRole: "social proof", rhythm: "proof", trust: "high" },
  { prefix: "TestimonialVideoCards", label: "Video Testimonial Cards", family: "testimonial", variant: "video-cards", count: 6, purpose: "Use video proof only with real assets.", conversionRole: "social proof", rhythm: "proof", mediaRatio: "high" },
  { prefix: "TestimonialReviewRail", label: "Review Rail", family: "testimonial", variant: "review-rail", count: 7, purpose: "Show review snippets with attribution only if provided.", conversionRole: "social proof", rhythm: "proof" },

  { prefix: "PricingTierCards", label: "Pricing Tier Cards", family: "pricing", variant: "tier-cards", count: 5, purpose: "Show pricing only when provided.", conversionRole: "pricing clarity", rhythm: "support" },
  { prefix: "PricingQuoteRequest", label: "Quote Request Pricing", family: "pricing", variant: "quote-request", count: 5, purpose: "Handle unknown pricing through quote requests.", conversionRole: "lead conversion", rhythm: "conversion" },
  { prefix: "PricingMembershipPanel", label: "Membership Pricing Panel", family: "pricing", variant: "membership-panel", count: 5, purpose: "Explain recurring plans with explicit terms.", conversionRole: "pricing clarity", rhythm: "support" },

  { prefix: "ComparisonTableSimple", label: "Simple Comparison Table", family: "comparison", variant: "simple-table", count: 5, purpose: "Compare options without fake claims.", conversionRole: "decision support", rhythm: "support" },
  { prefix: "ComparisonFeatureColumns", label: "Feature Columns Comparison", family: "comparison", variant: "feature-columns", count: 5, purpose: "Compare offering fit by feature.", conversionRole: "decision support", rhythm: "support" },
  { prefix: "ComparisonGoodBetterBest", label: "Good Better Best Comparison", family: "comparison", variant: "good-better-best", count: 5, purpose: "Show tier logic without prices unless provided.", conversionRole: "decision support", rhythm: "support" },

  { prefix: "MapLocationContext", label: "Location Context Map", family: "map", variant: "location-context", count: 5, purpose: "Explain location and route context.", conversionRole: "local clarity", rhythm: "support" },
  { prefix: "MapServiceArea", label: "Service Area Map", family: "map", variant: "service-area", count: 5, purpose: "Show service area without inventing exact coverage.", conversionRole: "local clarity", rhythm: "support" },
  { prefix: "MapVenueDirections", label: "Venue Directions Map", family: "map", variant: "venue-directions", count: 5, purpose: "Help visitors navigate to a provided venue/location.", conversionRole: "directions", rhythm: "support" },

  { prefix: "BookingPanelAppointment", label: "Appointment Booking Panel", family: "booking", variant: "appointment-panel", count: 5, purpose: "Structure appointment request path.", conversionRole: "appointment conversion", rhythm: "conversion", industries: healthcare },
  { prefix: "BookingRoomReservation", label: "Room Reservation Panel", family: "booking", variant: "room-reservation", count: 5, purpose: "Structure hotel/resort reservation inquiry.", conversionRole: "booking conversion", rhythm: "conversion", industries: ["hospitality", "restaurant", "real-estate"], archetypes: ["hotel_resort", "booking"] },
  { prefix: "BookingRestaurantTable", label: "Restaurant Table Booking", family: "booking", variant: "restaurant-table", count: 5, purpose: "Structure restaurant booking inquiry.", conversionRole: "reservation conversion", rhythm: "conversion", industries: restaurant, archetypes: ["restaurant_menu", "booking"] },

  { prefix: "StickyActionMobile", label: "Mobile Sticky Action", family: "sticky-action", variant: "mobile-action", count: 4, purpose: "Keep one key action visible on mobile.", conversionRole: "mobile conversion", rhythm: "conversion", cta: "dominant" },
  { prefix: "StickyContactRail", label: "Sticky Contact Rail", family: "sticky-action", variant: "contact-rail", count: 3, purpose: "Keep contact access nearby on long pages.", conversionRole: "lead conversion", rhythm: "conversion" },
  { prefix: "StickyBookingAssist", label: "Sticky Booking Assist", family: "sticky-action", variant: "booking-assist", count: 3, purpose: "Support booking-heavy journeys.", conversionRole: "booking conversion", rhythm: "conversion" },

  { prefix: "NavigationEditorialMega", label: "Editorial Mega Navigation", family: "navigation", variant: "editorial-mega", count: 5, purpose: "Organize larger pages with editable navigation metadata.", conversionRole: "wayfinding", rhythm: "opening" },
  { prefix: "NavigationMinimalTopbar", label: "Minimal Topbar Navigation", family: "navigation", variant: "minimal-topbar", count: 5, purpose: "Use restrained navigation for premium or focused pages.", conversionRole: "wayfinding", rhythm: "opening" },
  { prefix: "NavigationConversionHeader", label: "Conversion Header Navigation", family: "navigation", variant: "conversion-header", count: 5, purpose: "Keep primary CTA visible in header metadata.", conversionRole: "header conversion", rhythm: "opening", cta: "strong" },

  { prefix: "TimelineMilestone", label: "Milestone Timeline", family: "timeline", variant: "milestone", count: 5, purpose: "Show dated milestones only if provided.", conversionRole: "history proof", rhythm: "support" },
  { prefix: "TimelineProcessNarrative", label: "Process Narrative Timeline", family: "timeline", variant: "process-narrative", count: 5, purpose: "Tell process or admissions journey in sequence.", conversionRole: "process clarity", rhythm: "support" },

  { prefix: "BlogMediaFeature", label: "Blog Media Feature", family: "blog-media", variant: "feature", count: 5, purpose: "Feature editorial posts without generating article content.", conversionRole: "content engagement", rhythm: "support" },
  { prefix: "BlogMediaGrid", label: "Blog Media Grid", family: "blog-media", variant: "grid", count: 5, purpose: "Organize articles/media metadata in editable cards.", conversionRole: "content discovery", rhythm: "support" },

  { prefix: "TeamLeadershipGrid", label: "Leadership Team Grid", family: "team", variant: "leadership-grid", count: 5, purpose: "Show team members only when provided.", conversionRole: "team trust", rhythm: "proof", trust: "high" },
  { prefix: "TeamEditorialProfiles", label: "Editorial Team Profiles", family: "team", variant: "editorial-profiles", count: 5, purpose: "Present people and roles without inventing credentials.", conversionRole: "people trust", rhythm: "proof", trust: "high" },

  { prefix: "FeatureIconNarrative", label: "Feature Icon Narrative", family: "feature", variant: "icon-narrative", count: 3, purpose: "Explain features in scannable groups.", conversionRole: "feature education", rhythm: "support" },
  { prefix: "StatsGuardedLedger", label: "Guarded Stats Ledger", family: "stats", variant: "guarded-ledger", count: 3, purpose: "Show statistics only when facts are provided.", conversionRole: "proof support", rhythm: "proof", trust: "high" },
  { prefix: "LogoCloudProvided", label: "Provided Logo Cloud", family: "logo-cloud", variant: "provided-only", count: 3, purpose: "Show logos only when supplied.", conversionRole: "logo proof", rhythm: "proof" },
  { prefix: "SocialProofGuarded", label: "Guarded Social Proof", family: "social-proof", variant: "guarded", count: 3, purpose: "Show social proof without invented reviews.", conversionRole: "social proof", rhythm: "proof" },
  { prefix: "NewsletterEditorial", label: "Editorial Newsletter", family: "newsletter", variant: "editorial", count: 3, purpose: "Invite subscriptions with clear expectation metadata.", conversionRole: "subscriber conversion", rhythm: "conversion" },
  { prefix: "AnnouncementBanner", label: "Announcement Banner", family: "announcement", variant: "banner", count: 3, purpose: "Surface time-sensitive provided announcements.", conversionRole: "announcement", rhythm: "opening" },
  { prefix: "AwardsProvidedPanel", label: "Provided Awards Panel", family: "awards", variant: "provided-panel", count: 3, purpose: "Display awards only when provided.", conversionRole: "award proof", rhythm: "proof" },
  { prefix: "IntegrationsGrid", label: "Integrations Grid", family: "integrations", variant: "grid", count: 3, purpose: "Show integrations only from provided product data.", conversionRole: "technical proof", rhythm: "support", industries: ["technology-saas", "d2c", "professional-services"] },
  { prefix: "EcommerceCategoryRail", label: "Ecommerce Category Rail", family: "ecommerce-category", variant: "category-rail", count: 3, purpose: "Show product categories without price invention.", conversionRole: "category browse", rhythm: "support", industries: d2c, archetypes: ["ecommerce", "catalogue"] },
  { prefix: "EcommerceProductDetail", label: "Ecommerce Product Detail", family: "ecommerce-product", variant: "detail", count: 3, purpose: "Explain product details with provided facts.", conversionRole: "purchase intent", rhythm: "support", industries: d2c, archetypes: ["ecommerce", "product_launch"] },
  { prefix: "LocationNarrative", label: "Location Narrative", family: "location", variant: "narrative", count: 3, purpose: "Explain locality using provided context.", conversionRole: "location confidence", rhythm: "support", industries: realEstate },
  { prefix: "AmenityGallery", label: "Amenity Gallery", family: "amenities", variant: "gallery", count: 3, purpose: "Show amenities only with provided assets or facts.", conversionRole: "amenity inspection", rhythm: "support", industries: realEstate, archetypes: ["property_showcase", "hotel_resort"] },
  { prefix: "FloorPlanPreview", label: "Floor Plan Preview", family: "floor-plan", variant: "preview", count: 3, purpose: "Preview provided floor plans without inventing dimensions.", conversionRole: "plan inspection", rhythm: "support", industries: realEstate, archetypes: ["property_showcase"] },
  { prefix: "MenuPreview", label: "Menu Preview", family: "menu", variant: "preview", count: 3, purpose: "Preview menu items without inventing prices.", conversionRole: "menu inspection", rhythm: "support", industries: restaurant, archetypes: ["restaurant_menu"] },
  { prefix: "ReservationPanel", label: "Reservation Panel", family: "reservation", variant: "panel", count: 3, purpose: "Guide reservation inquiry without promising availability.", conversionRole: "reservation request", rhythm: "conversion", industries: restaurant, archetypes: ["booking", "restaurant_menu"] },
  { prefix: "DoctorProfileGrid", label: "Doctor Profile Grid", family: "doctor-profile", variant: "grid", count: 3, purpose: "Show doctors only when names and credentials are provided.", conversionRole: "doctor trust", rhythm: "proof", industries: healthcare, archetypes: ["appointment"] },
  { prefix: "CourseCatalogue", label: "Course Catalogue", family: "course-list", variant: "catalogue", count: 3, purpose: "List courses without inventing outcomes or accreditation.", conversionRole: "course selection", rhythm: "support", industries: education, archetypes: ["catalogue", "brochure"] },
  { prefix: "VehicleListing", label: "Vehicle Listing", family: "vehicle-listing", variant: "listing", count: 3, purpose: "List vehicles only from provided inventory.", conversionRole: "inventory inquiry", rhythm: "support", industries: automotive, archetypes: ["catalogue"] },
  { prefix: "CaseStudyTeaser", label: "Case Study Teaser", family: "case-study", variant: "teaser", count: 3, purpose: "Tease case studies without invented metrics.", conversionRole: "case study proof", rhythm: "proof" },
  { prefix: "BeforeAfterGallery", label: "Before After Gallery", family: "before-after", variant: "gallery", count: 3, purpose: "Compare provided before-after assets only.", conversionRole: "visual proof", rhythm: "proof", industries: ["automotive", "interior-design", "beauty-wellness"] },
  { prefix: "LeadFormGuarded", label: "Guarded Lead Form", family: "lead-form", variant: "guarded", count: 3, purpose: "Collect leads with consent and missing-fact safety.", conversionRole: "lead capture", rhythm: "conversion" },
];

function pad(index: number) {
  return String(index).padStart(2, "0");
}

function toWords(value: string) {
  return value.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[-_]+/g, " ").trim();
}

function metadataFor(seriesSpec: RecipeSeries, index: number): CreativeRecipe["metadata"] {
  const density = seriesSpec.density ?? (["hero", "gallery", "portfolio"].includes(seriesSpec.family) ? "low" : "medium");
  const mediaRatio = seriesSpec.mediaRatio ?? (["hero", "gallery", "portfolio", "product"].includes(seriesSpec.family) ? "balanced" : "low");
  const whitespace = seriesSpec.whitespace ?? (index % 3 === 0 ? "spacious" : index % 2 === 0 ? "balanced" : "compact");
  return Object.freeze({
    tags: [seriesSpec.family, seriesSpec.variant, toWords(seriesSpec.prefix).toLowerCase()],
    layoutPattern: `${seriesSpec.variant}-layout-${(index % 5) + 1}`,
    gridSystem: index % 4 === 0 ? "asymmetric editorial grid" : index % 3 === 0 ? "modular card grid" : "responsive primitive grid",
    visualHierarchy: index % 3 === 0 ? "media first" : index % 2 === 0 ? "message first" : "balanced proof and action",
    whitespaceLevel: whitespace,
    asymmetryLevel: index % 5 === 0 ? "high" : index % 3 === 0 ? "moderate" : index % 2 === 0 ? "subtle" : "none",
    contentDensity: density,
    mediaRatio,
    imageFraming: mediaRatio === "dominant" ? "full-bleed editorial crop" : mediaRatio === "high" ? "large framed media" : "supporting media slot",
    typographyRhythm: index % 2 === 0 ? "large headline with compact support" : "stacked headline and narrative body",
    ctaProminence: seriesSpec.cta ?? (seriesSpec.rhythm === "conversion" ? "strong" : seriesSpec.rhythm === "opening" ? "standard" : "subtle"),
    motionSuitability: index % 4 === 0 ? "editorial" : index % 3 === 0 ? "expressive" : "minimal",
    visualComplexity: mediaRatio === "dominant" ? "cinematic" : whitespace === "spacious" ? "layered" : "simple",
    conversionIntensity: seriesSpec.rhythm === "conversion" || seriesSpec.rhythm === "closure" ? "high" : "medium",
    luxuryLevel: seriesSpec.luxury ?? (seriesSpec.variant.includes("luxury") ? "high" : "medium"),
    editorialLevel: seriesSpec.editorial ?? (seriesSpec.variant.includes("editorial") ? "high" : "medium"),
    trustLevel: seriesSpec.trust ?? (["trust", "proof", "testimonial", "doctor-profile"].includes(seriesSpec.family) ? "high" : "medium"),
    mobilePriority: ["cta", "booking", "reservation", "sticky-action", "lead-form"].includes(seriesSpec.family) ? "critical" : "high",
    uniquenessLevers: ["layoutPattern", "mediaRatio", "visualHierarchy", "whitespaceLevel", "ctaProminence", seriesSpec.variant],
    visualDensity: mediaRatio === "dominant" || mediaRatio === "high" ? "rich" : density === "low" ? "minimal" : "balanced",
  });
}

function fragmentsFor(seriesSpec: RecipeSeries, index: number): CreativeRecipe["fragments"] {
  return Object.freeze({
    layoutFragments: [`${seriesSpec.variant}-shell`, index % 2 === 0 ? "split primitive stack" : "layered primitive stack"],
    mediaFragments: [seriesSpec.family, seriesSpec.mediaRatio ?? "asset slot"].filter(Boolean),
    typographyFragments: [index % 2 === 0 ? "display headline" : "editorial heading", "support copy"],
    spacingFragments: [index % 3 === 0 ? "expansive section padding" : "balanced section padding", "responsive gap"],
    motionFragments: [index % 4 === 0 ? "stagger suitable" : "fade suitable"],
    ctaFragments: [seriesSpec.conversionRole, seriesSpec.rhythm === "conversion" ? "primary action" : "support action"],
    backgroundFragments: [index % 2 === 0 ? "surface band" : "media-aware background"],
    interactionFragments: [seriesSpec.family === "faq" ? "accordion intent" : "hover-safe primitive intent"],
  });
}

function recipeFromSeries(seriesSpec: RecipeSeries, index: number): CreativeRecipe {
  const id = `${seriesSpec.prefix}${pad(index)}`;
  const requiresMedia = ["hero", "gallery", "portfolio", "product", "map", "testimonial", "booking", "amenities", "floor-plan", "menu", "vehicle-listing", "before-after"].includes(seriesSpec.family);
  return Object.freeze({
    id,
    name: `${seriesSpec.label} ${pad(index)}`,
    family: seriesSpec.family,
    category: seriesSpec.family,
    variant: seriesSpec.variant,
    purpose: seriesSpec.purpose,
    compatibility: {
      supportedPatterns: [seriesSpec.family, seriesSpec.variant, seriesSpec.prefix],
      supportedArchetypes: seriesSpec.archetypes ?? GENERIC_ARCHETYPES,
      supportedDesignLanguages: ["Minimal", "Modern", "Premium", "Editorial", "Luxury", "Clinical", "Hospitality", "Technology", "Warm", "Architectural"],
      supportedIndustries: seriesSpec.industries ?? GENERIC_INDUSTRIES,
      suitableVisualMoods: ["calm", "trustworthy", "luxurious", "elegant", "energetic", "technical", "inspiring", "warm", "precise"],
      suitableMotionStrategies: ["Minimal", "Editorial", "Luxury", "Clinical", "Hospitality", "Automotive", "Product Showcase", "Narrative"],
    },
    requirements: {
      requiredContentFields: ["heading", "body", ...(seriesSpec.rhythm === "conversion" || seriesSpec.family === "cta" ? ["primaryCta"] : [])],
      optionalContentFields: ["eyebrow", "secondaryCta", "caption", "proofNote", "localityNote"],
      requiredAssets: requiresMedia ? ["provided media asset"] : [],
    },
    editability: {
      primitiveExpansionIntent: ["section", "container", "column", "heading", "text", ...(seriesSpec.rhythm === "conversion" || seriesSpec.family === "cta" ? ["button"] : []), ...(requiresMedia ? ["image"] : [])],
      editableFields: ["heading", "body", "cta", "media", "spacing", "background", "layout"],
      inspectorGroups: ["Content", "Typography", "Layout", "Spacing", "Background", "Media", "Animation", "Responsive", "AI"],
      aiEditableFields: ["heading", "body", "cta"],
    },
    inspectorHints: [
      { group: "Content", propertyPath: "props.text", control: "textarea", helpText: "Editable copy only; missing facts remain explicit." },
      { group: "Design", propertyPath: "style.backgroundColor", control: "color", helpText: "Theme-aware color binding." },
      { group: "Responsive", propertyPath: "style.gap", control: "slider", helpText: "Adjust layout rhythm by breakpoint." },
    ],
    responsiveBehavior: {
      desktop: ["full recipe layout", "preserve visual rhythm"],
      tablet: ["reduce columns", "preserve CTA order"],
      mobile: ["stack primitives", "keep primary action reachable"],
    },
    accessibilityNotes: ["Use semantic heading order.", "Keep buttons descriptive.", "Do not rely on motion for meaning.", "Require alt metadata for real media."],
    seoNotes: ["Use truthful section headings.", "Keep unsupported claims out of copy metadata."],
    conversionRole: seriesSpec.conversionRole,
    compositionIntent: {
      role: seriesSpec.family,
      bestBefore: seriesSpec.rhythm === "opening" ? [] : ["cta", "footer"],
      bestAfter: seriesSpec.rhythm === "opening" ? [] : ["hero", "trust"],
      rhythm: seriesSpec.rhythm,
    },
    antiPatterns: ["opaque markup block", "image-only section", "non-editable blob", "unsupported claim", "preview-only dependency"],
    conflicts: [],
    fallbacks: [{ reason: "Recipe assets or facts missing.", fallbackBehavior: "Keep required facts/assets explicit and use a simpler editable primitive layout." }],
    metadata: metadataFor(seriesSpec, index),
    fragments: fragmentsFor(seriesSpec, index),
    version: CREATIVE_LIBRARY_VERSION_STRING,
    status: "stable",
  });
}

/**
 * Builds the expanded metadata-only Creative Recipe catalog.
 *
 * @example
 * const catalog = buildCreativeRecipeCatalog();
 */
export function buildCreativeRecipeCatalog(): CreativeRecipe[] {
  return series.flatMap((seriesSpec) => Array.from({ length: seriesSpec.count }, (_, index) => recipeFromSeries(seriesSpec, index + 1)));
}
