# Builder Stabilization Audit (Phase 1)

Date: 2026-06-24
Scope: BuildEZ visual builder systems (primary focus on apps/web-app/modules/builder-v2 and connected runtime/API/database layers)

This audit intentionally excludes new AI feature implementation. It evaluates current builder readiness for production-grade visual editing.

## Current Architecture

### Existing reusable systems (present)
- Widget Registry: `apps/web-app/modules/builder-v2/core/registry/WidgetRegistry.ts`
- Widget registration bootstrap: `apps/web-app/modules/builder-v2/widgets/registerWidgets.ts`
- Property Registry: `apps/web-app/modules/builder-v2/core/properties/PropertyRegistry.ts`
- Command Bus: `apps/web-app/modules/builder-v2/core/commands/CommandBus.ts`
- Command implementations: `apps/web-app/modules/builder-v2/core/commands/*.ts`
- Builder blueprint type system: `apps/web-app/modules/builder-v2/types/blueprint.ts`
- Media library UI/store/service: `apps/web-app/modules/builder-v2/media/**`
- Runtime engine: `apps/web-app/modules/builder/runtime/**`
- Prisma models for site/page/blueprint/history/media: `packages/db/prisma/schema.prisma`

### Architecture currently in use
- Builder route entry renders dynamic Builder V2 root:
  - `apps/web-app/app/app/(builder)/[siteSlug]/[pageSlugWithId]/BuilderRoot.tsx`
- Main builder shell and UX orchestration:
  - `apps/web-app/modules/builder-v2/workspace/BuilderShell.tsx`
  - `apps/web-app/modules/builder-v2/workspace/BuilderHeader.tsx`
- Canvas renderer path:
  - `apps/web-app/modules/builder-v2/canvas/BuilderCanvas.tsx`
  - `apps/web-app/modules/builder-v2/canvas/NodeRenderer.tsx`

### Structural observations
- There are duplicate runtime trees:
  - `modules/builder/runtime/**`
  - `apps/web-app/modules/builder/runtime/**`
- There are duplicate/stale builder artifacts in route-local and legacy folders:
  - `apps/web-app/app/app/(builder)/[siteSlug]/[pageSlugWithId]/sidebar/**`
  - `modules/_legacy/**`
  - `modules/builder/renderer/PageRenderer copy*.tsx`, `PageRenderer.backup`

## Current Widget Coverage

### Registered widgets (active)
From `apps/web-app/modules/builder-v2/widgets/registerWidgets.ts`:
- Layout: `page`, `section`, `container`, `column`
- Content/media: `heading`, `text`, `button`, `image`, `video`, `icon`, `divider`, `spacer`

### Widget rendering status
- Rendered in `apps/web-app/modules/builder-v2/canvas/NodeRenderer.tsx` with explicit switch cases for all currently registered types.
- Basic inline editing exists for text/heading/button content via `contentEditable` and update command execution.

### Coverage gaps
- No advanced form widgets in active registration despite `NodeType` allowing broader domain types.
- No global component/template extraction workflow.
- Widget extension API is not exposed beyond internal registration.

## Inspector Coverage

### Current tabs
- `Content`, `Design`, `Advanced` only:
  - `apps/web-app/modules/builder-v2/inspector/InspectorPanel.tsx`

### Implemented controls
- Content tab:
  - text/heading/button content, heading level, button URL
  - image upload + alt
  - video URL/poster/autoplay/controls/loop
  - font picker (`GoogleFontsPicker`)
  - file: `apps/web-app/modules/builder-v2/inspector/tabs/ContentTab.tsx`
- Design tab:
  - text/background color, typography, alignment
  - spacing, gap, radius, min-height, basic column direction prop
  - file: `apps/web-app/modules/builder-v2/inspector/tabs/DesignTab.tsx`
- Advanced tab:
  - class name, custom CSS, animation fields, spacing boxes
  - file: `apps/web-app/modules/builder-v2/inspector/tabs/AdvancedTab.tsx`

### Coverage gaps vs target parity
- Missing tabs: `Responsive`, `Motion` (as dedicated tab), `Visibility`, `Accessibility`, `SEO`.
- Layout/property depth is incomplete for parity (display/flex/grid/full positioning/overflow/z-index/transform variants not comprehensively exposed).
- Responsive editing controls are not inspector-first and not device-explicit for each property.

## Media Coverage

### Present
- Full-screen modal shell with tabbed sections (`library`, `upload`, `ai`):
  - `apps/web-app/modules/builder-v2/media/components/MediaLibraryModal.tsx`
- Upload path integrated with R2-backed route:
  - UI: `apps/web-app/modules/builder-v2/inspector/tabs/ContentTab.tsx`
  - API: `apps/web-app/app/api/builder-v2/assets/upload/route.ts`
- Asset persistence in Prisma `MediaAsset` model with rich fields (tags, prompt, dominantColor, blurhash, folder, favorite, usage count):
  - `packages/db/prisma/schema.prisma`

### Critical integration issues
- `useMedia` service calls non-existent endpoints:
  - `/api/media`, `/api/media/:id` are referenced in `apps/web-app/modules/builder-v2/media/services/media.service.ts`
  - No `apps/web-app/app/api/media/**` routes exist.
- Builder API client points to `/api/builder-v2/assets`, while service path points elsewhere.
- Media metadata operations (rename, move, replace, bulk actions, favorites workflow UI, folder management UI) are incomplete in current modal UX.

## Canvas Coverage

### Present
- Node rendering and selection:
  - `apps/web-app/modules/builder-v2/canvas/NodeRenderer.tsx`
  - `apps/web-app/modules/builder-v2/canvas/SelectionOverlay.tsx`
- Floating selection toolbar with smart top/bottom placement and off-screen horizontal clamping:
  - `apps/web-app/modules/builder-v2/canvas/SelectionToolbar.tsx`
- Drag ghost and drop indicator:
  - `apps/web-app/modules/builder-v2/canvas/DragGhost.tsx`
  - `apps/web-app/modules/builder-v2/canvas/DropZoneIndicator.tsx`
- Context menu and mini handles:
  - `apps/web-app/modules/builder-v2/canvas/ContextMenu.tsx`
  - `apps/web-app/modules/builder-v2/canvas/MiniHandles.tsx`

### Gaps vs required commercial behavior
- `DropZones.tsx` is a stub (`return null`).
- `ResizeHandles.tsx` is a stub (`return null`).
- `GuideOverlay.tsx` is a stub (`return null`).
- Hover overlay tracks no hover source (`hoveredNodeId` never set), so hover outlines are not functional as a real system.
- Current drag/drop uses native HTML5 drag events and custom events; it does not implement robust insertion bars across all layout modes (before/after/inside with precise parent detection in flex/grid/column contexts).

## Missing Features

1. Full inspector parity tabs and controls (Responsive, Visibility, Accessibility, SEO, richer Motion).
2. Production-grade drag/drop engine with insertion logic parity for flex/grid/columns and reliable auto-scroll.
3. Multi-selection and keyboard shortcut system for builder editing.
4. Dedicated responsive editing model with independent per-device authoring UX and explicit breakpoint tooling.
5. Full media management operations and unified endpoint contract.
6. Header action parity: publish pipeline integration and autosave state UX standards.
7. Builder isolation hardening (iframe-level isolation optional path is not implemented).
8. Draft/version rollback workflow integrated directly with builder operations.

## Known Bugs

1. Save endpoint mismatch in header:
   - Header posts to `/api/builder-v2/blueprints/${pageId}`
   - No corresponding route exists under `apps/web-app/app/api/builder-v2/blueprints/**`
   - Source: `apps/web-app/modules/builder-v2/workspace/BuilderHeader.tsx`
2. Unpublish route appears broken/inconsistent:
   - Uses undefined symbols (`ctx`, `verifyPermission`) and inconsistent schema fields (`published`)
   - Source: `apps/web-app/app/api/pages/[pageId]/unpublish/route.ts`
3. Header undo/redo availability flags are hardcoded (`canUndo = false`, `canRedo = false`) while buttons still invoke bus calls.
4. Builder shell has placeholder action handlers (`onSave`, `onPublish`) in root orchestration path.
5. Inspector Advanced tab contains type inconsistency (`BlueprintNode` referenced without import/type alignment), indicating incomplete refactor quality.
6. Multiple placeholder components return null, creating false sense of feature completeness.

## Performance Bottlenecks

1. CommandBus uses full `structuredClone` snapshots for every execute/undo/redo operation:
   - `apps/web-app/modules/builder-v2/core/commands/CommandBus.ts`
   - Cost grows with blueprint size.
2. Node renderer recursively renders from root and is not memoized by node slice; large trees risk broad rerendering:
   - `apps/web-app/modules/builder-v2/canvas/NodeRenderer.tsx`
3. Overlay systems use global style injection against selectors and global listeners (`mousemove`, `scroll`, drag events) that can increase runtime overhead at scale.
4. Runtime generation pathways are duplicated across folders, increasing maintenance and optimization fragmentation.

## Code Duplication

### Confirmed duplicate systems/files
1. Runtime engine duplicated:
   - `modules/builder/runtime/**`
   - `apps/web-app/modules/builder/runtime/**`
   - with file-level differences (for example `generateRuntimeHTML.ts`, `renderNodeToHtml.ts`).
2. Renderer copies/backups:
   - `modules/builder/renderer/PageRenderer copy.tsx`
   - `modules/builder/renderer/PageRenderer copy 2.tsx`
   - `modules/builder/renderer/PageRenderer.backup`
3. Legacy mirrors and old artifacts:
   - `modules/_legacy/**`
   - `apps/web-app/modules/_legacy/**`
4. Route-local stale sidebar files in builder route folder that are not canonical with active modules/builder-v2 implementation.

## Architecture Violations

1. Endpoint contract drift between UI and API layers:
   - Header save points to missing route.
   - Media service uses non-existent `/api/media` endpoints while other modules use `/api/builder-v2/assets`.
2. Parallel state systems with overlapping concern:
   - `useBuilderStore`, `useBlueprintStore`, and command bus snapshots all represent blueprint mutations in overlapping ways.
3. Duplicate runtime engine locations violate single canonical rendering/runtime source principle.
4. Builder layout injects external Tailwind CDN script in builder route layout, increasing global side-effect and isolation risk:
   - `apps/web-app/app/app/(builder)/[siteSlug]/[pageSlugWithId]/layout.tsx`
5. Partial/placeholder modules are present in production path (null-return components), creating architectural ambiguity.

## Technical Debt

### High severity
1. Unify API contracts for save/publish/media and remove dead endpoint paths.
2. Remove/retire duplicate runtime trees or designate one canonical runtime source.
3. Replace placeholder components (`DropZones`, `ResizeHandles`, `GuideOverlay`, `PublishModal`) with production implementations.
4. Fix broken publish/unpublish endpoint consistency and schema compatibility.

### Medium severity
1. Consolidate blueprint state ownership model (single canonical state + command/history integration).
2. Strengthen responsive model implementation (device + per-property override UX and persistence).
3. Expand inspector architecture into extensible tab modules with property registry-driven rendering for parity goals.
4. Add keyboard shortcut layer and multi-select state model.

### Low severity
1. Remove legacy/backup/copy files from active workspace tree.
2. Normalize naming/casing and route param consistency across builder files.
3. Tighten typing and linting in partially migrated modules.

## Audit Conclusion

Builder V2 has a usable base: registry-driven widgets, command pattern, blueprint model, media asset schema, and runtime generation pipeline exist. However, it is not yet production-ready at Elementor/Webflow/Framer parity due to incomplete interaction systems, endpoint mismatches, duplicate runtime architecture, and placeholder modules in active paths.

Phase 1 is complete with this report. No architecture rewrite is required to proceed, but stabilization must prioritize contract unification, removal of duplicate execution paths, and completion of currently stubbed editor capabilities before any AI-first expansion.