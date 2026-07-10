# Builder Roadmap

Date: 2026-07-09  
Program: Builder Stabilization Program  
Phase: BSP-16 finalized

## Completed BSP Scope

- BSP-1 Builder Audit.
- BSP-2 Builder Bug Database Classification & Fix Sprint Planning.
- BSP-3 Builder Regression Suite Foundation.
- BSP-4 Builder Stress Testing Foundation.
- BSP-5 AI Compatibility Audit & Contracts.
- BSP-6 Builder Quality Score & Release Gate Finalization.
- BSP-7 Serialization, Schema Validation, and History Transactions.
- BSP-8 Responsive Architecture and Inspector Binding Proof.
- BSP-9 Canvas, Runtime, Preview, and Publish Parity.
- BSP-10 Clipboard, Layers Sorting, and Layout Controls.
- BSP-11 Inspector UX Controls.
- BSP-12 Theme Panels, Header/Footer Policy, and Multi-Column Selector.
- BSP-13 Widget & Inspector Modernization.
- BSP-14 Motion, Premium Builder UX, Fullscreen Builder, and Layers Modernization.
- BSP-15 Production Widget Implementation & AI Widget Library.
- BSP-16 Builder QA Certification & Release Gate Approval.

## Current Gate Status

Release gate: conditional engineering gate; production gate failed.  
Overall Quality Score: 84/100.  
Strategic AI Compatibility Score: 62/100.  
BSP executable AI contract score: 18/100.

## Approved Next Work

Phase 40A is conditionally approved only as disabled, dry-run Native Builder Execution Engine work:

1. No live Builder mutations.
2. No AI node insertion.
3. No Mapper execution.
4. No feature flag enablement.
5. No production route changes.
6. Must add executable/browser QA before any live execution.

## Ordered Fix Sprint Roadmap

1. Phase 40A: disabled dry-run Native Builder Execution Engine.
2. QA-1: executable regression runner for Builder specs.
3. QA-2: browser coverage for canvas, inspector, responsive, preview, and publish parity.
4. QA-3: accessibility and keyboard certification.
5. QA-4: performance measurements for 100, 500, and 1000 node pages.
6. QA-5: AI user-edit preservation and rollback proof.
7. Release Gate Recheck: quality and AI readiness must reach 90+.

## Blocked Work

- AI Native Builder Execution.
- Mapper execution into Builder.
- AI node insertion.
- AI CommandBus writes.
- Preview Harness confidence claims before critical gates pass.
- Production rollout.
- Live Native Builder Execution writes.

## Inert-Only Work

Streaming Canvas UX and AI Node Actions may continue only as inert UI scaffolding. They must not execute Mapper, mutate Builder stores, insert nodes, call AI, change routes, change runtime rendering, or change feature flags.

## AI Enablement Milestone

AI node generation may be reconsidered only after:

- No blocker bugs remain.
- No critical gate bugs remain.
- Regression and stress suites pass.
- Manual QA passes.
- Quality Score is 90+.
- AI Compatibility is 90+.
- Release gate passes.
## BSP-17 — Native Builder Insertion Hardening

Status: Partially Complete

Completed

- Validation audit
- CommandBus audit
- Native insertion planner audit
- BlocksPanel stale selection fix
- BuilderShell insertion parity

Remaining

- Drag & Drop insertion
- Clipboard insertion
- Duplicate insertion
- Template insertion
- AI mapper insertion

Next Phase

BSP-18 — Unified Builder Insertion Pipeline
