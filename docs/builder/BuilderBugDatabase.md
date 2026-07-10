# Builder Bug Database

Date: 2026-07-08  
Phase: BSP-9 update  
Status: Audit database with BSP-7 through BSP-9 partial fixes recorded

## BSP-7 Status Update

BSP-7 partially addresses BUG-0037, BUG-0031, BUG-0033, and related parent/child and save/reload roundtrip risks.

- BUG-0037 now has a production validation module and safe serialization helpers, but API route enforcement remains pending because BSP-7 did not allow production route changes.
- BUG-0031 now has bounded CommandBus history through `HistoryManager`.
- BUG-0033 now has explicit CommandBus transaction support so batched commands can undo/redo atomically.
- Parent/child consistency, orphan detection, cycle detection, invalid relationship detection, and serialization-safe value validation now exist as reusable contracts.

Release gate remains failed until these fixes are wired through all required save/load paths, executable tests run, and responsive/inspector/parity gates are addressed.

## BSP-8 Status Update

BSP-8 partially addresses BUG-0002, BUG-0019, BUG-0007, and related responsive/property binding risks.

- BUG-0002 now has a shared responsive model for base, desktop, tablet, and mobile values.
- BUG-0019 now has canvas style resolution using the same responsive resolver as inspector updates.
- BUG-0007 now has property binding validation for registry-driven inspector controls.
- Unsupported registry property types are hidden instead of rendered as inert controls.
- Inspector Design and Advanced tabs now use the shared canvas device mode instead of private local breakpoint state.

Release gate remains failed until executable component/browser tests prove rendered inspector behavior and BSP-9 completes canvas/runtime/preview/publish parity.

## BSP-9 Status Update

BSP-9 partially addresses BUG-0025, BUG-0026, BUG-0039, and related responsive/style/theme parity risks.

- BUG-0039 now has shared render style, responsive, theme, widget, and parity contract helpers under `core/rendering`.
- Canvas and runtime now consume the same core style/container resolution helpers.
- BUG-0025 and BUG-0026 now have contract-level parity validation for preview/published render paths.
- Theme token, responsive style, missing asset, unsupported widget, and builder-only overlay leakage checks are covered by compile-safe parity specs.

Release gate remains failed until executable browser parity tests prove canvas, preview, and published output match in real rendered output.

Severity scale: Blocker, Critical, High, Medium, Low.  
Priority scale: P0, P1, P2, P3.  
Confirmation: BUG-0001 through BUG-0030 are confirmed known audit entries requested for BSP-1. BUG-0031 onward are additional audit findings from code inspection.

## Confirmed Known Bugs

### BUG-0001

Title: Color picker missing or insufficient in inspector  
Severity: High  
Category: Inspector  
Current Behaviour: Some color controls use a basic picker, while generic color schema fields fall back to text input.  
Expected Behaviour: Professional color picker with swatches, token support, alpha, recent colors, and validation.  
Likely Files: `inspector/components/ColorPicker.tsx`, `inspector/tabs/ContentTab.tsx`, `inspector/tabs/DesignTab.tsx`  
Priority: P1  
Regression Required: Yes  
AI Impact: High; AI-generated editable color bindings cannot be trusted.

### BUG-0002

Title: Responsive controls are incorrect  
Severity: Critical  
Category: Responsive  
Current Behaviour: Canvas device state and inspector device state are separate; controls are effectively universal or locally scoped.  
Expected Behaviour: Explicit Desktop, Tablet, and Mobile controls synchronized with canvas preview.  
Likely Files: `store/useCanvasStore.ts`, `inspector/tabs/DesignTab.tsx`, `inspector/tabs/AdvancedTab.tsx`, `inspector/tabs/InspectorControls.tsx`  
Priority: P0  
Regression Required: Yes  
AI Impact: Critical; AI layouts will not have reliable per-device editability.

### BUG-0003

Title: Widget library too basic  
Severity: High  
Category: Widget Registry  
Current Behaviour: Active block menu exposes a small primitive set.  
Expected Behaviour: Complete production widget library for common site sections and embedded content.  
Likely Files: `sidebar/panels/BlockMenu.tsx`, `widgets/*`, `marketplace/firstPartyElements.ts`  
Priority: P1  
Regression Required: Yes  
AI Impact: High; AI will overuse primitives or premium placeholders.

### BUG-0004

Title: Header and footer cannot be edited as normal Builder nodes  
Severity: Critical  
Category: Runtime / Editability  
Current Behaviour: Site layout header/footer can be rendered outside the editable page node tree.  
Expected Behaviour: Header/footer should be editable through Builder workflows or explicitly governed by site-level editing.  
Likely Files: `theme/SiteThemeFrame.tsx`, `theme/siteLayout.ts`, `runtime/PublishedPageRenderer.tsx`, `workspace/BuilderShell.tsx`  
Priority: P0  
Regression Required: Yes  
AI Impact: Critical; AI-generated pages need editable navigation and footer contracts.

### BUG-0005

Title: Motion system lacks real GSAP, Motion, Parallax, and Transition inspector execution  
Severity: High  
Category: Motion / Inspector  
Current Behaviour: Motion metadata and some CSS animations exist, but no complete GSAP/Motion/parallax/transition inspector behavior is proven.  
Expected Behaviour: Full motion inspector with supported engines, reduced-motion handling, canvas/runtime parity, and validation.  
Likely Files: `inspector/tabs/AdvancedTab.tsx`, `canvas/NodeRenderer.tsx`, `runtime/PublishedPageRenderer.tsx`  
Priority: P1  
Regression Required: Yes  
AI Impact: High; AI motion metadata may produce misleading editability.

### BUG-0006

Title: Unit picker missing  
Severity: High  
Category: Inspector  
Current Behaviour: Numeric controls default to px or fixed hints; text inputs accept arbitrary units without structured selection.  
Expected Behaviour: Unit picker for px, %, em, rem, vw, and vh.  
Likely Files: `inspector/tabs/InspectorControls.tsx`, `inspector/tabs/DesignTab.tsx`  
Priority: P1  
Regression Required: Yes  
AI Impact: High; AI cannot safely bind responsive sizing.

### BUG-0007

Title: Many inspector controls do nothing or only persist metadata  
Severity: Critical  
Category: Property Binding  
Current Behaviour: Some controls write props or advanced metadata that are partially or not visibly consumed.  
Expected Behaviour: Every inspector control must have verified canvas, preview, publish, and serialization behavior.  
Likely Files: `inspector/tabs/*`, `canvas/NodeRenderer.tsx`, `runtime/PublishedPageRenderer.tsx`  
Priority: P0  
Regression Required: Yes  
AI Impact: Critical; generated nodes could appear editable while edits do not render.

### BUG-0008

Title: Alignment controls use weak inputs and inconsistent semantics  
Severity: Medium  
Category: Inspector / Layout  
Current Behaviour: Alignment appears across segmented controls, selects, and raw values with direction-dependent behavior.  
Expected Behaviour: Visual alignment controls with clear row/column semantics and responsive state.  
Likely Files: `inspector/tabs/DesignTab.tsx`, `inspector/tabs/InspectorControls.tsx`  
Priority: P2  
Regression Required: Yes  
AI Impact: Medium; layout correction becomes unpredictable.

### BUG-0009

Title: Full Width and Boxed controls broken or incomplete  
Severity: High  
Category: Layout / Runtime Parity  
Current Behaviour: Width mode writes props and style values, but canvas/runtime/site chrome can interpret width differently.  
Expected Behaviour: Stable full/boxed behavior across canvas, preview, published runtime, and theme frame.  
Likely Files: `inspector/tabs/DesignTab.tsx`, `canvas/NodeRenderer.tsx`, `runtime/PublishedPageRenderer.tsx`, `theme/SiteThemeFrame.tsx`  
Priority: P1  
Regression Required: Yes  
AI Impact: High; AI section widths may publish differently than edited.

### BUG-0010

Title: Copy Style and Paste Style broken  
Severity: High  
Category: Clipboard  
Current Behaviour: Style copy/paste is exposed but depends on session state and incomplete workflow verification.  
Expected Behaviour: Reliable style clipboard with compatibility checks, visible state, and undo semantics.  
Likely Files: `core/commands/StyleCommands.ts`, `workspace/BuilderShell.tsx`, `canvas/ContextMenu.tsx`  
Priority: P1  
Regression Required: Yes  
AI Impact: Medium; style normalization for AI-generated sections is harder.

### BUG-0011

Title: Copy and Paste node missing or incomplete  
Severity: High  
Category: Clipboard  
Current Behaviour: Some copy/paste node commands exist, but primary node copy/paste workflow is incomplete and not consistently visible.  
Expected Behaviour: Copy, paste, paste inside, duplicate, and keyboard shortcuts for nodes.  
Likely Files: `core/commands/ElementClipboardCommands.ts`, `workspace/BuilderShell.tsx`, `canvas/SelectionToolbar.tsx`  
Priority: P1  
Regression Required: Yes  
AI Impact: Medium; manual repair of AI layouts is slower.

### BUG-0012

Title: Embed, CSS, and JS widgets missing  
Severity: High  
Category: Widget Registry  
Current Behaviour: No embed, CSS, or JS widgets are exposed in active widgets.  
Expected Behaviour: Safe Embed widget, scoped CSS widget, and governed JS widget with publishing policy.  
Likely Files: `widgets/*`, `sidebar/panels/BlockMenu.tsx`, `marketplace/firstPartyElements.ts`  
Priority: P1  
Regression Required: Yes  
AI Impact: High; AI cannot represent common website requirements safely.

### BUG-0013

Title: Fullscreen Builder missing  
Severity: Medium  
Category: Workspace UX  
Current Behaviour: Builder runs in fixed app chrome without fullscreen authoring mode.  
Expected Behaviour: Fullscreen mode for focused editing and preview.  
Likely Files: `workspace/BuilderShell.tsx`, `workspace/BuilderHeader.tsx`  
Priority: P2  
Regression Required: Yes  
AI Impact: Low; mainly affects human review of AI output.

### BUG-0014

Title: Layers panel outdated  
Severity: High  
Category: Layers  
Current Behaviour: Active layers panel is a minimal inline component; legacy layer code also exists.  
Expected Behaviour: Modern navigator with icons, names, lock/visibility, search, hierarchy actions, and drag sorting.  
Likely Files: `sidebar/PanelContainer.tsx`, `sidebar/panels/LayersPanel.tsx`, `app/app/(builder)/.../sidebar/LayersPanel.tsx`  
Priority: P1  
Regression Required: Yes  
AI Impact: High; complex AI layouts need robust navigation.

### BUG-0015

Title: Layers not sortable  
Severity: High  
Category: Layers / Drag Drop  
Current Behaviour: Layers panel renders hierarchy but does not support sorting.  
Expected Behaviour: Drag-sort layers with valid reparent/reorder constraints.  
Likely Files: `sidebar/PanelContainer.tsx`, `core/commands/ReorderNodeCommand.ts`, `core/commands/ReparentNodeCommand.ts`  
Priority: P1  
Regression Required: Yes  
AI Impact: Medium; user repair of AI layouts is constrained.

### BUG-0016

Title: Theme Colors panel empty  
Severity: High  
Category: Theme  
Current Behaviour: Colors panel is a placeholder.  
Expected Behaviour: Theme color editor with tokens and live binding.  
Likely Files: `sidebar/PanelContainer.tsx`, `theme/defaultTheme.ts`, `theme/theme.types.ts`  
Priority: P1  
Regression Required: Yes  
AI Impact: High; AI tokenized color systems cannot be edited globally.

### BUG-0017

Title: Theme Settings empty  
Severity: High  
Category: Theme  
Current Behaviour: Settings panel is a placeholder.  
Expected Behaviour: Theme/site/page settings with typography, spacing, layout, and SEO controls.  
Likely Files: `sidebar/PanelContainer.tsx`, `theme/*`  
Priority: P1  
Regression Required: Yes  
AI Impact: High; AI-generated design systems lack owner-editable controls.

### BUG-0018

Title: Column widget structure choices incomplete  
Severity: Medium  
Category: Layout  
Current Behaviour: Column picker has presets but labels and expected presets do not fully match requested options.  
Expected Behaviour: Clear options for 2 columns, 3 columns, 30/70, 70/30, 25/75, 75/25, 33/33/33, 25/50/25, and similar.  
Likely Files: `layout/ColumnStructurePicker.tsx`, `workspace/BuilderShell.tsx`  
Priority: P2  
Regression Required: Yes  
AI Impact: Medium; generated layouts need human-adjustable structure.

### BUG-0019

Title: Responsive preview needs work  
Severity: Critical  
Category: Responsive / Preview  
Current Behaviour: Header changes canvas width; runtime uses media queries and published renderer logic.  
Expected Behaviour: Accurate responsive preview with parity to published runtime.  
Likely Files: `workspace/BuilderHeader.tsx`, `workspace/BuilderShell.tsx`, `canvas/NodeRenderer.tsx`, `runtime/PublishedPageRenderer.tsx`  
Priority: P0  
Regression Required: Yes  
AI Impact: Critical; AI output cannot be approved without responsive trust.

### BUG-0020

Title: Toolbar UX needs review  
Severity: Medium  
Category: UX  
Current Behaviour: Header, selection toolbar, context menu, and sidebar provide overlapping actions.  
Expected Behaviour: Audited toolbar IA, discoverability, keyboard support, and disabled states.  
Likely Files: `workspace/BuilderHeader.tsx`, `canvas/SelectionToolbar.tsx`, `canvas/ContextMenu.tsx`  
Priority: P2  
Regression Required: Yes  
AI Impact: Medium; repair workflows become slower.

### BUG-0021

Title: Selection UX needs review  
Severity: High  
Category: Selection  
Current Behaviour: Selection is mouse-first with basic state and incomplete multi-selection workflow.  
Expected Behaviour: Predictable selection, nested selection, breadcrumbs, keyboard navigation, and multi-select operations.  
Likely Files: `store/useSelectionStore.ts`, `canvas/SelectionOverlay.tsx`, `canvas/NodeRenderer.tsx`  
Priority: P1  
Regression Required: Yes  
AI Impact: High; generated nested layouts need precise selection.

### BUG-0022

Title: Inspector UX needs redesign  
Severity: High  
Category: Inspector  
Current Behaviour: Inspector has many generic controls and collapsible sections but weak prioritization.  
Expected Behaviour: Widget-aware, responsive-aware, token-aware inspector designed for repeated professional use.  
Likely Files: `inspector/InspectorPanel.tsx`, `inspector/tabs/*`  
Priority: P1  
Regression Required: Yes  
AI Impact: High; AI nodes need understandable editable surfaces.

### BUG-0023

Title: Builder shortcuts audit missing  
Severity: Medium  
Category: Keyboard  
Current Behaviour: No complete shortcut registry or audit was found.  
Expected Behaviour: Documented and tested shortcuts for undo, redo, copy, paste, delete, duplicate, navigation, and preview.  
Likely Files: `workspace/BuilderShell.tsx`, `workspace/BuilderHeader.tsx`  
Priority: P2  
Regression Required: Yes  
AI Impact: Medium; repair velocity suffers.

### BUG-0024

Title: Performance audit missing  
Severity: High  
Category: Performance  
Current Behaviour: Full blueprint clones and unbounded history are used without stress thresholds.  
Expected Behaviour: Measured performance budgets for node count, nesting, drag, selection, save, preview, and history.  
Likely Files: `core/commands/CommandBus.ts`, `canvas/NodeRenderer.tsx`, `runtime/PublishedPageRenderer.tsx`  
Priority: P1  
Regression Required: Yes  
AI Impact: High; AI can create larger pages than manual users.

### BUG-0025

Title: Serialization audit missing  
Severity: Critical  
Category: Serialization  
Current Behaviour: Save endpoint accepts arbitrary object payload with minimal validation.  
Expected Behaviour: Versioned schema validation, migration, compatibility checks, and round-trip tests.  
Likely Files: `app/api/builder-v2/blueprints/[pageId]/route.ts`, `types/blueprint.ts`, `runtime/isBuilderV2Blueprint.ts`  
Priority: P0  
Regression Required: Yes  
AI Impact: Critical; AI nodes must not corrupt persisted pages.

### BUG-0026

Title: Publish parity audit missing  
Severity: Critical  
Category: Publish  
Current Behaviour: Runtime renderer duplicates canvas logic and has separate layout decisions.  
Expected Behaviour: Canvas, preview, and published output parity with automated checks.  
Likely Files: `runtime/PublishedPageRenderer.tsx`, `app/(runtime)/[...slug]/page.tsx`, `canvas/NodeRenderer.tsx`  
Priority: P0  
Regression Required: Yes  
AI Impact: Critical; AI output must publish as reviewed.

### BUG-0027

Title: Preview parity audit missing  
Severity: Critical  
Category: Preview  
Current Behaviour: Preview has Builder v2 and legacy branches with layout normalization differences.  
Expected Behaviour: Preview must match canvas and publish for the same blueprint.  
Likely Files: `app/preview/[siteSlug]/[pageSlugWithId]/page.tsx`, `runtime/PublishedPageRenderer.tsx`, `canvas/NodeRenderer.tsx`  
Priority: P0  
Regression Required: Yes  
AI Impact: Critical; approval loop depends on preview accuracy.

### BUG-0028

Title: Builder accessibility audit missing  
Severity: High  
Category: Accessibility  
Current Behaviour: Accessibility fields exist but no complete authoring/accessibility audit is documented.  
Expected Behaviour: WCAG-aware Builder chrome and generated page controls.  
Likely Files: `inspector/tabs/AdvancedTab.tsx`, `canvas/*`, `workspace/*`  
Priority: P1  
Regression Required: Yes  
AI Impact: High; AI generation must not create inaccessible pages.

### BUG-0029

Title: Keyboard navigation audit missing  
Severity: High  
Category: Accessibility / Keyboard  
Current Behaviour: Builder is primarily mouse-driven.  
Expected Behaviour: Keyboard access for canvas selection, layers, inspector, toolbar, drag alternatives, and modals.  
Likely Files: `workspace/BuilderShell.tsx`, `canvas/*`, `sidebar/*`, `inspector/*`  
Priority: P1  
Regression Required: Yes  
AI Impact: Medium; manual repair and compliance are weakened.

### BUG-0030

Title: Mobile Builder audit missing  
Severity: Medium  
Category: Mobile Builder  
Current Behaviour: Builder chrome is desktop-oriented.  
Expected Behaviour: Defined policy for mobile authoring or explicit unsupported state with responsive preview intact.  
Likely Files: `workspace/BuilderShell.tsx`, `workspace/BuilderHeader.tsx`, `app/app/(builder)/.../builder-ui.css`  
Priority: P2  
Regression Required: Yes  
AI Impact: Low; mainly affects authoring device support.

## Additional Bugs Discovered

### BUG-0031

Title: CommandBus history is unbounded  
Severity: High  
Category: History / Performance  
Current Behaviour: CommandBus pushes full blueprint snapshots without enforcing a limit.  
Expected Behaviour: Bounded history with memory budget and pruning.  
Likely Files: `core/commands/CommandBus.ts`, `core/history/HistoryManager.ts`  
Priority: P1  
Regression Required: Yes  
AI Impact: High; large AI pages can exhaust memory during editing.

### BUG-0032

Title: HistoryManager is a stub  
Severity: Medium  
Category: History  
Current Behaviour: `HistoryManager` only declares `maxHistory = 100`.  
Expected Behaviour: Centralized history management used by CommandBus.  
Likely Files: `core/history/HistoryManager.ts`, `core/commands/CommandBus.ts`  
Priority: P2  
Regression Required: Yes  
AI Impact: Medium; history behavior is not architecturally stable.

### BUG-0033

Title: Multi-command user actions create multiple undo steps  
Severity: High  
Category: History / Commands  
Current Behaviour: Adding a container with seeded column executes multiple commands.  
Expected Behaviour: Compound actions should be grouped into one undoable transaction.  
Likely Files: `workspace/BuilderShell.tsx`, `core/commands/CommandBus.ts`  
Priority: P1  
Regression Required: Yes  
AI Impact: High; AI repair operations will need atomic transactions.

### BUG-0034

Title: Save and publish callbacks in shell are no-ops  
Severity: Medium  
Category: Workspace  
Current Behaviour: `onSave` and `onPublish` exist as empty functions in `BuilderShell.tsx`.  
Expected Behaviour: Dead callbacks should be removed or wired through a single source of truth.  
Likely Files: `workspace/BuilderShell.tsx`, `workspace/BuilderHeader.tsx`  
Priority: P2  
Regression Required: Yes  
AI Impact: Low; creates maintenance risk.

### BUG-0035

Title: Drag/drop logic duplicated between canvas and shell  
Severity: High  
Category: Drag Drop  
Current Behaviour: Drop target calculations exist in both `BuilderCanvas.tsx` and `BuilderShell.tsx`.  
Expected Behaviour: One tested drop intent service.  
Likely Files: `canvas/BuilderCanvas.tsx`, `workspace/BuilderShell.tsx`  
Priority: P1  
Regression Required: Yes  
AI Impact: Medium; generated complex nesting increases drop edge cases.

### BUG-0036

Title: Drag state uses global window variables  
Severity: Medium  
Category: Drag Drop  
Current Behaviour: Drag identity and type are stored on `window.__builderDragId` and related globals.  
Expected Behaviour: Scoped drag state with cleanup guarantees.  
Likely Files: `canvas/NodeRenderer.tsx`, `sidebar/panels/BlockMenu.tsx`, `workspace/BuilderShell.tsx`  
Priority: P2  
Regression Required: Yes  
AI Impact: Medium; fragile repair flows on complex pages.

### BUG-0037

Title: Blueprint API lacks schema validation on save  
Severity: Critical  
Category: Serialization  
Current Behaviour: POST accepts any object and stores it as blueprint data.  
Expected Behaviour: Validate node map, root, parent/child links, style value types, schema version, and unknown node policy.  
Likely Files: `app/api/builder-v2/blueprints/[pageId]/route.ts`, `types/blueprint.ts`  
Priority: P0  
Regression Required: Yes  
AI Impact: Critical; AI output must be rejected before persistence if invalid.

### BUG-0038

Title: Blueprint schema version mismatch risk  
Severity: High  
Category: Serialization  
Current Behaviour: Save endpoint writes `schemaVersion: 1` for native Builder v2 blueprints.  
Expected Behaviour: Native Builder schema version should match documented runtime expectations and migrations.  
Likely Files: `app/api/builder-v2/blueprints/[pageId]/route.ts`, `types/blueprint.ts`  
Priority: P1  
Regression Required: Yes  
AI Impact: High; future AI migrations may be unsafe.

### BUG-0039

Title: Canvas and published renderers duplicate style resolution  
Severity: Critical  
Category: Runtime / Parity  
Current Behaviour: Canvas `NodeRenderer` and `PublishedPageRenderer` separately resolve styles, motion, tokens, widgets, and responsive values.  
Expected Behaviour: Shared render contract or parity tests proving equivalence.  
Likely Files: `canvas/NodeRenderer.tsx`, `runtime/PublishedPageRenderer.tsx`  
Priority: P0  
Regression Required: Yes  
AI Impact: Critical; generated page review can diverge from published output.

### BUG-0040

Title: Generic color widget properties render as text input  
Severity: Medium  
Category: Inspector  
Current Behaviour: `WidgetOptionField` handles `color` with the same text input fallback path.  
Expected Behaviour: `color` properties should render the color picker and token selector.  
Likely Files: `inspector/tabs/ContentTab.tsx`  
Priority: P2  
Regression Required: Yes  
AI Impact: Medium; widget-defined color bindings are weak.

### BUG-0041

Title: Theme colors and theme settings are placeholders in active sidebar  
Severity: High  
Category: Theme  
Current Behaviour: `ColorsPanel` and `PageSettingsPanel` render placeholder text.  
Expected Behaviour: Functional theme/page setting panels.  
Likely Files: `sidebar/PanelContainer.tsx`  
Priority: P1  
Regression Required: Yes  
AI Impact: High; AI-generated theme tokens are not user-editable.

### BUG-0042

Title: Premium widgets render as previews rather than full native editables  
Severity: High  
Category: Widgets / AI Compatibility  
Current Behaviour: Premium node types fall through to `PremiumWidgetPreview` for canvas/runtime rendering.  
Expected Behaviour: Premium widgets should expose native child/editing structure or explicit locked component policy.  
Likely Files: `widgets/premium/*`, `canvas/NodeRenderer.tsx`, `runtime/PublishedPageRenderer.tsx`  
Priority: P1  
Regression Required: Yes  
AI Impact: High; AI may create attractive but weakly editable pages.

BSP-15 Update: Improved. Production widget rendering now uses `ProductionWidgetView` through canvas/runtime fallback paths, and the scaffold backlog has been converted into registered native widget definitions. Follow-up QA is still required for structured repeaters, accessibility behavior, and executable widget parity.

### BUG-0043

Title: Accessibility fields are not comprehensively rendered  
Severity: High  
Category: Accessibility  
Current Behaviour: Some ARIA fields are read, but SEO/accessibility metadata has no full runtime policy.  
Expected Behaviour: Accessibility metadata should have validated runtime effects or be removed from authoring UI.  
Likely Files: `inspector/tabs/AdvancedTab.tsx`, `canvas/NodeRenderer.tsx`, `runtime/PublishedPageRenderer.tsx`  
Priority: P1  
Regression Required: Yes  
AI Impact: High; AI compliance claims would be unsafe.

### BUG-0044

Title: Custom CSS accepts raw declarations without safety model  
Severity: High  
Category: Inspector / Security  
Current Behaviour: Advanced custom CSS is parsed as inline declarations and applied.  
Expected Behaviour: Scoped, validated CSS model with publish and security policy.  
Likely Files: `inspector/tabs/AdvancedTab.tsx`, `canvas/NodeRenderer.tsx`, `runtime/PublishedPageRenderer.tsx`  
Priority: P1  
Regression Required: Yes  
AI Impact: High; generated CSS could break layout or accessibility.

### BUG-0045

Title: Autosave race conditions are untested  
Severity: High  
Category: Autosave  
Current Behaviour: Autosave, manual save, preview, publish, and page switching can all trigger save flows.  
Expected Behaviour: Save queue with cancellation/stale revision handling and regression tests.  
Likely Files: `workspace/BuilderHeader.tsx`, `store/useBuilderStore.ts`  
Priority: P1  
Regression Required: Yes  
AI Impact: Medium; generated edits must not be lost during review.

### BUG-0046

Title: Node names are not surfaced in active layers  
Severity: Medium  
Category: Layers  
Current Behaviour: Layers panel shows only node type.  
Expected Behaviour: Show user-editable names, widget icons, and meaningful labels.  
Likely Files: `sidebar/PanelContainer.tsx`, `types/blueprint.ts`  
Priority: P2  
Regression Required: Yes  
AI Impact: Medium; generated pages need understandable navigation.

### BUG-0047

Title: Keyboard shortcuts are not centralized  
Severity: Medium  
Category: Keyboard  
Current Behaviour: Undo/redo buttons exist, but no shortcut registry was found.  
Expected Behaviour: Central command shortcut registry with conflict handling.  
Likely Files: `workspace/BuilderShell.tsx`, `core/commands/*`  
Priority: P2  
Regression Required: Yes  
AI Impact: Medium; repair workflows are slower.

### BUG-0048

Title: Inline rich text editing can drop formatting  
Severity: Medium  
Category: Canvas / Text  
Current Behaviour: Text node inline blur writes `text` from `textContent`, while inspector WYSIWYG writes `html`.  
Expected Behaviour: Clear rich text editing policy preserving or intentionally stripping formatting.  
Likely Files: `canvas/NodeRenderer.tsx`, `inspector/tabs/ContentTab.tsx`  
Priority: P2  
Regression Required: Yes  
AI Impact: Medium; AI-generated rich copy may lose structure.

### BUG-0049

Title: Responsive scaling in canvas may hide true published sizing  
Severity: High  
Category: Responsive / Parity  
Current Behaviour: Canvas scales some numeric style values by device size; published runtime uses CSS/media behavior.  
Expected Behaviour: Canvas should reflect actual responsive CSS output or be explicitly marked as simulation.  
Likely Files: `canvas/NodeRenderer.tsx`, `runtime/PublishedPageRenderer.tsx`  
Priority: P1  
Regression Required: Yes  
AI Impact: High; AI mobile review can be misleading.

### BUG-0050

Title: Publish flow depends on unsaved dirty state and UI-local revision tracking  
Severity: Medium  
Category: Publish / Autosave  
Current Behaviour: Header saves before publishing when dirty, then opens publish modal.  
Expected Behaviour: Publish should use an explicit saved revision and block stale or failed saves.  
Likely Files: `workspace/BuilderHeader.tsx`, `components/PublishModal.tsx`, `app/api/builder-v2/blueprints/[pageId]/route.ts`  
Priority: P2  
Regression Required: Yes  
AI Impact: Medium; AI pages need reliable approval-to-publish flow.

## BSP-10 Fix Status

Date: 2026-07-08  
Status: Clipboard, layers sorting, and layout control fixes implemented with compile-safe regression specs.

| Bug | Title | BSP-10 Status | Notes |
| --- | --- | --- | --- |
| BUG-0010 | Copy Style / Paste Style broken | Addressed | Style clipboard now copies filtered compatible style fields, rejects incompatible style paste safely, validates the resulting blueprint, and runs through CommandBus. Browser regression still pending. |
| BUG-0011 | Copy / Paste node missing | Addressed | Node clipboard now copies selected node subtrees, generates duplicate-safe ids, validates compatible paste parents, validates resulting blueprints, and preserves CommandBus undo/redo semantics. Browser regression still pending. |
| BUG-0015 | Layers not sortable | Partially addressed | Sibling reorder command and minimal up/down Layers panel hook added. Full drag sorting UX remains a future enhancement. |
| BUG-0009 | Full Width / Boxed controls broken | Addressed | Section/container width mode now writes concrete layout styles and responsive width updates use active-device responsive values. Browser visual proof still pending. |

Release gate interpretation: BSP-10 reduces manual editing blockers but does not pass the Builder release gate. Executable tests, browser-level QA, drag sorting UX, and remaining inspector/widget/accessibility work are still required.

## BSP-11 Fix Status

Date: 2026-07-08  
Status: Inspector UX controls implemented with compile-safe regression specs.

| Bug | Title | BSP-11 Status | Notes |
| --- | --- | --- | --- |
| BUG-0001 | Color picker missing | Addressed | Color controls now use a shared picker with hex input, visual native picker, palette swatches, clear/transparent support, and theme-token-ready metadata. Browser QA still pending. |
| BUG-0006 | Unit picker missing | Addressed | Unit input support added for `px`, `%`, `em`, `rem`, `vw`, and `vh`, with parsing, formatting, validation, and `px` fallback for unknown units. |
| BUG-0008 | Alignment controls use text boxes | Addressed | Alignment now has visual segmented/icon controls and widget-defined `alignment` properties render through the property renderer. |
| BUG-0007 | Inspector controls visible but do nothing | Improved | Implemented `alignment` rendering and preserved hidden/disabled handling for unsupported controls. Full executable component coverage remains pending. |

Release gate interpretation: BSP-11 improves Inspector readiness but does not pass the Builder release gate. Browser-level inspector QA, executable component tests, theme panels, header/footer policy, and remaining widget work are still required.

## BSP-12 Fix Status

Date: 2026-07-09  
Status: Theme panels, header/footer policy, and multi-column selector implemented with compile-safe regression specs.

| Bug | Title | BSP-12 Status | Notes |
| --- | --- | --- | --- |
| BUG-0016 | Theme Colors panel empty | Addressed | Colors panel now renders global color tokens and button color defaults from the existing theme token system. |
| BUG-0017 | Theme Settings empty | Addressed | Settings panel now renders fonts, spacing, radius, shadows, button defaults, and section/container default metadata. |
| BUG-0004 | Header/Footer cannot be edited | Policy scaffolded | Native editable global section policy added; opaque and AI-generated header/footer output remains blocked until native editability is implemented. |
| BUG-0018 | Column widget should ask layout | Addressed | Shared presets now include 1 column, equal layouts, ratio layouts, and sidebar/content variants; native column application remains CommandBus-backed. |

Release gate interpretation: BSP-12 improves theme/global-section readiness but does not pass the Builder release gate. Native editable header/footer structures, executable tests, theme-token inspector picker UI, and browser QA remain required.

## BSP-13 Fix Status

Date: 2026-07-09  
Status: Widget capability audit and scaffold modernization implemented with compile-safe regression specs.

| Bug | Title | BSP-13 Status | Notes |
| --- | --- | --- | --- |
| BUG-0003 | Widget library too basic | Improved | BSP-15 registered the production widget catalog as native editable Builder widgets with capability/readiness metadata. |
| BUG-0012 | Embed, CSS, and JS widgets missing | Partially improved / gated | `codeBlock` is a safe native text-display widget. `embed` is restricted metadata only; unsafe JS and opaque HTML execution remain disabled. |
| BUG-0042 | Premium widgets render as previews rather than full native editables | Classified | Premium widgets are audited and blocked for AI readiness until native editability or explicit locked-component policy exists. |

Release gate interpretation: BSP-13 improves widget governance and AI compatibility planning but does not pass the Builder release gate. Real native implementations, browser tests, runtime parity, accessibility, and publish review remain required.
