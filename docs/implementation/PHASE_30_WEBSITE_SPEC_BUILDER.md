# Phase 30 - WebsiteSpec Builder

## Status

Implemented on 2026-07-07.

## Objective

Create a deterministic local WebsiteSpec Builder that converts upstream Website Engine outputs into canonical SDK `WebsiteSpec` and `WebsiteDNA` contracts before Compiler.

## Implemented

- Added `WebsiteSpecBuilderInput`, `WebsiteSpecBuilderResult`, `WebsiteSpecBuildExplanation`, `WebsiteSpecBuildMetrics`, `WebsiteSpecBuildWarning`, `SectionSpecBuildInput`, `WebsiteDNAInput`, and `WebsiteDNAResult`.
- Added `runWebsiteSpecBuilder()` and `buildWebsiteSpec()` for canonical WebsiteSpec construction.
- Added `buildWebsiteDNA()` for identity continuity across business, brand, content, experience, pattern, creative, design, media, and motion inputs.
- Added helpers for section specs, content requirements, component preferences, forbidden components/patterns, design rules, asset requirements, SEO requirements, accessibility requirements, conversion rules, responsive rules, missing facts, fallback strategy, validation, verification, and versioning.
- Removed the old planner-shaped real-estate-specific specification skeleton from the module exports and files.

## Safety Boundaries

- No Mapper.
- No Renderer.
- No Critic or Repair.
- No Planner or AI orchestration.
- No Builder nodes.
- No React, CSS, HTML, or JavaScript generation.
- No generated websites.
- No provider, MCP, DB, network, external service, or LLM calls.
- No production route wiring.
- No `ai-v9` changes.
- Feature flags remain false.

## Validation

Run:

```bash
pnpm --dir apps/web-app typecheck:builder
```

The compile-safe verification entry point is:

```ts
runWebsiteSpecBuilderVerification()
```

## Next Phase

Phase 31 - Native Builder Mapper Contracts.
