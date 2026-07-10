# BSP-10 Clipboard, Layers Sorting, and Layout Controls

Date: 2026-07-08  
Status: Implemented with compile-safe regression coverage  
Phase: Builder Bug Fix Sprint 4

## Objective

BSP-10 addresses the core manual editing blockers for clipboard workflows, layer ordering, and section/container layout controls.

Target bugs:

- BUG-0010: Copy Style / Paste Style broken
- BUG-0011: Copy / Paste node missing
- BUG-0015: Layers not sortable
- BUG-0009: Full Width / Boxed controls broken
- Related layout control reliability issues

## Implementation Summary

### Clipboard Foundation

Added `apps/web-app/modules/builder-v2/core/clipboard/` with:

- `builderClipboard.ts`
- `clipboardTypes.ts`
- `clipboardValidation.ts`
- `copyNode.ts`
- `pasteNode.ts`
- `copyStyle.ts`
- `pasteStyle.ts`
- `index.ts`

The clipboard foundation supports node copy/paste, style copy/paste, subtree cloning, duplicate-safe ids, parent/child validation, compatible style filtering, session storage persistence when available, and in-memory fallback for non-browser/test environments.

### CommandBus Integration

Updated clipboard-facing commands to delegate through the new clipboard helpers while preserving CommandBus and history semantics:

- `CopyElementCommand`
- `PasteElementCommand`
- `CopyStyleCommand`
- `PasteStyleCommand`

Paste and style paste operations validate their resulting blueprint before returning changes to CommandBus.

### Layers Sorting

Updated `ReorderNodeCommand` to support sibling reordering by direction or target index. The command validates the resulting blueprint and rejects invalid or out-of-bounds moves.

Updated the Layers panel with a minimal safe reorder hook using up/down controls for sibling ordering. Reorder actions go through CommandBus and preserve selection after execution.

### Full Width / Boxed Controls

Updated Design inspector layout controls so section/container width mode writes real layout style values:

- Full width resolves to `width: "100%"` and clears boxed max-width/margins.
- Boxed resolves to `width: "100%"`, `maxWidth`, and horizontal auto margins.
- Width percentage updates now use responsive style writes for the active device.
- Container and column sizing paths remain tied to existing inspector semantics.

The BSP-9 shared rendering resolver now has compile-safe regression coverage for the full-width/boxed contract.

## Regression Coverage

Added compile-safe regression specs and helpers:

- `commands/clipboard.test.ts`
- `commands/style-clipboard.test.ts`
- `commands/layers-reorder.test.ts`
- `inspector/layout-controls.test.ts`
- `helpers/testClipboardHarness.ts`
- `helpers/testLayersHarness.ts`

Coverage includes:

- Node copy/paste duplicates subtrees with new ids.
- Invalid paste parents are rejected.
- Style copy/paste copies compatible style fields only.
- Incompatible style paste is safely rejected.
- Layers reorder changes sibling order.
- Invalid layer moves are rejected.
- Undo/redo works for paste and reorder.
- Full-width/boxed styles resolve consistently through canvas/runtime parity helpers.
- Responsive layout overrides resolve per device.

## Verification

Command run:

```bash
pnpm --dir apps/web-app typecheck:builder
```

Result: Passed.

No test runner script is configured in `apps/web-app/package.json`; BSP-10 test files are compile-safe regression specifications until a runner is added.

## Safety

- `ai-v9` untouched.
- AI generation not wired.
- Mapper not executed.
- No AI Builder nodes inserted.
- Feature flags unchanged.
- No route changes.
- No unrelated Builder UI refactor.
- Manual Builder behavior changed only for intended clipboard, layers reorder, and layout control fixes.

## Remaining Risks

- Layers sorting uses minimal up/down controls; full drag sorting remains a later UX enhancement.
- Clipboard behavior is compile-safe and typechecked, but still needs executable/browser regression once a runner exists.
- Layout width slider can still emit multiple style updates for compound width/flex/max-width edits; a future command transaction could make that a single undo step.
- Full publish/preview visual parity still requires browser-level snapshots.
