# Rendering Engine

The Rendering Engine renders native builder nodes for canvas, preview, and published output with parity. It should use the same interpretation of node schema, style tokens, responsive rules, and assets across environments.

Preview-published parity is a platform invariant. If a generated page passes QA in preview but publishes differently, the QA result is invalid.

Renderer contracts should be covered by snapshot, DOM, visual, and accessibility tests.

## Implementation Guidance

Future Codex sessions should treat this document as architectural intent, then confirm current code before editing. Any behavior change must update the relevant module doc, specification, phase checklist, and changelog.

