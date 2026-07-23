# Builder 3 Dual Canvas Contract

## Decision

Builder 3 provides a canvas mode switch with two tabs:

- `Preview`
- `Edit`

Both tabs render the same canonical React/TypeScript project through the same isolated Vite preview runtime.

## Preview mode

- Shows the clean website output.
- Adds no selection outlines, handles, source metadata, or editing chrome inside the rendered document.
- Is the source for desktop, tablet, and mobile visual-certification screenshots.

## Edit mode

- Shows the identical website output.
- Adds a source-mapped interaction overlay for hover, selection, contextual prompts, and focused source patches.
- Treats visible DOM elements as editable canvas nodes without converting them into Builder 2 Blueprint nodes.
- Refreshes the same canonical project through Vite HMR after an approved patch.

## Invariants

- Switching tabs must not transform, recompile into Blueprint, or rewrite project source.
- Preview and Edit must have visual parity when editing overlays are ignored.
- If source mapping is unavailable, Edit mode must show the website and disable the affected editing action; it must never hide or replace the output.
- Builder 3 must not import Builder 2.
- AI V12 must not import AI V11.

## Acceptance evidence

Final approval requires matched Preview/Edit screenshots at desktop, tablet, and mobile, plus proof that an Edit-mode source patch updates Preview mode without unrelated visual drift.
