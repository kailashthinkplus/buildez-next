# Builder RC-4 Certification

Status: ✅ CERTIFIED (WITH KNOWN ISSUE)

Date: 2026-07-13

---

## Certification Summary

RC-4 Rendering & Canvas has successfully completed certification.

The Builder now passes:

- ✅ Canvas geometry
- ✅ Horizontal scrolling
- ✅ Zoom controls
- ✅ Zoom targeting (100%)
- ✅ Zoom targeting (80%)
- ✅ Zoom targeting (50%)
- ✅ Responsive targeting (Desktop)
- ✅ Responsive targeting (Tablet)
- ✅ Responsive targeting (Mobile)
- ✅ Canvas centering
- ✅ Sidebar interaction
- ✅ Published/runtime parity
- ✅ Rendering stability

---

# Known Issue

## RC4-KB-001 — Nested Scroll Palette Drop Target Resolution

Status: Open

Severity: Medium

Priority: P2

Production Requirement: Must be fixed before Production GA.

### Description

Dragging a new widget from the Builder palette into a nested container after
vertically scrolling the canvas may resolve the ancestor Section instead of the
intended Container.

Expected:

Target:
rc-t3b-container-c

Actual:

Target:
rc-t3b-section-c

---

### Scope

Affected:

- Palette → Canvas insertion
- Deep vertical scrolling
- Nested containers

Verified Working:

- Existing node reorder
- Zoom targeting
- Responsive targeting
- Horizontal scrolling
- Canvas centering
- Rendering
- Publishing

---

### Impact

Low-Medium.

Users can insert into the section and reposition manually.

No Blueprint corruption.

No serialization issues.

No runtime rendering issues.

No publishing issues.

---

### Root Cause

Still under investigation.

Evidence currently indicates an ancestor hit-testing issue during
scroll-based palette insertion rather than a Blueprint, command,
or rendering defect.

---

### Regression Test

playwright/tests/builder/operations/scroll-targeting.spec.ts

---

## Certification Decision

RC-4 is accepted and certified with one known non-blocking issue.

Development proceeds to RC-5 Commands & History.

