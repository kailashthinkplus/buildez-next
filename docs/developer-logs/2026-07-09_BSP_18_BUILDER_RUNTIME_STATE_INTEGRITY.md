# BSP-18 Builder Runtime State Integrity

Date: 2026-07-09

## Summary

Performed runtime state synchronization audit for Builder selection, undo/redo, and blueprint lifecycle.

## Investigation

Reviewed:

- useSelectionStore.ts
- CommandBus.ts
- BuilderShell.tsx

## Findings

Selection state exists independently from Builder Blueprint.

Undo, redo, delete, AI reload, and blueprint replacement can invalidate the selected node.

## Fix

BuilderShell now synchronizes selection with the active blueprint.

When:

- blueprint changes
- selected node no longer exists

selection is automatically cleared.

## Benefits

- Prevents stale selection references.
- Prevents Inspector targeting deleted nodes.
- Prevents SelectionOverlay rendering invalid nodes.
- Improves runtime consistency after undo/redo.
- Improves AI blueprint reload stability.

## Validation

npm run typecheck:builder

PASS

## Remaining Risks

- Hover synchronization
- Multi-selection synchronization
- Drag/drop transient state
