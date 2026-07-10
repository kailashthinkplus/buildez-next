# Website Engine Critic

Phase 35 implements the deterministic, metadata-only Critic Engine.

The critic does not render pages, capture screenshots, execute the Mapper, mutate the Builder store, call providers, call LLMs, or generate React/CSS/HTML/JS. It evaluates upstream Website Engine metadata and returns an `EngineResult<CriticResult>`.

## Entry Points

- `runCriticEngine(input)`
- `runCritic(input)` compatibility wrapper
- `evaluateWebsite(input)` compatibility wrapper returning `WebsiteEvaluation`
- `runCriticVerification()`

## Categories

- Visual hierarchy
- Typography
- Spacing
- Composition
- Design DNA consistency
- Creative Library diversity
- Content truth
- Conversion quality
- Accessibility
- SEO
- Performance risk
- Mobile quality
- Editability
- Renderer parity
- Industry fit
- Asset readiness
- Motion/accessibility risk

## Quality Gates

- `85+` is preview-ready.
- `90+` is publish-recommended.
- Below `85` requires Repair.
- Any hard failure blocks publish recommendation.

## Hard Failures

The critic can block publish for fake or unsupported claims, placeholder copy, missing primary CTA on conversion pages, unsupported widget types, opaque HTML/blob output, missing mobile plan, severe accessibility risk, missing required assets without substitution policy, renderer parity critical issues, non-editable generated sections, and repeated near-identical recipe use where diversity is expected.

## Safety

The module is inert. It has no production route wiring and does not change Builder behavior. Feature flags remain false by default.
