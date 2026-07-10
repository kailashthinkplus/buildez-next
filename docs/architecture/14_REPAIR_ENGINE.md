# Repair Engine

The Repair Engine converts critic failures into structural changes. It can replace a weak section variant, request a missing asset, adjust tokens, reorder sections, or reduce unsupported claims.

Repair plans must be typed, auditable, and bounded. They should include the cause, target section, proposed operation, expected score lift, and rollback path.

Cosmetic-only repair is insufficient when the section model is wrong.

## Implementation Guidance

Future Codex sessions should treat this document as architectural intent, then confirm current code before editing. Any behavior change must update the relevant module doc, specification, phase checklist, and changelog.

