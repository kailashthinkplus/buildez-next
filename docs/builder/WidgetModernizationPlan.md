# Widget Modernization Plan

Date: 2026-07-09  
Phase: BSP-15  
Status: Production widget library implemented

## Objective

Modernize the native Builder widget system so manual Builder editing and future AI-generated editable nodes can depend on explicit widget capability metadata instead of informal assumptions.

## BSP-13 Scope

BSP-13 added:

- Registered widget capability metadata.
- Scaffold-only metadata for missing production widgets.
- Inspector support metadata.
- Serialization support metadata.
- AI readiness metadata only.
- Embed/code widget safety gate metadata.

BSP-15 builds on that foundation by registering the production widget catalog as native editable Builder widgets. It does not add opaque HTML widgets and does not enable AI insertion.

## Registered Widgets Audited

The audit covers all currently registered core and premium widgets:

- page
- section
- container
- column
- heading
- text
- button
- image
- video
- icon
- divider
- spacer
- smartHeader
- hero
- leadForm
- cardGrid
- galleryLightbox
- faq
- testimonials
- pricing
- offerGrid
- floatingWhatsApp
- locationMap
- smartFooter
- features
- gallery
- cta

## Scaffold-Only Widgets

The BSP-13 scaffold backlog has been converted into registered native widgets in BSP-15.

Remaining scaffold-only widgets: none in the production catalog.

Remaining gated widgets:

- `embed`: restricted metadata and safe placeholder rendering; no script or opaque HTML execution.
- `popupModal`: metadata-only; no runtime popup execution.

## Rules

- No opaque HTML/template blobs.
- Restricted widgets must carry explicit safety warnings and gate status.
- Embed remains gated by safety policy.
- AI insertion remains blocked until Builder release gates pass.
- Production widgets must remain native editable structures.

## Next Work

BSP-16 should certify the Builder release gate with executable QA, manual QA, accessibility review, widget inspector polish review, and AI compatibility verification.
