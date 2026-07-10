# 2026-07-07 - Phase 30 WebsiteSpec Builder

## Summary

Implemented the deterministic local WebsiteSpec Builder. The specification module now builds canonical SDK `WebsiteSpec` and `WebsiteDNA` contracts from upstream Website Engine metadata before Compiler.

## Code Changes

- Added WebsiteSpec Builder contracts and runner.
- Added helper files for section specs, content requirements, component preferences, forbidden components, design rules, asset requirements, SEO requirements, accessibility requirements, conversion rules, responsive rules, fallback strategy, missing facts, WebsiteDNA, validation, verification, and versioning.
- Removed the old planner-shaped, real-estate-specific WebsiteSpec skeleton files.
- Updated the specification module README and barrel exports.

## Verification

- Ran `pnpm --dir apps/web-app typecheck:builder`.
- Result: passed.

## Safety Notes

- `ai-v9` untouched.
- Builder behavior untouched.
- Production routes untouched.
- Rendering untouched.
- Feature flags remain false.
- No DB, network, LLM, MCP, provider calls, generated websites, Builder nodes, React components, CSS, HTML, or JavaScript.

## Next

Phase 31 - Native Builder Mapper Contracts.
