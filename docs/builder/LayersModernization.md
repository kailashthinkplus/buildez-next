# Layers Modernization

Date: 2026-07-09  
Phase: BSP-14  
Status: Builder UX implemented; executable QA pending

## Scope

BSP-14 modernizes the Layers panel with a professional hierarchy while preserving CommandBus ordering.

## Supported

- Collapsible tree.
- Widget icons.
- Drag/reorder indicators.
- Hover states.
- Better spacing.
- Multi-select metadata.
- Keyboard navigation metadata.
- Search.
- Filter.
- Expand all.
- Collapse all.

## Ordering

Layer ordering continues to use `ReorderNodeCommand` through CommandBus. BSP-14 does not duplicate Builder store state or introduce a separate layer model.

## Remaining Work

- Browser-level keyboard navigation QA.
- Drag sorting UI beyond up/down controls.
- Large-tree performance QA.
- Multi-select execution behavior.
