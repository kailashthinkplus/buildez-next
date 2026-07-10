# BSP-7 Serialization, Schema Validation, and History Transactions

Date: 2026-07-08  
Program: Builder Stabilization Program  
Phase: BSP-7  
Type: Bug fix sprint

## Objective

Fix the first structural Builder blockers around blueprint validation, safe serialization, parent/child tree consistency, CommandBus history stability, transaction batching, and save/reload roundtrip safety.

## Bugs Addressed

- BUG-0037 serialization/schema validation: partially addressed with production validator and serialization helpers.
- BUG-0031 CommandBus history: partially addressed with bounded history manager and validation-backed command acceptance.
- BUG-0033 multi-command undo fragmentation: addressed for explicit CommandBus transactions.
- Related parent/child consistency risks: addressed through tree validation.
- Related save/reload roundtrip risks: addressed through serialize/deserialize helpers and compile-safe regression specs.

## Validation Added

Created `apps/web-app/modules/builder-v2/core/validation/`:

- `blueprintSchema.ts`
- `blueprintValidation.ts`
- `nodeTreeValidation.ts`
- `serializationValidation.ts`
- `validationResult.ts`
- `index.ts`

Validation checks blueprint shape, version, root page, unique node ids, parent ids, child references, cycles, orphan nodes, invalid node types, unsupported widget types, allowed hierarchy, props/style defaults, and JSON-safe serialized values.

## Serialization Added

Created `apps/web-app/modules/builder-v2/core/serialization/`:

- `serializeBlueprint.ts`
- `deserializeBlueprint.ts`
- `normalizeBlueprint.ts`
- `repairBlueprintTree.ts`
- `index.ts`

Serialization validates before output. Deserialization validates before accepting. Normalization fills safe defaults. Repair only handles safe child-reference cleanup and returns errors for unsafe structural issues.

## History Added

- Replaced placeholder `HistoryManager` with bounded undo/redo stack.
- Updated `CommandBus` with explicit transactions.
- Added atomic transaction undo/redo support.
- Added failed command rollback for invalid command output.
- Wrapped existing compound container/column insert flows in explicit CommandBus transactions.
- Preserved existing single-command `execute()` behavior.

## Regression Coverage

Updated compile-safe specs:

- `commands/history-transactions.test.ts`
- `serialization/blueprint-schema.test.ts`
- `serialization/save-reload-roundtrip.test.ts`

Coverage includes duplicate ids, orphan nodes, cycles, invalid parents, invalid child relationships, normalization defaults, safe repair, unsafe repair, transaction undo/redo, failed command rollback, and save/reload roundtrip preservation.

## Limits

The production blueprint API route was not changed because BSP-7 explicitly prohibited production route changes except compile-safe import fixes. API-level save rejection should be wired only when that constraint is lifted or explicitly approved.

No test runner is configured in `apps/web-app`; BSP-7 ran Builder typecheck and compile-safe regression specs only.

## Verification

Command run:

```text
pnpm --dir apps/web-app typecheck:builder
```

Result: passed.

## Safety

No `ai-v9` files changed. AI generation was not wired. Mapper was not executed. No AI Builder nodes were inserted. Feature flags remain false. No unrelated Builder UI was refactored.
