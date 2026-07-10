# Phase 26 Design Engine

## Objective

Implement the deterministic local Design Engine.

Design Engine answers what visual language the website should use. It creates design intent and token strategy. It does not render UI, select final components, generate CSS files, generate Builder nodes, or create `WebsiteSpec`.

## Scope

Created or updated `apps/web-app/modules/builder-v2/website-engine/design/` with:

- `DesignEngine.ts`
- `designIntent.ts`
- `designLanguages.ts`
- `typographyEngine.ts`
- `colorEngine.ts`
- `layoutEngine.ts`
- `spacingEngine.ts`
- `rhythmEngine.ts`
- `motionEngine.ts`
- `responsiveEngine.ts`
- `densityEngine.ts`
- `themeEngine.ts`
- `brandAdaptation.ts`
- `tokenValidation.ts`
- `contrast.ts`
- `validation.ts`
- `verification.ts`
- `version.ts`
- `index.ts`
- `README.md`
- `runDesign.ts`

## Contracts Added

- `DesignInput`
- `DesignResult`
- `DesignIntent`
- `DesignLanguageProfile`
- `TypographyProfile`
- `ColorProfile`
- `SpacingProfile`
- `LayoutProfile`
- `MotionProfile`
- `ResponsiveProfile`
- `DensityProfile`
- `ThemeProfile`
- `VisualRhythm`
- `InteractionProfile`
- `BrandAdaptationReport`
- `DesignConfidence`
- `DesignMetrics`
- `DesignWarning`

`DesignTokens` is reused from the SDK.

## Design Languages Added

Minimal, Modern, Luxury, Premium, Editorial, Corporate, Creative, Organic, Clinical, Hospitality, Industrial, Fashion, Bold, Playful, Brutalist, Technology, Warm, and Heritage.

## Helpers Added

- `runDesignEngine()`
- `inferDesignIntent()`
- `selectDesignLanguage()`
- `buildTypographyProfile()`
- `buildColorProfile()`
- `buildSpacingProfile()`
- `buildLayoutProfile()`
- `buildMotionProfile()`
- `buildResponsiveProfile()`
- `buildDensityProfile()`
- `buildThemeProfile()`
- `buildVisualRhythm()`
- `buildInteractionProfile()`
- `buildBrandAdaptationReport()`
- `buildDesignTokens()`
- `validateContrastBasics()`
- `scoreDesignConfidence()`
- `validateDesignResult()`
- `runDesignVerification()`

## Verification

Ran:

```sh
pnpm --dir apps/web-app typecheck:builder
```

Status: passed.

## Safety

- `ai-v9` untouched.
- Builder behavior untouched.
- Production routes untouched.
- Rendering untouched.
- Feature flags remain false.
- No DB calls.
- No network calls.
- No LLM calls.
- No CSS generation.
- No component selection.
- No layout generation.
- No Builder nodes.
- No Planner, Component Engine, Composition Engine, Mapper, Renderer, Critic, Repair, WebsiteSpec Builder, AI generation, or production wiring.

## Documentation Gaps

The phase brief references documents that are currently absent:

- `docs/architecture/30_DESIGN_ENGINE_V2.md`
- `docs/specifications/DesignLanguage.md`
- `docs/specifications/DesignIntent.md`
- `docs/specifications/VisualRhythm.md`
- `docs/specifications/DensityProfile.md`
- `docs/specifications/InteractionProfile.md`
- `docs/specifications/ResponsiveProfile.md`
- `docs/specifications/ThemeProfile.md`
- `docs/specifications/BrandAdaptationReport.md`

Implementation proceeded from available design docs, SDK contracts, and the Phase 26 brief.

## Technical Debt

- Design scoring is deterministic and simple.
- Contrast checks are basic token-level checks, not rendered visual QA.
- Tokens are strategy tokens and do not emit CSS.

## Next Phase

Phase 27 — Component Engine.
