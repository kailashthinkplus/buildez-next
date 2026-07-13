# RC2-BLOCKER-001 — Drag & Drop Hit Testing

Status: OPEN
Priority: P0
Area: Builder RC-2 (Operations)

## Summary

A single hit-testing defect causes the Builder to resolve ancestor nodes instead of the intended drop target during drag-and-drop.

This is currently the only known blocker preventing full RC-2 certification.

---

## Symptoms

Observed across multiple Playwright suites:

- Scroll targeting
- Palette insertion
- Cross-container move
- Golden journeys
- Persistence
- Nested container targeting

Typical failures:

Expected:
    rc-t3b-container-c

Received:
    rc-t3b-section-c

Expected:
    rc-t3b-container-b

Received:
    rc-t3b-section-b

Expected:
    rc-t3b-container-nested

Received:
    rc-t3b-container-c

Expected:
    intent = inside

Received:
    intent = after

---

## Root Cause (Current Hypothesis)

The drag hit-testing engine is selecting an ancestor node before the intended container.

Likely investigation points:

- BuilderShell.tsx
  - findTargetNodeElement()
  - computeDrop()

Possible causes:

- elementsFromPoint() ordering
- ancestor preference
- nested container prioritization
- inside/before/after intent calculation
- pointer lane calculation

---

## Impact

This single defect causes failures in multiple browser tests but does NOT affect:

- CommandBus
- Undo / Redo
- Transactions
- Serialization
- Validation
- History
- Persistence logic

Those systems have already passed unit certification.

---

## Certification Status

RC-2: BLOCKED

All remaining browser failures are believed to stem from this single shared hit-testing issue rather than multiple independent defects.

Target for resolution:
Builder Stabilization RC-2 revisit.
