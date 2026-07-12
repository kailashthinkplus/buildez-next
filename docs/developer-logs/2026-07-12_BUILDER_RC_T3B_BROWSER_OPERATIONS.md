# 2026-07-12 — Builder RC-T3B Browser Operations

Selected the existing authenticated production contracts as the disposable-page mechanism. Added a deterministic 14-node Builder fixture with two primary containers, nested content, vertical height, and horizontal width. Added create, reset, open, and cleanup helpers plus an executable reset journey. The journey passed 2/2 including authentication: it created a draft, seeded the Blueprint, duplicated a heading, reset through the save API, reloaded to the exact fixture, verified selection cleared, and soft-deleted the page in teardown. No customer-like page or direct database mutation was used.

RC-T3B is not yet complete; DnD, persistence, keyboard, zoom/responsive, golden journeys, repeatability, and operation visual baselines remain.

## RC-T3C follow-up

Added runtime parent/type metadata, stable palette/drop/save/viewport/zoom selectors, DnD and structural assertion helpers, and an isolated cross-container journey. The native drag now emits an `inside` intent and moves Button A from Container A to Container B while preserving selection. Persistence remains blocked: Save now does not complete within the Playwright deadline, so BRC-0014 was registered P1. Eight leaked disposable drafts from deadline-masked teardown were cleaned through the authenticated production delete API. RC-T3 remains failed and repeatability was not claimed.
