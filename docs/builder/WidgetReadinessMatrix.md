# Widget Readiness Matrix

Date: 2026-07-09  
Phase: BSP-15

| Widget Group | Status | Notes |
| --- | --- | --- |
| Core layout widgets | Baseline | Page, section, container, and column have capability metadata and native serialization requirements. |
| Core content widgets | Baseline | Heading, text, button, image, video, icon, divider, and spacer have inspector and serialization metadata. |
| Production widgets | Implemented | BSP-15 registered Tier 1 and Tier 2 production widgets as native editable Builder widgets. |
| Scaffold widgets | Cleared | The BSP-13 scaffold backlog has been converted into registered native widgets. |
| Embed/code | Restricted / gated | `codeBlock` renders safe text. `embed` stores restricted metadata and cannot execute unsafe JS or opaque HTML. |
| Popup | Metadata-only / gated | `popupModal` is registered for metadata only; runtime modal execution remains gated. |
| AI readiness | Explicit but disabled | Widget metadata declares future AI capabilities, but AI insertion remains disabled until Builder release gates pass. |

## Required Before Production-Ready

- Native editable data model.
- Inspector content/design/advanced/responsive support.
- Serialization and save/reload proof.
- Clipboard and undo/redo proof.
- Canvas/runtime/preview/publish parity proof.
- Accessibility and keyboard interaction proof.
- Theme token compatibility.
- AI compatibility after Builder release gates pass.

## BSP-15 Production Widget Coverage

- Tier 1: accordion/FAQ, tabs, testimonials, pricing, stats/counter, logo cloud, gallery/masonry, team, portfolio, timeline/process, CTA, feature grid, lead form, contact form, location map, and social links.
- Tier 2: carousel, before/after, table, countdown, code block, restricted embed, popup metadata, blog grid, post list, and category list.
- Remaining scaffold-only widgets: none in the BSP-15 catalog.
- Remaining gated widgets: `embed` and `popupModal`.
