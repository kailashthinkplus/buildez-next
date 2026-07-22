# AI v10 Root Cause Investigation RC-2

## Executive findings

- Duplicate anatomy first appears in `ComponentEngine.sectionSelections`. Two distinct upstream sections are made equivalent; no source section is compiled twice.
- The exact duplicate hero purpose/content intent first appears in `SemanticBlueprintCompiler.orderedSections`, whose `find(idMatch || componentMatch)` can return an earlier section sharing the same component.
- Pattern provenance is independently corrupted in `buildSectionSpecs`: composition is reordered, but pattern references are joined from `selectedPatterns[index]`. Nine of ten fixed-fixture sections receive the wrong WebsiteSpec pattern reference.
- The 97.06px metric-heading geometry first appears in `compileFloatingProof` during semantic/archetype compilation. It is deliberately emitted by a hard-coded nested three-track grid.
- The remaining observations reduce to four root-cause groups, not dozens of independent failures.
- RC-1 remains correct: resolved grids remain grids, no captured node has zero width, and the proven Canvas/runtime widths match.

## Section provenance and duplicate sections

The complete ten-section table is in `section-provenance.json`. It connects final Blueprint node, source section, pattern, component selection, compiler coverage, archetype, composition order, Experience scroll step, WebsiteSpec pattern reference, content anatomy, and duplicate fingerprint.

### Duplicate pair 1: editorial hero and sticky mobile CTA

| Field | Editorial source | Sticky source |
| --- | --- | --- |
| Source section | `section.editorial_hero.6` | `section.sticky_mobile_cta.2` |
| Source pattern | `editorial_hero` | `sticky_mobile_cta` |
| ComponentEngine selection | `HeroEditorialSplit01` | `HeroEditorialSplit01` |
| Archetype | `editorialSplitHero` | `editorialSplitHero` |
| Final node | `section.section_editorial_hero_6` | `section.section_sticky_mobile_cta_2` |

Pattern Intelligence still represents two different purposes. The first anatomical duplication occurs in `buildSectionScopedSelection()` at `components/sectionScopedSelection.ts:69-72`, where the sticky-action section selects the hero component and archetype. This is two equivalent upstream selections, not one section compiled twice.

The compiler then intensifies the problem. `SemanticBlueprintCompiler.ts:19` searches WebsiteSpec sections with:

```text
candidate.id === section.id || candidate.componentVariantRef === section.componentId
```

Because the editorial section appears first and shares `HeroEditorialSplit01`, the sticky section receives the editorial spec's purpose and type. This is the first stage where the two sections become semantically identical, rather than merely anatomically identical.

Smallest safe correction, not implemented: require exact section-ID association before any component fallback, and never use a non-unique component ID as a section join key. Separately constrain sticky-action selection to an anatomy that retains sticky-action semantics.

### Duplicate pair 2: footer trust closure and trust band

| Field | Footer closure | Trust band |
| --- | --- | --- |
| Source section | `section.footer_trust_closure.4` | `section.trust_band.5` |
| Component | `FooterTrustClosure01` | `TrustBandInline01` |
| Coverage | archetype fallback | archetype fallback |
| Archetype | `floatingProofSection` | `floatingProofSection` |
| Final role | proof | proof |

The sources and components remain distinct, but ComponentEngine assigns the same fallback archetype. `compileFloatingProof` then emits identical proof-plus-three-metric anatomy for both. The first bad stage for duplicate anatomy is therefore ComponentEngine archetype fallback, not Pattern Intelligence or CompositionEngine.

Smallest safe correction, not implemented: prevent semantically different proof placements from sharing an anatomy when their content-role fingerprints collide, or provide distinct compiler coverage. No deduplication or archetype change is included here.

### WebsiteSpec provenance defect

`specification/sectionSpecBuilder.ts:13-20` iterates reordered composition sections but associates `selectedPatterns[index]`. Only FAQ remains aligned by coincidence. The other nine pattern references are incorrect—for example:

- editorial hero receives `contact_lead_capture`;
- footer trust closure receives `sticky_mobile_cta`;
- trust band receives `final_conversion_block`;
- sticky mobile CTA receives `project_showcase`.

`SemanticBlueprintCompiler.ts:28` adds another order-indexed pattern, compounding the association. This does not create the initial duplicate selection, but it corrupts compiler provenance and can influence pattern-sensitive recipe decisions.

Smallest safe correction, not implemented: join patterns by stable section/source ID rather than post-composition array position.

## Narrow metric geometry

The first bad stage is semantic/archetype compilation in `compileFloatingProof`, `layout-archetypes/archetypeCompilers.ts:28`.

The compiler hard-codes both levels:

```text
outer:  1.15fr .85fr, gap 48px
inner:  repeat(3, 1fr), gap 12px
cards:  [1, 2, 3], padding 20px per side
```

Measured desktop calculation:

```text
outer available width                         1072.00px
outer width after 48px gap                    1024.00px
metrics allocation: 1024 × .85 / (1.15+.85)  435.20px
inner width after two 12px gaps                411.20px
each of three cards                            137.07px
heading width after 40px horizontal padding     97.07px
measured heading width                          97.06px
```

This is a three-column metric grid nested inside the narrower `.85fr` column of another grid. The archetype explicitly requests the nesting. Card count and track count are hard-coded, not derived from content or available width.

Viewport feasibility:

| Viewport | Metrics container | Card | Metric heading | Inner tracks |
| --- | ---: | ---: | ---: | --- |
| Desktop | 435.20px | 137.06px | 97.06px | 3 |
| Tablet | 786px | 254px | 214px | 3 |
| Mobile | 342px | 342px | 252px | 1 |

Desktop violates the 220px heading-track contract and tablet remains slightly below it because tablet retains three tracks. Mobile correctly reduces to one track.

Smallest safe correction, not implemented: add pre-compilation feasibility validation and reject/fallback when the effective nested card content width is below contract. No column-count or layout correction is included in RC-2.

## Overflow grouping

`anomaly-provenance.json` traces every observed node to raw/resolved styles, parent layout/tracks, selected archetype, and compiler source. The observations group into four underlying causes:

1. `floating-proof-nested-three-track-metrics`: 24 observations across the two floating-proof sections. These are narrow-track wrapping and repeated parent/child observations of the same compiler rule.
2. `compiled-text-track-or-content-height`: three substantive vertical text observations in hero/locality anatomy. These require content-height feasibility analysis but are not renderer display failures.
3. `fixed-track-gallery-anatomy`: four observations from the lifestyle rail. The rail viewport overflow is intentional where `overflow-x: auto`; the associated track observation is a duplicate of the same media rule, not a separate defect.
4. `measurement-rounding`: 36 observations dominated by 1–3px `client`/`scroll` differences. These are diagnostic noise plus repeated ancestors, not 36 layout defects.

True horizontal overflow, narrow wrapping, vertical overflow, intentional media overflow, and rounding are retained as separate classifications inside each group. The report does not hide any observation.

## Archetype feasibility

`archetype-feasibility.json` records available rendered content width, container padding/gaps/tracks, all descendant text widths, and contract flags for every selected archetype. It identifies infeasible effective text tracks in:

- both `floatingProofSection` instances;
- `architecturalProjectShowcase` card/caption tracks;
- `galleryJourney` item tracks;
- the legacy FAQ recipe.

The hero, locality narrative, and framed CTA sections satisfy the static desktop text-width calculation. This diagnostic is descriptive only and changes no compiler behavior.

## RC-1 evidence

- `19-rendered-style-contract.json` contains zero `RENDERER_DISPLAY_OVERRIDE` anomalies.
- `container.archetype.section_footer_trust_closure_4` resolves and renders as grid.
- Canvas/runtime proof column widths both equal 588.80px.
- Canvas/runtime proof headline widths both equal 513px.
- Canvas/runtime metric card widths both equal 137.06px.
- Canvas/runtime metric-heading widths both equal 97.06px.
- Desktop, tablet, and mobile captures contain no zero-width nodes.

RC-1 rendering is therefore not responsible for the remaining narrow metric layout or duplicate sections.

## Scope confirmation

RC-2 adds diagnostics, an artifact analyzer, tests for fingerprinting and overflow grouping, and this report. It does not change prompts, scoring, selection, composition, archetypes, compilation, Blueprint schema, responsive resolution, Canvas, runtime, enrichment, images, or repair behavior.
