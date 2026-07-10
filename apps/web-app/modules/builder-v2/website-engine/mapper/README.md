# Native Builder Mapper

## Purpose

Native Builder Mapper converts Builder Blueprint intent into executable native Builder mapping plans and, behind a disabled feature flag, can materialize native-compatible node and command objects for manual verification.

Phase 32 keeps execution disabled by default. It does not execute commands, write the Builder store, modify the canvas, alter renderer behavior, or wire production routes.

## Current Status

Phase 32 Mapper Execution Behind Disabled Feature Flag.

## Public API

- `runNativeBuilderMapper(input)` returns `EngineResult<MapperResult>`.
- `buildNativeBuilderMappingPlan(input)` builds an inert `NativeBuilderMappingPlan`.
- `buildNodeMappingPlan(input)` creates ordered native node creation metadata.
- `buildCommandMappingPlan(input)` creates inert command intent plans.
- `buildPropertyMappingPlan(input)` maps inspector bindings to native property path intents.
- `buildStyleMappingPlan(input)` maps style bindings to `BuilderNode.style` paths.
- `buildResponsiveMappingPlan(input)` maps desktop/tablet/mobile responsive metadata.
- `buildAssetMappingPlan(input)` maps asset requirements without upload/fetch/substitution.
- `validateNativeBuilderMappingPlan(plan)` validates contract safety.
- `runNativeBuilderMapperVerification()` performs compile-safe verification.
- `executeNativeBuilderMappingPlan(input)` validates a mapping plan and hard-blocks unless `MAPPER_EXECUTION_ENABLED` is explicitly true.
- `createNativeBuilderNodesFromPlan(plan)` creates native-compatible `BuilderNode` objects without inserting them.
- `buildCommandObjectsFromPlan(plan)` creates native `BuilderCommand` objects without executing them.
- `applyPropertyMappings(plan)`, `applyStyleMappings(plan)`, and `applyResponsiveMappings(plan)` create non-mutating mapping records.
- `resolveAssetMappings(plan)` creates local-only asset mapping records without upload, fetch, or substitution.
- `validateMapperExecutionInput(input)` and `validateMapperExecutionResult(result)` enforce execution safety.
- `runMapperExecutionVerification()` proves execution is blocked by default.

## Feature Flag Behavior

`MAPPER_EXECUTION_ENABLED` lives in the Website Engine SDK feature flags and remains `false`.

Normal calls to `executeNativeBuilderMappingPlan()` return `EngineResult<MapperExecutionResult>` with `status: "blocked"`, `blocked: true`, and `reason: "MAPPER_EXECUTION_DISABLED"`.

No production import path calls mapper execution. The helper exists for future disabled-flag manual verification only.

## Safety Notes

- No command execution.
- No Builder store writes.
- No automatic mapper execution.
- No rendering.
- No Builder behavior changes.
- No React, CSS, HTML, or JavaScript generation.
- No production route wiring.
- Feature flags remain false.

## Creative Library Alignment

Creative Library does not emit mapper plans. Mapper only consumes native intent produced downstream by Builder Blueprint Engine and converts it into inert native Builder execution plans.

## Implementation Phase

Phase 32 Mapper Execution Behind Disabled Feature Flag.
