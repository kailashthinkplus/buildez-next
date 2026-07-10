# Learning Engine

The Learning Engine records generation traces, critic scores, repair outcomes, user edits, acceptance signals, and future analytics. It should improve ranking and defaults without hiding why decisions changed.

Learning must be privacy-aware and tenant-safe. It should aggregate patterns where possible and avoid leaking tenant-specific facts into shared knowledge.

Early learning can be offline: persist generation history and compare variant outcomes before deploying automated ranking.

## Implementation Guidance

Future Codex sessions should treat this document as architectural intent, then confirm current code before editing. Any behavior change must update the relevant module doc, specification, phase checklist, and changelog.

