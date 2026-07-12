# Builder RC-T3 Operations Baseline

Date: 2026-07-12  
Status: baseline documented before RC-T3 production changes.

## Production command and entry-point inventory

The active mutation boundary is `CommandBus`. Production commands discovered are InsertNode, DeleteNode, DuplicateNode, UpdateNode, ReorderNode, ReparentNode, WrapInContainer, CopyElement, PasteElement, CopyStyle, PasteStyle, and node hidden/lock/responsive-visibility commands. `BuilderShell`, `BlocksPanel`, `PanelContainer`, Inspector `useNodeUpdater`, and inline canvas editing execute these commands. Compound native insertion plans use `CommandBus.transaction`.

The active store initializes from CommandBus and subscribes to validated snapshots. `useBuilderStore.setBlueprint` remains a public direct-set risk, although no active editing entry point was found using it. AI refresh deliberately reinitializes a complete server-returned Blueprint rather than applying an editing mutation. The older `useBlueprintStore` is a parallel legacy-style state surface and is not on the active BuilderRoot path.

## Supported and unsupported operations

Supported in production architecture: native hierarchy insert, subtree delete, recursive duplicate with regenerated IDs, same-parent reorder, cross-parent reparent, internal session-storage copy/paste, single-node container wrap, operation undo/redo, locked-node UI guards, canvas and palette HTML drag/drop, and single-node selection recovery.

Unsupported or incomplete: no Unwrap command/control; no multi-node command implementation despite `multiSelection` metadata; no cross-page/cross-site persistent clipboard contract (session storage only); no OS clipboard contract; no marquee selection; no multi-node delete/duplicate/move/wrap/copy; no explicit composite required-child/min/max contract in operation commands. These are not classified Ready.

## Architecture

- DnD uses native HTML drag events, DOM-derived target rectangles, `elementsFromPoint`, Builder custom events, a drag ghost, drop indicator, and auto-scroll. Palette drops build a native insertion plan; canvas drops execute ReparentNodeCommand.
- Clipboard serializes a full subtree into session storage, then regenerates every ID during paste and validates the completed Blueprint before returning it.
- Selection is Zustand state with one primary selected ID and a `multiSelection` array. BuilderShell clears stale/deleted selection. Duplicate, paste, move, reorder, and wrap do not currently select the operation result explicitly.
- Transactions are owned by CommandBus. A command exception inside a transaction rolls the entire Blueprint back and creates no history entry. No-op/rejected command results do not create history.
- BuilderHeader observes dirty/revision state and performs debounced authenticated Blueprint persistence. Operations themselves do not call persistence APIs.

## Existing executable evidence

`pnpm --dir apps/web-app test:builder:commands` executed 55 tests: 55 passed, 0 failed, 0 skipped. Existing evidence covers insertion hierarchy, subtree delete, recursive duplicate IDs, move/reparent cycles, reorder, clipboard, wrap, transactions, failure rollback, no phantom history, and seeded valid operations.

Authenticated Playwright infrastructure and the reviewed RC-T2 smoke/visual baseline exist. The RC-T3 baseline smoke attempt against the pre-existing port-3000 dev server failed during setup because the server redirected a successful login back to `/app/login`; two Builder tests did not run. A prior clean server on port 3001 passed authentication, smoke, and visual comparison. RC-T3 browser operation evidence must therefore use a clean deterministic server and cannot rely on the stale port-3000 process.

## Missing coverage and initial release risks

Missing executable coverage includes UI insert/delete/duplicate/reorder/copy/paste/wrap, keyboard focus guards, real DnD, operation selection semantics, autosave/reload for each core operation, zoom/scroll/device contexts, composite operations, and isolated golden journeys.

Initial risks:

- Selection after duplicate and paste is not updated to the newly created node; the stated intended behavior is currently unprovable from command return types.
- DuplicateNodeCommand lacks a root guard; duplicating root can create unreachable nodes and is expected to be rejected by CommandBus validation rather than by command capability.
- InsertNodeCommand mutates its constructor-owned node and does not explicitly reject an existing ID before mutation; validation provides the final safety boundary.
- `useBuilderStore.setBlueprint` is a direct mutation escape hatch.
- Browser tests currently target user content and have no deterministic reset fixture, so destructive journeys would be unsafe until isolation is established.
- The unrelated `/app` `getCurrentSession` import defect remains outside RC-T3 because direct Builder routes work on a clean server.

Deferred RC-T1/RC-T2 failures map to motion, theme, widget/AI metadata, and Inspector phases; none is reassigned to RC-T3. No production code was changed by RC-T3 before this baseline.

## RC-T3B disposable-page and reset strategy

The selected isolation mechanism is authenticated API-driven disposable page creation using only existing production contracts. Each destructive Playwright test creates a draft page through tenant-scoped `POST /api/pages`, writes the deterministic native fixture through tenant-scoped `POST /api/builder-v2/blueprints/:pageId`, navigates directly to that new Builder route, and soft-deletes it through tenant-scoped `DELETE /api/pages/:pageId` in teardown. Reset rewrites the same deterministic fixture through the normal Blueprint save contract and reloads the Builder; it does not mutate the database directly, replace client store state, add a test-only endpoint, or touch the real `home` page.

The dedicated account must own the configured `E2E_SITE_SLUG` site and may create/delete draft pages. Fixture titles use an RC-specific prefix and random suffix to prevent collisions. Cleanup is attempted even after assertion failure. The fixture has deterministic node IDs, two primary containers, basic widgets, nested layout, and a tall third section. This mechanism was selected after confirming the existing create, tenant-scoped save, and soft-delete APIs; it is safer than duplicating or restoring customer-like content.
