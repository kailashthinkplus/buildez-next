# Developer Logs

Developer logs preserve implementation context that should not live only in chat. Add one log entry per meaningful Website Engine implementation session so future Codex sessions and human engineers can recover the why, not only the diff.

## Naming

Use `YYYY-MM-DD-short-topic.md`. Keep the topic concrete, for example `2026-07-05-real-estate-fixtures.md` or `2026-07-12-renderer-parity-checks.md`.

## Required Content

- Objective: the specific engineering or documentation goal.
- Files changed: the important files and why they changed.
- Decisions made: tradeoffs, boundaries, feature flags, and rejected paths.
- Verification performed: commands, tests, screenshots, fixtures, or manual QA.
- Follow-ups: concrete next steps that remain after the session.
- Risks and rollback notes: how to disable, revert, or contain the change.

## What Belongs Here

Use logs for implementation breadcrumbs: why a module API was shaped a certain way, why a real estate anti-pattern was added, why a repair operation was scoped down, or why a phase is incomplete. Link to ADRs when a decision has durable architectural weight.

## What Does Not Belong Here

Do not store secrets, private customer data, prompt transcripts containing tenant-sensitive facts, access tokens, raw analytics events, or generated content that should remain tenant-scoped. Summarize sensitive facts as categories, not values.

## Maintenance Rule

When a Website Engine PR changes behavior, the developer log should be updated before the changelog. The log can be detailed and session-oriented; the changelog should remain release-oriented and readable.
