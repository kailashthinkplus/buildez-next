# Phase 46: Golden Website Visual Evaluation

## Purpose

RC-12 extends deterministic Golden Website correctness validation into rendered visual-quality validation. It proves that all 52 RC-11 fixtures can be hydrated without AI calls, rendered by the existing production runtime, inspected at desktop/tablet/mobile widths, scored deterministically, and captured without network dependencies.

RC-12 is an isolated validation system. It does not change generation decisions or production rendering.

## Data flow

```text
GoldenWebsiteCase
  -> existing GoldenWebsiteRunner
  -> existing semantic hydration contract with deterministic fixture content
  -> native Builder Blueprint
  -> existing PublishedPageRenderer
  -> Playwright viewport assertions and captures

Native Blueprint + selected components
  -> VisualQualityEvaluator
  -> metadata-only VisualQualityScore
```

## Golden preview route

Development and test environments expose:

```text
/internal/golden-preview/[caseId]
```

The route:

- loads an existing RC-11 fixture;
- executes the existing Golden Website and Blueprint engines;
- hydrates semantic placeholders through the existing hydration function;
- uses inline deterministic SVG fixture media;
- renders exclusively through `PublishedPageRenderer`;
- returns 404 in production;
- exposes stable Blueprint metadata, selected component IDs, composition score, full design execution plan, visual score, and render status through visible diagnostics and data attributes.

No alternative renderer or mock component tree is used.

## Deterministic content and assets

Preview copy is fixed by semantic node role. Media uses encoded inline SVG data URLs keyed by case and image order. Golden Design fixtures use system fonts. Captures therefore make no image, font, AI, or other remote requests.

Blueprint timestamps remain internal and are not rendered. Screenshot-visible status metadata contains stable fields only.

## Capture pipeline

`golden-preview.spec.ts` renders every fixture at:

| Target | Viewport |
| --- | --- |
| Desktop | 1440 × 1200 |
| Tablet | 1024 × 1200 |
| Mobile | 390 × 1200 |

For every viewport it verifies:

- successful route response;
- ready render status;
- production runtime root visibility;
- exact native node count in the DOM;
- no unresolved semantic placeholders;
- no horizontal document overflow;
- no console errors;
- no runtime exceptions.

Captures are written to:

```text
golden-captures/{industry}/{caseId}/{desktop|tablet|mobile}.png
```

Animations and carets are disabled during capture. The capture system produces 156 screenshots for the 52 cases.

## Visual quality scoring

`VisualQualityEvaluator` produces immutable metadata:

```ts
{
  layout,
  typography,
  hierarchy,
  imagery,
  responsive,
  overall,
  warnings,
}
```

### Layout

Evaluates overflow risk, fixed-width safety, whitespace balance, and section rhythm.

### Typography

Evaluates exactly one page H1, section-level H2 presence, body readability, and scale consistency. Small semantic labels and captions are distinguished from body copy.

### Hierarchy and component quality

Evaluates component pattern diversity, card fatigue, repeated layouts, and the presence of conversion hierarchy.

### Imagery

Evaluates required image sources and accessible alt text, while allowing intentionally text-led compositions.

### Responsive

Evaluates responsive style metadata, CTA presence, and mobile image width safety.

Scores are diagnostic only and never alter generation, layout, or component selection.

## Reference metadata

Optional reference metadata lives under `golden-websites/references/`. A case may provide style, mood, visual focus, notes, and an optional image path. Missing reference metadata or images never block preview generation or scoring.

The initial luxury residential reference describes a premium architecture-led editorial direction without requiring a checked-in reference image.

## Test coverage

Unit tests verify:

- all 52 cases receive stable scores;
- repeated evaluation is identical;
- hydrated previews contain no semantic placeholders;
- preview imagery is local and deterministic;
- intentional hierarchy and overflow regressions reduce scores and emit warnings;
- optional references do not become required dependencies.

Playwright performs real runtime validation and screenshot capture for every case and viewport.

## Limitations

- The evaluator uses deterministic Blueprint and DOM signals; it does not perform computer-vision aesthetic judgment.
- Screenshot similarity baselines and perceptual diff thresholds are not introduced in RC-12.
- Fixture copy and inline imagery are intentionally deterministic evaluation content, not production creative output.
- A high score proves conformance to the encoded quality rules, not universal subjective design preference.

## Safety boundaries

RC-12 changes no AI integration, AI v10 orchestration, Website Engine decision logic, Blueprint schema, serialization format, component compiler, hydration architecture, Builder renderer, canvas architecture, runtime rendering, or motion engine.
