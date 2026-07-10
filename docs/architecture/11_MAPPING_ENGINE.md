# Mapping Engine

The Mapping Engine converts WebsiteSpec plus composition decisions into native editable builder nodes. It must not emit opaque screenshots or non-editable blobs.

Mapping preserves semantic structure: sections, headings, text, CTAs, media, forms, cards, and lists should remain inspectable in the builder. Mapper output should be deterministic for a given spec and engine version.

A mapping failure should return a typed error and a repairable cause, not partial placeholder UI.

## Implementation Guidance

Future Codex sessions should treat this document as architectural intent, then confirm current code before editing. Any behavior change must update the relevant module doc, specification, phase checklist, and changelog.

