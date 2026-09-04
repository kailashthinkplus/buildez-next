# AI v10 Recovery — Phase 4

## Outcome

AI v10 now supports a separate rendered visual-quality loop. A rendering adapter supplies real RGBA screenshots for desktop, tablet, and mobile; the new gate inspects those pixels, creates typed visual repair actions, compiles a native Blueprint repair candidate, and rerenders it for at most three iterations.

The existing metadata Critic and Renderer Parity systems remain unchanged and continue to run before/after their existing stages.

## Rendering boundary

The website engine does not generate React or HTML and does not call Canvas. Rendering is an injected orchestration dependency:

```ts
renderBlueprint(blueprint, iteration): Promise<RenderedScreenshot[]>
```

Each run must return desktop, tablet, and mobile captures with dimensions and RGBA pixels. Missing viewports or invalid pixel buffers fail explicitly. If no renderer is installed, legacy generation remains compatible and the returned visual-quality category reports `available: false`; no visual score is fabricated.

## RenderedVisualQualityGate

The gate returns independent scores for:

- composition;
- typography;
- imagery;
- hierarchy;
- originality;
- responsiveness.

It combines pixel-derived contrast, color diversity, edge density, and cross-viewport behavior with the native Blueprint’s semantic node relationships. `pixelInspected: true` guarantees that a returned rendered evaluation came from actual pixel buffers.

The result also includes typed issues, repair actions, viewport coverage, and a non-compensating pass decision. Every required visual dimension must meet its own threshold.

## Visual repair actions

Phase 4 supports:

- `increase_hero_scale`;
- `replace_repetitive_grid`;
- `change_section_archetype`;
- `increase_whitespace`;
- `adjust_media_dominance`;
- `improve_typography_hierarchy`.

`RenderedVisualRepairCompiler` applies actions immutably to existing native Blueprint node styles and props. It does not introduce widget types, change the Blueprint schema, mutate the source, generate code, or touch Canvas/Renderer implementation.

## Iteration loop

```text
native hydrated Blueprint
  -> render desktop/tablet/mobile
  -> pixel-level evaluation
  -> compile typed repair candidate
  -> rerender and reevaluate
  -> stop on pass or after iteration 3
```

The loop is deterministic for identical Blueprint pixels. It records every iteration, evaluation, and executed action ID. Non-improving output is bounded by the three-iteration maximum.

## Independent quality categories

AI v10 returns:

- `engineeringQuality`: Renderer Parity integrity;
- `semanticQuality`: existing metadata Critic result;
- `visualQuality`: rendered gate result when available.

The categories use a non-compensating decision. High engineering quality cannot offset failed visual or semantic quality.

## Compatibility and guarantees

- Existing metadata critic retained.
- Native Blueprint and editability preserved.
- No Blueprint node-schema changes.
- No Canvas changes.
- No Renderer changes.
- No React or HTML generation.
- Existing v10 dependency objects remain valid because the renderer dependency is optional.
- Deterministic visual repair mode is always enabled.

## Verification

Tests cover pixel sensitivity, required viewport validation, typed repairs, source immutability, native-schema preservation, repair/rerender behavior, deterministic results, the three-iteration limit, and AI v10 orchestration integration.

