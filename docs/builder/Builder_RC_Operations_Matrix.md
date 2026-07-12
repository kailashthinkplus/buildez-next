# Builder RC-T3 Operation Capability Matrix

Date: 2026-07-12

| Operation | Implementation | UI / shortcut | Parent contract | Validation / transaction / history | Selection | Node test | Browser test | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Insert | InsertNodeCommand + native insertion plan | Blocks panel, palette drag, add section, quick add | Schema relationship rules | Blueprint validation; composite plans transactional; undo/redo | Planned inserted node selected by shell | Pass | Missing | Partial |
| Delete | DeleteNodeCommand | Selection toolbar; keyboard support not established | Root protected; locked UI guard | Recursive; validation; undo/redo | Deleted primary selection clears | Pass | Missing | Partial |
| Duplicate | DuplicateNodeCommand | Selection toolbar | Same parent | Recursive new IDs; validation; undo/redo | Created root selected | Pass | Pass (leaf duplicate + undo) | Partial |
| Reorder | ReorderNodeCommand | Layers arrows, selection toolbar | Same parent | Invalid/no-op unchanged; undo/redo | Moved node remains selected | Pass | Missing | Partial |
| Cross-parent move | ReparentNodeCommand | Canvas DnD/custom event | Schema + container capability; cycle rejection | Atomic command; undo/redo | Moved node remains selected | Pass | Missing | Partial |
| Palette DnD | HTML DnD -> insertion plan | Block menu drag | DOM target + schema | CommandBus, transactional when composite | Inserted node selected | Contract only | Missing | Partial |
| Palette DnD RC-T3F | Native Blocks drag | Heading | Non-empty passes; empty hierarchy mismatches target | Save/reload on passing path | New node selected | Pass | Fail (empty) | Blocked: BRC-0016 |
| Canvas DnD | HTML DnD -> ReparentNodeCommand | Node/toolbar drag | DOM target + schema + cycle guard | CommandBus; undo/redo | Moved node remains selected | Command pass | Missing | Partial |
| Copy | CopyElementCommand | Toolbar/context path | Any existing unlocked node | No Blueprint/history mutation | Unchanged | Pass | Missing | Partial |
| Paste | PasteElementCommand | Toolbar/context path | Clipboard target resolver | Regenerated IDs; final validation; one undo entry | Created root selected | Pass | Missing | Partial |
| Cross-page/site paste | Session-storage clipboard | No certified UI contract | Undefined | No persistence contract | Undefined | Missing | Missing | Unsupported |
| Wrap | WrapInContainerCommand | Selection toolbar menu | Non-root node with parent | One validated command; undo/redo | Wrapped node remains selected | Pass | Missing | Partial |
| Unwrap | None | None | N/A | N/A | N/A | None | None | Unsupported |
| Multi-select operations | Selection metadata only | No complete production operation path | Undefined | No atomic multi-node commands | Incomplete | None | None | Unsupported |
| Composite operations | Generic commands | Generic operation UI | Registry/schema only | Generic validation; no required-child cardinality contract | Generic | Partial | Missing | Partial |
| Keyboard operations | Escape fullscreen confirmed; operation shortcuts under audit | Window key handlers | Focus contract not proven | CommandBus where wired | Varies | Partial | Missing | Partial |
| Persistence | BuilderHeader autosave/save API | Automatic/manual header | Current page | Debounced by dirty revision | Reload recovery undefined | Contract only | Missing | Partial |

Keyboard shortcut, toolbar, context-menu, DnD, allowed/forbidden parent, and composite rows will be updated only from executable RC-T3 evidence. Unsupported capabilities are not treated as passing.
# RC-T3E gate

| Journey | Native DnD | Dirty/save | API/reload | Cleanup | Result |
| --- | --- | --- | --- | --- | --- |
| Button A → Container B | Handle, active, over B, inside, valid | dirty → saving → saved | exact once; reload retained | zero after each run | 3 consecutive passes |
| Save failure/retry | Same native drag | saving → error → saving → saved | unchanged after 500; persisted after retry | zero | Pass |
