# Specification

## Purpose

The WebsiteSpec Builder converts deterministic upstream Website Engine outputs into the canonical SDK `WebsiteSpec` and `WebsiteDNA` contracts before Compiler.

It is not a Planner, Mapper, Renderer, Critic, Repair system, generator, or production integration point.

## Current Status

Phase 30 WebsiteSpec Builder.

## Public API

- `runWebsiteSpecBuilder(input)` returns `EngineResult<WebsiteSpecBuilderResult>`.
- `buildWebsiteSpec(input)` returns SDK `WebsiteSpec`.
- `buildWebsiteDNA(input)` returns SDK `WebsiteDNA`.
- `buildSectionSpecs(input)` builds SDK section specs.
- `buildContentRequirements(input)` builds explicit content requirements.
- `buildComponentPreferences(input)` builds preferred component metadata.
- `buildForbiddenComponents(input)` carries rejected pattern/component/constraint references.
- `buildDesignRules(input)` builds design metadata rules, not CSS.
- `buildAssetRequirements(input)` builds SDK asset requirements.
- `buildSeoRequirements(input)` builds SEO requirements.
- `buildAccessibilityRequirements(input)` builds accessibility requirements.
- `buildConversionRules(input)` builds conversion rules.
- `buildResponsiveRules(input)` builds responsive rules, not CSS.
- `buildMissingFacts(input)` preserves missing facts and assets explicitly.
- `buildFallbackStrategy(input)` describes safe behavior for unknowns.
- `validateWebsiteSpecBuilderResult(result)` validates the result.
- `runWebsiteSpecBuilderVerification()` performs compile-safe verification.

## Dependencies

SDK contracts and inert local Website Engine module outputs only.

## Safety Notes

- No Builder nodes.
- No Mapper.
- No Renderer.
- No generated websites.
- No React, CSS, HTML, or JavaScript generation.
- No provider, MCP, DB, network, external service, or LLM calls.
- No production wiring.
- Feature flags remain false.

## Implementation Phase

Phase 30 WebsiteSpec Builder.
