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
