# Builder RC Native DnD Determinism Baseline

## Production contract

Builder V2 uses custom browser HTML5 drag-and-drop. It does not use an external DnD library or pointer, mouse, or keyboard sensor package. Native `draggable`, `dragstart`, capture-phase `dragover`, `drop`, and `dragend` events form the contract; Chromium supplies its native movement activation behavior.

The supported selected-node handle is `data-testid="builder-node-drag-handle"`. Drag start writes the node ID/type into `DataTransfer` and emits `builder:start-drag`. `BuilderShell` resolves the live element stack with `elementsFromPoint`, excluding the dragged node and descendants. The capture handler calculates a vertical or horizontal lead against the live target rectangle. Its edge band is `max(12, min(28, span * 0.2))`: container center resolves `inside`, top/leading edge resolves `before`, and bottom/trailing edge resolves `after`. Grid containers resolve inside. Zoom and scroll need no separate arithmetic because hit testing and rectangles are viewport coordinates after transforms.

Read-only shell attributes expose the live contract: `data-dnd-active-id`, `data-dnd-over-id`, `data-dnd-intent`, and `data-dnd-valid`.

## Root causes and fixes

- The old test dragged editable node content rather than the real selected-node handle.
- Fixed Builder chrome could intercept the old `dragTo` point.
- Partially visible Container B caused release points outside the viewport.
- Edge auto-scroll could move the target under a stationary pointer until intent changed from inside to after.
- A `pointerup` cancellation listener cleared drag identity before native HTML5 completion and was removed; `drop`, `dragend`, explicit Builder end, and blur remain completion/cancel paths.
- Selection-toolbar geometry is synchronized through its requestAnimationFrame layout before mouse-down.
- The helper derives every point from live handle, target, and viewport boxes, advances production edge auto-scroll with native dragover movement, then enters Container B's real padding lane outside the 28px edge band before release.

## Evidence

The focused journey passed three consecutive no-retry runs. Each run observed Button A active, Container B over, `inside`, valid drop, one parent move, retained selection, dirty, successful production POST, saved, persisted API hierarchy, reload hierarchy, teardown, and zero leaked disposable pages.

The controlled failure regression observed saving, a routed HTTP 500, error without false saved state, unchanged server Blueprint, successful retry, persisted move, and reload preservation.
