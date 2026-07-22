# AI v10 Orchestrator

## Purpose

Future orchestration shell for the Website Engine.

## Current Status

Phase 11 skeleton only. Disabled by feature flag.

## Public API Placeholder

`runAiV10Orchestrator(input)` returns an `EngineResult` explaining that orchestration is disabled and skeleton-only.

## Dependencies

SDK feature flags and trace helpers only. No ai-v9 calls and no external LLM calls.

## Implementation Phase

Phase 17 ai-v10 Orchestrator.

## Safety Notes

Not imported by production generation as a working engine. The legacy `runV10WebsiteGeneration` entry point fails closed while `AI_V10_ENABLED` is false.

