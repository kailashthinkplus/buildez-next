# Architecture Review Gate After Compiler

Last updated: 2026-07-06

## 1. Executive Summary

Decision: **No-go for Mapper implementation now.**

BuildEZ has a strong inert foundation: SDK contracts, repository records, knowledge graph, constraints, reasoning, Decision Engine, and Website Compiler contracts. However, the current compiler output is still structurally valid but shallow because the upstream intelligence engines that should shape premium websites are not implemented yet.

If Mapper is implemented immediately, it will map default compiled sections and generic component-family placeholders into Builder nodes. That would create a high risk of generic, same-shaped websites even though the pipeline looks architecturally complete.

The correct path is to improve the inputs before mapping:

1. Business Intelligence Engine.
2. Brand Intelligence Engine.
3. Content Intelligence Engine.
4. Experience Engine.
5. Pattern Intelligence Engine.
6. Design Engine.
7. Component Engine.
8. Composition Engine.
9. Compiler Revisit / Enrichment.
10. Mapper Contracts.

The Compiler should remain frozen as a contract layer until these upstream engines produce richer, testable inputs.

## 2. Current Foundation Status

Implemented foundation:

- SDK and core contracts.
- Website Repository records and fixtures.
- Knowledge Graph contracts and local indexing.
- Constraint Engine.
- Reasoning Engine.
- Decision Engine.
- Website Compiler contracts.

These modules are useful and should remain. They establish the language of the engine and protect future work from ad hoc generation. But they are not enough to produce world-class websites because they do not yet understand business nuance, brand identity, content strategy, journey rhythm, semantic pattern fit, design systems, component metadata, or composition quality deeply enough.

## 3. Architecture Scorecard

| Area | Score | Status | Notes |
| --- | ---: | --- | --- |
| SDK | 8/10 | Strong foundation | Shared types, versions, results, traces, validators, and utilities exist. |
| Repository | 7/10 | Good foundation | Starter records and fixtures exist, but ranking metadata and deeper component/design records are still thin. |
| Knowledge Graph | 7/10 | Good foundation | Local graph exists over repository records, but graph semantics need richer intelligence inputs. |
| Constraints | 7/10 | Good foundation | Truth/editability/parity rules exist, but constraints are still lightweight and not fixture-calibrated. |
| Reasoning | 6/10 | Useful but early | Can rank candidates deterministically, but relies on shallow upstream intelligence. |
| Decision Engine | 6/10 | Useful but early | Can commit a Decision Plan, but decisions are only as rich as candidate inputs. |
| Compiler | 6/10 | Contract-ready | Produces mapper-ready structure, but section/component defaults are shallow. |
| Business Intelligence readiness | 2/10 | Not ready | Architecture exists; implementation does not. |
| Brand Intelligence readiness | 2/10 | Not ready | Architecture exists; implementation does not. |
| Content Intelligence readiness | 2/10 | Not ready | Architecture exists; implementation does not. |
| Experience readiness | 2/10 | Not ready | Architecture exists; implementation does not. |
| Pattern Intelligence readiness | 2/10 | Not ready | Architecture exists; implementation does not. |
| Design Engine readiness | 2/10 | Not ready | Skeleton exists, but deterministic design reasoning is not implemented. |
| Component Engine readiness | 2/10 | Not ready | Skeleton exists, but component-family/variant metadata selection is not production-grade. |
| Composition readiness | 2/10 | Not ready | Skeleton exists, but journey/rhythm/density composition is not implemented. |
| Mapper readiness | 3/10 | No-go | Mapper would map shallow plans into nodes too early. |
| Production readiness | 1/10 | No-go | Feature flags remain false; ai-v9 remains production path. |

## 4. What Has Been Implemented

- SDK contracts and compile-safe verification.
- Local repository records and fixture contracts.
- Local knowledge graph indexing and traversal.
- Local constraint rules and evaluation.
- Deterministic reasoning candidates and scoring.
- Deterministic Decision Plan selection.
- Mapper-ready Compiler contract output.
- Documentation and changelog trail for phases 13 through 19.

## 5. What Has Not Been Implemented

- Business Intelligence Engine.
- Brand Intelligence Engine.
- Content Intelligence Engine.
- Experience Engine.
- Pattern Intelligence Engine.
- Design Engine.
- Component Engine.
- Composition Engine.
- Compiler enrichment based on those engines.
- Mapper contracts.
- Mapper to native Builder nodes.
- Simulation, renderer parity, critic/evaluation, repair, learning, planner, WebsiteSpec builder, ai-v10 orchestration, shadow comparison, rollout, and ai-v9 replacement.

## 6. Why Mapper Should Not Be Next

Mapper would take today’s compiler output and turn it into native Builder nodes. Today that output is structurally valid but not sufficiently intelligent.

What Mapper would produce today:

- Editable nodes, if implemented carefully.
- Sections derived from default compiler patterns or sparse `WebsiteSpec` data.
- Component-family placeholders rather than deeply selected component variants.
- Generic CTA/SEO/accessibility/responsive rules.
- Asset requests rather than rich asset strategy.

Would Mapper output high-quality websites today? **No.** It would likely output technically editable but generic websites. That is the exact failure mode the Website Engine is supposed to avoid.

## 7. Why Intelligence Engines Must Come First

World-class websites require more than section mapping. They require:

- Business understanding before structure.
- Brand understanding before design.
- Content strategy before copy.
- Experience rhythm before composition.
- Pattern intelligence before component choice.
- Design language before visual mapping.
- Component metadata before node creation.
- Composition strategy before section assembly.

The compiler is currently missing rich upstream inputs. If those inputs remain shallow, Mapper will faithfully map shallow intent.

## 8. Risks Of Early Mapper

- Generic pages become native and therefore appear deceptively “real.”
- The team optimizes node mapping before business/brand/content quality exists.
- Placeholder component families harden into production assumptions.
- Real estate or SaaS-shaped composition can leak into all industries.
- Visual quality problems become harder to fix because they are downstream symptoms.
- Builder parity work begins before there is enough semantic intent to preserve.
- User-facing demos may look editable but not strategically credible.

## 9. Corrected Implementation Roadmap

1. Phase 21 — Business Intelligence Engine.
2. Phase 22 — Brand Intelligence Engine.
3. Phase 23 — Content Intelligence Engine.
4. Phase 24 — Experience Engine.
5. Phase 25 — Pattern Intelligence Engine.
6. Phase 26 — Design Engine.
7. Phase 27 — Component Engine.
8. Phase 28 — Composition Engine.
9. Phase 29 — Compiler Revisit / Enrichment.
10. Phase 30 — Mapper Contracts.
11. Phase 31 — Mapper to Native Builder Nodes.
12. Phase 32 — Simulation Engine.
13. Phase 33 — Renderer Parity.
14. Phase 34 — Critic / Evaluation.
15. Phase 35 — Repair Engine.
16. Phase 36 — Learning Engine.
17. Phase 37 — Planner.
18. Phase 38 — WebsiteSpec Builder.
19. Phase 39 — AI v10 Orchestrator.
20. Phase 40 — ai-v9 Shadow Comparison.
21. Phase 41 — Limited Rollout.
22. Phase 42 — ai-v9 Replacement Strategy.

## 10. Compiler Freeze Recommendation

Freeze the Compiler as a contract layer for now.

Allowed before revisit:

- Documentation corrections.
- Type-only compatibility updates required by intelligence engines.
- Validation clarifications.

Avoid before revisit:

- Mapping behavior.
- Builder node assumptions.
- HTML/React/CSS output.
- Component implementation choices.
- Production wiring.

## 11. Compiler Revisit Criteria

Revisit Compiler only after:

- Business Intelligence produces fixture-backed `BusinessIntelligenceProfile` outputs.
- Brand Intelligence produces fixture-backed `BrandIntelligenceProfile` outputs.
- Content Intelligence produces fixture-backed `ContentStrategy` outputs.
- Experience Engine produces journey/rhythm/CTA/density outputs.
- Pattern Intelligence produces semantic pattern selections and rejections.
- Design Engine produces deterministic design-language/tokens strategy.
- Component Engine produces component-family and variant readiness metadata.
- Composition Engine produces section order, density, transition, and CTA cadence.

Compiler enrichment should then convert these richer inputs into a better `CompiledWebsitePlan`.

## 12. Safety Status

- Production behavior affected today: **none**.
- Feature flags: **must remain false**.
- ai-v9: **still isolated**.
- Existing Builder routes: **untouched**.
- Builder behavior: **unchanged**.
- Mapper: **not implemented**.
- Website generation: **not implemented**.
- LLM calls from code: **none added**.
- DB/external services: **none added**.

## 13. Go / No-Go Decision

Mapper implementation: **No-go**.

Business Intelligence Engine implementation: **Go**.

Compiler behavior changes: **No-go except documentation/type-only support for upstream modules**.

## 14. Acceptance Criteria For Moving To Mapper Later

Mapper should not start until:

- Business, brand, content, experience, pattern, design, component, and composition engines exist.
- Each engine has cross-industry fixture coverage for real estate, healthcare, restaurant, education, and automotive.
- Compiler has been revisited and enriched from those outputs.
- `CompiledWebsitePlan` contains concrete section intent, component mapping intent, asset requirements, responsive rules, quality gates, and missing-fact handling.
- Component Engine can say which native Builder node families are eligible.
- Design Engine can provide token strategy without requiring mapper invention.
- Composition Engine can prevent generic section rhythm.
- Constraints continue to block fake facts and unsupported claims.
- Feature flags remain false until shadow comparison and rollout phases.

## 15. Next Phase Recommendation

Next phase: **Phase 21 — Business Intelligence Engine**.

Business Intelligence is the correct next foundation because every downstream module depends on understanding what the business is, what model it operates under, what proof it needs, what facts are missing, and what conversion goal the website should serve.

## Review Questions

1. **Is the current foundation ready for Mapper implementation?** No.
2. **What would Mapper produce today?** Editable but shallow/default nodes from structurally valid compiler sections.
3. **Would Mapper output high-quality websites if implemented now?** No.
4. **Are Compiler inputs currently rich enough?** No.
5. **Which intelligence engines must exist before Mapper?** Business, Brand, Content, Experience, Pattern, Design, Component, and Composition engines.
6. **Should Compiler stay frozen as a contract for now?** Yes.
7. **Should Compiler be revisited after intelligence/design/component/composition engines exist?** Yes.
8. **What is the correct implementation order from here?** Phase 21 through Phase 42 as listed above.
9. **What risks exist if Mapper is implemented too early?** Generic pages, hardened placeholders, weak visual quality, and premature production assumptions.
10. **What risks exist if intelligence engines are delayed?** The engine remains structurally correct but strategically shallow.
11. **What production behavior is affected today?** None.
12. **Are feature flags still false?** Yes, they must remain false.
13. **Is ai-v9 still isolated?** Yes.
14. **Are existing builder routes untouched?** Yes.
