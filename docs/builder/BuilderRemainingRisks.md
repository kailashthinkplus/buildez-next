# Builder Remaining Risks

Date: 2026-07-09  
Phase: BSP-16

## Highest Risks

1. Executable/browser QA does not exist yet.
2. Preview/publish parity is contract-level, not browser-proven.
3. Accessibility readiness is not certified.
4. Serialization is improved but not proven through all save/load/API paths.
5. Responsive behavior is modeled but not proven across real viewport rendering.
6. Production widgets are native but still need structured repeaters and interaction QA.
7. Header/footer editability is policy-scaffolded, not fully implemented as shared native sections.
8. Embed and popup remain gated for security/accessibility/runtime reasons.
9. Performance budgets are metadata-only; large-page measurements are pending.
10. AI compatibility is intentionally blocked below release threshold.

## Risk Acceptance

The program may accept these risks only for disabled, dry-run, non-mutating Phase 40A work. These risks are not acceptable for production rollout, live AI node writes, Mapper execution, or publish confidence claims.

## Required Mitigations

- Add a real test runner for Builder regression specs.
- Add Playwright or equivalent browser coverage for canvas, inspector, responsive preview, preview route, and publish route.
- Add accessibility scans and keyboard navigation tests.
- Add measured performance budgets for 100, 500, and 1000 node pages.
- Add manual QA checklist execution.
- Keep AI execution and Mapper insertion blocked until gate thresholds pass.
