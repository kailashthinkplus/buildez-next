# Pattern Intelligence Engine

Phase 25 adds an inert, local-only Pattern Intelligence Engine.

## Scope

Pattern Intelligence answers: which proven UX, content, conversion, trust, and journey patterns fit this business and website goal?

It is semantic pattern reasoning only. It is not template selection, component selection, layout generation, visual design, Builder node creation, WebsiteSpec creation, AI generation, or production wiring.

## Inputs

- `BusinessIntelligenceProfile`.
- `BrandIntelligenceProfile`.
- `ContentStrategy`.
- `ExperienceStrategy`.
- `WebsiteIntentClassification`.
- `BusinessContext`.
- Local repository and graph references.
- Reasoning candidates.
- Decision plan if available.
- Constraint result context.
- Known and missing facts.

## Output

`runPatternIntelligence()` returns `EngineResult<PatternIntelligenceResult>` with:

- Ranked selected and rejected semantic patterns.
- Recommended pattern sets in trace metadata.
- Pattern sequence suggestions.
- Compatibility and conflict notes.
- Required facts and assets.
- Conversion, trust, SEO, accessibility, and mobile behavior notes.
- Fallback patterns.
- Confidence, explanations, warnings, decisions, metrics, and trace metadata.

## Starter Semantic Patterns

The local catalog includes reusable definitions for Editorial Hero, Product Value Hero, Booking Hero, Appointment Hero, Trust Band, Proof Stack, Locality Map Narrative, Lifestyle Gallery, Service Matrix, Menu Preview, Course Catalogue Preview, Vehicle Service Matrix, Project Showcase, Product Feature Stack, FAQ Objection Handling, Final Conversion Block, Sticky Mobile CTA, Founder Story, Process Timeline, Portfolio Showcase, Comparison Section, Review Proof Block, Contact Lead Capture, and Footer Trust Closure.

## Verification

Use `runPatternIntelligenceVerification()` for compile-safe local verification.

```ts
import { runPatternIntelligenceVerification } from "./pattern-intelligence";

const result = runPatternIntelligenceVerification();
```

The required builder typecheck remains:

```sh
pnpm --dir apps/web-app typecheck:builder
```
