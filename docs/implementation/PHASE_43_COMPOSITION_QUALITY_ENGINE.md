# Phase 43: Composition Quality Engine

## Purpose

RC-9E adds a deterministic quality gate between the Website Engine's ordered composition result and native Builder Blueprint compilation. It evaluates whether existing component variants form a coherent page journey. It does not select, reorder, render, or mutate sections.

## Architecture

```text
CompositionResult
  -> ordered semantic sections
  -> CompositionQualityEngine.evaluate()
  -> immutable scores, warnings, and suggestions
  -> ComponentVariantCompilerRegistry / RecipeRegistry fallback
  -> native Builder Blueprint seeds
```

`SemanticBlueprintCompiler` exposes the evaluation as `compositionQuality` on its compilation result. RC-9E is warning-only: a failed evaluation does not block Blueprint compilation or alter the final section sequence.

The module is located at `modules/builder-v2/website-engine/composition-quality/`:

- `CompositionQualityEngine.ts` normalizes input and combines scores.
- `CompositionQualityScore.ts` defines the immutable result contract.
- `CompositionQualityRules.ts` owns thresholds and weights.
- `sectionRelationshipRules.ts` describes family-specific journeys.
- `visualRhythmAnalyzer.ts` classifies layout patterns and density transitions.
- `CompositionGuard.ts` detects composition anti-patterns.
- `CompositionAntiPatterns.ts` contains reusable diagnostic language.
- `fixtures/` contains full-page golden compositions.

## Scoring model

The overall score is a deterministic weighted average of five 0–100 dimensions:

| Dimension | Weight | Signals |
| --- | ---: | --- |
| Rhythm | 20% | Preferred relationship order and visual breaks |
| Trust | 20% | Presence and placement of proof before conversion |
| Conversion | 20% | A decisive conversion close without CTA abuse |
| Visual balance | 20% | Layout variation and editorial/media interruptions |
| Density | 20% | Healthy page length and avoidance of card fatigue |

The default numerical pass threshold is 70. A composition with any major warning remains failed even if the aggregate score is high. This keeps a strong average from hiding a major journey defect.

## Relationship rules

Rules cover real estate, healthcare, restaurant/food and beverage, automotive, and professional services. Each rule declares:

- preferred role order;
- required journey roles;
- trust roles;
- conversion roles;
- visual storytelling roles.

Role matching uses existing section categories, purposes, and component variant IDs. No new business-intelligence inference is introduced.

## Anti-patterns

The guard reports:

- missing trust before a conversion request;
- conversion blocks appearing before proof;
- more than two primary conversion sections;
- three or more consecutive card-driven sections;
- repeated layout patterns without visual variation;
- missing gallery/media/project storytelling in visual business families;
- missing recommended relationship roles.

Diagnostics contain stable codes, human-readable messages, severity, affected section IDs, and repair suggestions.

## Examples

A premium automotive flow uses Hero → Trust → Services → Gallery → Reviews → Booking CTA → Footer. A weak Hero → Services → CTA flow fails because it requests conversion without a trust layer and has insufficient journey depth.

A restaurant flow is rewarded for Experience Gallery → Menu → Story → Reviews before its reservation close. A page made entirely of service, feature, benefit, and pricing grids is penalized for card fatigue and missing visual breaks.

## Golden fixtures

Full-page fixtures cover luxury real estate, automotive, restaurant, healthcare, and professional services. They lock ordering intent, component variant identifiers, and a minimum expected score of 85.

## Future learning integration

The result contract can later provide structured feedback to candidate evolution or learning systems. That future integration should consume stable warning codes and score dimensions; it must not make this engine nondeterministic or move Blueprint mutation outside Builder commands.

## Safety boundaries

RC-9E makes no AI calls and changes no prompts, hydration behavior, Blueprint schema, serialization, renderer, canvas, runtime, or component compiler implementation. It produces metadata only.
