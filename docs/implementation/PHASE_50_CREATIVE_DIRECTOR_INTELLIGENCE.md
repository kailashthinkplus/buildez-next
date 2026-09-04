# Phase 50 — Creative Director Intelligence

## Purpose

RC-16 adds deterministic art-direction judgment before native component compilation. Existing composition and design scores measure structural correctness and execution readiness; the Creative Director score measures perceived quality, emotional impact, storytelling, differentiation, and conversion confidence.

The layer is metadata-only. It does not choose production components, reorder sections, change compiler seeds, modify Blueprint nodes, or call AI.

## Pipeline

```text
Website Intelligence
  → Creative Director Intelligence
  → Component Selection
  → Design Intelligence
  → Semantic Blueprint Compilation
```

`SemanticBlueprintCompiler` evaluates the direction before recipe/compiler expansion and returns it as `creativeDirectionPlan`. The generated seeds remain unchanged.

## CreativeDirectionPlan

The immutable plan contains:

- an industry- and archetype-aware visual personality;
- a composition style such as editorial, cinematic, minimal, luxury, bold, technical, warm, or premium;
- maximum section-count guidance;
- section hierarchy and narrative purpose;
- trust, conversion, and imagery-dominant section placement;
- visual rhythm, density alternation, whitespace, contrast, and section-variation metadata;
- anti-template warnings;
- five creative score dimensions and an overall creative score.

## Personality rules

The compiler distinguishes experience intent within a business family. Luxury residential work receives architectural editorial direction, while affordable housing emphasizes accessible community living. Premium automotive and service-center experiences separate ownership aspiration from technical care. Healthcare distinguishes clinical institutions and specialist authority. Restaurant direction separates cinematic culinary storytelling from casual warmth. SaaS distinguishes enterprise technical authority from growth-oriented product narratives.

## Anti-template rules

Deterministic warnings identify:

- more than two consecutive card grids;
- repeated split compositions;
- uniform heading/copy/card shells;
- repeated conversion blocks;
- equal-weight spacing rhythm;
- excessive standalone information sections;
- neutral surfaces without contrast moments;
- insufficient visual storytelling.

Warnings are explanatory metadata and never reject or mutate production output.

## Creative scoring

`creativeScore` is the rounded mean of originality, emotional impact, visual storytelling, brand differentiation, and conversion confidence. Pattern diversity, image moments, trust placement, focused conversion, and intentional density improve the score. High- and medium-severity anti-template warnings reduce it deterministically.

Premium golden examples must score at least 85. Purpose-built template-failure fixtures score below 70 and identify their responsible sections.

## Golden benchmark integration

Every one of the 52 golden website reports and previews exposes:

```ts
{
  creativeScore,
  creativeWarnings,
  creativeDirectionPlan
}
```

The metadata participates in benchmark reporting only. Blueprint validation, serialization, hydration, canvas, runtime, motion, and component compiler behavior remain unchanged.
