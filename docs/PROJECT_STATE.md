# BuildEZ Project State

Last updated: 2026-07-09

## Current Phase

BSP-16 Builder QA Certification & Release Gate Approval.

This phase finalizes the Builder Stabilization Program with QA certification documents, a final release gate, AI readiness certification, remaining risk register, updated quality score, and explicit Go/No-Go decision.

This phase does not modify `ai-v9`, wire AI generation, execute Mapper, insert AI Builder nodes, enable feature flags, start Phase 40A, call live LLM APIs, call DB/network/MCP/providers, or change production routes.

## Completed

- Phase 00 Architecture Documentation.
- Universal foundation documentation for business ontology, website ontology, archetypes, and industry inheritance.
- Phase 10 Website Engine Core Docs.
- Phase 11 Website Engine Skeleton.
- Phase 12A Website Intelligence Layer Docs.
- Phase 13 Website Engine SDK Production Foundation.
- Phase 14 Website Repository Records and Fixture Contracts.
- Phase 15 Repository-backed Knowledge Graph Contracts and Local Indexing.
- Phase 16 Constraint Engine Contracts and Local Evaluation.
- Phase 17 Website Engine Reasoning Layer.
- Phase 18 Decision Engine.
- Phase 19 Website Compiler Contracts and Local Compilation Plan.
- Phase 20 Architecture Review Gate after Compiler.
- Phase 21 Business Intelligence Engine.
- Phase 22 Brand Intelligence Engine.
- Phase 23 Content Intelligence Engine.
- Phase 24 Experience Engine.
- Phase 25 Pattern Intelligence Engine.
- Phase 26 Design Engine.
- Phase 26A Creative Intelligence Layer Architecture.
- Phase 26B Inspiration Engine.
- Phase 26C Visual Mood Engine.
- Phase 26D Media Intelligence Engine.
- Phase 26E Motion Intelligence Engine.
- Phase 26F Creative Provider Abstraction & Higgsfield MCP Strategy.
- Phase 27 Component Engine.
- Phase 28 Composition Engine.
- Phase 29 Compiler Revisit / Enrichment.
- Phase 30 WebsiteSpec Builder.
- Phase 30.5 Builder Blueprint Engine with Inspector Blueprint support.
- Phase 30.6 Native Builder Alignment for Builder Blueprint Engine.
- Phase 31 Native Builder Mapper Contracts.
- Phase 31A Creative Library / Recipe Repository.
- Phase 31A.1 Creative Library Expansion Pack.
- Phase 32 Mapper Execution Behind Disabled Feature Flag.
- Phase 33 Renderer and Preview/Published Parity Contracts.
- Phase 34 Simulation Engine.
- Phase 35A Design DNA & Recipe Fragment Engine.
- Phase 35 Critic Engine.
- Phase 35.5 Similarity & Diversity Engine.
- Phase 35.75 Candidate Evolution Engine.
- Phase 36 Repair Engine.
- Phase 36.5 Self-Play Optimization Engine.
- Phase 37 Learning Engine.
- Phase 38 AI Planner.
- Phase 39 AI v10 Orchestrator.
- Phase 40 ai-v9 Shadow Comparison.
- BSP-1 Builder Audit.
- BSP-2 Builder Bug Database Classification & Fix Sprint Planning.
- BSP-3 Builder Regression Suite Foundation.
- BSP-4 Builder Stress Testing Foundation.
- BSP-5 AI Compatibility Audit & Contracts.
- BSP-6 Builder Quality Score & Release Gate Finalization.
- BSP-7 Builder Bug Fix Sprint 1: Serialization, Schema Validation, and History Transactions.
- BSP-8 Builder Bug Fix Sprint 2: Responsive Architecture and Inspector Binding Proof.
- BSP-9 Builder Bug Fix Sprint 3: Canvas, Runtime, Preview and Publish Parity.
- BSP-10 Builder Bug Fix Sprint 4: Clipboard, Layers Sorting, and Layout Controls.
- BSP-11 Inspector UX Controls.
- BSP-12 Theme Panels, Header/Footer Policy, and Multi-Column Selector.
- BSP-13 Widget & Inspector Modernization.
- BSP-14 Motion, Premium Builder UX, Fullscreen Builder, and Layers Modernization.
- BSP-15 Production Widget Implementation & AI Widget Library.
- BSP-16 Builder QA Certification & Release Gate Approval.

## Current Gate Decision

Builder Stabilization Program status: complete.  
Engineering readiness: conditional pass.  
Production rollout: no-go.  
Native Builder Execution: conditional go only for disabled, dry-run, non-mutating Phase 40A work.  
Preview Harness: conditional go only for harness construction and evidence gathering.  
Streaming Canvas UX: conditional go only as inert UI scaffolding.  
AI Node Actions: conditional go only as inert disabled controls/plans.  
AI-generated Builder nodes: no-go.  
Mapper execution into Builder: no-go.

## Known Repository Context

The current builder stack includes `modules/builder-v2` concepts such as AI generation, widgets, runtime, canvas, core, theme, types, store, and workspace. Existing generated-output concerns include weak premium preview rendering, fake fallback copy, overly direct AI node generation, prompt-only industry knowledge, JSON-only QA, cosmetic repair, SaaS-shaped real estate output, weak design-token enforcement, and component mapping that is not yet premium or industry-aware.

## Target Platform Shape

`apps/web-app/modules/builder-v2/website-engine/` becomes the durable platform capability. `apps/web-app/modules/builder-v2/ai-v10/orchestrator/` becomes a thin orchestration layer that asks for planning, classification, and ambiguity resolution without letting the LLM directly invent arbitrary layouts.

The platform foundation is universal:

- Business concepts are modeled as `BusinessFamily`, `Industry`, `SubIndustry`, `BusinessModel`, `RevenueModel`, `CustomerJourney`, `TrustModel`, `ConversionGoal`, `LocalityNeed`, `ComplianceNeed`, `ContentNeed`, and `AssetNeed`.
- Website concepts are modeled as `WebsiteArchetype`, `SectionPattern`, and `ComponentPattern`.
- Industries inherit from families and override only what is truly different.
- Real estate is one validation fixture, not the foundation of the engine.
- Website Engine SDK owns shared contracts.
- Repository stores reusable structured knowledge.
- Constraint Engine enforces rules before rendering.
- Decision Engine commits ranked candidates into one coherent Website Strategy. Resolver remains a deprecated compatibility term.
- Compiler converts resolved intent into a mapper-ready `CompiledWebsitePlan`.
- Simulation predicts desktop, tablet, mobile, accessibility, SEO, performance, parity, and editability risk before preview.
- Website Intelligence understands business, brand, content, experience, and patterns before WebsiteSpec creation.
- Engine Trace records decisions for replayability.
- Website Engine SDK now owns normalized contracts, versions, errors, results, traces, lightweight validators, schemas, and utilities.
- Website Repository now owns local deterministic record contracts, starter records, fixture contracts, query helpers, and repository verification.
- Knowledge Graph now builds an inert local index from repository records with typed nodes, edges, relationships, traversal, validation, and verification.
- Constraint Engine now owns inert local rule contracts, starter constraints, repository/graph rule collection, deterministic evaluation, validation, and verification.
- Reasoning Engine now owns deterministic candidate sets, scoring, ranking, explanations, metrics, validation, and verification.
- Decision Engine now owns deterministic selection, Decision Plan contracts, validation, and verification.
- Website Compiler now owns enriched deterministic mapper-ready plan contracts, local compilation helpers, validation, verification, version metadata, trace metadata, upstream summaries, missing facts/assets, carried constraints, creative direction, content roles, experience roles, pattern roles, component mapping intent, quality gates, and safety guarantees.
- WebsiteSpec Builder now owns deterministic canonical `WebsiteSpec` and `WebsiteDNA` construction, section specs, content requirements, component preferences, forbidden components/patterns, design rules, asset requirements, SEO requirements, accessibility requirements, conversion rules, responsive rules, facts used, missing facts, fallback strategy, warnings, metrics, validation, verification, and trace metadata.
- Builder Blueprint Engine now owns deterministic mapper-ready editable Builder blueprint contracts, native primitive widget trees, InspectorBlueprint metadata, property definitions, editable property bindings, responsive bindings, style bindings, motion metadata, widget capabilities, section capabilities, AI/regeneration metadata, validation, verification, metrics, warnings, and trace metadata without inserting anything into Builder.
- Builder Blueprint Engine is now explicitly aligned to existing native Builder node/widget/property/command concepts through native node intents, native widget intents, native inspector binding intents, native command intents, and compatibility validation.
- Native Builder Mapper now owns inert mapping contracts and plans for native node creation, command intent ordering, property mapping, style mapping, responsive mapping, asset mapping, validation, verification, warnings, metrics, and trace metadata.
- Creative Library now owns metadata-only creative recipe contracts, a 559-recipe deterministic expansion catalog, richer layout/media/typography/conversion/trust/mobile metadata, fragment metadata, scoring, ranking, deterministic diversity selection, compatibility, requirements, variants, families, composition intent, responsive behavior, editability, inspector hints, fallbacks, validation, verification, warnings, metrics, and trace metadata.
- Design DNA and Recipe Fragments now extend Creative Library with deterministic visual identity axes, uniqueness scoring, deterministic diversity seeds, a 240-fragment metadata catalog, fragment compatibility, fragment scoring, recipe assembly plans, and fragment-aware Creative Library execution.
- Mapper Execution now owns disabled-feature-flag-only helpers for validating mapping execution input, materializing native-compatible nodes and command objects, producing non-mutating property/style/responsive/asset application records, validating execution results, and proving default execution remains blocked.
- Renderer Parity now owns metadata-only target matrices, parity snapshots, parity rules, issue detection, metrics, validation, and verification scaffolding for future canvas/preview/published/export consistency.
- Simulation Engine now owns deterministic metadata-only risk prediction for desktop/tablet/mobile structure, responsive stacking, above-the-fold CTA, content density, asset readiness, accessibility, SEO, performance, renderer parity, editability, conversion friction, scoring, validation, recommendations, and verification.
- Critic Engine now owns deterministic metadata-only website evaluation across visual hierarchy, typography, spacing, composition, Design DNA, Creative Library diversity, content truth, conversion, accessibility, SEO, performance, mobile, editability, renderer parity, industry fit, asset readiness, and motion risk, with hard failures, quality gates, repair hints, publish recommendation thresholds, validation, verification, metrics, confidence, and trace metadata.
- Similarity & Diversity Engine now owns deterministic metadata-only comparison profiles, Design DNA similarity, recipe overlap, fragment overlap, component overlap, composition/section order similarity, layout rhythm, motion rhythm, typography rhythm, CTA cadence, visual density, industry/archetype repetition, Creative Library family repetition, diversity thresholds, penalties, recommendations, repair hints, validation, verification, metrics, confidence, and trace metadata without persisting history.
- Candidate Evolution Engine now owns deterministic metadata-only generation of at least five website plan candidates, candidate mutations, candidate variants, candidate comparisons, weighted scoring, deterministic ranking, winner selection, runner-up preservation, repair priority, validation, verification, metrics, confidence, and trace metadata before Repair.
- Repair Engine now owns deterministic metadata-only repair planning for structural, content truth, design, composition, component replacement, creative diversity, similarity reduction, accessibility, SEO, performance, mobile, editability, motion safety, asset readiness, and renderer parity issues, with prioritized actions, targets, rules, hints, expected impact, risk, confidence, validation, verification, metrics, and trace metadata.
- Self-Play Optimization now owns deterministic metadata-only optimization loops, quality targets, optimization candidates, iteration history, repair-plan application simulation, score progression, stopping rules, final recommendations, remaining risks, validation, verification, metrics, confidence, and trace metadata before any Builder handoff.
- Learning Engine now owns metadata-only local learning records, generation history metadata, ranking signals, pattern signals, recipe signals, fragment signals, Design DNA signals, critic signals, repair signals, similarity signals, self-play signals, aggregation summaries, missing telemetry markers, validation, verification, metrics, confidence, and trace metadata without persistence.
- AI Planner now owns inert orchestration contracts for interpreted intent, known facts, missing facts, clarification questions, pipeline plans, ordered module plans, disabled execution gates, warnings, confidence, metrics, validation, verification, and trace metadata without live LLM calls or production execution.
- AI v10 Orchestrator now owns disabled orchestration contracts for the full Website Engine pipeline, execution modes, stage results, artifact summaries, gate validation, pipeline trace, warnings, metrics, and compile-safe verification without replacing `ai-v9` or executing production generation.
- ai-v9 Shadow Comparison now owns inert metadata-only comparison tooling for provided ai-v9 artifacts and provided Website Engine v10 artifacts, including normalized adapters, quality, editability, native Builder compatibility, truth safety, renderer parity, similarity/diversity, performance risk, repairability, winner recommendation, rollout readiness, validation, verification, metrics, and trace metadata without executing ai-v9 or v10 generation.
- Phase 20 review concluded Mapper is intentionally deferred until upstream intelligence, design, component, and composition engines exist.
- Business Intelligence Engine now owns deterministic local profiling for business identity, business family, industry, subindustry, business model, revenue model, offer model, audience, journey, trust, proof, objections, positioning, locality, compliance, conversion goals, missing facts, confidence, warnings, explanations, metrics, and trace metadata.
- Brand Intelligence Engine now owns deterministic local profiling for brand identity, personality, voice, tone, emotional positioning, audience perception, trust posture, story angle, differentiation, premium level, energy level, locality positioning, brand risks, brand constraints, existing brand assets, missing brand facts, confidence, warnings, explanations, metrics, and trace metadata.
- Content Intelligence Engine now owns deterministic local strategy for message hierarchy, headline strategy, section messaging roles, CTA strategy, proof strategy, FAQ strategy, SEO content strategy, trust copy rules, objection handling, locality content requirements, truth policy, missing content facts, confidence, warnings, explanations, metrics, and trace metadata.
- Experience Engine now owns deterministic local strategy for journey stages, attention curve, trust curve, CTA cadence, proof placement, content density curve, media rhythm, interaction rhythm, scroll narrative, mobile journey, conversion friction points, confidence, warnings, explanations, metrics, and trace metadata.
- Pattern Intelligence Engine now owns deterministic local semantic pattern catalog, candidate scoring, ranking, recommended pattern sets, sequence suggestions, compatibility notes, conflict detection, explanations, fallback patterns, required fact/asset surfacing, confidence, warnings, metrics, and trace metadata.
- Design Engine now owns deterministic local design intent, design language selection, typography, color, spacing, layout, motion, responsive, density, theme, visual rhythm, interaction, brand adaptation, SDK design tokens, contrast notes, confidence, warnings, explanations, metrics, and trace metadata.
- Creative Intelligence is now documented as the provider-agnostic art-direction layer after Design Engine, with Inspiration, Visual Mood, Media Intelligence, Motion Intelligence, Creative Provider Abstraction, and Higgsfield MCP Strategy as optional provider guidance.
- Inspiration Engine now owns deterministic local inspiration metadata, starter source categories, trait extraction, profile matching, scoring, risk detection, validation, verification, warnings, explanations, metrics, and trace metadata without copying, fetching, provider calls, UI generation, Builder nodes, or final component selection.
- Visual Mood Engine now owns deterministic local visual mood profiles for emotion, lighting, camera language, depth, materials, textures, atmosphere, contrast, color temperature, image style, luxury, energy, realism, cinematic level, seasonality, weather, warnings, confidence, validation, verification, and trace metadata without image generation, CSS generation, providers, Builder nodes, or component selection.
- Media Intelligence Engine now owns deterministic local media needs, image/video/icon/map/3D requirements, asset readiness, substitution policy, truth policy, generated-media suitability notes, real-asset requirements, stock-risk warnings, missing assets, risks, validation, verification, confidence, warnings, metrics, and trace metadata without media generation, asset upload, providers, Builder nodes, or production wiring.
- Motion Intelligence Engine now owns deterministic local motion language, scroll behavior, reveal strategy, parallax recommendation, camera movement, hover behavior, transition behavior, micro-interactions, sticky policy, page transitions, performance profile, reduced-motion strategy, accessibility notes, provider-candidate metadata, risks, validation, verification, confidence, warnings, metrics, and trace metadata without animation code, CSS, HTML, JS timelines, providers, libraries, Builder nodes, or production wiring.
- Creative Provider Abstraction now owns provider-agnostic request/result contracts, safety policy, fallback policy, provider metadata registry, inert provider adapters, Higgsfield MCP strategy metadata, validation, verification, and trace metadata without provider execution, MCP calls, network calls, generated assets, motion code, CSS, HTML, JS, Builder nodes, or production wiring.
- Component Engine now owns deterministic local component variant contracts, metadata catalog, candidate scoring, ranking, compatibility, conflict detection, requirements, editable mapping intent, fallbacks, quality checks, validation, verification, confidence, warnings, metrics, and trace metadata without rendering, Builder nodes, React components, CSS, HTML, JS, provider execution, generation, or production wiring.
- Composition Engine now owns deterministic local composition plan contracts, section ordering, page rhythm, visual breathing, section weights, CTA cadence, media/content alternation, trust placement, conversion journey, scroll narrative, mobile stacking, density transitions, composition rules, conflicts, quality checks, fallbacks, validation, verification, confidence, warnings, metrics, and trace metadata without rendering, Builder nodes, React components, CSS, HTML, JS, Mapper, Renderer, generation, or production wiring.
- Compiler has been revisited after upstream intelligence, creative, design, component, and composition modules, and now emits an enriched mapper-ready plan for a future Mapper.
- WebsiteSpec Builder now creates the canonical pre-Compiler contract and preserves WebsiteDNA identity for future edits and downstream consistency.
- Builder Blueprint Engine now expands WebsiteSpec and Compiler metadata into editable native Builder primitive intents before the Native Builder Mapper contract phase.
- Native Builder Mapper now converts Builder Blueprint intent into executable-plan metadata only; actual command execution remains deferred behind a disabled feature flag.
- Creative Library now provides reusable recipe variants for downstream engines without emitting Builder nodes, React, CSS, HTML, JavaScript, screenshots, media, provider requests, or rendered output.
- Repository starter coverage includes real estate, healthcare, restaurant / food and beverage, automotive, and education, with additional fixture contracts for D2C, hospitality, and interior design.
- `ai-v9` remains unchanged and isolated until replacement is proven safe.
- BSP-1 Builder Audit now owns documentation-only native Builder audit artifacts, confirmed bug database entries, regression and stress plans, AI compatibility assessment, quality score, release gate, roadmap, implementation log, and developer log without modifying Builder behavior.
- BSP-2 Builder Bug Triage now owns documentation-only fix-wave classification for BUG-0001 through BUG-0050, dependency planning, regression matrix planning, critical path planning, implementation log, and developer log without fixing bugs or changing Builder behavior.
- BSP-3 Builder Regression Suite Foundation now owns compile-safe native Builder test scaffolding under `apps/web-app/modules/builder-v2/__tests__/`, deterministic fixtures, command/serialization/inspector/responsive/widget/parity harnesses, initial regression specs, and builder typecheck inclusion without changing Builder runtime behavior.
- BSP-4 Builder Stress Testing Foundation now owns compile-safe stress scenarios under `apps/web-app/modules/builder-v2/__tests__/stress/`, deterministic large blueprint factories, stress metrics, performance budgets, and stress spec metadata without changing Builder runtime behavior.
- BSP-5 AI Compatibility Audit & Contracts now owns metadata-only native Builder AI compatibility contracts under `apps/web-app/modules/builder-v2/ai-compatibility/`, including widget capability matrix, inspector capability, command capability, regeneration scope, edit safety rules, validation, verification, and a blocked AI readiness result without changing Builder runtime behavior.
- BSP-6 Builder Quality Score & Release Gate Finalization now owns the final pre-fix Builder scorecard, Go/No-Go decision, release gate checklist, and ordered fix sprint plan. Builder Quality Score remains 43/100, strategic AI Compatibility remains 42/100, BSP-5 executable AI contract score remains 6/100, and the release gate remains failed.
- BSP-7 Builder Bug Fix Sprint 1 now owns production validation helpers, safe serialization helpers, safe tree repair contracts, bounded CommandBus history, explicit transaction batching, transaction undo/redo, failed-command rollback, and expanded compile-safe regression specs for serialization and history. Builder Quality Score is now 46/100; strategic AI Compatibility remains 42/100; BSP-5 executable AI contract score remains 6/100; the release gate remains failed.
- BSP-8 Builder Bug Fix Sprint 2 now owns shared responsive helpers, canvas/inspector device sync, responsive override/inheritance/reset behavior, property binding registry/validation/update pipeline, unsupported property hiding, and expanded compile-safe regression specs for responsive and inspector binding. Builder Quality Score is now 52/100; strategic AI Compatibility remains 42/100; BSP-5 executable AI contract score remains 6/100; the release gate remains failed.
- BSP-9 Builder Bug Fix Sprint 3 now owns shared render contracts, shared style/theme/responsive resolution, canvas/runtime resolver adoption, native widget parity metadata, preview/publish parity validation contracts, and expanded compile-safe parity specs. Builder Quality Score is now 58/100; strategic AI Compatibility remains 42/100; BSP-5 executable AI contract score remains 6/100; the release gate remains failed.
- BSP-10 Builder Bug Fix Sprint 4 now owns CommandBus-backed node clipboard, style clipboard, duplicate-safe subtree paste, compatible style paste validation, sibling layer reordering, minimal Layers panel reorder controls, full-width/boxed layout control fixes, and expanded compile-safe regression specs. Builder Quality Score is now 64/100; strategic AI Compatibility remains 42/100; BSP-5 executable AI contract score remains 6/100; the release gate remains failed.
- BSP-11 Builder Bug Fix Sprint 5 now owns inspector color picker upgrades, unit picker support, visual alignment controls, renderable alignment property bindings, dead-control hiding/disabled proof, active-device responsive inspector updates where applicable, and expanded compile-safe regression specs. Builder Quality Score is now 69/100; strategic AI Compatibility remains 42/100; BSP-5 executable AI contract score remains 6/100; the release gate remains failed.
- BSP-12 now owns non-empty theme colors/settings panels, theme token metadata, CommandBus-backed theme token updates, header/footer editable global section policy scaffolding, required multi-column selector presets, shared native column-structure application logic, and expanded compile-safe regression specs. Builder Quality Score is now 73/100; strategic AI Compatibility is now 44/100; BSP-5 executable AI contract score remains 6/100; the release gate remains failed.
- BSP-13 now owns widget capability/readiness metadata, registered widget audit coverage, scaffold-only missing widget planning, inspector support metadata, serialization support metadata, AI readiness metadata only, embed/code safety policy, and expanded compile-safe widget regression specs. Builder Quality Score is now 76/100; strategic AI Compatibility is now 48/100; BSP-5 executable AI contract score remains 6/100; the release gate remains failed.
- BSP-14 now owns fullscreen Builder focus mode, persisted fullscreen preference, modernized Layers hierarchy, metadata-only motion inspector groups and presets, premium Builder-only selection/drop/placeholder polish, and expanded compile-safe UX regression specs. Builder Quality Score is now 80/100; strategic AI Compatibility remains 48/100; BSP-5 executable AI contract score remains 6/100; the release gate remains failed.

## Active Constraints

- Do not refactor `ai-v9` yet.
- Do not change existing builder behavior yet.
- BSP planning phases must remain documentation-only until a fix phase is explicitly approved.
- Do not add runtime code outside inert Website Engine foundations.
- Do not route production traffic to Website Engine yet.
- Keep Website Engine feature flags false.
- Keep compiler, decision, reasoning, constraints, graph, repository, and SDK usage local-only.
- Mapper execution remains disabled by default and must not write Builder store or execute CommandBus commands from production paths.
- Renderer parity remains metadata-only and must not render, capture screenshots, alter canvas/runtime behavior, or wire production routes.
- Simulation remains metadata-only and must not render, capture screenshots, automate browsers, mutate Builder store, execute Mapper automatically, or wire production routes.
- Critic remains metadata-only and must not render, capture screenshots, execute Mapper, mutate Builder store, generate React/CSS/HTML/JS, call DB/network/LLM/MCP/providers, or wire production routes.
- Similarity & Diversity remains metadata-only and must not persist history, render, capture screenshots, execute Mapper, mutate Builder store, create Builder nodes, generate React/CSS/HTML/JS, call DB/network/LLM/MCP/providers, or wire production routes.
- Candidate Evolution remains metadata-only and must not persist history, render, capture screenshots, execute Mapper, mutate Builder store, create Builder nodes, generate React/CSS/HTML/JS, call DB/network/LLM/MCP/providers, or wire production routes.
- Repair remains metadata-only and must not apply repairs, persist history, render, capture screenshots, execute Mapper, mutate Builder store, create Builder nodes, generate React/CSS/HTML/JS, call DB/network/LLM/MCP/providers, or wire production routes.
- Self-Play Optimization remains metadata-only and must not apply repairs to Builder, persist history, render, capture screenshots, execute Mapper, mutate Builder store, create Builder nodes, generate React/CSS/HTML/JS, call DB/network/LLM/MCP/providers, or wire production routes.
- Learning remains metadata-only and must not persist records, invent telemetry, render, capture screenshots, execute Mapper, mutate Builder store, create Builder nodes, generate React/CSS/HTML/JS, call DB/network/LLM/MCP/providers, or wire production routes.
- AI Planner remains inert and must not replace `ai-v9`, call live LLM APIs, generate WebsiteSpec directly, execute modules, execute Mapper, mutate Builder store, create Builder nodes, generate React/CSS/HTML/JS, call DB/network/MCP/providers, or wire production routes.
- AI v10 Orchestrator remains disabled and inert; it must not replace `ai-v9`, call live LLM APIs, execute Mapper by default, mutate Builder store, insert Builder nodes, generate React/CSS/HTML/JS, call DB/network/MCP/providers, persist records, publish, or wire production routes.
- ai-v9 Shadow Comparison remains metadata-only and must not execute ai-v9, generate v10 output, call live LLM APIs, execute Mapper, mutate Builder store, insert Builder nodes, render, capture screenshots, persist records, call DB/network/MCP/providers, or wire production routes.
- Creative Library remains metadata-only and must not emit Builder nodes, React, CSS, HTML, JavaScript, screenshots, media, provider calls, or production wiring.
- Design DNA and Recipe Fragments remain metadata-only and must not emit Builder nodes, generated code, screenshots, provider requests, or production wiring.
- Compiler remains mapper-ready plan only; it must not emit Builder nodes, HTML, React components, CSS, JavaScript, rendered output, or generated websites.
- Do not rely on chat history for architecture decisions.
- Treat docs in this directory as the implementation contract for future work.

## First Implementation After This Phase

BSP-15 is the next Builder priority: Builder QA Certification & Release Gate Approval.

Website Engine next priority remains Phase 41 Internal Preview Harness after Builder stabilization planning is reconciled with release gates.

Immediate next work:

- BSP-15 should certify Builder QA and evaluate release gate approval using the BSP regression scaffold, without enabling AI generation, executing Mapper, inserting AI nodes, changing feature flags, or refactoring unrelated UI.
- Keep SDK, Repository, Graph, Constraint, Reasoning, Decision, WebsiteSpec Builder, Builder Blueprint Engine, Native Builder Mapper, Mapper Execution, Renderer Parity, Simulation, Creative Library, Design DNA, Similarity & Diversity, Candidate Evolution, Repair, Self-Play Optimization, Learning, AI Planner, AI v10 Orchestrator, ai-v9 Shadow Comparison, Compiler, Critic, Business Intelligence, Brand Intelligence, Content Intelligence, Experience, Pattern Intelligence, Design, Creative Intelligence, Inspiration, Visual Mood, Media Intelligence, Motion Intelligence, Creative Provider, Component Engine, and Composition Engine contracts stable while preparing the Internal Preview Harness.
- Preserve the agency-style intelligence order: Business Intelligence, Brand Intelligence, Content Intelligence, Experience Engine, Pattern Intelligence, Design Engine.
- Treat inspiration as metadata and art-direction input; do not copy, fetch, scrape, or clone websites.
- Treat Visual Mood as descriptive art direction; do not generate images, CSS, components, Builder nodes, or provider requests.
- Treat Media Intelligence as requirements and policy; do not generate, upload, fetch, or silently substitute media.
- Treat Motion Intelligence as behavior language; do not generate animation code, CSS, HTML, JS timelines, choose libraries, or create Builder nodes.
- Treat Creative Providers as optional bounded execution adapters; do not let providers decide strategy, WebsiteSpec, sections, final components, Builder nodes, truth, compliance, mapper output, renderer parity, or critique.
- Treat Component Engine output as selectable component metadata only; Composition Engine owns final page order and section composition.
- Treat Composition Engine output as page-journey metadata only; Compiler now carries it into mapper-ready plan metadata.
- Treat WebsiteSpec as the canonical pre-Compiler contract; do not bypass it when implementing Mapper contracts.
- Treat Compiler output as mapper-ready plan metadata only; Mapper still owns Builder-native conversion later.
- Treat Builder Blueprint output as mapper-ready editable blueprint metadata only; it must not write to Builder store or canvas.
- Treat Builder Blueprint native compatibility metadata as intent only; do not execute CommandBus commands until the Mapper phase explicitly allows it.
- Treat Native Builder Mapper output as inert mapping-plan metadata by default; Phase 32 execution helpers must hard-block while `MAPPER_EXECUTION_ENABLED` is false.
- Treat Creative Library recipes as metadata only; Component Engine selects intent, Creative Library provides recipe variants, Composition Engine arranges recipes, Builder Blueprint expands recipes, and Mapper maps native intent.
- Keep feature flags default off.
- `ai-v9` remains unchanged.
- Application code remains unchanged outside Website Engine foundation modules.
- Do not implement production generation or builder wiring.
- Phase 41 may add an internal preview harness using shadow artifacts; it must not route production traffic, replace `ai-v9`, change rendering behavior, execute Mapper by default, apply repairs, or change Builder behavior until explicitly approved.
- Keep production routes on current behavior.
- Continue fixture-based coverage across real estate, healthcare, restaurant, education, automotive, hospitality, interior design, D2C, professional services, manufacturing, technology, NGO, and government contexts.

## Risks To Track

- Existing generated pages can look premium in intent but render as placeholders.
- Visual QA cannot be trusted until it evaluates rendered output.
- Any industry can regress into generic SaaS composition if archetypes, section patterns, component patterns, and anti-patterns are not typed.
- Preview/published parity must be enforced before large-scale generation is trusted.
- Overfitting to real estate would undermine the Website Operating System vision.

## Documentation Maintenance Rule

Every implementation PR that touches Website Engine behavior must update at least one of: module doc, specification doc, phase file, ADR, developer log, or changelog.
