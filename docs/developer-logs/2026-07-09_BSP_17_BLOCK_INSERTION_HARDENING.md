# BSP-17 Builder Block Insertion Hardening

Date: 2026-07-09

## Summary

Performed a Builder insertion architecture audit after runtime validation failures:

- invalid-child-relationship
- Initial CommandBus blueprint validation failures
- InsertNodeCommand validation errors

## Investigation

Reviewed:

- blueprintSchema.ts
- nodeTreeValidation.ts
- CommandBus.ts
- InsertNodeCommand.ts
- nativeHierarchyInsertion.ts
- BuilderShell.tsx
- BlocksPanel.tsx
- Website Engine command mapper

Verified:

- Validation architecture is correct.
- CommandBus correctly validates after execution.
- InsertNodeCommand rejects invalid parent/child combinations.
- Native insertion planner correctly generates Section → Container → Column wrappers.

## Root Cause

BlocksPanel used the current selectedNodeId without verifying it still existed in the active blueprint.

Following undo, delete, replace, or selection changes, stale selection state could be used as the insertion context.

## Fix

BlocksPanel now:

- validates selectedNodeId exists
- falls back to blueprint.root when invalid
- selects the newly inserted node after successful insertion

This keeps BlocksPanel behavior consistent with BuilderShell.

## Validation

Executed:

npm run typecheck:builder

Result:

PASS

## Remaining Work

Continue BSP-18:

- Drag & Drop insertion audit
- Paste audit
- Duplicate audit
- Template insertion audit
- AI mapper insertion audit
