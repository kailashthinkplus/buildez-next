# RC-3.5C Typed Nested Hydration and Native Media

## Result

AI v10 now emits stable nested native-widget structures, validates model patches against widget-specific schemas, discovers media from production population contracts, maps generated results to exact nested paths, and records opt-in forensic diagnostics.

Supported schemas:

- hero: `media`
- carousel: `slides[]`
- gallery lightbox: `galleryItems[]`
- FAQ: `questions[]`
- timeline: `steps[]`
- lead form: `fields[]`
- smart footer: `navItems[]` and copyright
- CTA: `actions[]`
- logo cloud and floating WhatsApp retain verified-fact gating; they are not hydrated into fabricated facts

Each repeated item has a deterministic stable ID. Patch validation rejects unknown top-level and nested fields, immutable identity/structure changes, invalid item counts, duplicate IDs, oversized strings, malformed URLs, and style/tree/type mutation through the existing props-only response envelope. Required media `src` may remain empty only between hydration and media assignment.

## Page-wide context

Creative enrichment receives compact section order, major headlines, CTA labels, adjacency guidance, population contracts, hydration schemas, media roles, verified/missing facts already present in the business/specification context, and composition/art-direction data. The model therefore has page-wide repetition context rather than isolated widgets.

## Media assignment

`discoverNativeWidgetMediaSlots` traverses every path declared by `ProductionWidgetPopulationContract.imageAssignmentSchema`. Current coverage is hero media, carousel slides, and gallery/lightbox items. Every slot records widget ID/type, exact path, role, required status, prompt, aspect ratio, crop family, alt intent, and assignment state.

`runV10ImageGeneration` combines primitive image nodes and native nested slots, generates each selected pending slot once, and maps HTTPS results back to its exact path. Assignment preserves IDs and order, rejects unsafe URLs and unknown shapes, records provider failures, and reports required slots that remain unresolved. It does not generate customer logos or factual project identity.

## Rendering and persistence

The shared premium widget renderer used by Canvas and published runtime now prefers nested carousel/gallery/hero media and nested display labels, while retaining the existing flat Inspector properties. Nested props and media paths survive the native serialization round trip with stable IDs and ordering.

Forensic mode writes:

- `widget-hydration-diagnostics.json`
- `widget-media-assignment.json`

## Safety and verification

Tests cover typed schemas, valid nested hydration, unknown/unsafe mutation rejection, item-count and identity constraints, slot discovery, exact result mapping, unsafe URL failure, serialization, deterministic population, semantic compiler regression, and the same contract across real estate, healthcare, SaaS, hospitality, and automotive.

Focused suites pass. Repository-wide TypeScript remains blocked by pre-existing parser errors in legacy Blueprint files and `BlocksPanel.tsx`. No fixture-specific production logic, arbitrary code/style mutation, background generation, motion timelines, or fabricated facts were added.

The regenerated deterministic Sanjeevini trace contains 11 required nested media slots: one hero, four carousel slides, and six gallery items. Its forensic image dependency intentionally returns no images, so all 11 remain explicitly `pending` with the warning `Forensic fixture preserves missing image output.` rather than silently passing.

Six runtime/Canvas screenshots were captured. The desktop runtime renders without the previous grid-collapse failure, but it remains visually generic: the fixture repeats the business name throughout, unresolved slots invoke legacy demo imagery (including an unsuitable SaaS dashboard image), the hero retains its internal demo overlay, and footer/form supporting content remains generic. DOM diagnostics report two small desktop vertical overflows (`heading.quote.section_trust_band_5` and `heading.headline.section_sticky_mobile_cta_2`). These are honest remaining findings; RC-3.5C does not claim visual-quality completion.
