# Builder Bug Triage

Date: 2026-07-08  
Program: Builder Stabilization Program  
Phase: BSP-2  
Status: Classification only, no fixes applied

## Triage Rules

- Wave 1 fixes structural release blockers before UX expansion.
- Wave 2 restores expected manual editing basics.
- Wave 3 improves inspector correctness and usability.
- Wave 4 expands widget/layout capability after the core contract is stable.
- Wave 5 adds advanced motion and premium authoring UX.
- Wave 6 remains gated until Builder foundations pass release criteria.

## Complete Bug Classification

| Bug | Severity | Fix Wave | Dependency | Likely Files | Regression | AI Impact | Release Gate | Recommendation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| BUG-0001 | High | Wave 3 | BUG-0007, BUG-0016 | `inspector/components/ColorPicker.tsx`, `inspector/tabs/ContentTab.tsx`, `inspector/tabs/DesignTab.tsx` | Yes | High | Inspector stable | Now after binding proof |
| BUG-0002 | Critical | Wave 1 | BUG-0019, BUG-0049 | `store/useCanvasStore.ts`, `inspector/tabs/DesignTab.tsx`, `inspector/tabs/AdvancedTab.tsx`, `inspector/tabs/InspectorControls.tsx` | Yes | Critical | Responsive stable | Now |
| BUG-0003 | High | Wave 4 | BUG-0037, BUG-0042 | `sidebar/panels/BlockMenu.tsx`, `widgets/*`, `marketplace/firstPartyElements.ts` | Yes | High | AI Compatibility 90+ | Later |
| BUG-0004 | Critical | Wave 2 | BUG-0039, BUG-0026 | `theme/SiteThemeFrame.tsx`, `theme/siteLayout.ts`, `runtime/PublishedPageRenderer.tsx`, `workspace/BuilderShell.tsx` | Yes | Critical | No critical bugs | Now after parity baseline |
| BUG-0005 | High | Wave 5 | BUG-0039, BUG-0043, BUG-0044 | `inspector/tabs/AdvancedTab.tsx`, `canvas/NodeRenderer.tsx`, `runtime/PublishedPageRenderer.tsx` | Yes | High | AI Compatibility 90+ | Defer |
| BUG-0006 | High | Wave 3 | BUG-0002, BUG-0007 | `inspector/tabs/InspectorControls.tsx`, `inspector/tabs/DesignTab.tsx` | Yes | High | Inspector stable | Now after responsive architecture |
| BUG-0007 | Critical | Wave 1 | BUG-0039, BUG-0037 | `inspector/tabs/*`, `canvas/NodeRenderer.tsx`, `runtime/PublishedPageRenderer.tsx` | Yes | Critical | Inspector stable | Now |
| BUG-0008 | Medium | Wave 3 | BUG-0002, BUG-0007 | `inspector/tabs/DesignTab.tsx`, `inspector/tabs/InspectorControls.tsx` | Yes | Medium | Inspector stable | Now after unit picker |
| BUG-0009 | High | Wave 2 | BUG-0039, BUG-0002 | `inspector/tabs/DesignTab.tsx`, `canvas/NodeRenderer.tsx`, `runtime/PublishedPageRenderer.tsx`, `theme/SiteThemeFrame.tsx` | Yes | High | Canvas and responsive stable | Now after parity baseline |
| BUG-0010 | High | Wave 2 | BUG-0031, BUG-0033 | `core/commands/StyleCommands.ts`, `workspace/BuilderShell.tsx`, `canvas/ContextMenu.tsx` | Yes | Medium | History stable | Now |
| BUG-0011 | High | Wave 2 | BUG-0031, BUG-0033 | `core/commands/ElementClipboardCommands.ts`, `workspace/BuilderShell.tsx`, `canvas/SelectionToolbar.tsx` | Yes | Medium | History stable | Now |
| BUG-0012 | High | Wave 4 | BUG-0037, BUG-0044 | `widgets/*`, `sidebar/panels/BlockMenu.tsx`, `marketplace/firstPartyElements.ts` | Yes | High | AI Compatibility 90+ | Later |
| BUG-0013 | Medium | Wave 5 | BUG-0020 | `workspace/BuilderShell.tsx`, `workspace/BuilderHeader.tsx` | Yes | Low | Quality Score 90+ | Defer |
| BUG-0014 | High | Wave 5 | BUG-0015, BUG-0046 | `sidebar/PanelContainer.tsx`, `sidebar/panels/LayersPanel.tsx`, `app/app/(builder)/.../sidebar/LayersPanel.tsx` | Yes | High | Quality Score 90+ | Defer after sort |
| BUG-0015 | High | Wave 2 | BUG-0035, BUG-0036 | `sidebar/PanelContainer.tsx`, `core/commands/ReorderNodeCommand.ts`, `core/commands/ReparentNodeCommand.ts` | Yes | Medium | Manual quality | Now after command stability |
| BUG-0016 | High | Wave 3 | BUG-0037, BUG-0007 | `sidebar/PanelContainer.tsx`, `theme/defaultTheme.ts`, `theme/theme.types.ts` | Yes | High | Inspector stable | Now after binding proof |
| BUG-0017 | High | Wave 3 | BUG-0016, BUG-0037 | `sidebar/PanelContainer.tsx`, `theme/*` | Yes | High | Inspector stable | Now after theme colors |
| BUG-0018 | Medium | Wave 4 | BUG-0009, BUG-0002 | `layout/ColumnStructurePicker.tsx`, `workspace/BuilderShell.tsx` | Yes | Medium | Widgets / responsive | Later |
| BUG-0019 | Critical | Wave 1 | BUG-0039, BUG-0049 | `workspace/BuilderHeader.tsx`, `workspace/BuilderShell.tsx`, `canvas/NodeRenderer.tsx`, `runtime/PublishedPageRenderer.tsx` | Yes | Critical | Responsive stable | Now |
| BUG-0020 | Medium | Wave 5 | BUG-0021, BUG-0023 | `workspace/BuilderHeader.tsx`, `canvas/SelectionToolbar.tsx`, `canvas/ContextMenu.tsx` | Yes | Medium | Quality Score 90+ | Defer |
| BUG-0021 | High | Wave 2 | BUG-0029, BUG-0047 | `store/useSelectionStore.ts`, `canvas/SelectionOverlay.tsx`, `canvas/NodeRenderer.tsx` | Yes | High | Canvas stable | Now |
| BUG-0022 | High | Wave 3 | BUG-0007, BUG-0006, BUG-0016 | `inspector/InspectorPanel.tsx`, `inspector/tabs/*` | Yes | High | Inspector stable | Now after core controls |
| BUG-0023 | Medium | Wave 2 | BUG-0047 | `workspace/BuilderShell.tsx`, `workspace/BuilderHeader.tsx` | Yes | Medium | Accessibility/manual quality | Now after command map |
| BUG-0024 | High | Wave 1 | BUG-0031, BUG-0033 | `core/commands/CommandBus.ts`, `canvas/NodeRenderer.tsx`, `runtime/PublishedPageRenderer.tsx` | Yes | High | Performance / AI Compatibility | Now |
| BUG-0025 | Critical | Wave 1 | BUG-0037, BUG-0038 | `app/api/builder-v2/blueprints/[pageId]/route.ts`, `types/blueprint.ts`, `runtime/isBuilderV2Blueprint.ts` | Yes | Critical | Serialization stable | Now |
| BUG-0026 | Critical | Wave 1 | BUG-0039, BUG-0027 | `runtime/PublishedPageRenderer.tsx`, `app/(runtime)/[...slug]/page.tsx`, `canvas/NodeRenderer.tsx` | Yes | Critical | Publish stable | Now |
| BUG-0027 | Critical | Wave 1 | BUG-0039, BUG-0019 | `app/preview/[siteSlug]/[pageSlugWithId]/page.tsx`, `runtime/PublishedPageRenderer.tsx`, `canvas/NodeRenderer.tsx` | Yes | Critical | Preview stable | Now |
| BUG-0028 | High | Wave 2 | BUG-0043, BUG-0029 | `inspector/tabs/AdvancedTab.tsx`, `canvas/*`, `workspace/*` | Yes | High | Accessibility | Now after keyboard baseline |
| BUG-0029 | High | Wave 2 | BUG-0047, BUG-0021 | `workspace/BuilderShell.tsx`, `canvas/*`, `sidebar/*`, `inspector/*` | Yes | Medium | Accessibility | Now |
| BUG-0030 | Medium | Wave 5 | BUG-0019, BUG-0029 | `workspace/BuilderShell.tsx`, `workspace/BuilderHeader.tsx`, `app/app/(builder)/.../builder-ui.css` | Yes | Low | Quality Score 90+ | Defer |
| BUG-0031 | High | Wave 1 | None | `core/commands/CommandBus.ts`, `core/history/HistoryManager.ts` | Yes | High | History stable | Now |
| BUG-0032 | Medium | Wave 1 | BUG-0031 | `core/history/HistoryManager.ts`, `core/commands/CommandBus.ts` | Yes | Medium | History stable | Now |
| BUG-0033 | High | Wave 1 | BUG-0031, BUG-0032 | `workspace/BuilderShell.tsx`, `core/commands/CommandBus.ts` | Yes | High | History stable | Now |
| BUG-0034 | Medium | Wave 2 | BUG-0045 | `workspace/BuilderShell.tsx`, `workspace/BuilderHeader.tsx` | Yes | Low | Manual quality | Safe defer if no callsite risk |
| BUG-0035 | High | Wave 2 | BUG-0031, BUG-0033 | `canvas/BuilderCanvas.tsx`, `workspace/BuilderShell.tsx` | Yes | Medium | Canvas stable | Now |
| BUG-0036 | Medium | Wave 2 | BUG-0035 | `canvas/NodeRenderer.tsx`, `sidebar/panels/BlockMenu.tsx`, `workspace/BuilderShell.tsx` | Yes | Medium | Canvas stable | Now after drop service |
| BUG-0037 | Critical | Wave 1 | None | `app/api/builder-v2/blueprints/[pageId]/route.ts`, `types/blueprint.ts` | Yes | Critical | Serialization stable | Now |
| BUG-0038 | High | Wave 1 | BUG-0037 | `app/api/builder-v2/blueprints/[pageId]/route.ts`, `types/blueprint.ts` | Yes | High | Serialization stable | Now |
| BUG-0039 | Critical | Wave 1 | BUG-0037 | `canvas/NodeRenderer.tsx`, `runtime/PublishedPageRenderer.tsx` | Yes | Critical | Canvas/preview/publish stable | Now |
| BUG-0040 | Medium | Wave 3 | BUG-0001, BUG-0007 | `inspector/tabs/ContentTab.tsx` | Yes | Medium | Inspector stable | Now after color picker |
| BUG-0041 | High | Wave 3 | BUG-0016, BUG-0017 | `sidebar/PanelContainer.tsx` | Yes | High | Inspector stable | Now |
| BUG-0042 | High | Wave 4 | BUG-0039, BUG-0007 | `widgets/premium/*`, `canvas/NodeRenderer.tsx`, `runtime/PublishedPageRenderer.tsx` | Yes | High | AI Compatibility 90+ | Later |
| BUG-0043 | High | Wave 2 | BUG-0007, BUG-0028 | `inspector/tabs/AdvancedTab.tsx`, `canvas/NodeRenderer.tsx`, `runtime/PublishedPageRenderer.tsx` | Yes | High | Accessibility | Now |
| BUG-0044 | High | Wave 1 | BUG-0037, BUG-0007 | `inspector/tabs/AdvancedTab.tsx`, `canvas/NodeRenderer.tsx`, `runtime/PublishedPageRenderer.tsx` | Yes | High | Serialization/security | Now |
| BUG-0045 | High | Wave 2 | BUG-0037, BUG-0033 | `workspace/BuilderHeader.tsx`, `store/useBuilderStore.ts` | Yes | Medium | Publish/save stability | Now |
| BUG-0046 | Medium | Wave 2 | BUG-0015 | `sidebar/PanelContainer.tsx`, `types/blueprint.ts` | Yes | Medium | Manual quality | Now after sortable layers |
| BUG-0047 | Medium | Wave 2 | BUG-0033 | `workspace/BuilderShell.tsx`, `core/commands/*` | Yes | Medium | Keyboard/manual quality | Now |
| BUG-0048 | Medium | Wave 3 | BUG-0007 | `canvas/NodeRenderer.tsx`, `inspector/tabs/ContentTab.tsx` | Yes | Medium | Inspector/canvas stable | Defer until binding proof |
| BUG-0049 | High | Wave 1 | BUG-0002, BUG-0039 | `canvas/NodeRenderer.tsx`, `runtime/PublishedPageRenderer.tsx` | Yes | High | Responsive/parity | Now |
| BUG-0050 | Medium | Wave 2 | BUG-0045, BUG-0037 | `workspace/BuilderHeader.tsx`, `components/PublishModal.tsx`, `app/api/builder-v2/blueprints/[pageId]/route.ts` | Yes | Medium | Publish stable | Now after save queue |

## Top 10 Bugs To Fix First

1. BUG-0037: Blueprint API lacks schema validation on save.
2. BUG-0025: Serialization audit missing.
3. BUG-0039: Canvas and published renderers duplicate style resolution.
4. BUG-0002: Responsive controls are incorrect.
5. BUG-0019: Responsive preview needs work.
6. BUG-0007: Many inspector controls do nothing or only persist metadata.
7. BUG-0031: CommandBus history is unbounded.
8. BUG-0033: Multi-command user actions create multiple undo steps.
9. BUG-0026: Publish parity audit missing.
10. BUG-0027: Preview parity audit missing.

## Bugs Blocking AI Generation

BUG-0002, BUG-0003, BUG-0004, BUG-0005, BUG-0007, BUG-0009, BUG-0012, BUG-0016, BUG-0017, BUG-0019, BUG-0022, BUG-0024, BUG-0025, BUG-0026, BUG-0027, BUG-0028, BUG-0031, BUG-0033, BUG-0037, BUG-0038, BUG-0039, BUG-0041, BUG-0042, BUG-0043, BUG-0044, BUG-0049.

## Bugs Blocking Manual Builder Quality

BUG-0001, BUG-0002, BUG-0004, BUG-0006, BUG-0007, BUG-0008, BUG-0009, BUG-0010, BUG-0011, BUG-0014, BUG-0015, BUG-0016, BUG-0017, BUG-0019, BUG-0020, BUG-0021, BUG-0022, BUG-0023, BUG-0028, BUG-0029, BUG-0031, BUG-0033, BUG-0035, BUG-0036, BUG-0040, BUG-0041, BUG-0045, BUG-0046, BUG-0047, BUG-0048, BUG-0050.

## Product Enhancements, Not Defects

BUG-0003, BUG-0005, BUG-0012, BUG-0013, BUG-0018, BUG-0020, BUG-0022, BUG-0023, BUG-0030, BUG-0042, BUG-0047.

## Bugs Requiring Architecture Work

BUG-0002, BUG-0004, BUG-0007, BUG-0019, BUG-0024, BUG-0025, BUG-0026, BUG-0027, BUG-0031, BUG-0032, BUG-0033, BUG-0035, BUG-0037, BUG-0038, BUG-0039, BUG-0044, BUG-0045, BUG-0049, BUG-0050.

## Bugs Safe To Defer

BUG-0003, BUG-0005, BUG-0012, BUG-0013, BUG-0018, BUG-0020, BUG-0030, BUG-0034, BUG-0042, BUG-0048.

## Release Gate Summary

Wave 1 must clear serialization, history, responsive architecture, inspector binding proof, and parity baseline. Wave 2 must restore the manual repair loop. Waves 3 through 5 improve quality and capability. Wave 6 remains blocked until all prior waves pass regression and quality thresholds.
