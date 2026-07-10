# Phase 33 - Renderer and Preview/Published Parity Contracts

## Status

Implemented on 2026-07-07.

## Objective

Create metadata-only renderer parity contracts and verification scaffolding so future AI-generated native Builder nodes can be checked for consistency across:

- Builder canvas
- Preview
- Published page
- Export/runtime

## Implemented

- Added `website-engine/renderer-parity`.
- Added `RenderTarget`.
- Added `RendererParityInput`.
- Added `RendererParityResult`.
- Added `RendererParitySnapshot`.
- Added `RendererParityRule`.
- Added `RendererParityIssue`.
- Added `RendererParityMetrics`.
- Added `RendererParityWarning`.
- Added `runRendererParityEngine()`.
- Added `runRendererParityCheck()`.
- Added `buildRenderTargetMatrix()`.
- Added `buildParitySnapshot()`.
- Added `compareParitySnapshots()`.
- Added `validateRendererParityInput()`.
- Added `validateRendererParityResult()`.
- Added `runRendererParityVerification()`.

## Checks

- Unsupported widget types.
- Missing responsive metadata.
- Missing style bindings.
- Missing required assets.
- Missing motion metadata.
- Mapper compatibility gaps.
- Target coverage for canvas, preview, published, and export.
- Side-effect safety.

## Safety Boundaries

- No `ai-v9` changes.
- No production renderer changes.
- No canvas behavior changes.
- No production route wiring.
- No automatic Mapper execution.
- No Builder store writes.
- No screenshot capture.
- No actual rendering.
- No DB, network, LLM, MCP, provider, or external service calls.
- Feature flags remain false.

## Validation

Run:

```bash
pnpm --dir apps/web-app typecheck:builder
```

The compile-safe verification entry point is:

```ts
runRendererParityVerification()
```

## Next Phase

Phase 34 - Simulation Engine.
