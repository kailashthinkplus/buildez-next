# Testing Strategy

Testing should cover schemas, module contracts, deterministic mapping, renderer parity, critic scoring, repair behavior, and end-to-end generation traces.

Test layers: unit tests for pure engines, contract tests for WebsiteSpec and graph data, fixture tests for real estate examples, visual regression tests across breakpoints, accessibility checks, and publish-preview parity tests.

A release should not expand generation scope unless failures can be reproduced from saved specs and fixtures.

## Implementation Guidance

Future Codex sessions should treat this document as architectural intent, then confirm current code before editing. Any behavior change must update the relevant module doc, specification, phase checklist, and changelog.

