# BuildEZ Builder Stabilization Audit — Phase 1

**Audit date:** 2026-06-24  
**Scope:** active Builder V2 route, `apps/web-app/modules/builder-v2`, connected builder APIs, persistence models, preview/publish paths, and the canonical runtime imports used by the web app. AI capability was inventoried only where it currently leaks into the builder experience; no AI work is proposed for stabilization.

## Executive Summary

The repository contains the right architectural primitives for a commercial visual editor: a normalized blueprint, widget and property registries, a command bus, undo/redo snapshots, media persistence, and a runtime engine. Those primitives are not yet connected into one reliable production path.

The current builder is **not ready for Phase 2 UX work without a short Phase 1 remediation pass**. The highest-risk issues are:

1. The builder's server route loads and passes a blueprint, but the client route ignores those props and re-fetches `GET /api/pages/:pageId`; that GET currently returns only site branding, not the page or blueprint.
2. Save exists at `POST /api/builder-v2/blueprints/:pageId`, but autosave is not wired, the dirty flag is never cleared after a manual save, and an unused persistence hook writes blueprint data to the wrong PATCH contract.
3. Publish UI is a null component, unpublish does not compile, and the publish pipeline resolves a snapshot but does not validate or compile the requested runtime artifacts.
4. The active canvas bypasses registered widget renderers and the property registry. It maintains a second hard-coded rendering/inspector path.
5. The full application type-check is blocked by syntax errors in included legacy and AI files. No builder tests were found.

**Readiness assessment:** foundational architecture present; production workflow broken; interaction maturity prototype-level.

## Audit Method

- Traced the active route from `app/app/(builder)/[siteSlug]/[pageSlugWithId]/page.tsx` through the route-local client entry and `modules/builder-v2/workspace`.
- Inspected all active Builder V2 subsystems and their import/usage relationships.
- Inspected connected page, blueprint, media, preview, publish, runtime, and Prisma paths.
- Compared active code against widget schemas and the Phase 2–10 requirements.
- Ran `pnpm exec tsc --noEmit --pretty false` from `apps/web-app`.
- Searched for tests, stubs, duplicate files, legacy source included by TypeScript, and parallel state/render paths.

The type-check stopped at parser errors in `modules/_legacy/modules.old/blueprint/*.ts` and `modules/builder/ai-v8/lib/reactGenerator.ts`, so it could not reach all semantic errors in active Builder V2 files.

## Current Architecture

### Active request and rendering flow

1. The server page authenticates the tenant, resolves the site/page, and creates a legacy-shaped blueprint when one does not exist:
   - `apps/web-app/app/app/(builder)/[siteSlug]/[pageSlugWithId]/page.tsx`
2. The route-local client entry registers widgets and dynamically loads the workspace root:
   - `apps/web-app/app/app/(builder)/[siteSlug]/[pageSlugWithId]/BuilderRoot.tsx`
3. `workspace/BuilderRoot.tsx` independently fetches `/api/pages/:pageId`, converts legacy trees to normalized V2, and initializes the builder.
4. `workspace/BuilderProvider.tsx` initializes `useBuilderStore`, which initializes the singleton `CommandBus` and subscribes to snapshots.
5. `BuilderShell.tsx` composes the header, sidebar, hard-coded canvas renderer, overlays, and hard-coded inspector.

### Reusable architecture already present

| System | Canonical active implementation | Status |
|---|---|---|
| Builder Blueprint | `modules/builder-v2/types/blueprint.ts` | Normalized `root` + node map; responsive value type exists |
| Widget Registry | `core/registry/WidgetRegistry.ts` | Registers 12 active widget definitions |
| Property Registry | `core/properties/PropertyRegistry.ts` | Populated during widget registration, but bypassed by active inspector |
| Command Bus | `core/commands/CommandBus.ts` | Active mutation and undo/redo owner |
| History | Command Bus snapshot arrays | Active but unbounded; separate history classes/stores are incomplete and unused |
| Media | `modules/builder-v2/media/**`, `/api/builder-v2/assets/**`, `MediaAsset` | Partial and contract-fragmented |
| Runtime | `apps/web-app/modules/builder/runtime/**` | Imported by active preview/publish/render routes |
| Persistence | `Blueprint`, `BlueprintHistory`, snapshots in Prisma | Models and manual save route exist |

### State ownership

- `useBuilderStore` + `CommandBus` are the active blueprint state path.
- `useBlueprintStore` is a second, unused store written for an array-shaped `nodes` model that conflicts with the active record-shaped blueprint.
- `useHistoryStore` has no working redo and is unused.
- `HistoryManager` only defines `maxHistory = 100` and is unused.
- There are two Canvas stores in different module roots plus an unused viewport store; device/zoom state is therefore not expressed as a single editor contract.

### Architecture documentation

`docs/BUILDER_V2_ARCHITECTURE.md`, `docs/BUILDER_V2_ROADMAP.md`, and `docs/COMMANDS.md` are zero-byte files. The code, not documentation, is currently the only source of truth.

## Current Widget Coverage

### Registered active widgets

| Category | Widgets |
|---|---|
| Layout | page, section, container, column |
| Basic | heading, text, button, divider |
| Media | image, video, icon |
| Utility | spacer |

The `NodeType` union additionally lists grid, form, hero, features, pricing, gallery, FAQ, CTA, footer, and custom, but these types are not registered as active widgets.

### Rendering coverage

- `canvas/NodeRenderer.tsx` has explicit output for all 12 registered types and a generic default.
- Inline editing exists for heading, text, and button via `contentEditable` and `UpdateNodeCommand`.
- Image and video output is basic; video props such as autoplay, controls, and loop are edited by the inspector but not honored by the renderer, which always renders `controls`.
- The icon inspector writes `props.char`, while the canvas reads `props.glyph`; edits do not appear.
- Widget definition renderers (`WidgetDefinition.render`) and `WidgetFrame` exist but are not used by the active canvas. This makes registry rendering metadata non-authoritative.
- Several widget compiler/AI files exist only for selected widgets, so widget contracts are inconsistent even before future runtime generation.

### Coverage gaps

- No forms, menus, galleries, carousels, maps, embeds, social, commerce, or dynamic-data widgets.
- No reusable components/symbols, global widgets, templates, or component instance model.
- No widget-level validation or compatibility rules for valid parents/children.
- No migration registry for evolving widget/blueprint schema versions.

## Inspector Coverage

### Active inspector

The active inspector is a hard-coded three-tab implementation:

- **Content:** text, heading level, button URL, direct image upload, alt text, video fields, icon character, font family.
- **Design:** colors, basic typography, alignment, uniform padding/margin/gap, radius, min-height, and column direction.
- **Advanced:** class name, custom CSS, basic animation fields, and four-side spacing UI.

### Critical inspector issues

1. The active inspector does not read `PropertyRegistry`; widget property schemas and inspector UI can drift independently.
2. `AdvancedTab` reads/writes presentation under `node.props.style`, while the blueprint contract and canvas use `node.style`. Advanced spacing therefore does not affect the active renderer.
3. `AdvancedTab` references an undefined `BlueprintNode` type.
4. Responsive widget properties exist in definitions, but the active controls write scalar values and have no active device override UX.
5. The content image upload omits required `siteId`, expects `{ url }`, and calls an API that requires multipart `siteId` and returns `{ ok, asset }`; this path is broken.
6. Widget property types include controls that `PropertyRenderer` does not comprehensively support, and `PropertyRenderer` is unused by the active panel.

### Missing target coverage

- Missing dedicated tabs: Responsive, Motion, Visibility, Accessibility, SEO.
- Missing comprehensive flex/grid controls, wrapping, alignment, overflow, position offsets, z-index, border details, shadows, transforms, states, units, and min/max sizing.
- Missing per-breakpoint indicators, reset/inherit controls, linked values, token/global-style binding, and validation.
- Missing semantic HTML, ARIA, keyboard/accessibility, link relationship, image metadata, and heading-order guidance.

## Media Coverage

### Present

- Prisma `MediaAsset` supports R2 URL, thumbnail, type, dimensions, alt/title/tags, source/provider/prompt, favorite, folder, dominant color, blurhash, usage count, and last-used time.
- `/api/builder-v2/assets/upload` validates image types and size, processes WebP plus thumbnail with Sharp, hashes files, uploads to R2, and persists the asset.
- List, search, create, and delete routes exist.
- A large modal shell offers Library, Upload, and AI tabs with search.

### Integration and security gaps

1. `media.service.uploadImage` uses `/api/uploads/image/init`, while the active builder asset upload route is `/api/builder-v2/assets/upload`; the media hook and inspector each follow a different upload contract.
2. `MediaLibrary.tsx`, `MediaPicker.tsx`, and inspector `ImageContent.tsx` are empty files. The modal is not integrated into the active content inspector.
3. List/create/delete APIs authenticate a user but do not verify that the requested `siteId` or asset belongs to that user's tenant/site. Delete fetches by asset ID alone. This is a cross-tenant authorization risk.
4. Duplicate detection uses globally unique `fileHash`; uploading the same file to another site can return an asset owned by the first site.
5. Deleting a database row does not delete the R2 object or thumbnail and does not check asset usage.
6. Rename, replace, metadata edits, folders, favorites UX, bulk operations, clipboard paste, multi-upload, video/icon/stock views, pagination/infinite scrolling, and recent/usage tracking are absent.

## Canvas Coverage

### Present

- Recursive normalized-node rendering.
- Click selection, CSS hover outlines, selection overlay, context menu, mini handles, and a floating toolbar.
- Native HTML drag events for reparenting.
- Drag ghost and a before/inside/after visual indicator.
- Zoom transform and desktop/tablet/mobile selector state.

### Interaction gaps and bugs

1. `DropZones`, `GuideOverlay`, and `ResizeHandles` are null stubs; a second selection overlay is also a null stub.
2. `HoverOverlay` owns local `hoveredNodeId` but never updates it. Hover visuals currently come only from CSS on every node, not a coordinated overlay.
3. Drop execution always reparents **inside** the hit node. The visual before/after classification is never passed to the command, so the indicator can promise an insertion that will not occur.
4. `DropZoneIndicator` subtracts the canvas top coordinate from `rect.left` (`x: rect.left - canvastartY`), causing horizontal coordinate drift.
5. Native HTML drag is attached only to section/container/column nodes. Content nodes cannot be moved from the canvas through the same path.
6. No cycle/descendant guard is visible before reparenting; invalid parentage depends on command behavior rather than drop validation.
7. No horizontal/grid-aware hit testing, insertion index computation, auto-scroll, precise element ghost, or drop animation.
8. Zoom is implemented with CSS transform but overlay coordinates use viewport rectangles/fixed positioning inconsistently; this invites scale drift.
9. Device switching changes header state but does not set an independent canvas width. Laptop exists in blueprint types but not in the active Canvas store/header.
10. Selection store contains `multiSelection`, but canvas click always replaces selection and no multi-selection operations are implemented.
11. No keyboard editing shortcut layer, spacing visualization, padding/gap/margin guides, snap guides, rulers, resize behavior, or orientation switching.

## Missing Features

### Stabilization prerequisites

- One reliable server-to-client blueprint load contract.
- One save/autosave contract with dirty/saving/saved/error state.
- Working publish modal and validated publish pipeline.
- Tenant-safe media authorization and one upload contract.
- A green type-check for active production code and a test boundary that excludes quarantined legacy code.
- Canonical use of widget/property registries by canvas and inspector.

### Commercial editor capabilities

- Navigator/layers integration with reorder, lock, visibility, rename, nesting, and search.
- Element toolbar parity: move handle, node copy/paste, visibility, lock, navigator, settings, and responsive visibility.
- Accurate DnD across vertical, horizontal, grid, and column layouts.
- Multi-select, resize, keyboard shortcuts, snap/spacing guides, and accessible focus handling.
- Fully responsive authoring with per-property overrides and canvas breakpoints.
- Global styles/tokens surfaced in every compatible inspector control.
- Draft recovery, version browsing, rollback, and collaboration-ready conflict/version semantics.
- Runtime validation/compilation, asset manifest, metadata/SEO generation, immutable publish output, and rollback.

## Known Bugs

### Critical

1. **Builder load contract is broken.** The server entry passes `pageId`, `siteId`, and `initialBlueprint` to a route-local `BuilderRoot` component that declares no props. The workspace root then fetches `GET /api/pages/:pageId`, but that handler returns only `{ success, site }`. The client consequently receives no blueprint and falls back to an empty page.
2. **Publish UI does nothing.** `components/PublishModal.tsx` returns null and accepts no props, while the header renders it with page/site props.
3. **Unpublish route is invalid.** It uses incompatible `apiHandler` parameters, undefined `ctx` and `verifyPermission`, and writes a nonexistent `published` field instead of the `Page.status` model.
4. **Application type-check cannot complete.** Parser failures in source included by `apps/web-app/tsconfig.json` prevent reliable build verification.
5. **Media authorization is insufficient.** Asset list/create/delete operations lack tenant/site ownership enforcement.

### High

6. Header undo/redo availability is hard-coded false while buttons are explicitly `disabled={false}`; users can click buttons whose visual state says unavailable.
7. Command Bus exposes no `canUndo`/`canRedo` subscription, and history is unbounded despite an unused `HistoryManager.maxHistory` field.
8. Manual save does not call `clearDirty`, so save state remains dirty forever.
9. Autosave manager exists but is unused. `useBuilderPersistence` is also unused and PATCHes blueprint data to an endpoint that only updates title/slug.
10. Image upload in Content tab sends the wrong request and parses the wrong response.
11. Advanced styles are saved in the wrong blueprint location and are not rendered.
12. Icon edits target `char`, rendering targets `glyph`.
13. Drop indicator coordinates and semantics do not match the actual move.

### Medium

14. Canvas video ignores inspector autoplay/loop/control values.
15. `Toast` and `CreatePageModal` are null stubs, so save feedback and page creation UI are invisible.
16. Page status in the header defaults to Draft until the page switcher is opened and pages are fetched.
17. The page ID is extracted by the final hyphen-delimited slug segment; CUID-style IDs containing hyphens or changed URL formats would be fragile.
18. Newly created server blueprints use legacy nested shape and schema version defaults to 1, while the client V2 metadata declares version 2.
19. Canvas styling always falls back to desktop-first values; selected device does not participate in style resolution.

## Performance Bottlenecks

1. Every command stores a full `structuredClone` of the blueprint, clones again before execution, and clones again for every emit. Memory and CPU scale with blueprint size × history depth.
2. Command history has no cap, transaction grouping, coalescing, or patch representation. Typing/slider changes can produce many full snapshots.
3. The recursive canvas renderer receives the whole blueprint; any command snapshot changes the root object and broadly rerenders the tree. No node-level selector/memoization boundary is present.
4. Selection toolbar recomputes layout on every captured `mousemove`, scroll, and resize without requestAnimationFrame throttling or a `ResizeObserver`.
5. Drop indicator listens globally to drag events and calls DOM queries/geometry reads during dragover.
6. Google font selection dynamically injects external stylesheets; no deduped font asset policy or loading budget is enforced across page content.
7. Media list is unpaginated and loads all assets for a site.
8. Tailwind CDN is loaded before interaction in the builder layout, adding network/runtime work and mutating the same document as editor UI.

## Code Duplication

1. Runtime trees exist in both `apps/web-app/modules/builder/runtime` and root `modules/builder/runtime` (18 files each), with many byte-identical files and some divergent ones.
2. Builder renderer copies/backups exist (`PageRenderer copy.tsx`, `PageRenderer copy 2.tsx`, `PageRenderer.backup`).
3. Widget registration is implemented twice: `widgets/registerWidgets.ts` and `core/registry/registerWidgets.ts`.
4. Builder providers exist in `core/BuilderProvider.tsx` and `workspace/BuilderProvider.tsx`; only the latter owns active initialization.
5. Canvas/core renderer stacks coexist: `canvas/**`, `core/renderer/**`, and widget SDK rendering.
6. Selection overlays/toolbars exist across `canvas`, `canvas/selection`, `core/renderer`, `selection`, and `toolbar` folders.
7. Active module and route-local sidebar/toolbars overlap.
8. `apps/web-app/modules/_legacy` contains 475 files and root `modules/_legacy` contains 459 files; the web app TypeScript include still compiles legacy sources.
9. Media components contain empty duplicate placeholders (`MediaLibrary`, `MediaPicker`, and inspector `ImageContent`).

## Architecture Violations

1. **Registry bypass:** active canvas switches on node types instead of rendering through `WidgetRegistry`; active inspector switches on node types instead of `PropertyRegistry`.
2. **Multiple state authorities:** active Command Bus state coexists with incompatible blueprint/history stores and duplicate canvas stores.
3. **Blueprint contract drift:** server bootstrap, database schemaVersion, legacy conversion, active V2 types, runtime resolver, and unused stores do not share one versioned schema/migration boundary.
4. **Endpoint ownership drift:** manual save, unused persistence hook, media hook, content upload, and server loading use inconsistent contracts.
5. **Canvas/editor coupling:** builder UI and website content share one document and global Tailwind runtime; CSS namespace rules are partial, and overlays query content DOM directly.
6. **Placeholder production modules:** header actions and active shell import null components and migration placeholders.
7. **Runtime duplication:** more than one physical runtime tree violates the requirement for a canonical runtime engine.
8. **Publish bypasses requested validation:** publish snapshots resolved content without validating the normalized blueprint or generating a complete runtime manifest/output.
9. **Authorization inconsistency:** blueprint save uses tenant-scoped `apiHandler`, while media routes perform only user authentication.
10. **Source hygiene:** legacy code and root-level duplicate modules remain inside active TypeScript/build scope.

## Technical Debt

### P0 — must complete before Phase 2 interaction work

1. Make the server-loaded blueprint the single initialization path, or make the page GET endpoint return the exact client contract; do not retain both.
2. Restore a green active-code type-check/build boundary and quarantine legacy trees from compilation.
3. Connect manual save and debounced autosave to the blueprint route; expose accurate dirty/saving/saved/error and undo/redo state.
4. Implement the existing publish modal contract, validate before snapshotting, and repair/unify unpublish.
5. Enforce tenant/site ownership on all media queries/mutations and unify upload around `/api/builder-v2/assets/upload`.
6. Choose and document canonical files for registry bootstrap, provider, canvas renderer, inspector renderer, state, and runtime.

### P1 — foundation for Phase 2 and Phase 3

1. Route active canvas rendering through widget definitions without creating another renderer.
2. Route active inspector fields through the Property Registry, adding category/tab adapters to the existing contract.
3. Add command metadata, bounded/coalesced history, and observable undo/redo availability.
4. Add blueprint validation and schema migration at load/save/publish boundaries.
5. Replace drag visual/execution divergence with one layout-aware drop calculation used by both indicator and command.
6. Establish overlay geometry in a single coordinate system that accounts for zoom and scroll.
7. Add focused unit tests for commands, blueprint validation/migration, responsive resolution, drop calculation, and persistence contracts.

### P2 — maintainability and scale

1. Remove or archive duplicate runtime/renderer/provider/registration files after imports are migrated.
2. Add integration tests for load → edit → undo/redo → autosave → preview → publish → rollback.
3. Add performance budgets for node count, command latency, rerender count, and media pagination.
4. Populate architecture, commands, widget, and API documentation from the canonical path.

## Recommended Stabilization Sequence

1. **Build boundary:** exclude/quarantine legacy parser failures and make active Builder V2 type-checkable.
2. **Load/save contract:** use one blueprint shape/version from server load through Command Bus and blueprint API.
3. **State/history contract:** expose dirty and undo/redo truth; wire bounded autosave.
4. **Registry contract:** connect existing widget and property registries to active canvas/inspector.
5. **Media security/contract:** tenant-scope APIs and integrate the existing modal/upload route.
6. **Publish contract:** validate, snapshot immutable data, compile through the canonical runtime, and support rollback/unpublish.
7. **Interaction baseline:** only then begin the Phase 2 toolbar and DnD overhaul.

## Phase 1 Exit Criteria

Phase 1 should be considered complete when this report is accepted and the following remediation gate is scheduled before Phase 2:

- Active builder can load an existing V2 blueprint and a migrated legacy blueprint.
- Edit, undo, redo, save, reload, and autosave preserve the same normalized data.
- Active production code type-checks and has smoke coverage.
- Media operations are tenant-safe and the inspector can select/upload an asset.
- Publish refuses invalid blueprints and produces a recoverable immutable version.
- Canonical implementation paths are documented; duplicate paths are marked for removal.

No implementation code was changed during this audit.
