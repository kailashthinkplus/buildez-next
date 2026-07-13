# RC7-BLOCKER-001

## Title

Native Drag Target Resolution

## Status

Open

Priority: P0

## Summary

Multiple Playwright failures originate from the same production drag target
resolution subsystem.

Affected production files:

- BuilderShell.tsx
- builderDrag.ts
- NodeRenderer.tsx

Primary symptoms:

- container resolves as section
- container resolves as widget
- expected "inside" becomes "after"
- drag target occasionally clears during move
- scroll targeting resolves parent instead of intended container

## Affected tests

- drag-insert.spec.ts
- golden-journeys.spec.ts
- persistence-matrix.spec.ts
- scroll-targeting.spec.ts

## Root Cause

Pending investigation.

Likely confined to native DnD hit testing:

- elementsFromPoint()
- findTargetNodeElement()
- computeDrop()

## Certification impact

RC-7 blocked until resolved.
