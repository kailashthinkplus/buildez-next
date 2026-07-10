# BSP-17 Native Builder Insertion Hardening

## Objective

Harden the native Builder insertion pipeline while preserving strict blueprint validation and native Builder architecture.

## Problem Statement

Runtime insertions occasionally failed with:

- invalid-child-relationship
- Initial CommandBus blueprint validation failure

Although validation correctly rejected invalid trees, insertion context could become stale.

## Investigation

Reviewed:

- blueprintSchema.ts
- nodeTreeValidation.ts
- CommandBus.ts
- InsertNodeCommand.ts
- nativeHierarchyInsertion.ts
- BuilderShell.tsx
- BlocksPanel.tsx
- Website Engine mapper

## Findings

Confirmed:

- Validation architecture is correct.
- CommandBus validates correctly.
- InsertNodeCommand rejects invalid hierarchy.
- Native insertion planner generates valid Section → Container → Column hierarchy.
- Website Engine remains Builder-agnostic.

Root cause identified:

BlocksPanel could use a stale selectedNodeId after selection changes.

## Changes

Modified:

apps/web-app/modules/builder-v2/sidebar/panels/BlocksPanel.tsx

Implemented:

- Validate selectedNodeId exists.
- Fallback to blueprint.root.
- Select newly inserted node after insertion.
- Preserve strict hierarchy validation.
- No schema changes.
- No validation weakening.

## Validation

Executed:

npm run typecheck:builder

Status:

PASS

## Remaining Risks

- Drag & Drop insertion
- Clipboard insertion
- Duplicate insertion
- Template insertion
- AI mapper insertion

## Next Phase

BSP-18 — Unified Builder Insertion Pipeline
