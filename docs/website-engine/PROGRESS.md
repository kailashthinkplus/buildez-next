# Website Engine Progress

## Status

- [x] Created `website-engine/` platform namespace.
- [x] Added OpenAI-only `model-gateway` with budget checks and prompt cache.
- [x] Added planner intent classifier with deterministic fallback.
- [x] Added architecture documentation.
- [x] Added structured debug trace logger.
- [x] Added initial knowledge graph and real-estate lead-gen graph.
- [x] Added `WebsiteSpec` contract and deterministic builder.
- [x] Added deterministic design token and composition engines.
- [x] Added asset intelligence requirements.
- [x] Added component metadata registry.
- [x] Added native builder node mapper.
- [x] Added multi-axis critic scaffold.
- [x] Added repair plan scaffold.
- [x] Added learning/analytics trace types.
- [x] Added `ai-v10` orchestrator entrypoint.
- [x] Added protected `generate-v10` API route for explicit testing.
- [x] Added native v10 execution across Website Engine intelligence, design, component, composition, decision, specification, and Blueprint stages.
- [x] Added GPT-5.6 enrichment constrained to Engine-owned node IDs.
- [x] Added GPT Image 2 hydration for Engine image nodes with durable R2 persistence.
- [x] Added pre/post-repair parity and Critic evaluation with applied native Blueprint repair.
- [x] Added Builder selector for `AI v10 · Website Engine` and `AI v9 · Direct`; v10 is the default.
- [x] Kept ai-v9 completely outside the v10 execution path.
- [x] Added a v10-only GPT-5.6 website-builder profile for art direction and Blueprint candidate generation, independently configurable through `OPENAI_V10_WEBSITE_MODEL`.
- [x] Added GPT-5.6 pre-generation prompt engineering and a four-decision, use-case-aware strategy interview in the Builder chat.
- [x] Added v10 Website Engine specialist-agent activity covering strategy through renderer parity.
- [x] Replaced v10's timer-driven generic status carousel with live, run-scoped Website Engine progress and use-case-aware stage summaries.
- [x] Added ordered milestone history, creative heartbeats, per-image completion events, real request cancellation, minute/second elapsed formatting, and user-respecting chat auto-scroll.
- [x] Added a blocking canvas generation overlay with staggered section skeletons, shimmer, and live activity copy.
- [x] Capped creative enrichment at 8K output tokens/four minutes and individual image calls at three minutes to prevent unbounded generation runs.
- [x] Split creative enrichment into bounded 16-node content batches with props-only output and one compact JSON retry, preventing whole-page response truncation.
- [x] Limited creative enrichment to three concurrent 3.5K-token batches so aggregate output reservation remains below the project key's confirmed 16,384-token authorization ceiling.
- [x] RC-9A: replaced the single generic Section/Container/50-50 recipe expander with the Semantic Blueprint Compiler and fifteen native recipe families.
- [x] RC-9A: preserved `orderedSectionSequence`, wired Pattern Intelligence into `BuilderBlueprintInput`, and selected recipes from component variants/categories, pattern references, WebsiteSpec sections, and composition evidence.
- [x] RC-9A: mapped Design Engine tokens into the native Builder theme and emitted semantic content/media bindings for later GPT hydration without customer-copy placeholders.
- [x] Enforced JSON-object responses for preflight and creative enrichment; creative batches now use 8-node/2-worker limits and recursively split failed batches down to individual nodes instead of discarding the whole page.
- [ ] Add rendered screenshot QA.
- [ ] Replace/deprecate `PremiumWidgetPreview` for production rendering.
- [ ] Add tests for Sanjeevini real-estate output.

## Debugging

Generator traces are emitted through `website-engine/debug/GeneratorLogger.ts`.

Set `WEBSITE_ENGINE_DEBUG=true` to enable console debug logs.

Each run gets a trace with:

- run id
- stage events
- warnings
- errors
- model usage when available
- generated spec summary
- generated blueprint summary

## Verification

- `npx tsc --noEmit --pretty false --strict --skipLibCheck --target ES2022 --module ESNext --moduleResolution Bundler --lib ES2022,DOM --jsx react-jsx apps/web-app/modules/builder-v2/website-engine/index.ts apps/web-app/modules/builder-v2/ai-v10/index.ts`
- `npx eslint apps/web-app/modules/builder-v2/website-engine apps/web-app/modules/builder-v2/ai-v10 apps/web-app/app/api/builder-v2/ai/generate-v10/route.ts`

Repo-wide `tsc` is still blocked by pre-existing legacy syntax errors under `_legacy/modules.old` and `modules/builder/ai-v8`.

## Cost Guardrails

- Classification uses the OpenAI light model by default.
- Classification has a 1-cent estimated budget cap.
- Website Engine owns planning, specification, hierarchy, and native nodes; GPT-5.6 enriches those nodes and GPT Image 2 supplies generated assets inside v10.
- No OpenAI calls are made by the deterministic graph/spec/mapper layers.
