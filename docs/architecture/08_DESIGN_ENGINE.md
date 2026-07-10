# Design Engine

The Design Engine owns visual language. It turns WebsiteSpec and brand context into deterministic tokens for color, typography, spacing, radius, shadows, section density, and interaction tone.

It must prevent weak one-note palettes, enforce legible contrast, and produce vertical-appropriate visual systems. For real estate, supported styles include Luxury, Premium, Editorial, and Minimal; generic SaaS-blue dashboards are anti-patterns.

Design output should be consumed by Creative Intelligence, composition, components, mapper, and renderer.

## Creative Intelligence Handoff

Design Engine owns visual language and token strategy. Creative Intelligence owns art direction: inspiration metadata, visual mood, media requirements, motion language, and provider abstraction. Design must not call providers, generate media, or decide cinematic/motion assets directly.

## Implementation Guidance

Future Codex sessions should treat this document as architectural intent, then confirm current code before editing. Any behavior change must update the relevant module doc, specification, phase checklist, and changelog.
