# Security And Tenancy

The Website Engine must preserve tenant isolation across prompts, specs, assets, generation history, analytics, and learned patterns.

Security rules: validate all model outputs, sanitize content before rendering, restrict asset access to the owning tenant, avoid prompt leakage, rate-limit expensive AI and visual QA flows, and log high-risk operations.

Shared knowledge can include generic industry structure but must not include private tenant data unless explicitly anonymized and permitted.

## Implementation Guidance

Future Codex sessions should treat this document as architectural intent, then confirm current code before editing. Any behavior change must update the relevant module doc, specification, phase checklist, and changelog.

