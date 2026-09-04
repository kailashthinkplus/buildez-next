# Phase 44: Design Intelligence Compiler

## Purpose

RC-10 translates existing Website Engine design intelligence into deterministic execution metadata. It sits after composition-quality evaluation and before native component compilation, giving downstream systems one consistent description of typography, spacing, containers, media treatment, motion intent, and responsive behavior.

The compiler does not emit CSS, mutate component trees, or render content.

## Architecture

```text
CompositionResult
  -> CompositionQualityEngine
  -> DesignIntelligenceCompiler
  -> immutable DesignExecutionPlan
  -> ComponentVariantCompilerRegistry / RecipeRegistry fallback
  -> native Builder Blueprint seeds
```

`SemanticBlueprintCompiler` returns the plan as `designExecutionPlan` alongside `compositionQuality`. These are isolated compilation diagnostics and do not change the Blueprint schema.

## Inputs

The compiler accepts existing Website Engine artifacts:

- `DesignResult`
- `BrandIntelligenceProfile`
- business family and website archetype
- `CompositionResult`
- `ComponentResult`
- selected component variant identifiers

Inputs are optional so legacy Blueprint compilation remains compatible. Missing design or brand inputs produce explicit quality warnings and family-safe defaults.

## Output

`DesignExecutionPlan` contains:

- `visualDirection`
- `typographyPlan`
- `spacingPlan`
- `containerPlan`
- `mediaPlan`
- `motionPlan`
- `responsivePlan`
- `qualityScore`

Every plan is immutable and JSON-safe.

## Industry rules

### Luxury real estate

Uses a luxury-editorial direction, display typography, narrow body measure, 120px section rhythm, full-bleed hero media, wide galleries, cinematic crops, minimal radius, and subtle slow reveals.

### Healthcare

Uses a clear clinical direction, accessible 18px body typography, readable measures, balanced spacing, clean trustworthy photography, center-safe crops, and restrained responsive reveals.

### Restaurant

Uses hospitality-editorial typography, short readable measures, airy rhythm, full-bleed media, editorial lifestyle crops, immersive gallery rails, and slow visual reveals.

### SaaS

Uses product precision, compact information hierarchy, 80px section rhythm, 24px card spacing, contained UI media, structured product storytelling, and crisp restrained motion intent.

### Automotive

Uses performance-premium direction, bold headings, balanced density, subject-focused wide media, structured radii, and crisp reveal intent.

## Scoring

Design quality is evaluated across five 0–100 dimensions:

| Dimension | Evaluates |
| --- | --- |
| Typography | Minimum body size, line height, and readable text measure |
| Spacing | Section rhythm and useful component separation |
| Hierarchy | Hero emphasis, heading strength, and contrast |
| Media | Explicit aspect ratio, crop, and gallery behavior |
| Responsive | Headline-first stacking, CTA visibility, and mobile body size |

The overall score is the arithmetic mean with deterministic source-completeness penalties. Golden premium fixtures must score above 85.

## Responsive execution

Desktop metadata defines density, maximum width, and grid capacity. Tablet metadata defines column reduction and whether media priority should be preserved. Mobile metadata always preserves headline-first reading order, keeps the primary CTA visible, places media after the primary action, and enforces a minimum 16px body size.

## Motion boundary

RC-10 maps design intent to `none`, `subtle`, or `moderate` motion with a small preferred-effect set. It always requires reduced-motion support. The existing motion engine remains authoritative for execution.

## Golden fixtures

Fixtures cover luxury real estate, restaurant, healthcare, automotive, and SaaS. Each locks the expected visual direction, typography density, media treatment, and minimum quality score.

## Future learning integration

Future learning or candidate-evolution systems may consume stable plan fields and quality warnings as feedback. They should preserve deterministic compilation and must not allow learned output to bypass native component compilers, Builder commands, accessibility constraints, or renderer parity.

## Safety boundaries

RC-10 introduces no LLM calls and changes no AI prompts, hydration behavior, Blueprint schema, serialization, component compiler, renderer, canvas, runtime, or motion implementation.
