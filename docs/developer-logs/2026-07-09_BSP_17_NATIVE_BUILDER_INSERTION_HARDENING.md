# 2026-07-09 BSP-17 Native Builder Insertion Hardening

## Summary

Performed a full Builder insertion architecture review following runtime hierarchy validation failures.

## Files Reviewed

- blueprintSchema.ts
- nodeTreeValidation.ts
- CommandBus.ts
- InsertNodeCommand.ts
- nativeHierarchyInsertion.ts
- BuilderShell.tsx
- BlocksPanel.tsx
- Website Engine mapper

## Root Cause

BlocksPanel insertion relied on selectedNodeId without confirming it still existed in the current blueprint.

This could happen after:

- delete
- undo
- selection changes
- blueprint refresh

## Fix

BlocksPanel now:

- validates selectedNodeId
- falls back to blueprint.root
- selects inserted node

Behavior is now consistent with BuilderShell.

## Validation

npm run typecheck:builder

PASS

## Status

BSP-17 partially complete.

Next:

BSP-18 Unified Builder Insertion Pipeline.
