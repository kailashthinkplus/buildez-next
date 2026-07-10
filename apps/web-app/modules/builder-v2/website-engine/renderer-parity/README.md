# Renderer Parity

## Purpose

Renderer Parity defines metadata contracts for checking that native Builder nodes can eventually render consistently across Builder canvas, preview, published page, and export/runtime surfaces.

Phase 33 is contracts and inert verification only. It does not render, capture screenshots, mutate Builder store, execute Mapper, change canvas/runtime behavior, or wire production routes.

## Current Status

Phase 33 Renderer and Preview/Published Parity Contracts.

## Public API

- `runRendererParityEngine(input)` returns `EngineResult<RendererParityResult>`.
- `runRendererParityCheck(input)` builds metadata-only parity snapshots.
- `buildRenderTargetMatrix()` returns canvas, preview, published, and export targets.
- `buildParitySnapshot(input)` creates a non-rendered snapshot for one target.
- `compareParitySnapshots(snapshots)` compares metadata snapshots.
- `validateRendererParityInput(input)` validates input references.
- `validateRendererParityResult(result)` validates result shape and side-effect safety.
- `runRendererParityVerification()` performs compile-safe verification without rendering.

## Checks

- Unsupported widget types.
- Missing responsive metadata.
- Missing style bindings.
- Missing required assets.
- Missing motion metadata.
- Mapper compatibility gaps.
- Target coverage for canvas, preview, published, and export.
- Side-effect safety.

## Safety Notes

- No `ai-v9` changes.
- No production renderer changes.
- No canvas behavior changes.
- No production route wiring.
- No Builder store writes.
- No automatic Mapper execution.
- No screenshot capture.
- No DB, network, LLM, MCP, or provider calls.
- Feature flags remain false.
