# Builder RC DnD Cancellation and Commit Safety Baseline

## State ownership before RC-T3H

- Active ID/type/source lived in mutable `window` fields.
- `pendingDropRef` held only the latest structural plan.
- Observable over ID, intent, and validity lived in React state.
- Escape, dragend, drop, and component cleanup cleared different subsets.
- Native drop could recover a cancelled active ID from `DataTransfer`.
- Invalid collision cleared the pending plan but left observable target state stale.
- No consumed commit token or final pointer/target revalidation existed.

The only mutation path was `onDropCapture` → insertion/reparent handler → CommandBus. `dragend` did not intentionally mutate, but stale payload and pending state could allow a later drop to reach that path.

## Canonical lifecycle

1. `dragstart` creates one session: active ID, cancelled=false, committed=false.
2. Each `dragover` resolves the current pointer stack. Chrome or no target clears pending and observable validity.
3. A valid collision stores over ID, intent, parent plan, and pointer coordinates.
4. Escape/blur/dragend without commit marks cancelled, clears active/pending/observable state, and cannot commit.
5. Native `drop` recomputes the current target and intent at final coordinates.
6. Commit requires active identity, matching payload, not cancelled, unused token, no chrome, no dragged-subtree hit, and exact pending/current over ID, intent, and parent equality.
7. The token is consumed before the existing CommandBus-backed insertion/reparent handler runs.
8. All completion paths clear transient state. Native `dragend` never implies commit.

## Additional root cause

Selecting a contenteditable Button and focusing its move handle blurred the Button. Inline blur unconditionally executed an identical `UpdateNodeCommand`, refreshing metadata and creating phantom history, dirty state, and autosave even when DnD itself did not commit. `buildInlineTextProps` now returns null for unchanged content.

## Regression evidence

- Pure commit predicate covers valid, cancelled, already-consumed, inactive, stale target, stale intent, payload mismatch, Builder chrome, and self/descendant cases.
- Pure inline patch coverage proves unchanged Button/Heading blur produces no patch while real edits preserve sibling props.
- Authenticated Chromium verifies Escape, Builder header, self, parent→descendant, and invalid Section→widget releases are clean structural no-ops.
- Valid cross-container and palette suites remain executable regressions.
