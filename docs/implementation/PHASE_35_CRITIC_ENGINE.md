# Phase 35 - Critic Engine

Date: 2026-07-07

## Summary

Phase 35 implements the first production-grade, metadata-only Critic Engine for the BuildEZ Website Engine. The critic evaluates upstream contracts from Simulation, Renderer Parity, Compiler, Builder Blueprint, Mapper plans, Creative Library, Design DNA, Media Intelligence, and Motion Intelligence without rendering, screenshots, Builder store writes, Mapper execution, provider calls, or production wiring.

## Implemented

- `runCriticEngine()` returns `EngineResult<CriticResult>`.
- `runCritic()` remains as a compatibility wrapper.
- `evaluateWebsite()` remains as a compatibility wrapper returning `WebsiteEvaluation`.
- `runCriticVerification()` provides compile-safe local verification.
- `validateCriticInput()` and `validateCriticResult()` enforce the critic contract.
- `runQualityGates()` applies preview, publish, repair, and hard-failure gates.

## Categories

- Visual hierarchy
- Typography
- Spacing
- Composition
- Design DNA consistency
- Creative Library diversity
- Content truth
- Conversion quality
- Accessibility
- SEO
- Performance risk
- Mobile quality
- Editability
- Renderer parity
- Industry fit
- Asset readiness
- Motion/accessibility risk

## Quality Gates

- Score `85+`: preview-ready when no hard failures exist.
- Score `90+`: publish-recommended when no hard failures exist.
- Score below `85`: requires Repair.
- Any hard failure blocks publish recommendation.

## Hard Failures

- Fake stats
- Fake compliance claims
- Fake awards
- Fake testimonials
- Fake pricing
- Placeholder copy
- Missing primary CTA on a conversion-focused page
- No editable mapping intent
- Unsupported widget types
- Opaque HTML/blob-like output
- Missing mobile plan
- Severe accessibility risk
- Missing required assets without substitution policy
- Renderer parity critical issue
- Non-editable generated section
- Repeated near-identical recipe use where diversity is expected

## Safety

- No `ai-v9` changes.
- No Builder behavior changes.
- No production routes.
- No Builder store writes.
- No Mapper execution.
- No renderer or canvas changes.
- No screenshots.
- No DB, network, LLM, MCP, or provider calls.
- No generated React, CSS, HTML, or JavaScript.
- Feature flags remain false.

## Verification

`pnpm --dir apps/web-app typecheck:builder` passed.

## Next Phase

Phase 36 - Repair Engine.
