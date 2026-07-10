# Migration Strategy

Migration should be incremental. Stabilize current AI output first, then introduce WebsiteSpec as a sidecar, build the Website Engine core beside `ai-v9`, add SDK/repository/constraints/reasoning/Decision Engine/compiler/simulation behind feature flags, then map selected fixture flows through the new engine. Retire direct AI node generation only after parity and quality gates pass.

Compatibility matters: existing saved pages and builder nodes must continue rendering. Migration should add adapters and shims before replacing behavior.

Every migration phase needs rollback: disable new orchestration, fall back to existing generator, or render from previously saved builder nodes.

ai-v9 must remain unchanged and isolated during early phases. ai-v10 is introduced only as orchestration glue after core engine contracts and fixture coverage exist.

## Implementation Guidance

Future Codex sessions should treat this document as architectural intent, then confirm current code before editing. Any behavior change must update the relevant module doc, specification, phase checklist, and changelog.
