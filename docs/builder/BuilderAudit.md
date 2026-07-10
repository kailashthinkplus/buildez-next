# Builder Audit

Date: 2026-07-08  
Program: Builder Stabilization Program  
Phase: BSP-1  
Scope: Native Builder audit only

## Safety Boundary

BSP-1 is documentation-only. No Builder behavior, routes, stores, widgets, canvas logic, renderer logic, Website Engine modules, ai-v9 modules, feature flags, Mapper execution, CommandBus execution, or Builder node insertion was changed.

## Sources Inspected

- `docs/PROJECT_STATE.md`
- `apps/web-app/modules/builder-v2/workspace/BuilderShell.tsx`
- `apps/web-app/modules/builder-v2/workspace/BuilderHeader.tsx`
- `apps/web-app/modules/builder-v2/canvas/BuilderCanvas.tsx`
- `apps/web-app/modules/builder-v2/canvas/NodeRenderer.tsx`
- `apps/web-app/modules/builder-v2/store/*`
- `apps/web-app/modules/builder-v2/core/commands/*`
- `apps/web-app/modules/builder-v2/core/history/HistoryManager.ts`
- `apps/web-app/modules/builder-v2/inspector/*`
- `apps/web-app/modules/builder-v2/sidebar/*`
- `apps/web-app/modules/builder-v2/widgets/*`
- `apps/web-app/modules/builder-v2/marketplace/*`
- `apps/web-app/modules/builder-v2/runtime/PublishedPageRenderer.tsx`
- `apps/web-app/app/preview/[siteSlug]/[pageSlugWithId]/page.tsx`
- `apps/web-app/app/(runtime)/[...slug]/page.tsx`
- `apps/web-app/app/api/builder-v2/blueprints/[pageId]/route.ts`

## Executive Summary

The native Builder has a usable editing shell, basic drag/drop, registered primitive widgets, an inspector, save/autosave, preview, runtime rendering, and a CommandBus-based undo/redo model. It is not ready for AI-generated editable Builder nodes.

The main blocker is not one isolated bug. The system lacks a proven contract across canvas, inspector controls, serialization, preview, publish, runtime, and responsive behavior. Many inspector controls write values that are only partially consumed by canvas/runtime. Several advanced controls create metadata without a complete behavior layer. Layers, theme panels, clipboard, accessibility, keyboard operation, and performance controls are below the release bar required before AI can safely create editable nodes.

## Audit Coverage

### Canvas

Canvas rendering is handled by `BuilderCanvas.tsx` and `NodeRenderer.tsx`. It supports node rendering, selection, hover, inline text editing, basic empty states, drag start, drag/drop events, and per-device width simulation.

Risks:

- Canvas and runtime each implement their own render logic, increasing parity risk.
- Responsive behavior is partly simulated by scaling numeric values and partly by style object selection.
- Empty state and selection chrome can affect author perception but are not a stable editability contract.
- Background image overlays are injected by renderer heuristics rather than explicit node semantics.

### Viewport

Viewport device and zoom state live in `useCanvasStore.ts`. Header exposes desktop/tablet/mobile buttons and limited zoom choices.

Risks:

- Inspector device state is local to inspector tabs and is not synchronized with canvas device state.
- Fullscreen builder is not implemented.
- Fit-to-page calculation is sidebar-width dependent and not a formal viewport service.

### Selection

Selection state supports one selected node plus a `multiSelection` array in `useSelectionStore.ts`.

Risks:

- Multi-selection state exists but has no full workflow.
- Selection toolbar is not enough for complex generated layouts.
- Selection affordances need accessibility and keyboard audit.

### Hover

Hover state is stored separately and driven by mouse events in node rendering.

Risks:

- Hover overlays are mouse-first.
- Drag state suppresses hover by global body class and window variables.

### Drag, Drop, Resize

Drag/drop uses global `window.__builderDragId`, dataTransfer payloads, duplicated drop calculations, and custom events. Resize handles exist in files but no complete audited contract was found in the active shell.

Risks:

- Drop logic is duplicated in `BuilderCanvas.tsx` and `BuilderShell.tsx`.
- Global drag state is fragile.
- Resize is not release-ready as a primary Builder operation.

### History, Undo, Redo

CommandBus snapshots full blueprints with `structuredClone`. Undo/redo is functional at command granularity.

Risks:

- `HistoryManager.ts` is a stub.
- No history cap is enforced in `CommandBus`.
- Multi-command actions such as inserting a container then column are recorded as separate undo steps.
- Clipboard and style copy commands may pollute undo history because copy commands are executed through CommandBus.

### Clipboard

The shell exposes copy style, paste style, copy node, and paste node actions. State appears to depend on sessionStorage and local booleans.

Risks:

- Copy/paste node is not visible as a complete primary workflow.
- Copy/paste style has known broken behavior.
- Clipboard is not clearly serialized or scoped per page/site.

### Inspector

The inspector has Content, Style, and Advanced tabs with many controls. Some controls use appropriate components, but several still rely on raw text inputs for structured values.

Risks:

- Color property schema falls back to text input in generic widget options.
- Unit picker is absent.
- Responsive device editing is local to tabs and can disagree with canvas preview.
- Advanced motion/SEO/accessibility/custom CSS metadata is only partially consumed.
- Inspector needs redesign before AI-generated nodes expose large property sets.

### Responsive Controls

Responsive style values are stored as objects keyed by desktop/tablet/mobile. Canvas and runtime pick responsive values differently and also apply hardcoded mobile stacking rules.

Risks:

- Device controls are split between header viewport and inspector tab device state.
- Runtime uses media queries while canvas uses current device store.
- There is no regression matrix for per-device inspector edits.

### Property Binding

Property editing is direct mutation through `UpdateNodeCommand` patches. Widget registry properties exist but do not guarantee rendered behavior.

Risks:

- There is no binding validator proving that every inspector control maps to canvas, preview, and publish.
- Generic property renderer treats `color`, `image`, `url`, and `text` similarly in some paths.

### Widget Registry

WidgetRegistry supports registered primitive and premium definitions. Core widgets include page, section, container, column, heading, text, button, image, video, icon, divider, and spacer.

Risks:

- Active block menu exposes only a small subset.
- Embed, CSS, and JS widgets are absent.
- Premium widgets render through preview-style fallback components, not full editable native primitives.

### Layers Panel

Active layers UI is embedded in `PanelContainer.tsx`; another legacy layers panel exists under app route files.

Risks:

- Layers are basic, not sortable, not searchable, not lock/visibility aware enough, and not a reliable navigation tool for complex AI layouts.
- Parallel legacy/module layers implementations increase drift risk.

### CommandBus

CommandBus is simple and useful but not yet a durable editing transaction layer.

Risks:

- No transaction grouping.
- No command validation result.
- No bounded history.
- No telemetry or replay diagnostics.
- No stable AI-safe command contract should be assumed from current state.

### Store

Builder state uses Zustand and subscribes to CommandBus. Canvas, selection, hover, panel, and builder stores are separate.

Risks:

- Store state can diverge from CommandBus state.
- Dirty/revision tracking depends on emitted command snapshots.
- Clipboard exists in store but current shell also uses sessionStorage paths.

### Serialization

Blueprint save API stores arbitrary object payloads with minimal validation.

Risks:

- No schema migration or compatibility validation on POST.
- `schemaVersion` is set to `1` while runtime expects Builder v2 shape by type guard.
- History snapshots use JSON string comparison, which is expensive and ordering-sensitive.

### Autosave

Header implements dirty-state autosave with a 2 second delay and local auto-save preference.

Risks:

- Autosave is UI-local and not coordinated with CommandBus transactions.
- Save/preview/publish race conditions are not covered by tests.

### Preview, Publish, Runtime

Preview and runtime both use `PublishedPageRenderer` for Builder v2 blueprints. Legacy fallback still exists.

Risks:

- Published renderer duplicates large portions of canvas render behavior.
- Preview/public routing includes site layout decisions that can alter apparent parity.
- Header/footer/site chrome can exist outside editable page nodes.

### Performance

The Builder clones entire blueprints on command execution and emits full snapshots to all listeners.

Risks:

- Large generated pages can degrade with full blueprint cloning, full render recursion, and unbounded history.
- No stress limits are documented for node count, history depth, nested depth, or media-heavy pages.

### AI Compatibility

The native Builder is not ready for AI-generated editable nodes. AI must remain gated until the release gate is passed.

Primary blockers:

- Inspector binding confidence is below release threshold.
- Serialization validation is insufficient.
- Responsive parity is insufficient.
- Runtime/canvas parity is insufficient.
- Widget coverage is incomplete.
- Layers/navigation cannot handle complex generated pages.

## Audit Result

Status: Not ready for AI node generation.  
Release gate: Failed.  
Recommended next phase: BSP-2 should fix blockers in the native Builder only, starting with inspector binding, responsive controls, serialization validation, layers, clipboard/history, and preview/publish parity.
