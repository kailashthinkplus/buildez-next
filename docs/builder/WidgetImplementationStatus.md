# Widget Implementation Status

Date: 2026-07-09  
Phase: BSP-15

| Area | Status | Evidence |
| --- | --- | --- |
| Tier 1 production widgets | Implemented | Registered native definitions and production React view branches. |
| Tier 2 production widgets | Implemented with gated exceptions | Carousel, before/after, table, countdown, code block, blog/post/category lists implemented. Embed is restricted. Popup is metadata-only. |
| Inspector support | Implemented metadata | Content, design, advanced, responsive, theme, and motion metadata exist on production widgets. |
| Serialization | Implemented contract | Default nodes serialize as native Builder node shapes. |
| Canvas/runtime parity | Implemented baseline | Canvas and runtime use `ProductionWidgetView` for production widget rendering. |
| Clipboard | Supported by native node commands | Capability metadata marks widgets as clipboard-capable. |
| Undo/redo | Supported by CommandBus contracts | Capability metadata marks widgets as undo/redo-capable. |
| AI readiness | Explicit but gated | AI insertion remains disabled. Restricted embed and popup metadata remain gated. |
| Opaque HTML widgets | Blocked | Compile-safe specs assert no script/template payload in defaults. |

## Remaining Scaffold-Only Widgets

None in the BSP-15 production catalog.

## Remaining Gated Widgets

- `embed`: restricted metadata; no script or opaque HTML execution.
- `popupModal`: metadata only; no runtime modal execution.

## Remaining Risks

- Repeater-style inspector UX is still generic text/textarea based and should become structured in a later polish sprint.
- Accessibility behavior for tabs, carousel, table editing, and popup execution still needs executable/browser QA.
- Form submission, live countdown timers, external map providers, and carousel autoplay were intentionally not added.
