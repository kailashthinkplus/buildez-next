# Website Specification

WebsiteSpec replaces loose golden-blueprint thinking. It is the contract between intelligence and rendering. The spec captures the result of business intelligence, brand intelligence, content strategy, experience strategy, and pattern intelligence. It should not be the place where all reasoning happens.

A WebsiteSpec should be serializable, versioned, explainable, and testable. It should never require reading the original chat to understand why a page was generated.

Inputs to WebsiteSpec should include `BusinessIntelligenceProfile`, `BrandIntelligenceProfile`, `ContentStrategy`, `ExperienceStrategy`, `PatternIntelligenceResult`, repository records, and trace decisions.

See `docs/specifications/WebsiteSpec.md` for the TypeScript shape.

## Implementation Guidance

Future Codex sessions should treat this document as architectural intent, then confirm current code before editing. Any behavior change must update the relevant module doc, specification, phase checklist, and changelog.
