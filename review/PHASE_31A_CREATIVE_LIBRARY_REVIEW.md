# Phase 31A Creative Library Review
Generated: Tue Jul  7 12:52:10 IST 2026


====================================================================
FILE: docs/architecture/51_CREATIVE_LIBRARY.md
====================================================================
# Creative Library

## Purpose

Creative Library is a metadata-only repository of reusable section and component recipes. It prevents visual convergence by giving the engine many safe, editable, reusable recipe variants without generating code or Builder nodes.

## Boundaries

- No rendering.
- No Builder nodes.
- No React, CSS, HTML, or JavaScript.
- No screenshots or generated images.
- No provider, MCP, DB, network, or LLM calls.

## Lifecycle Fit

- Component Engine selects component intent.
- Creative Library provides rich recipe variants.
- Composition Engine arranges selected recipes.
- Builder Blueprint Engine expands recipes into native editable primitives.
- Mapper maps native intent into Builder execution plans.

## Recipe Requirements

Every recipe declares purpose, supported patterns, archetypes, design languages, industries, visual moods, motion strategies, required content, assets, editability, inspector hints, responsive behavior, accessibility, SEO, conversion role, composition role, anti-patterns, conflicts, fallbacks, version, and status.

====================================================================
FILE: docs/modules/creative-library.md
====================================================================
# Creative Library Module

## Responsibility

Stores reusable metadata-only recipes for beautiful, unique websites.

## Public Surface

- `runCreativeLibrary()`
- `buildCreativeRecipeCatalog()`
- `buildCreativeRecipeCandidates()`
- `scoreCreativeRecipes()`
- `rankCreativeRecipes()`
- `selectCreativeRecipes()`
- `validateCreativeRecipe()`
- `runCreativeLibraryVerification()`

## Non-Goals

No rendering, Builder node output, React, CSS, HTML, JavaScript, images, providers, DB, network, LLM, Mapper execution, or production wiring.

====================================================================
FILE: docs/specifications/CreativeRecipe.md
====================================================================
# CreativeRecipe

## Purpose

`CreativeRecipe` defines reusable section/component recipe metadata that downstream engines can select, compose, expand, and map later.

## Required Fields

- `id`
- `name`
- `family`
- `category`
- `variant`
- `purpose`
- `compatibility`
- `requirements`
- `editability`
- `inspectorHints`
- `responsiveBehavior`
- `accessibilityNotes`
- `seoNotes`
- `conversionRole`
- `compositionIntent`
- `antiPatterns`
- `conflicts`
- `fallbacks`
- `metadata`
- `version`
- `status`

## Safety

Recipes are metadata only. They must not emit Builder nodes, HTML, CSS, React, JavaScript, screenshots, generated images, or provider requests.

====================================================================
FILE: docs/implementation/PHASE_31A_CREATIVE_LIBRARY.md
====================================================================
# Phase 31A - Creative Library / Recipe Repository

## Status

Implemented on 2026-07-07.

## Objective

Create a metadata-only Creative Library that stores reusable section/component recipes for beautiful, unique websites.

## Implemented

- Added `website-engine/creative-library`.
- Added Creative Recipe contracts and starter catalog.
- Added scoring, ranking, compatibility, requirements, variants, families, composition, responsive, editability, inspector hints, fallbacks, validation, and verification helpers.
- Added recipe category folders for future organization.
- Added starter recipe metadata across hero, gallery, CTA, trust/proof, service/product, FAQ, contact, footer, portfolio, process, comparison, pricing, testimonial, map/location, booking/appointment, and sticky-action.

## Safety Boundaries

- No `ai-v9` changes.
- No Builder behavior changes.
- No Builder store writes.
- No routes changed.
- No rendering changes.
- No production wiring.
- No React, CSS, HTML, or JavaScript generation.
- No Builder node output.
- No DB, network, LLM, MCP, or provider calls.
- Feature flags remain false.

## Validation

Run:

```bash
pnpm --dir apps/web-app typecheck:builder
```

## Next Phase

Phase 32 - Mapper Execution Behind Disabled Feature Flag.

====================================================================
FILE: apps/web-app/modules/builder-v2/website-engine/creative-library/README.md
====================================================================
# Creative Library

## Purpose

Creative Library stores reusable section and component recipe metadata for unique, beautiful websites.

It is not rendering, Builder nodes, React components, CSS, HTML, JavaScript, screenshots, provider output, or generated media.

## Current Status

Phase 31A Creative Library / Recipe Repository.

## Public API

- `runCreativeLibrary(input)` returns `EngineResult<CreativeLibraryResult>`.
- `buildCreativeRecipeCatalog()` returns the metadata-only recipe catalog.
- `buildCreativeRecipeCandidates(catalog, input)` filters compatible recipes.
- `scoreCreativeRecipes()` scores recipe fit.
- `rankCreativeRecipes()` sorts candidates deterministically.
- `selectCreativeRecipes()` selects recipe metadata.
- `detectRecipeCompatibility()` checks input fit.
- `detectRecipeConflicts()` returns declared conflicts.
- `buildRecipeFallbacks()` returns fallback metadata.
- `validateCreativeRecipe()` validates one recipe.
- `validateCreativeLibraryResult()` validates the full result.
- `runCreativeLibraryVerification()` performs compile-safe verification.

## Integration Alignment

- Component Engine selects component intent.
- Creative Library provides rich recipe variants.
- Composition Engine arranges selected recipes.
- Builder Blueprint Engine expands recipes into native editable primitives.
- Mapper maps native intent into Builder execution plans.

## Safety Notes

- Metadata only.
- No Builder nodes.
- No rendering.
- No React, CSS, HTML, or JavaScript.
- No providers, MCP, DB, network, or LLM calls.
- Feature flags remain false.

====================================================================
FILE: apps/web-app/modules/builder-v2/website-engine/creative-library/recipeCatalog.ts
====================================================================
import { CREATIVE_LIBRARY_VERSION_STRING } from "./version";
import type { CreativeRecipe, CreativeRecipeFamily } from "./creativeRecipe";
import { GENERIC_ARCHETYPES, GENERIC_INDUSTRIES } from "./creativeRecipe";

type Seed = Readonly<{ id: string; name: string; family: CreativeRecipeFamily; variant: string; purpose: string; conversionRole?: string; rhythm?: CreativeRecipe["compositionIntent"]["rhythm"]; industries?: string[]; archetypes?: CreativeRecipe["compatibility"]["supportedArchetypes"] }>;

const seeds: Seed[] = [
  ["HeroEditorialSplit01", "Editorial Split Hero", "hero", "editorial-split", "Open with balanced copy, CTA, and real media.", "primary introduction", "opening"],
  ["HeroLuxuryImmersive01", "Luxury Immersive Hero", "hero", "luxury-immersive", "Open with image-led premium presence.", "aspirational lead", "opening"],
  ["HeroProductValue01", "Product Value Hero", "hero", "product-value", "Explain product value with proof-ready CTA.", "product conversion", "opening"],
  ["HeroAppointmentFocused01", "Appointment Focused Hero", "hero", "appointment-focused", "Prioritize appointment action with trust.", "appointment booking", "opening", ["healthcare", "beauty-wellness", "professional-services"], ["appointment", "lead_generation"]],
  ["HeroRestaurantExperience01", "Restaurant Experience Hero", "hero", "restaurant-experience", "Surface ambience, menu path, and booking intent.", "reservation intent", "opening", ["restaurant", "hospitality"], ["restaurant_menu", "booking"]],
  ["GalleryMasonryEditorial01", "Masonry Editorial Gallery", "gallery", "masonry-editorial", "Show diverse visual proof with editorial rhythm.", "visual inspection", "support"],
  ["GalleryLifestyleRail01", "Lifestyle Rail Gallery", "gallery", "lifestyle-rail", "Show horizontal lifestyle imagery with captions.", "desire building", "support"],
  ["GalleryFullscreenImmersive01", "Fullscreen Immersive Gallery", "gallery", "fullscreen-immersive", "Create a cinematic inspection moment.", "visual immersion", "support"],
  ["GalleryProductGrid01", "Product Grid Gallery", "gallery", "product-grid", "Show product imagery in comparable groups.", "product inspection", "support", ["d2c", "ecommerce"], ["ecommerce", "catalogue"]],
  ["GalleryArchitecturePortfolio01", "Architecture Portfolio Gallery", "gallery", "architecture-portfolio", "Show project craft, materials, and spaces.", "portfolio proof", "support", ["interior-design", "real-estate"], ["portfolio", "property_showcase"]],
  ["CTAFinalConversionBlock01", "Final Conversion Block", "cta", "final-conversion", "Close with a direct action and reassurance.", "final conversion", "closure"],
  ["CTAInlineTrustLead01", "Inline Trust CTA", "cta", "inline-trust-lead", "Pair CTA with nearby proof.", "trust-led conversion", "conversion"],
  ["CTABookingPanel01", "Booking Panel CTA", "cta", "booking-panel", "Group booking path, contact, and next steps.", "booking conversion", "conversion", ["healthcare", "restaurant", "hospitality"], ["booking", "appointment"]],
  ["CTAStickyMobile01", "Sticky Mobile CTA", "cta", "sticky-mobile", "Keep mobile conversion action accessible.", "mobile conversion", "conversion"],
  ["CTAEditorialMinimal01", "Editorial Minimal CTA", "cta", "editorial-minimal", "Use quiet conversion for premium pages.", "soft conversion", "closure"],
  ["TrustCredentialBand01", "Credential Trust Band", "trust", "credential-band", "Declare verified trust cues only.", "trust support", "proof"],
  ["TrustLogoLedger01", "Logo Ledger Trust", "trust", "logo-ledger", "Show provided partner or credential marks.", "trust proof", "proof"],
  ["TrustLocalAssurance01", "Local Assurance Trust", "trust", "local-assurance", "Explain local presence without fake claims.", "local trust", "proof"],
  ["TrustPrivacyNote01", "Privacy Note Trust", "trust", "privacy-note", "Clarify privacy-sensitive action boundaries.", "privacy reassurance", "proof", ["healthcare", "professional-services"], ["appointment", "lead_generation"]],
  ["TrustProcessPromise01", "Process Promise Trust", "trust", "process-promise", "Show reliable process commitments.", "process trust", "proof"],
  ["ProofMetricLedger01", "Metric Ledger Proof", "proof", "metric-ledger", "Display only provided metrics and proof.", "proof support", "proof"],
  ["ProofReviewStack01", "Review Stack Proof", "proof", "review-stack", "Show reviews only when provided.", "social proof", "proof"],
  ["ProofCaseStudyTeaser01", "Case Study Teaser Proof", "proof", "case-study-teaser", "Preview outcomes without inventing numbers.", "case proof", "proof"],
  ["ProofBeforeAfterGuarded01", "Guarded Before After Proof", "proof", "before-after-guarded", "Show before/after only with real assets.", "visual proof", "proof"],
  ["ProofCertificationPanel01", "Certification Panel Proof", "proof", "certification-panel", "Show certifications only when provided.", "credential proof", "proof"],
  ["ServiceMatrixCards01", "Service Matrix Cards", "service", "matrix-cards", "Make services comparable and scannable.", "service selection", "support"],
  ["ServiceEditorialList01", "Editorial Service List", "service", "editorial-list", "Explain services in premium prose blocks.", "service education", "support"],
  ["ServiceIconGrid01", "Icon Service Grid", "service", "icon-grid", "Summarize offerings with compact icons.", "service overview", "support"],
  ["ProductFeatureStack01", "Product Feature Stack", "product", "feature-stack", "Explain product value through feature groups.", "product education", "support"],
  ["ProductShowcaseCards01", "Product Showcase Cards", "product", "showcase-cards", "Show product categories without fake prices.", "product inspection", "support"],
  ["FAQObjectionAccordion01", "Objection FAQ Accordion", "faq", "objection-accordion", "Answer conversion objections clearly.", "objection handling", "support"],
  ["FAQCompactSupport01", "Compact FAQ Support", "faq", "compact-support", "Provide concise answers near conversion.", "support clarity", "support"],
  ["FAQCategoryTabs01", "FAQ Category Tabs", "faq", "category-tabs", "Group FAQs by visitor intent.", "information clarity", "support"],
  ["FAQHealthcareSafety01", "Healthcare Safety FAQ", "faq", "healthcare-safety", "Handle care and privacy questions safely.", "appointment reassurance", "support", ["healthcare"], ["appointment"]],
  ["FAQAdmissionsPath01", "Admissions Path FAQ", "faq", "admissions-path", "Explain admissions/course questions.", "education reassurance", "support", ["education"], ["brochure", "catalogue"]],
  ["ContactLeadCaptureForm01", "Lead Capture Contact", "contact", "lead-capture", "Collect lead details with clear consent.", "lead capture", "conversion"],
  ["ContactSplitMap01", "Split Map Contact", "contact", "split-map", "Pair contact details with location context.", "local contact", "conversion"],
  ["ContactAppointmentRequest01", "Appointment Request Contact", "contact", "appointment-request", "Collect appointment requests without promising availability.", "appointment request", "conversion"],
  ["ContactRestaurantReservation01", "Restaurant Reservation Contact", "contact", "restaurant-reservation", "Guide reservation inquiry and directions.", "reservation request", "conversion", ["restaurant"], ["booking", "restaurant_menu"]],
  ["ContactMinimalEditorial01", "Minimal Editorial Contact", "contact", "minimal-editorial", "Close premium pages with restrained contact.", "soft lead", "closure"],
  ["FooterTrustClosure01", "Trust Closure Footer", "footer", "trust-closure", "Close with navigation and trust reminders.", "closure", "closure"],
  ["FooterMegaEditorial01", "Mega Editorial Footer", "footer", "mega-editorial", "Provide rich navigation and brand closure.", "navigation closure", "closure"],
  ["FooterLocalBusiness01", "Local Business Footer", "footer", "local-business", "Surface local details and contact paths.", "local closure", "closure"],
  ["FooterProductSupport01", "Product Support Footer", "footer", "product-support", "Close ecommerce or product sites with support.", "support closure", "closure", ["d2c", "ecommerce"], ["ecommerce", "catalogue"]],
  ["FooterMinimalBrand01", "Minimal Brand Footer", "footer", "minimal-brand", "Use quiet closure for portfolio/editorial sites.", "brand closure", "closure"],
  ["PortfolioShowcaseGrid01", "Portfolio Showcase Grid", "portfolio", "showcase-grid", "Display selected work in a structured grid.", "portfolio proof", "support"],
  ["PortfolioCaseStudyRail01", "Case Study Rail", "portfolio", "case-study-rail", "Show process and results previews.", "case study proof", "support"],
  ["PortfolioImmersiveProject01", "Immersive Project Portfolio", "portfolio", "immersive-project", "Give a larger visual project moment.", "visual proof", "support"],
  ["ProcessTimeline01", "Process Timeline", "process", "timeline", "Explain project/service stages.", "process clarity", "support"],
  ["ProcessStepCards01", "Process Step Cards", "process", "step-cards", "Show steps as editable cards.", "process clarity", "support"],
  ["ProcessConsultationFlow01", "Consultation Flow", "process", "consultation-flow", "Explain consultation or booking path.", "appointment clarity", "support"],
  ["ComparisonTableSimple01", "Simple Comparison Table", "comparison", "simple-table", "Compare options without fake claims.", "decision support", "support"],
  ["ComparisonFeatureColumns01", "Feature Columns Comparison", "comparison", "feature-columns", "Compare offering fit by feature.", "decision support", "support"],
  ["ComparisonGoodBetterBest01", "Good Better Best Comparison", "comparison", "good-better-best", "Show tier logic without prices unless provided.", "decision support", "support"],
  ["PricingTierCards01", "Pricing Tier Cards", "pricing", "tier-cards", "Show pricing only when provided.", "pricing clarity", "support"],
  ["PricingQuoteRequest01", "Quote Request Pricing", "pricing", "quote-request", "Handle unknown pricing through quote request.", "lead conversion", "conversion"],
  ["PricingMembershipPanel01", "Membership Pricing Panel", "pricing", "membership-panel", "Explain recurring plans with explicit terms.", "pricing clarity", "support"],
  ["TestimonialQuoteStack01", "Quote Stack Testimonials", "testimonial", "quote-stack", "Show testimonials only if provided.", "social proof", "proof"],
  ["TestimonialVideoCards01", "Video Testimonial Cards", "testimonial", "video-cards", "Use video proof only with real assets.", "social proof", "proof"],
  ["TestimonialReviewRail01", "Review Rail", "testimonial", "review-rail", "Show review snippets with attribution only if provided.", "social proof", "proof"],
  ["MapLocationContext01", "Location Context Map", "map", "location-context", "Explain location and route context.", "local clarity", "support"],
  ["MapServiceArea01", "Service Area Map", "map", "service-area", "Show service area without inventing exact coverage.", "local clarity", "support"],
  ["MapVenueDirections01", "Venue Directions Map", "map", "venue-directions", "Help visitors navigate to venue/location.", "directions", "support"],
  ["BookingPanelAppointment01", "Appointment Booking Panel", "booking", "appointment-panel", "Structure appointment request path.", "appointment conversion", "conversion"],
  ["BookingRoomReservation01", "Room Reservation Panel", "booking", "room-reservation", "Structure hotel/resort reservation inquiry.", "booking conversion", "conversion", ["hospitality"], ["hotel_resort", "booking"]],
  ["BookingRestaurantTable01", "Restaurant Table Booking", "booking", "restaurant-table", "Structure restaurant booking inquiry.", "reservation conversion", "conversion", ["restaurant"], ["restaurant_menu", "booking"]],
  ["StickyActionMobile01", "Mobile Sticky Action", "sticky-action", "mobile-action", "Keep one key action visible on mobile.", "mobile conversion", "conversion"],
  ["StickyContactRail01", "Sticky Contact Rail", "sticky-action", "contact-rail", "Keep contact access nearby on long pages.", "lead conversion", "conversion"],
  ["StickyBookingAssist01", "Sticky Booking Assist", "sticky-action", "booking-assist", "Support booking-heavy journeys.", "booking conversion", "conversion"],
].map(([id, name, family, variant, purpose, conversionRole, rhythm, industries, archetypes]) => ({ id, name, family, variant, purpose, conversionRole, rhythm, industries, archetypes } as Seed));

function recipeFromSeed(seed: Seed): CreativeRecipe {
  return Object.freeze({
    id: seed.id,
    name: seed.name,
    family: seed.family,
    category: seed.family,
    variant: seed.variant,
    purpose: seed.purpose,
    compatibility: {
      supportedPatterns: [seed.family, seed.variant],
      supportedArchetypes: seed.archetypes ?? GENERIC_ARCHETYPES,
      supportedDesignLanguages: ["Minimal", "Modern", "Premium", "Editorial", "Luxury", "Clinical", "Hospitality", "Technology", "Warm"],
      supportedIndustries: seed.industries ?? GENERIC_INDUSTRIES,
      suitableVisualMoods: ["calm", "trustworthy", "luxurious", "elegant", "energetic", "technical", "inspiring"],
      suitableMotionStrategies: ["Minimal", "Editorial", "Luxury", "Clinical", "Hospitality", "Automotive", "Product Showcase", "Narrative"],
    },
    requirements: {
      requiredContentFields: ["heading", "body", ...(seed.family === "cta" || seed.family === "booking" || seed.family === "contact" ? ["primaryCta"] : [])],
      optionalContentFields: ["eyebrow", "secondaryCta", "caption", "proofNote"],
      requiredAssets: ["primary visual asset"].filter(() => ["hero", "gallery", "portfolio", "product", "map", "testimonial", "booking"].includes(seed.family)),
    },
    editability: {
      primitiveExpansionIntent: ["section", "container", "column", "heading", "text", "button", ...(seed.family === "gallery" || seed.family === "hero" || seed.family === "portfolio" ? ["image"] : [])],
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
    accessibilityNotes: ["Use semantic heading order.", "Keep buttons descriptive.", "Do not rely on motion for meaning."],
    seoNotes: ["Use truthful section headings.", "Avoid invented locations, awards, credentials, prices, or metrics."],
    conversionRole: seed.conversionRole ?? "support journey",
    compositionIntent: {
      role: seed.family,
      bestBefore: seed.rhythm === "opening" ? [] : ["cta", "footer"],
      bestAfter: seed.rhythm === "opening" ? [] : ["hero", "trust"],
      rhythm: seed.rhythm ?? "support",
    },
    antiPatterns: ["opaque html block", "screenshot-only section", "non-editable blob", "fake claims", "premium preview dependency"],
    conflicts: [],
    fallbacks: [{ reason: "Recipe assets or facts missing.", fallbackBehavior: "Keep required facts/assets explicit and use a simpler editable primitive layout." }],
    metadata: {
      tags: [seed.family, seed.variant],
      uniquenessLevers: ["layout rhythm", "media ratio", "copy density", "CTA placement"],
      visualDensity: seed.family === "hero" || seed.family === "gallery" ? "rich" : "balanced",
      conversionIntensity: seed.rhythm === "conversion" || seed.rhythm === "closure" ? "high" : "medium",
    },
    version: CREATIVE_LIBRARY_VERSION_STRING,
    status: "starter",
  });
}

/**
 * Builds the metadata-only Creative Recipe catalog.
 *
 * @example
 * const catalog = buildCreativeRecipeCatalog();
 */
export function buildCreativeRecipeCatalog(): CreativeRecipe[] {
  return seeds.map(recipeFromSeed);
}

====================================================================
FILE: apps/web-app/modules/builder-v2/website-engine/components/README.md
====================================================================
# Component Engine

Phase 27 adds an inert, deterministic, local-only Component Engine.

## Scope

The Component Engine answers which editable component families and variants best satisfy selected patterns, design language, media needs, motion strategy, and conversion goals.

It does not render components, create Builder nodes, create React UI, generate CSS, generate HTML, generate JavaScript, call providers, call MCP tools, use a database, use the network, call LLMs, implement Composition Engine, implement Mapper, or wire into production.

## Output

`runComponentEngine()` returns `EngineResult<ComponentResult>` with ranked component candidates, recommended selections, component families, component categories, compatibility notes, conflicts, required facts, required assets, editable mapping intent, quality checks, fallback components, confidence, explanations, warnings, and trace metadata.

## Creative Library Alignment

Component Engine selects component intent. Creative Library provides richer metadata-only recipe variants that can later satisfy that intent without rendering, creating Builder nodes, or changing production behavior.

## Starter Variants

Includes metadata-only variants such as `HeroEditorialSplit01`, `HeroProductValue01`, `HeroBookingFocused01`, `HeroAppointmentFocused01`, `TrustBandInline01`, `ProofStackCards01`, `GalleryMasonryEditorial01`, `GalleryLifestyleRail01`, `ServiceMatrixCards01`, `MenuPreviewCards01`, `CourseCataloguePreview01`, `VehicleServiceMatrix01`, `ProjectShowcaseEditorial01`, `ProductFeatureStack01`, `FAQObjectionAccordion01`, `FinalConversionBlock01`, `StickyMobileCTA01`, `FounderStorySplit01`, `ProcessTimeline01`, `PortfolioShowcaseGrid01`, `ComparisonTableSimple01`, `ReviewProofBlock01`, `ContactLeadCaptureForm01`, and `FooterTrustClosure01`.

## Verification

```ts
import { runComponentVerification } from "./components";

const result = runComponentVerification();
```

====================================================================
FILE: apps/web-app/modules/builder-v2/website-engine/composition/README.md
====================================================================
# Composition Engine

Phase 28 adds an inert, deterministic, local-only Composition Engine.

## Scope

Composition Engine answers how selected patterns and components should be arranged into a coherent page journey. It decides rhythm, order, density, CTA cadence, media/content alternation, trust placement, conversion journey, scroll narrative, mobile stacking, and density transitions.

It does not render, create Builder nodes, generate websites, generate React components, generate CSS, generate HTML, generate JavaScript, implement Mapper, implement Renderer, implement Critic, implement Repair, call providers, call MCP tools, use a database, use the network, call LLMs, or wire into production.

## Output

`runCompositionEngine()` returns `EngineResult<CompositionResult>` with a composition plan, ordered section sequence, section weights, page rhythm, visual breathing, CTA cadence, trust placement, conversion journey, scroll narrative, mobile stacking, density transitions, conflicts, quality checks, fallbacks, confidence, explanations, warnings, and trace metadata.

## Creative Library Alignment

Composition Engine arranges selected recipe and component intent into a page journey. Creative Library owns reusable recipe variants; Composition Engine owns ordering, rhythm, density, CTA cadence, and journey placement.

## Rules

- Avoid three consecutive card-grid-like sections.
- Conversion-focused pages need early and final CTA opportunities.
- Healthcare introduces trust before appointment CTA.
- Restaurant pages surface menu/reservation/order path early.
- Real estate introduces project/location promise early and repeats site-visit action.
- Automotive clarifies service/catalogue/test-drive path early.
- Education clarifies program/admissions path early.

## Verification

```ts
import { runCompositionVerification } from "./composition";

const result = runCompositionVerification();
```

====================================================================
FILE: apps/web-app/modules/builder-v2/website-engine/builder-blueprint/README.md
====================================================================
# Builder Blueprint Engine

## Purpose

Builder Blueprint Engine converts WebsiteSpec, WebsiteDNA, CompiledWebsitePlan, DesignResult, ComponentResult, and CompositionResult metadata into a mapper-ready editable Builder blueprint contract.

It is not the Mapper. It does not insert anything into the Builder store or canvas. It does not replace the manual Builder model. It is only an AI translation layer into existing native BuildEZ Builder concepts: `BuilderNode`, `BuilderBlueprint`, `NodeType`, `WidgetProperty`, registered widget definitions, inspector property paths, and future CommandBus-compatible intents.

## Current Status

Phase 30.6 Native Builder Alignment.

## Public API

- `runBuilderBlueprintEngine(input)` returns `EngineResult<BuilderBlueprintResult>`.
- `buildBuilderBlueprint(input)` creates a mapper-ready editable blueprint contract.
- `validateNativeBlueprintCompatibility(widgets)` verifies generated widgets map to existing Builder node/widget/property concepts.
- `buildNativeNodeIntents(widgets)` creates existing `BuilderNode`-shaped insertion intents.
- `buildNativeWidgetIntents(widgets)` confirms existing native widget types.
- `buildNativeInspectorBindingIntents(widgets)` maps InspectorBlueprint metadata to existing `WidgetProperty` paths.
- `buildNativeCommandIntents(widgets)` creates future CommandBus-compatible intent metadata for Insert, Update, Style, Move, Reorder, and Duplicate commands without executing anything.
- `expandComponentRecipes(input)` expands component recipes into native primitive widget seeds.
- `buildSectionBlueprints(input, widgets)` builds section blueprint metadata.
- `buildWidgetBlueprint(input, seed)` builds editable widget metadata.
- `buildInspectorBlueprint(...)` builds content, design, advanced, responsive, and AI inspector metadata.
- `buildPropertyDefinitions(type, widgetId)` builds Inspector property definitions.
- `buildPropertyBindings(widgetId, definitions)` connects inspector controls to widget paths.
- `buildEditablePropertyBindings(bindings, definitions)` marks editability and AI-editability.
- `buildResponsivePropertyBindings(definitions)` builds desktop, tablet, and mobile responsive metadata.
- `buildStyleBindings(widgetId, style)` preserves style binding metadata.
- `buildMotionBindings(input, widgetId)` preserves motion intent metadata only.
- `validateBuilderBlueprint(blueprint)` validates editability, inspector coverage, primitive safety, and responsive metadata.
- `runBuilderBlueprintVerification()` performs compile-safe verification.

## Primitive Policy

Allowed primitives only:

- `page`
- `section`
- `container`
- `column`
- `heading`
- `text`
- `button`
- `image`
- `video`
- `icon`
- `divider`
- `spacer`

The engine must not create opaque HTML widgets, screenshots, PremiumWidgetPreview output, non-editable blobs, React components, CSS, HTML, JavaScript, or rendered websites.

## Inspector Blueprint

Every widget includes:

- property groups
- property definitions
- property bindings
- editable property bindings
- responsive bindings
- content/design/advanced/responsive/AI tabs
- widget capabilities
- AI metadata
- regeneration metadata
- native node intent
- native widget intent
- native inspector/property binding intent
- future native command intents

## Native Alignment

This module aliases or adapts to existing Builder contracts instead of creating a second node model:

- Native node shape: `apps/web-app/modules/builder-v2/types/blueprint.ts` `BuilderNode`
- Native blueprint shape: `BuilderBlueprint`
- Native widget type: `NodeType`
- Native inspector property shape: `WidgetProperty`
- Native mutation pathway: existing command concepts such as `InsertNodeCommand`, `UpdateNodeCommand`, `StyleCommands`, `MoveNodeCommand`, `ReorderNodeCommand`, and `DuplicateNodeCommand`

The output remains inert intent metadata. A future Mapper may consume these intents and execute real Builder commands, but this phase does not.

## Creative Library Alignment

Creative Library provides metadata-only recipe variants. Builder Blueprint Engine may later expand selected recipes into native editable primitives, while preserving InspectorBlueprint bindings and native Builder compatibility.

## Safety Notes

- No Builder store insertion.
- No CommandBus execution.
- No production wiring.
- No Mapper implementation.
- No Renderer implementation.
- No Critic or Repair implementation.
- No DB, network, LLM, MCP, provider calls, generated websites, React, CSS, HTML, or JavaScript.
- Feature flags remain false.

## Implementation Phase

Phase 30.6 Native Builder Alignment.

====================================================================
FILE: apps/web-app/modules/builder-v2/website-engine/mapper/README.md
====================================================================
# Native Builder Mapper

## Purpose

Native Builder Mapper converts Builder Blueprint intent into executable native Builder mapping plans and, behind a disabled feature flag, can materialize native-compatible node and command objects for manual verification.

Phase 32 keeps execution disabled by default. It does not execute commands, write the Builder store, modify the canvas, alter renderer behavior, or wire production routes.

## Current Status

Phase 32 Mapper Execution Behind Disabled Feature Flag.

## Public API

- `runNativeBuilderMapper(input)` returns `EngineResult<MapperResult>`.
- `buildNativeBuilderMappingPlan(input)` builds an inert `NativeBuilderMappingPlan`.
- `buildNodeMappingPlan(input)` creates ordered native node creation metadata.
- `buildCommandMappingPlan(input)` creates inert command intent plans.
- `buildPropertyMappingPlan(input)` maps inspector bindings to native property path intents.
- `buildStyleMappingPlan(input)` maps style bindings to `BuilderNode.style` paths.
- `buildResponsiveMappingPlan(input)` maps desktop/tablet/mobile responsive metadata.
- `buildAssetMappingPlan(input)` maps asset requirements without upload/fetch/substitution.
- `validateNativeBuilderMappingPlan(plan)` validates contract safety.
- `runNativeBuilderMapperVerification()` performs compile-safe verification.
- `executeNativeBuilderMappingPlan(input)` validates a mapping plan and hard-blocks unless `MAPPER_EXECUTION_ENABLED` is explicitly true.
- `createNativeBuilderNodesFromPlan(plan)` creates native-compatible `BuilderNode` objects without inserting them.
- `buildCommandObjectsFromPlan(plan)` creates native `BuilderCommand` objects without executing them.
- `applyPropertyMappings(plan)`, `applyStyleMappings(plan)`, and `applyResponsiveMappings(plan)` create non-mutating mapping records.
- `resolveAssetMappings(plan)` creates local-only asset mapping records without upload, fetch, or substitution.
- `validateMapperExecutionInput(input)` and `validateMapperExecutionResult(result)` enforce execution safety.
- `runMapperExecutionVerification()` proves execution is blocked by default.

## Feature Flag Behavior

`MAPPER_EXECUTION_ENABLED` lives in the Website Engine SDK feature flags and remains `false`.

Normal calls to `executeNativeBuilderMappingPlan()` return `EngineResult<MapperExecutionResult>` with `status: "blocked"`, `blocked: true`, and `reason: "MAPPER_EXECUTION_DISABLED"`.

No production import path calls mapper execution. The helper exists for future disabled-flag manual verification only.

## Safety Notes

- No command execution.
- No Builder store writes.
- No automatic mapper execution.
- No rendering.
- No Builder behavior changes.
- No React, CSS, HTML, or JavaScript generation.
- No production route wiring.
- Feature flags remain false.

## Creative Library Alignment

Creative Library does not emit mapper plans. Mapper only consumes native intent produced downstream by Builder Blueprint Engine and converts it into inert native Builder execution plans.

## Implementation Phase

Phase 32 Mapper Execution Behind Disabled Feature Flag.

====================================================================
CREATIVE LIBRARY TREE
====================================================================
apps/web-app/modules/builder-v2/website-engine/creative-library
├── CreativeLibraryEngine.ts
├── creativeRecipe.ts
├── index.ts
├── README.md
├── recipeCatalog.ts
├── recipeCompatibility.ts
├── recipeComposition.ts
├── recipeEditability.ts
├── recipeFallbacks.ts
├── recipeFamilies.ts
├── recipeInspectorHints.ts
├── recipeMetadata.ts
├── recipeRanking.ts
├── recipeRequirements.ts
├── recipeResponsive.ts
├── recipes
│   ├── blog
│   ├── booking
│   ├── comparison
│   ├── contact
│   ├── cta
│   ├── faq
│   ├── footer
│   ├── gallery
│   ├── hero
│   ├── map
│   ├── navigation
│   ├── portfolio
│   ├── pricing
│   ├── process
│   ├── product
│   ├── proof
│   ├── README.md
│   ├── service
│   ├── sticky-action
│   ├── team
│   ├── testimonial
│   ├── timeline
│   └── trust
├── recipeScoring.ts
├── recipeVariants.ts
├── validation.ts
├── verification.ts
└── version.ts

24 directories, 21 files
