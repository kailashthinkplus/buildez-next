# Phase 27 Component Engine

## Objective

Implement deterministic local Component Engine.

Component Engine answers which editable component families and variants best satisfy selected patterns, design language, media needs, motion strategy, and conversion goals. It produces component selection metadata only. It does not render components, create Builder nodes, create React UI, generate CSS, generate HTML, generate JavaScript, call providers, call LLMs, use a database, use the network, or wire into production.

## Scope

Created or updated `apps/web-app/modules/builder-v2/website-engine/components/` with:

- `ComponentEngine.ts`
- `componentVariant.ts`
- `componentCatalog.ts`
- `componentMetadata.ts`
- `componentScoring.ts`
- `componentRanking.ts`
- `componentCompatibility.ts`
- `componentRequirements.ts`
- `componentFallbacks.ts`
- `componentQuality.ts`
- `editableMappingIntent.ts`
- `validation.ts`
- `verification.ts`
- `version.ts`
- `index.ts`
- `README.md`
- `selectComponents.ts`

Updated the legacy `selectComponents()` wrapper to delegate to the new Component Engine while remaining metadata-only.

## Contracts Added

- `ComponentInput`
- `ComponentResult`
- `ComponentVariant`
- `ComponentMetadata`
- `ComponentCandidate`
- `ComponentSelection`
- `ComponentFamily`
- `ComponentCategory`
- `ComponentRequirement`
- `ComponentCompatibility`
- `ComponentConflict`
- `ComponentQualityCheck`
- `EditableMappingIntent`
- `ComponentFallback`
- `ComponentConfidence`
- `ComponentMetrics`
- `ComponentWarning`

Inputs may include Business Intelligence, Brand Intelligence, Content Strategy, Experience Strategy, Pattern Intelligence, Design Result, Inspiration Profile, Visual Mood Profile, Media Strategy, Motion Strategy, Creative Provider Result metadata, repository records, graph context, constraint results, missing facts, and missing assets.

## Starter Variants Added

- `HeroEditorialSplit01`
- `HeroProductValue01`
- `HeroBookingFocused01`
- `HeroAppointmentFocused01`
- `TrustBandInline01`
- `ProofStackCards01`
- `GalleryMasonryEditorial01`
- `GalleryLifestyleRail01`
- `ServiceMatrixCards01`
- `MenuPreviewCards01`
- `CourseCataloguePreview01`
- `VehicleServiceMatrix01`
- `ProjectShowcaseEditorial01`
- `ProductFeatureStack01`
- `FAQObjectionAccordion01`
- `FinalConversionBlock01`
- `StickyMobileCTA01`
- `FounderStorySplit01`
- `ProcessTimeline01`
- `PortfolioShowcaseGrid01`
- `ComparisonTableSimple01`
- `ReviewProofBlock01`
- `ContactLeadCaptureForm01`
- `FooterTrustClosure01`

All variants are metadata only and describe future editable mapping intent.

## Helpers Added

- `runComponentEngine()`
- `buildComponentCatalog()`
- `buildComponentCandidates()`
- `scoreComponentCandidates()`
- `rankComponentCandidates()`
- `selectComponentVariants()`
- `detectComponentCompatibility()`
- `detectComponentConflicts()`
- `buildComponentRequirements()`
- `buildEditableMappingIntent()`
- `buildComponentFallbacks()`
- `buildComponentQualityChecks()`
- `scoreComponentConfidence()`
- `validateComponentResult()`
- `runComponentVerification()`

## Output

`runComponentEngine()` returns `EngineResult<ComponentResult>` with:

- ranked component candidates
- recommended component selections
- component families
- component categories
- compatibility notes
- conflicts
- required facts
- required assets
- editable mapping intent
- quality checks
- fallback components
- confidence score
- explanations
- warnings
- trace metadata

## Verification

Ran:

```sh
pnpm --dir apps/web-app typecheck:builder
```

Status: passed.

## Safety

- `ai-v9` untouched by this phase.
- Builder behavior untouched by this phase.
- Production routes untouched by this phase.
- Rendering untouched by this phase.
- Feature flags remain false.
- No DB calls.
- No network calls.
- No LLM calls.
- No MCP calls.
- No provider execution.
- No website generation.
- No Builder nodes.
- No React components.
- No CSS generation.
- No HTML generation.
- No JS generation.
- No Composition Engine, Mapper, Renderer, Critic, Repair, AI generation, or production wiring.

## Documentation Gaps

The phase brief referenced `docs/specifications/ComponentMetadata.md`, but that file is not present in the repository. Implementation proceeded from `ComponentVariant.md`, architecture docs, existing module patterns, and the Phase 27 brief.

## Technical Debt

- Component scoring is deterministic starter logic and should eventually be repository-backed.
- The catalog is local metadata and not yet linked to a visual registry or Builder-native mapper.
- Component Engine does not decide final page order; Composition Engine must resolve sequence and layout relationships.
- Quality checks are metadata-level, not rendered visual QA.

## Next Phase

Phase 28 — Composition Engine.
