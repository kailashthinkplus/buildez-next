# Phase 31 - Native Builder Mapper Contracts

## Status

Implemented on 2026-07-07.

## Objective

Create contract-only Native Builder Mapper plans that convert Builder Blueprint intent into executable native Builder mapping plans without executing anything.

## Implemented

- Added `MapperInput`.
- Added `MapperResult`.
- Added `NativeBuilderMappingPlan`.
- Added `NodeMappingPlan`.
- Added `CommandMappingPlan`.
- Added `PropertyMappingPlan`.
- Added `StyleMappingPlan`.
- Added `ResponsiveMappingPlan`.
- Added `AssetMappingPlan`.
- Added `MapperWarning` and `MapperMetrics`.
- Added `runNativeBuilderMapper()`.
- Added deterministic helpers for node, command, property, style, responsive, and asset mapping plans.
- Added `validateNativeBuilderMappingPlan()`.
- Added compile-safe `runNativeBuilderMapperVerification()`.
- Removed old mutating mapper skeleton files from the Website Engine mapper module.

## Safety Boundaries

- No `ai-v9` changes.
- No Builder behavior changes.
- No Builder store writes.
- No CommandBus execution.
- No production route wiring.
- No renderer or canvas changes.
- No React, CSS, HTML, or JavaScript generation.
- No provider, MCP, DB, network, external service, or LLM calls.
- Feature flags remain false.

## Validation

Run:

```bash
pnpm --dir apps/web-app typecheck:builder
```

The compile-safe verification entry point is:

```ts
runNativeBuilderMapperVerification()
```

## Next Phase

Phase 32 - Mapper Execution Behind Disabled Feature Flag.
