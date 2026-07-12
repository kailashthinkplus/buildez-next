# Builder RC Save and Persistence Baseline

## Architecture

- `useBuilderStore` owns the current Blueprint, dirty flag, and monotonically increasing in-memory revision.
- `CommandBus` mutations notify the store; accepted mutations replace the Blueprint, set dirty, increment revision, and update undo/redo availability.
- `BuilderHeader` owns the user-facing save lifecycle and posts to the authenticated production route `POST /api/builder-v2/blueprints/:pageId`.
- Autosave schedules the same canonical save function two seconds after a dirty revision. Manual save uses that function immediately.
- The route tenant-scopes the page, records Blueprint history when data changes, and upserts the Blueprint in a database transaction.

## Observable contract

The existing save-status button now exposes `data-save-state` with `clean`, `dirty`, `saving`, `saved`, or `error`. `saved` is assigned only after a successful production response; a failed response leaves the store dirty and exposes `error`.

## Save orchestration

Save input is read from `useBuilderStore.getState()` when persistence starts, rather than from a render closure. Concurrent manual/autosave calls share one in-flight promise. If a newer revision arrives during the request, the orchestration submits one serialized follow-up containing the latest Blueprint before it reports completion. `clearDirty(revision)` cannot clear a newer mutation.

## RC-T3D/RC-T3E evidence

The initial headed trace showed the test did not reach save: `locator.dragTo` exhausted the 45-second test timeout because fixed Builder chrome intercepted the drop target. The in-body `finally` then attempted deletion with no remaining deadline, masking the original error.

Cleanup was moved to a separate `afterEach` hook using a fresh authenticated API request context and its own 20-second timeout. Subsequent deliberately failing focused runs completed cleanup without masking the DnD assertion.

RC-T3E switched to the real selected-node move handle and an explicit, live-geometry native pointer sequence. Three consecutive focused runs reached the production POST, observed `saving` then `saved`, verified Button A exactly once under Container B through the authenticated GET route, reloaded, and verified the same UI/API hierarchy. A controlled HTTP 500 produced `error`, left persisted state unchanged, and a subsequent real retry succeeded. BRC-0014 is resolved.
