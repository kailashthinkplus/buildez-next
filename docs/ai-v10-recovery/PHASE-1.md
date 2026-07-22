# AI v10 Recovery — Phase 1

## Outcome

Creative Director is now causal. It emits a typed, immutable `ArtDirectionBrief` that can influence component ranking, composition planning, and semantic Blueprint recipe styling before native nodes are returned.

Phase 1 remains additive: callers that do not provide an art-direction brief continue through the existing deterministic paths.

## Contract

`ArtDirectionBrief` is renderer-agnostic and does not contain or alter the Blueprint node schema. It carries executable direction in three groups:

- component strategy: preferred tags/families and discouraged patterns;
- composition strategy: rhythm, breathing, media rhythm, density, section limit, imagery emphasis, and weight variation;
- Blueprint strategy: container mode, heading scale, contrast, media treatment, and corner treatment.

`CreativeDirectionPlan` now exposes `artDirectionBrief`, `executable: true`, and `metadataOnly: false`.

## Causal effects

1. `ComponentEngine` uses preferred tags and families when calculating `designFit`.
2. `CompositionEngine` uses the brief for section ordering boosts, page rhythm, breathing, media alternation, and density-driven section weights.
3. `BuilderBlueprintInput` accepts the brief and semantic recipes apply its container width/framing, heading scale, section contrast, and media corner treatment.
4. AI v10 creates the brief after `DesignEngine`, then passes the same immutable object through component selection, composition, and Blueprint compilation.

## Compatibility boundaries

- No Canvas changes.
- No Renderer changes.
- No Blueprint node schema changes.
- No React generation.
- Existing engine inputs remain optional and old callers remain valid.
- Existing default behavior is retained when `artDirectionBrief` is absent.

## Verification

Tests cover deterministic immutable brief generation, component-score influence, composition influence, Blueprint-style influence, and legacy invocation without a brief.

