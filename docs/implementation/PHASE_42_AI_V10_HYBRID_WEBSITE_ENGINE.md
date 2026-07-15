# Phase 42 - AI v10 Native Website Engine Integration

Date: 2026-07-15

## Outcome

AI v10 now runs end to end from the Builder AI panel through the protected v10 route and persists an editable canonical Website Engine Blueprint without executing ai-v9.

## Architecture

1. Website Engine runs Planner, Business, Brand, Content, Experience, Pattern, Design, Component, Composition, and Decision stages.
2. Website Engine creates the authoritative WebsiteSpec and native editable Builder Blueprint node graph.
3. GPT-5.6 enriches only existing Engine-owned node IDs with copy, styles, responsive behavior, and image direction; it cannot replace the hierarchy or invent another Blueprint.
4. GPT Image 2 hydrates Engine image nodes and uploads durable assets to R2.
5. Website Engine runs renderer parity and Critic, applies native Blueprint repairs, and runs final parity/Critic evaluation.
6. The v10 route persists the repaired canonical Website Engine Blueprint and full stage metadata.

The native creative enrichment uses the accessible GPT-5.6 Sol model ID `gpt-5.6-sol` by default. `OPENAI_V10_WEBSITE_MODEL` can pin or override it independently. Image generation uses `gpt-image-2` by default and can be changed with `OPENAI_V10_IMAGE_MODEL`. Direct ai-v9 retains its separate implementation and model configuration.

AI-v9 is not imported or executed by v10. It remains available only as an explicit comparison path in the Builder selector.

## Builder Controls

- `AI v10 · Website Engine` is selected by default.
- `AI v9 · Direct` remains available for side-by-side testing and regression diagnosis.
- The selected version determines the API endpoint; both results use the existing Blueprint review flow.
- Before a v10 generation, GPT-5.6 acts as a Brief Architect: it interprets the raw request and produces an Engine-ready prompt rather than passing the user's text straight to generation.
- The v10 chat presents four use-case-aware decisions covering conversion outcome, art direction, proof/content strategy, and imagery/experience. Each choice explains its consequence and changes the approved brief.
- Generic v9-style pills are not used in the v10 interview. Generation begins only after the four decisions are selected.
- V10 publishes a specialist-agent trace for intent, business, brand, content, experience, patterns, design system, components, composition, Blueprint compilation, creative enrichment, image generation, critique, repair, and parity.
- While generation is running, the orchestrator publishes its actual current agent and stage through a run-scoped progress channel. The Builder displays use-case-aware status text and identifies long GPT-5.6 and image-generation work instead of advancing a synthetic timer to QA.
- The progress channel retains an ordered event stream so fast Engine stages are not lost between client polls. Long creative work emits milestone heartbeats and image generation reports each completed asset.
- Chat auto-scroll follows new activity only while the user remains near the bottom; manual upward scrolling suspends live following. A new decision question scrolls only its own card into view.
- Abort uses a real browser `AbortController`, records the stop action in chat, and prevents the Builder from refreshing a nonexistent result.
- While generation runs, the canvas is blocked by a staggered section-building overlay whose activity label follows the same live milestone stream.
- Creative enrichment is batched across customer-facing heading, text, button, and image nodes. Each batch returns props-only JSON, is capped independently, and retries once with a stricter compact contract if parsing detects an incomplete response; Website Engine layout and responsive styles are never delegated back to the model.
- OpenAI calls enforce JSON-object output. Enrichment uses eight-node batches with two workers; a batch that remains incomplete after its compact retry is recursively split into smaller sequential batches so completed content is preserved and one malformed response does not invalidate the page.

## Verification

- Native orchestration test proves Website Engine artifacts and node IDs reach the creative enrichment stage.
- The same test proves GPT enrichment receives and returns the Engine-owned Blueprint hierarchy.
- Routing tests prove v10 and v9 resolve to their corresponding endpoints.
- Preflight tests prove prompt engineering produces exactly four decisions with exactly three use-case-aware options each.
- Type checking is evaluated against touched files because the repository retains known unrelated Website Engine errors.

## Remaining Quality Work

- Run real prompt suites across industries and compare v9/v10 screenshots.
- Turn repair plans into controlled Blueprint repair execution after visual regression coverage exists.
- Add rendered desktop/tablet/mobile screenshot scoring.
