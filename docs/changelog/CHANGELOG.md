# BuildEZ Website Engine Changelog

This changelog tracks durable architecture and implementation changes for the BuildEZ Website Engine. It is intentionally higher-level than developer logs: use it to understand what changed across phases, not every command that was run.

## 2026-07-09

### Added - BSP-16 Builder QA Certification

- Added final Builder QA certification, final release gate, AI readiness certification, and remaining risk register.
- Updated Builder quality score to 84/100 and AI readiness score to 62/100.
- Finalized the Go/No-Go decision for Native Builder Execution, Preview Harness, Streaming Canvas UX, AI Node Actions, production rollout, AI-generated Builder nodes, and Mapper execution.
- Certified engineering readiness as conditional only; production rollout remains no-go.
- Confirmed regression/stress/AI compatibility scaffolds exist but executable/browser QA and manual QA have not run.
- Updated Builder roadmap, release gate checklist, project state, implementation note, and developer log.

### Constraints - BSP-16

- Phase 40A was not started.
- No browser tests are claimed as passed.
- No `ai-v9`, AI generation wiring, Mapper execution, AI Builder node insertion, feature flag changes, or production route changes were made.

### Added - BSP-15 Production Widget Library

- Converted the BSP-13 scaffold widget backlog into registered native Builder widgets.
- Added production widget definitions for accordion/FAQ, tabs, stats/counter, logo cloud, masonry gallery, team, portfolio, timeline/process, feature grid, contact form, social links, carousel, before/after, table, countdown, code block, restricted embed, popup metadata, blog grid, post list, and category list.
- Added `ProductionWidgetView` and updated canvas/runtime premium widget fallback rendering to share the same native production widget renderer.
- Updated widget capability metadata so production widgets declare content/design/advanced/responsive/theme/motion support, serialization requirements, clipboard, undo/redo, runtime parity, and AI readiness.
- Added production widget library/status docs and compile-safe regression specs for production widget contracts and serialization.
- Updated Builder quality score, widget readiness matrix, release gate checklist, project state, implementation note, and developer log.

### Constraints - BSP-15

- AI insertion remains disabled for every widget.
- Restricted embed does not execute scripts or opaque HTML.
- Popup remains metadata-only and gated.
- No `ai-v9`, AI generation wiring, Mapper execution, AI Builder node insertion, feature flag changes, route changes, or opaque HTML/template widgets were added.

### Added - BSP-14 Motion, Premium Builder UX, Fullscreen, and Layers UI Upgrade

- Added fullscreen Builder focus mode with persisted preference, browser fullscreen request where supported, sidebar collapse, header hiding, and Escape exit behavior.
- Modernized Layers with collapsible hierarchy, icons, search, filters, expand/collapse all, hover states, spacing, multi-select metadata, keyboard metadata, and CommandBus-backed ordering.
- Added metadata-only motion inspector groups and presets without adding GSAP, Framer Motion, or runtime animation execution.
- Improved Builder-only selection outline, hover outline, drop indicators, and placeholder styling.
- Added compile-safe regression specs for fullscreen, layers metadata, motion metadata, selection metadata, and canvas placeholders.
- Updated Builder quality score, release gate checklist, project state, implementation note, and developer log.

### Constraints - BSP-14

- No production GSAP execution or runtime animation code was added.
- No test runner is configured; BSP-14 ran typecheck and compile-safe specs only.
- No `ai-v9`, AI generation wiring, Mapper execution, AI Builder node insertion, feature flag changes, or runtime route changes were made.

### Added - BSP-13 Widget & Inspector Modernization

- Added registered widget capability metadata for inspector groups, editable props/styles, responsive fields, serialization requirements, allowed children, theme token fields, clipboard, undo/redo, runtime parity, and AI readiness.
- Added scaffold-only metadata for accordion, tabs, carousel, testimonial, timeline, stats/counter, logo cloud, gallery/masonry, before-after, team, portfolio, form, table, embed/code, map, social links, countdown, and popup/modal.
- Added widget inspector support, serialization support, AI readiness, and modernization summary helpers.
- Added embed/code widget safety policy and kept unsafe JS execution blocked.
- Added compile-safe regression specs for widget capabilities, modernization, inspector support, serialization support, and AI readiness.
- Updated Builder bug database, regression matrix, quality score, release gate checklist, project state, implementation note, and developer log.

### Constraints - BSP-13

- No new scaffold widget was registered as production-ready.
- No opaque HTML/template blobs were created.
- No test runner is configured; BSP-13 ran typecheck and compile-safe specs only.
- No `ai-v9`, AI generation wiring, Mapper execution, AI Builder node insertion, feature flag changes, route changes, or unrelated Builder UI refactors were made.

### Added - BSP-12 Theme Panels, Header/Footer Policy, and Multi-Column Selector

- Added theme token metadata for colors, typography, spacing, radius, shadows, buttons, and section/container defaults.
- Replaced empty Builder colors/settings placeholders with non-empty theme panels backed by existing theme tokens.
- Added CommandBus-backed theme token updates to `blueprint.theme.tokens`.
- Added header/footer editable global section policy metadata and documentation.
- Blocked opaque and AI-generated header/footer output by policy until native editable global sections exist.
- Added shared multi-column presets for 1 column, equal layouts, ratio layouts, and sidebar/content variants.
- Updated ColumnStructurePicker and BuilderShell column application to use shared native column-structure logic.
- Added compile-safe regression specs for theme panels, theme tokens, multi-column selector, and header/footer policy.

### Constraints - BSP-12

- No test runner is configured; BSP-12 ran typecheck and compile-safe specs only.
- Header/footer native editability is policy-scaffolded, not fully implemented.
- No `ai-v9`, AI generation wiring, Mapper execution, AI Builder node insertion, feature flag changes, route changes, or unrelated Builder UI refactors were made.

## 2026-07-08

### Added - BSP-11 Inspector UX Controls

- Upgraded the Builder inspector color picker with hex input, native visual color picker, palette swatches, clear/transparent support, and theme-token-ready metadata.
- Added inspector unit parsing and unit input support for `px`, `%`, `em`, `rem`, `vw`, and `vh`.
- Added visual alignment controls and made widget-defined `alignment` properties renderable through the property renderer.
- Updated applicable Design tab controls to respect active responsive device mode for colors, alignment, dimensions, spacing, and position offsets.
- Preserved hidden/disabled handling for unsupported inspector control types so visible controls have real bindings.
- Added compile-safe regression specs for color picker, unit picker, alignment controls, and dead controls.
- Updated Builder bug database, regression matrix, quality score, release gate checklist, project state, implementation note, and developer log.

### Constraints - BSP-11

- No test runner is configured; BSP-11 ran typecheck and compile-safe specs only.
- Theme token picker UI remains a follow-up even though color controls are token-metadata ready.
- No `ai-v9`, AI generation wiring, Mapper execution, AI Builder node insertion, feature flag changes, route changes, or unrelated Builder UI refactors were made.

### Added - BSP-10 Clipboard, Layers, and Layout Controls

- Added Builder clipboard helpers under `apps/web-app/modules/builder-v2/core/clipboard`.
- Added node copy/paste with subtree cloning, duplicate-safe ids, compatible parent validation, blueprint validation, and CommandBus history preservation.
- Added copy style / paste style with compatible style-field filtering and safe rejection for incompatible style paste.
- Updated clipboard commands to use the shared clipboard helpers without bypassing CommandBus.
- Updated `ReorderNodeCommand` for sibling ordering by direction or index with blueprint validation.
- Added minimal Layers panel up/down reorder controls that execute through CommandBus and preserve selection.
- Updated Design inspector full-width/boxed controls to write concrete layout style values and responsive width updates.
- Added compile-safe regression specs and harnesses for clipboard, style clipboard, layers reorder, and layout controls.
- Updated Builder bug database, regression matrix, quality score, release gate checklist, project state, implementation note, and developer log.

### Constraints - BSP-10

- No test runner is configured; BSP-10 ran typecheck and compile-safe specs only.
- Layers sorting uses a minimal up/down UI hook; full drag sorting remains a later UX enhancement.
- No `ai-v9`, AI generation wiring, Mapper execution, AI Builder node insertion, feature flag changes, route changes, or unrelated Builder UI refactors were made.

### Added - BSP-9 Renderer Parity Fixes

- Added shared rendering helpers under `apps/web-app/modules/builder-v2/core/rendering`.
- Added render contracts, style resolver, responsive resolver, theme resolver, widget resolver, and parity validation.
- Updated Builder canvas and runtime renderer to share core style/container resolution.
- Added native widget parity metadata for page, section, container, column, heading, text, button, image, video, icon, divider, and spacer.
- Expanded compile-safe parity specs for style parity, responsive parity, theme token parity, unsupported widgets, missing assets, preview/publish contract parity, and builder-only overlay leakage.
- Updated Builder bug database, regression matrix, quality score, release gate checklist, project state, implementation note, and developer log.

### Constraints - BSP-9

- No test runner is configured; BSP-9 ran typecheck and compile-safe specs only.
- No route changes were made; preview/publish parity is contract-level pending browser tests.
- No `ai-v9`, AI generation wiring, Mapper execution, AI Builder node insertion, feature flag changes, or unrelated Builder UI refactors were made.

### Added - BSP-8 Responsive Architecture and Inspector Binding Fixes

- Added shared responsive helpers under `apps/web-app/modules/builder-v2/core/responsive`.
- Added responsive base, desktop, tablet, and mobile resolution with inheritance and override reset behavior.
- Updated Design and Advanced inspector tabs to use shared canvas device mode.
- Updated canvas responsive style resolution to use the shared resolver.
- Added property binding registry, validation, and update pipeline under `core/properties`.
- Updated property renderer to hide unsupported property types instead of rendering inert controls.
- Expanded compile-safe responsive and inspector regression specs.
- Updated Builder bug database, regression matrix, quality score, release gate checklist, project state, implementation note, and developer log.

### Constraints - BSP-8

- No test runner is configured; BSP-8 ran typecheck and compile-safe specs only.
- No `ai-v9`, AI generation wiring, Mapper execution, AI Builder node insertion, feature flag changes, or unrelated Builder UI refactors were made.

### Added - BSP-7 Builder Serialization and History Fixes

- Added production Builder validation helpers under `apps/web-app/modules/builder-v2/core/validation`.
- Added safe serialization helpers under `apps/web-app/modules/builder-v2/core/serialization`.
- Added validation for blueprint shape, metadata version, unique node ids, parent/child links, cycles, orphan nodes, allowed hierarchy, unsupported node types, missing defaults, and JSON-safe serialized values.
- Added safe normalization and safe tree repair for missing child references, with unsafe structural repairs reported as errors.
- Replaced placeholder `HistoryManager` with bounded undo/redo history.
- Updated `CommandBus` with validation-backed command acceptance, explicit transaction begin/end, transaction wrapper, atomic transaction undo/redo, and failed-command rollback.
- Wrapped existing compound container/column insert flows in CommandBus transactions so they undo as one user action.
- Expanded compile-safe regression specs for serialization/schema validation, save/reload roundtrip, and history transactions.
- Updated Builder bug database, regression matrix, quality score, release gate checklist, project state, implementation note, and developer log.

### Constraints - BSP-7

- BSP-7 did not modify production routes because the phase prohibited route changes except compile-safe import fixes.
- API-level blueprint save enforcement remains a follow-up integration point.
- No test runner is configured; BSP-7 ran typecheck and compile-safe specs only.
- No `ai-v9`, AI generation wiring, Mapper execution, AI Builder node insertion, feature flag changes, or unrelated Builder UI refactors were made.

### Added - BSP-6 Builder Quality Score & Release Gate Finalization

- Added Builder Stabilization Scorecard, Builder Go/No-Go Decision, Builder Fix Sprint Plan, and Builder Release Gate Checklist.
- Finalized Builder Quality Score at 43/100, strategic AI Compatibility at 42/100, and BSP-5 executable AI contract score at 6/100.
- Finalized release gate criteria for blocker/critical bugs, serialization, history, responsive, inspector, canvas, runtime parity, regression, stress, AI compatibility, quality score, and manual QA.
- Recorded explicit no-go decisions for AI Native Builder Execution, Mapper execution into Builder, AI node insertion, and Preview Harness confidence work until gates pass.
- Approved BSP-7 as the next Builder bug fix sprint for serialization/schema validation and history transactions.

### Constraints - BSP-6

- BSP-6 is score/gate finalization only.
- No Builder bugs were fixed.
- No `ai-v9`, AI generation wiring, Mapper execution, Builder node insertion, Builder runtime behavior, routes, stores, widgets, canvas behavior, runtime rendering, Website Engine behavior, or feature flags changed.

### Added - BSP-5 AI Compatibility Audit & Contracts

- Added metadata-only AI compatibility module under `apps/web-app/modules/builder-v2/ai-compatibility`.
- Added contracts for AI compatibility result, native node capability, widget capability, inspector capability, command capability, regeneration scope, edit safety, compatibility matrix, warnings, and metrics.
- Added `runAICompatibilityAudit()`, capability builders, safety rule builders, validation, and verification helpers.
- Added native widget compatibility coverage for page, section, container, column, heading, text, button, image, video, icon, divider, and spacer.
- Updated Builder AI compatibility documentation, release gate, regression matrix, project state, implementation note, and developer log.

### Constraints - BSP-5

- BSP-5 is metadata/contracts only.
- AI readiness remains blocked; contract score is 6/100.
- No `ai-v9`, AI generation wiring, Mapper execution, Builder node insertion, Builder runtime behavior, routes, stores, widgets, canvas behavior, runtime rendering, Website Engine behavior, or feature flags changed.

### Added - BSP-4 Builder Stress Testing Foundation

- Added compile-safe native Builder stress scenarios under `apps/web-app/modules/builder-v2/__tests__/stress`.
- Added deterministic large blueprint factories for 100, 500, and 1000 node pages, 100 section pages, deep nesting, image-heavy pages, duplicated sections, and AI-shaped native page structures.
- Added metadata stress harness helpers for node count, section count, depth, serialized payload size, command count, history depth, image count, and responsive switch sequences.
- Added performance budget metadata for baseline, large AI, and extreme Builder stress tiers.
- Added stress specs for large blueprints, deep nesting, undo/redo, responsive switching, image-heavy pages, section duplication, drag/drop and zoom metadata, save/reload, and AI-shaped pages.
- Updated stress and regression documentation, project state, implementation notes, and developer log.

### Constraints - BSP-4

- BSP-4 is stress scaffold only.
- No test runner is configured yet; BSP-4 added compile-safe stress specifications rather than executable stress tests.
- No Builder bugs were fixed except compile-only scaffold adjustments.
- No `ai-v9`, Website Engine behavior, Builder runtime behavior, routes, stores, widgets, canvas behavior, runtime rendering, feature flags, AI wiring, Mapper execution, CommandBus production mutation, or Builder node insertion changed.

### Added - BSP-3 Builder Regression Suite Foundation

- Added compile-safe native Builder regression scaffold under `apps/web-app/modules/builder-v2/__tests__/`.
- Added deterministic blueprint fixtures and helper harnesses for assertions, node creation, commands, serialization, inspector bindings, responsive values, widget defaults, and canvas/runtime parity contracts.
- Added initial regression specification files for history transactions, blueprint schema validation, save/reload round-trip, inspector property binding, responsive device values, core widget serialization, canvas/runtime contracts, and native node AI compatibility.
- Added the Builder test tree to `apps/web-app/tsconfig.builder.json` so `pnpm --dir apps/web-app typecheck:builder` validates the scaffold.
- Updated Builder regression documentation, project state, implementation notes, and developer log.

### Constraints - BSP-3

- BSP-3 is regression foundation only.
- No test runner is configured yet; BSP-3 added compile-safe test specifications rather than executable runner tests.
- No Builder bugs were fixed except compile-only scaffold adjustments.
- No `ai-v9`, Website Engine behavior, Builder runtime behavior, routes, stores, widgets, canvas behavior, runtime rendering, feature flags, AI wiring, Mapper execution, CommandBus mutation, or Builder node insertion changed.

### Added - BSP-2 Builder Bug Database Classification & Fix Sprint Planning

- Added documentation-only Builder bug triage for BUG-0001 through BUG-0050.
- Added fix wave planning across structural blockers, editing basics, inspector UX, widget expansion, motion and premium UX, and AI readiness.
- Added Builder fix dependency map, regression matrix, critical path, implementation note, and developer log.
- Identified the top 10 bugs to fix first, AI generation blockers, manual Builder quality blockers, product enhancements, architecture-heavy bugs, and safe deferrals.
- Updated project state to record BSP-2 and set BSP-3 Regression Suite Foundation as the next Builder phase.

### Constraints - BSP-2

- BSP-2 is planning/classification only.
- No Builder bugs were fixed.
- No `ai-v9`, Website Engine behavior, Builder behavior, routes, stores, widgets, canvas, runtime, feature flags, Mapper execution, CommandBus mutation, or Builder node insertion changed.

### Added - BSP-1 Builder Audit

- Added documentation-only native Builder audit artifacts under `docs/builder`.
- Added confirmed bug database entries BUG-0001 through BUG-0030 and additional audit findings BUG-0031 through BUG-0050.
- Added Builder regression plan, stress plan, AI compatibility assessment, quality score, release gate, roadmap, implementation note, and developer log.
- Recorded a failed Builder release gate with Quality Score 43/100 and AI Compatibility 42/100.

### Constraints - BSP-1

- BSP-1 was audit-only.
- No Builder behavior, routes, stores, widgets, canvas, runtime, Website Engine behavior, ai-v9 behavior, feature flags, Mapper execution, CommandBus mutation, or Builder node insertion changed.

### Added - Phase 40 ai-v9 Shadow Comparison

- Added inert Shadow Comparison module under `website-engine/shadow-comparison`.
- Added contracts for `ShadowComparisonInput`, `ShadowComparisonResult`, `V9ShadowArtifact`, `V10ShadowArtifact`, `ShadowComparisonMetric`, category comparisons, `ShadowWinner`, `ShadowWarning`, and `ShadowMetrics`.
- Added ai-v9 and v10 artifact adapters that normalize provided metadata only and mark missing score signals explicitly.
- Added comparison categories for quality, editability, native Builder compatibility, truth and safety risk, renderer parity risk, similarity/diversity, performance risk, and repairability.
- Added conservative winner and rollout readiness recommendation logic.
- Added validation, compile-safe verification, architecture documentation, module documentation, result specification, implementation notes, developer log, and Website Engine barrel export.

### Constraints - Phase 40

- Shadow Comparison remains metadata-only.
- Feature flags remain false.
- No `ai-v9` replacement, `ai-v9` behavior changes, ai-v9 execution, v10 generation, live LLM/API calls, DB/network/MCP/provider calls, Builder mutations, Builder node insertion, Mapper execution, production route wiring, rendering changes, screenshots, publishing, or React/CSS/HTML/JS generation.

### Added - Phase 39 AI v10 Orchestrator

- Added disabled AI v10 Orchestrator module under `website-engine/orchestrator`.
- Added contracts for `AIV10OrchestratorInput`, `AIV10OrchestratorResult`, `PipelineStage`, `PipelineStageResult`, `PipelineArtifact`, `PipelineTrace`, `PipelineGate`, `PipelineExecutionMode`, `PipelineWarning`, and `PipelineMetrics`.
- Added deterministic full-pipeline stage ordering from Planner through Learning.
- Added disabled gate handling for live LLM calls, Mapper execution, Builder store writes, production route wiring, provider execution, persistence, and publish.
- Added metadata-only pipeline runner that runs only the inert Planner, consumes provided artifacts, and records missing downstream work as planned, skipped, or blocked.
- Added orchestrator validation, compile-safe verification, architecture documentation, module documentation, result specification, implementation notes, developer log, and Website Engine barrel export.

### Constraints - Phase 39

- AI v10 Orchestrator remains disabled and inert.
- Feature flags remain false.
- No `ai-v9` replacement, `ai-v9` behavior changes, live LLM/API calls, DB/network/MCP/provider calls, Builder mutations, Builder node insertion, Mapper execution by default, production route wiring, rendering changes, publishing, or React/CSS/HTML/JS generation.

## 2026-07-07

### Added - Phase 38 AI Planner

- Replaced the Planner skeleton with an inert AI Planner contract layer under `website-engine/planner`.
- Added contracts for `PlannerInput`, `PlannerResult`, `PlannerIntent`, `PlannerFact`, `PlannerMissingFact`, `PlannerClarification`, `PlannerPipelinePlan`, `PlannerModulePlan`, `PlannerTrace`, `PlannerWarning`, `PlannerMetrics`, and `PlannerConfidence`.
- Added deterministic helpers for intent interpretation, fact extraction, missing fact collection, clarification planning, pipeline planning, ordered module planning, trace metadata, validation, and verification.
- Added support for optional mocked plan input without live LLM calls.
- Added disabled execution gates for Website Engine feature flag, Mapper execution, Builder store mutation, production wiring, live LLM calls, and DB/network/provider calls.

### Constraints - Phase 38

- Planner remains inert and metadata-only.
- Feature flags remain false.
- No ai-v9 replacement, live LLM/API calls, DB/network/MCP/provider calls, Builder mutations, Mapper execution, production route wiring, WebsiteSpec generation, Builder nodes, or React/CSS/HTML/JS generation.

### Added - Phase 37 Learning Engine

- Replaced the Learning skeleton with metadata-only Learning Engine signal extraction under `website-engine/learning`.
- Added contracts for `LearningInput`, `LearningResult`, `LearningRecord`, `GenerationHistory`, `RankingSignal`, pattern/recipe/fragment/Design DNA/Critic/Repair/Similarity/Self-Play learning signals, `LearningAggregation`, `LearningMetrics`, `LearningWarning`, and `LearningConfidence`.
- Added local generation history metadata, ranking signal extraction, per-module learning signal extractors, aggregation summaries, missing telemetry markers, validation, verification, README, architecture/module/specification documentation, and compatibility `recordGeneration()`.

### Constraints - Phase 37

- Learning remains metadata-only and local/in-memory.
- Feature flags remain false.
- No DB persistence, network, LLM, MCP/provider calls, Builder mutations, Mapper execution, production route wiring, React/CSS/HTML/JS generation, ai-v9 changes, or invented telemetry.

### Added - Phase 36.5 Self-Play Optimization Engine

- Added deterministic metadata-only Self-Play Optimization under `website-engine/self-play`.
- Added contracts for `SelfPlayInput`, `SelfPlayResult`, `OptimizationCandidate`, `OptimizationIteration`, `OptimizationScore`, `OptimizationStoppingReason`, `OptimizationTrace`, `QualityTarget`, `RepairPlanApplication`, `SelfPlayWarning`, `SelfPlayMetrics`, and `SelfPlayConfidence`.
- Added optimization loop helpers, repair-plan application simulation, quality target construction, stopping condition evaluation, optimization trace generation, validation, verification, README, architecture/module/specification documentation, and Website Engine barrel export.
- Added default target score `95`, default max iterations `3`, and stopping rules for target reached, max iterations, no meaningful improvement, missing facts/assets, unrepaired metadata hard failures, and diversity worsening.

### Constraints - Phase 36.5

- Self-play remains metadata-only and deterministic.
- Feature flags remain false.
- No repair application to Builder, Builder nodes, Mapper execution, Builder store writes, rendering, screenshots, production route wiring, React/CSS/HTML/JS generation, ai-v9 changes, DB/network/LLM/MCP/provider calls, or persisted history.

### Added - Phase 36 Repair Engine

- Replaced the Repair skeleton with deterministic metadata-only Repair Engine planning under `website-engine/repair`.
- Added contracts for `RepairInput`, `RepairResult`, `RepairPlan`, `RepairAction`, `RepairTarget`, `RepairPriority`, `RepairHint`, `RepairRule`, `RepairCategory`, `RepairSeverity`, `RepairConfidence`, `RepairMetrics`, and `RepairWarning`.
- Added repair builders for structural, content truth, design, composition, component replacement, creative diversity, similarity reduction, accessibility, SEO, performance, mobile, editability, motion safety, asset readiness, and renderer parity.
- Added metadata-only action types including recipe replacement, fragment replacement, Design DNA retuning, composition ordering, CTA cadence, component variant replacement, trust section addition, placeholder copy removal, missing fact marking, motion reduction, mobile CTA, accessibility fallback, asset requirement, safe asset substitution, SEO requirement, editability binding, and renderer parity warning.
- Added `runRepairEngine()`, `buildRepairPlan()`, `collectRepairHints()`, `prioritizeRepairActions()`, `scoreRepairPlan()`, validation, verification, README, and compatibility wrappers.

### Constraints - Phase 36

- Repair remains metadata-only and deterministic.
- Feature flags remain false.
- No repair application, Builder nodes, Mapper execution, Builder store writes, rendering, screenshots, production route wiring, React/CSS/HTML/JS generation, ai-v9 changes, DB/network/LLM/MCP/provider calls, or persisted history.

### Added - Phase 35.75 Candidate Evolution Engine

- Added deterministic metadata-only Candidate Evolution under `website-engine/evolution`.
- Added contracts for `EvolutionInput`, `EvolutionResult`, `WebsiteCandidate`, `CandidateProfile`, `CandidateMutation`, `CandidateVariant`, `CandidateComparison`, `CandidateRanking`, `CandidateScore`, `CandidateWinner`, `CandidateHistory`, `EvolutionMetrics`, `EvolutionWarning`, and `EvolutionConfidence`.
- Added deterministic generation of five candidate variants before Repair.
- Added mutation dimensions for hero recipe, recipe family, fragment selection, Design DNA weighting, typography rhythm, spacing rhythm, layout rhythm, motion rhythm, CTA cadence, composition ordering, visual density, media strategy, grid philosophy, and asymmetry level.
- Added candidate comparison, weighted scoring, deterministic ranking, winner selection, runner-up preservation, repair priority generation, validation, verification, README, architecture/module/specification documentation, and Website Engine barrel export.

### Constraints - Phase 35.75

- Candidate Evolution remains metadata-only and deterministic.
- Feature flags remain false.
- No Builder nodes, Mapper execution, Builder store writes, rendering, screenshots, production route wiring, React/CSS/HTML/JS generation, ai-v9 changes, DB/network/LLM/MCP/provider calls, or persisted history.

### Added - Phase 35.5 Similarity & Diversity Engine

- Added deterministic metadata-only Similarity & Diversity Engine under `website-engine/similarity`.
- Added contracts for `SimilarityInput`, `SimilarityResult`, `WebsiteSimilarityProfile`, `SimilarityComparisonTarget`, `SimilarityScore`, `SimilarityDimension`, `SimilarityIssue`, `SimilarityWarning`, `DiversityScore`, `DiversityRecommendation`, `DiversityPenalty`, `SimilarityMetrics`, and `SimilarityConfidence`.
- Added profile extraction from WebsiteSpec, WebsiteDNA, Design DNA, Creative Library, Recipe Fragments, Component, Composition, Compiler, Builder Blueprint, Mapper, and Critic metadata.
- Added dimension comparers for Design DNA similarity, recipe overlap, fragment overlap, component overlap, section-order similarity, layout rhythm, motion rhythm, typography rhythm, CTA cadence, visual density, industry/archetype repetition, and Creative Library family repetition.
- Added diversity thresholds, penalties, recommendations, repair hints, validation, verification, README, architecture/module/specification documentation, and Website Engine barrel export.

### Constraints - Phase 35.5

- Similarity remains metadata-only and deterministic.
- Feature flags remain false.
- No history persistence, rendering, screenshots, Mapper execution, Builder store writes, Builder node creation, Builder behavior changes, production route wiring, React/CSS/HTML/JS generation, ai-v9 changes, DB/network/LLM/MCP/provider calls, or generated website output.

### Added - Phase 35 Critic Engine

- Replaced the old Critic skeleton with a deterministic metadata-only Critic Engine under `website-engine/critic`.
- Added contracts for `CriticInput`, `CriticResult`, `WebsiteEvaluation`, `CriticCategory`, `CriticScore`, `CriticIssue`, `CriticWarning`, `CriticRecommendation`, `CriticHardFailure`, `QualityGate`, `QualityGateResult`, `CriticMetrics`, and `CriticConfidence`.
- Added category critics for visual hierarchy, typography, spacing, composition, Design DNA consistency, Creative Library diversity, content truth, conversion quality, accessibility, SEO, performance risk, mobile quality, editability, renderer parity, industry fit, asset readiness, and motion/accessibility risk.
- Added quality gates for 85+ preview readiness, 90+ publish recommendation, below-85 repair requirement, and hard-failure publish blocking.
- Added hard-failure detection for placeholder/fake claim metadata, missing primary CTA on conversion pages, unsupported widgets, opaque HTML/blob-like output, missing mobile plan, severe accessibility risk, missing required assets without substitution policy, renderer parity blockers, non-editable sections, and repeated near-identical recipe use.
- Added `runCriticEngine()`, `runCritic()`, `evaluateWebsite()`, `validateCriticInput()`, `validateCriticResult()`, and `runCriticVerification()`.

### Constraints - Phase 35

- Critic remains metadata-only and deterministic.
- Feature flags remain false.
- No rendering, screenshots, Mapper execution, Builder store writes, Builder behavior changes, production route wiring, React/CSS/HTML/JS generation, ai-v9 changes, DB/network/LLM/MCP/provider calls, or generated website output.

### Added - Phase 35A Design DNA & Recipe Fragment Engine

- Added Design DNA contracts and deterministic generation under `creative-library/dna`.
- Added required Design DNA axes for grid, whitespace, asymmetry, hierarchy, typography, image crop, media ratio, card ratio, radius, shadow, border, depth, glass, background, CTA, section rhythm, scroll rhythm, motion rhythm, editorial, luxury, and density.
- Added deterministic diversity seed and Design DNA scoring, validation, and verification.
- Added Creative Fragment contracts and a 240-fragment metadata-only catalog under `creative-library/fragments`.
- Added fragment families for layout, grid, spacing, typography, background, media, CTA, motion, interaction, scroll, card, navigation, proof, form, footer, responsive, and accessibility.
- Added fragment compatibility, scoring, selection, recipe assembly plans, validation, and verification.
- Exposed `buildDesignDNA()`, `buildFragmentCatalog()`, `assembleCreativeRecipe()`, and `runCreativeLibraryWithFragments()` without breaking the existing Creative Library API.

### Constraints - Phase 35A

- Design DNA and Recipe Fragments remain metadata-only.
- Feature flags remain false.
- No ai-v9 changes, Builder behavior changes, Builder store writes, production route wiring, Mapper execution, Builder nodes, React/CSS/HTML/JS generation, DB/network/LLM/MCP/provider calls, screenshots, rendered output, or generated media.

### Added - Phase 31A.1 Creative Library Expansion Pack

- Expanded Creative Library from starter catalog size to 559 deterministic metadata-only recipes.
- Added richer recipe metadata fields for layout pattern, grid system, visual hierarchy, whitespace, asymmetry, content density, media ratio, image framing, typography rhythm, CTA prominence, motion suitability, visual complexity, conversion intensity, luxury, editorial, trust, mobile priority, and uniqueness levers.
- Added fragment metadata for layout, media, typography, spacing, motion, CTA, background, and interaction composition.
- Added recipe families for feature, stats, logo cloud, social proof, newsletter, announcement, awards, integrations, ecommerce category, ecommerce product, location, amenities, floor plan, menu, reservation, doctor profile, course list, vehicle listing, case study, before/after, lead form, and blog/media.
- Added deterministic diversity helpers: `calculateRecipeDiversityScore()`, `groupRecipesByFamily()`, `selectDiverseCreativeRecipes()`, and `avoidNearDuplicateRecipes()`.
- Strengthened Creative Library validation and verification for catalog size, per-family minimums, duplicate ids, required metadata, fragment arrays, safety boundaries, fake-claim terms, real-estate root prevention, and id naming.

### Constraints - Phase 31A.1

- Creative Library remains metadata-only.
- Feature flags remain false.
- No ai-v9 changes, Builder behavior changes, Builder store writes, production route wiring, Mapper execution, Builder nodes, React/CSS/HTML/JS generation, DB/network/LLM/MCP/provider calls, screenshots, rendered output, or generated media.

### Added - Phase 34 Simulation Engine

- Replaced the old Simulation skeleton with a deterministic metadata-only Simulation Engine under `website-engine/simulation`.
- Added contracts for `SimulationInput`, `SimulationResult`, `SimulationIssue`, `SimulationWarning`, `SimulationMetrics`, `ViewportSimulationResult`, `ResponsiveSimulationResult`, `AccessibilitySimulationResult`, `SEOSimulationResult`, `PerformanceSimulationResult`, `ConversionSimulationResult`, `AssetSimulationResult`, `EditabilitySimulationResult`, `ParitySimulationResult`, and `SimulationScore`.
- Added deterministic helpers for viewport, responsive, accessibility, SEO, performance, conversion, asset, editability, parity, scoring, input validation, result validation, and compile-safe verification.
- Added EngineResult entry point `runSimulationEngine()` and compatibility `runSimulation()` result builder.
- Updated Simulation README, implementation documentation, developer log, project state, changelog, and Website Engine barrel exports.

### Constraints - Phase 34

- Simulation is metadata-only and deterministic.
- Feature flags remain false.
- No rendering, screenshot capture, browser automation, Builder store mutation, automatic Mapper execution, route wiring, renderer/canvas changes, ai-v9 changes, DB/network/LLM/MCP/provider calls, or visual output changes.

### Added - Phase 33 Renderer and Preview/Published Parity Contracts

- Added metadata-only Renderer Parity module under `website-engine/renderer-parity`.
- Added contracts for `RenderTarget`, `RendererParityInput`, `RendererParityResult`, `RendererParitySnapshot`, `RendererParityRule`, `RendererParityIssue`, `RendererParityMetrics`, and `RendererParityWarning`.
- Added target matrix support for Builder canvas, preview, published page, and export/runtime.
- Added metadata-only helpers for parity snapshots, snapshot comparison, parity rules, validation, metrics, and compile-safe verification.
- Added checks for unsupported widget types, missing responsive metadata, missing style bindings, missing assets, missing motion metadata, mapper compatibility gaps, target coverage, and side-effect safety.
- Exported the module from the Website Engine barrel and updated project documentation.

### Constraints - Phase 33

- Renderer Parity is metadata-only.
- Feature flags remain false.
- No production renderer changes, canvas behavior changes, route wiring, Builder store writes, Mapper execution, screenshots, rendering, ai-v9 changes, DB/network/LLM/MCP/provider calls, or visual output changes.

### Added - Phase 32 Mapper Execution Behind Disabled Feature Flag

- Added disabled-flag-only mapper execution helpers under `website-engine/mapper`.
- Added `MAPPER_EXECUTION_ENABLED = false` to the Website Engine SDK feature flags.
- Added `executeNativeBuilderMappingPlan()` to validate Native Builder mapping plans and hard-block execution while the feature flag is false.
- Added inert materialization helpers for native Builder-compatible nodes, native command objects, property mappings, style mappings, responsive mappings, and asset mappings.
- Added execution validation and verification helpers proving default mapper execution is blocked and does not mutate Builder store or execute CommandBus commands.
- Updated Mapper README, implementation documentation, developer log, and project state.

### Constraints - Phase 32

- Mapper execution remains disabled by default.
- Feature flags remain false.
- No automatic mapper execution, Builder store writes, CommandBus execution, renderer/canvas changes, production route wiring, Builder behavior changes, React/CSS/HTML/JS generation, ai-v9 changes, DB/network/LLM/MCP/provider calls, or generated website insertion.

### Added - Phase 31A Creative Library / Recipe Repository

- Added metadata-only Creative Library under `website-engine/creative-library`.
- Added contracts for `CreativeRecipe`, `CreativeRecipeId`, `CreativeRecipeFamily`, `CreativeRecipeCategory`, `CreativeRecipeVariant`, `CreativeRecipeMetadata`, `CreativeRecipeRequirement`, `CreativeRecipeCompatibility`, `CreativeRecipeConflict`, `CreativeRecipeResponsiveBehavior`, `CreativeRecipeEditability`, `CreativeRecipeInspectorHint`, `CreativeRecipeCompositionIntent`, `CreativeRecipeFallback`, `CreativeRecipeScore`, `CreativeRecipeCandidate`, `CreativeRecipeSelection`, `CreativeLibraryInput`, `CreativeLibraryResult`, `CreativeLibraryWarning`, and `CreativeLibraryMetrics`.
- Added a starter catalog with 65 metadata-only recipes across hero, gallery, CTA, trust, proof, service, product, FAQ, contact, footer, portfolio, process, comparison, pricing, testimonial, map/location, booking/appointment, and sticky-action families.
- Added deterministic helpers for catalog construction, candidates, scoring, ranking, selection, compatibility, conflicts, requirements, fallbacks, validation, and compile-safe verification.
- Added Creative Library architecture, module, specification, implementation, and developer log documentation.
- Updated Component, Composition, Builder Blueprint, and Mapper READMEs to document integration alignment.

### Constraints - Phase 31A

- Creative Library remains metadata only.
- Feature flags remain false.
- No Builder nodes, rendering, React/CSS/HTML/JS generation, screenshots, generated media, provider calls, MCP calls, database calls, network calls, external service calls, LLM calls, ai-v9 changes, Builder behavior changes, Builder store writes, production route changes, or production wiring.

### Added - Phase 31 Native Builder Mapper Contracts

- Replaced the old mutating mapper skeleton with contract-only Native Builder Mapper planning modules.
- Added contracts for `MapperInput`, `MapperResult`, `NativeBuilderMappingPlan`, `NodeMappingPlan`, `CommandMappingPlan`, `PropertyMappingPlan`, `StyleMappingPlan`, `ResponsiveMappingPlan`, `AssetMappingPlan`, `MapperWarning`, and `MapperMetrics`.
- Added deterministic helpers for native node creation plans, inert command plans, property mapping plans, style mapping plans, responsive mapping plans, asset mapping plans, validation, and compile-safe verification.
- Added validation that all commands are inert, all nodes use supported native widget type intent, all properties use native path intent, style/responsive mappings are explicit, and no PremiumWidgetPreview or opaque HTML/React/CSS output appears.

### Constraints - Phase 31

- Mapper output remains inert mapping-plan metadata only.
- Feature flags remain false.
- No CommandBus execution, Builder store writes, renderer/canvas changes, production route wiring, Builder behavior changes, React/CSS/HTML/JS generation, ai-v9 changes, DB/network/LLM/MCP/provider calls, or generated website insertion.

### Added - Phase 30.6 Native Builder Alignment

- Aligned Builder Blueprint Engine with existing native Builder contracts instead of treating it as a second builder model.
- Added native compatibility layer files: `nativeNodeAdapter.ts`, `nativeWidgetAdapter.ts`, `nativeInspectorAdapter.ts`, `nativeCommandIntent.ts`, and `nativeBlueprintCompatibility.ts`.
- Added contracts for `NativeBuilderNodeIntent`, `NativeWidgetIntent`, `NativeInspectorBindingIntent`, `NativeCommandIntent`, and `NativeBlueprintCompatibilityResult`.
- Added compatibility metadata for existing `BuilderNode`, `BuilderBlueprint`, `NodeType`, `WidgetProperty`, registered native widget types, Inspector property paths, and future CommandBus concepts.
- Extended validation to require native widget intent, native node intent, native inspector/property binding intent, supported primitive widget types, and native compatibility.
- Updated the Builder Blueprint README to clarify that the module is only an AI translation layer into existing Builder-compatible node intent.

### Constraints - Phase 30.6

- Builder Blueprint Engine remains inert translation metadata only.
- Feature flags remain false.
- No Builder behavior changes, Builder store insertion, CommandBus execution, production Mapper, runtime rendering changes, React/CSS/HTML/JS generation, ai-v9 changes, route changes, production wiring, DB/network/LLM/MCP/provider calls, or generated website insertion.

### Added - Phase 30.5 Builder Blueprint Engine with Inspector Blueprint Support

- Added inert local Builder Blueprint Engine under `website-engine/builder-blueprint`.
- Added contracts for `BuilderBlueprintInput`, `BuilderBlueprintResult`, `BuilderBlueprint`, `SectionBlueprint`, `ContainerBlueprint`, `WidgetBlueprint`, `WidgetTreeNode`, `InspectorBlueprint`, `PropertyDefinition`, `ResponsivePropertyDefinition`, `PropertyGroup`, `PropertyBinding`, `EditablePropertyBinding`, `ResponsiveBlueprint`, `ResponsiveBinding`, `StyleBinding`, `MotionBinding`, `WidgetCapabilities`, `SectionCapabilities`, `AIWidgetMetadata`, `RegenerationMetadata`, `BuilderBlueprintValidationResult`, `BuilderBlueprintWarning`, and `BuilderBlueprintMetrics`.
- Added deterministic helpers for component recipe expansion, section/container/widget blueprints, InspectorBlueprint generation, property groups, property definitions, property bindings, editable bindings, responsive bindings, style bindings, motion metadata, widget capabilities, section capabilities, AI metadata, regeneration metadata, validation, and compile-safe verification.
- Added native primitive expansion using only page, section, container, column, heading, text, button, image, video, icon, divider, and spacer blueprint metadata.
- Exported the new inert module from the Website Engine barrel.

### Constraints - Phase 30.5

- Builder Blueprint Engine output remains mapper-ready editable blueprint metadata only.
- Feature flags remain false.
- No Builder store insertion, canvas insertion, Mapper, Renderer, Critic, Repair, Planner, AI orchestration, AI generation, generated websites, Builder behavior changes, React components, CSS, HTML, JS, provider calls, MCP calls, database calls, network calls, external service calls, LLM calls, ai-v9 changes, rendering changes, production route changes, or production wiring.

### Added - Phase 30 WebsiteSpec Builder

- Added deterministic local WebsiteSpec Builder under `website-engine/specification`.
- Added contracts for `WebsiteSpecBuilderInput`, `WebsiteSpecBuilderResult`, `WebsiteSpecBuildExplanation`, `WebsiteSpecBuildMetrics`, `WebsiteSpecBuildWarning`, `SectionSpecBuildInput`, `WebsiteDNAInput`, and `WebsiteDNAResult`.
- Added helpers for SDK `WebsiteSpec`, SDK `WebsiteDNA`, section specs, content requirements, component preferences, forbidden components/patterns, design rules, asset requirements, SEO requirements, accessibility requirements, conversion rules, responsive rules, facts used, missing facts, fallback strategy, validation, verification, versioning, and trace metadata.
- Removed the old planner-shaped, real-estate-specific WebsiteSpec skeleton from the specification module.
- Updated module README, project state, implementation phase doc, developer log, and changelog.

### Constraints - Phase 30

- WebsiteSpec Builder output remains canonical metadata before Compiler.
- Feature flags remain false.
- No Mapper, Renderer, Critic, Repair, Planner, AI orchestration, AI generation, generated websites, Builder nodes, React components, CSS, HTML, JS, provider calls, MCP calls, database calls, network calls, external service calls, LLM calls, ai-v9 changes, builder behavior changes, rendering changes, production route changes, or production wiring.

### Added - Phase 29 Compiler Revisit / Enrichment

- Enriched the inert local Website Compiler under `website-engine/compiler` to consume Decision, Business, Brand, Content, Experience, Pattern, Inspiration, Visual Mood, Media, Motion, Design, Component, Composition, WebsiteSpec, WebsiteDNA, Constraint, Repository, Graph, and feature-flag metadata.
- Extended compiler contracts for creative direction, content roles, experience roles, pattern roles, motion intent, media intent, missing assets, selected business family, selected industry, selected website goal, design tokens, theme intent, upstream engine versions, trace metadata, and richer compiler metrics.
- Added deterministic compiler helpers for assets, creative direction, content roles, quality gates, trace metadata, sections, components, responsive rules, validation, and verification.
- Updated compiler verification to exercise component and composition context while remaining compile-safe and local-only.

### Constraints - Phase 29

- Compiler output remains a mapper-ready plan only.
- Feature flags remain false.
- No Mapper, Renderer, Critic, Repair, Planner, AI generation, generated websites, Builder nodes, React components, CSS, HTML, JS, provider calls, MCP calls, database calls, network calls, external service calls, LLM calls, ai-v9 changes, builder behavior changes, rendering changes, production route changes, or production wiring.

## 2026-07-06

### Added - Phase 28 Composition Engine

- Added inert local Composition Engine under `website-engine/composition`.
- Added contracts for `CompositionInput`, `CompositionResult`, `CompositionPlan`, `CompositionSection`, `CompositionRule`, `SectionOrdering`, `PageRhythm`, `VisualBreathing`, `SectionWeight`, `CTACadence`, `MediaContentAlternation`, `TrustPlacement`, `ConversionJourney`, `ScrollNarrativePlan`, `MobileStackingPlan`, `DensityTransition`, `CompositionConflict`, `CompositionQualityCheck`, `CompositionFallback`, `CompositionConfidence`, `CompositionMetrics`, and `CompositionWarning`.
- Added deterministic helpers for composition plan construction, section ordering, page rhythm, visual breathing, section weights, CTA cadence, media/content alternation, trust placement, conversion journey, scroll narrative, mobile stacking, density transitions, composition rules, conflicts, quality checks, fallbacks, confidence scoring, validation, and compile-safe verification.
- Updated the legacy `runComposition()` wrapper to delegate to `runCompositionEngine()` while remaining metadata-only.

### Constraints - Phase 28

- Composition metadata only.
- Feature flags remain false.
- No Mapper, Renderer, Critic, Repair, Planner, AI generation, generated websites, Builder nodes, React components, CSS, HTML, JS, provider calls, MCP calls, database calls, network calls, external service calls, LLM calls, ai-v9 changes, builder behavior changes, rendering changes, production route changes, or production wiring.

### Added - Phase 27 Component Engine

- Added inert local Component Engine under `website-engine/components`.
- Added contracts for `ComponentInput`, `ComponentResult`, `ComponentVariant`, `ComponentMetadata`, `ComponentCandidate`, `ComponentSelection`, `ComponentFamily`, `ComponentCategory`, `ComponentRequirement`, `ComponentCompatibility`, `ComponentConflict`, `ComponentQualityCheck`, `EditableMappingIntent`, `ComponentFallback`, `ComponentConfidence`, `ComponentMetrics`, and `ComponentWarning`.
- Added metadata-only starter component variants including editorial/product/booking/appointment heroes, trust/proof blocks, galleries, service/menu/course/vehicle matrices, project/product/portfolio showcases, FAQ, final conversion, sticky CTA, founder story, process timeline, comparison, review proof, lead capture, and footer closure variants.
- Added deterministic helpers for catalog construction, candidate scoring, ranking, compatibility, conflict detection, requirements, editable mapping intent, fallbacks, quality checks, confidence scoring, validation, and compile-safe verification.
- Updated the legacy `selectComponents()` wrapper to delegate to `runComponentEngine()` while remaining metadata-only.

### Constraints - Phase 27

- Component selection metadata only.
- Feature flags remain false.
- No Composition Engine, Mapper, Renderer, Critic, Repair, website generation, Builder nodes, React components, CSS, HTML, JS, provider calls, MCP calls, database calls, network calls, external service calls, LLM calls, ai-v9 changes, builder behavior changes, rendering changes, production route changes, or production wiring.

### Added - Phase 26F Creative Provider Abstraction & Higgsfield MCP Strategy

- Added inert local Creative Provider Abstraction under `website-engine/creative-providers`.
- Added contracts for `CreativeProviderId`, `CreativeProviderType`, `CreativeProviderCapability`, `CreativeProviderRequest`, `CreativeProviderResult`, `CreativeProviderSafetyPolicy`, `CreativeProviderFallbackPolicy`, `CreativeProviderAdapter`, `CreativeProviderRegistry`, `CreativeProviderWarning`, `CreativeProviderMetrics`, and `HiggsfieldMcpStrategy`.
- Added metadata-only provider registry entries for `higgsfield-mcp`, `gsap`, `framer-motion`, `three-js`, `spline`, `rive`, `lottie`, `native-motion`, and `future-provider`.
- Added deterministic helpers for provider listing, capability lookup, provider candidate selection, safety policy construction, fallback policy construction, Higgsfield MCP strategy construction, inert provider results, request/result validation, and compile-safe verification.

### Constraints - Phase 26F

- Provider abstraction and metadata only.
- Feature flags remain false.
- No Higgsfield MCP connection, provider execution, MCP calls, network calls, database calls, external service calls, LLM calls, generated images, videos, motion code, CSS, HTML, JS, Builder nodes, ai-v9 changes, builder behavior changes, rendering changes, production route changes, or production wiring.

### Added - Phase 26E Motion Intelligence Engine

- Added inert local Motion Intelligence Engine under `website-engine/motion-intelligence`.
- Added contracts for `MotionInput`, `MotionStrategy`, `MotionLanguage`, `ScrollBehavior`, `RevealStrategy`, `ParallaxStrategy`, `CameraMovement`, `HoverBehavior`, `TransitionBehavior`, `MicroInteractionProfile`, `StickyBehavior`, `PageTransitionProfile`, `MotionPerformanceProfile`, `ReducedMotionProfile`, `MotionRisk`, `MotionConfidence`, `MotionMetrics`, and `MotionWarning`.
- Added deterministic helpers for motion language, scroll behavior, section reveal strategy, parallax strategy, camera movement, hover behavior, transition behavior, micro-interactions, sticky behavior, page transitions, performance profile, reduced-motion profile, risk detection, confidence scoring, validation, and verification.
- Added compile-safe `runMotionVerification()` across real estate, healthcare, restaurant / food and beverage, automotive, education, hospitality, interior / architecture, and D2C contexts.

### Constraints - Phase 26E

- Motion behavior strategy only.
- Feature flags remain false.
- No animation code, CSS generation, HTML generation, JavaScript timelines, animation library selection, GSAP implementation, Framer Motion implementation, Three.js implementation, provider calls, Higgsfield MCP implementation, ai-v9 changes, builder behavior changes, rendering changes, production route changes, database calls, network calls, external service calls, LLM calls, Builder nodes, or production wiring.

### Added - Phase 26D Media Intelligence Engine

- Added inert local Media Intelligence Engine under `website-engine/media-intelligence`.
- Added contracts for `MediaInput`, `MediaStrategy`, `MediaNeed`, `MediaAssetRequirement`, `MediaReadinessScore`, `MediaSubstitutionPolicy`, `MediaTruthPolicy`, `ImageNeed`, `VideoNeed`, `IconNeed`, `MapNeed`, `ThreeDNeed`, `MediaRisk`, `MediaConfidence`, `MediaMetrics`, and `MediaWarning`.
- Added deterministic helpers for media needs, image needs, video needs, icon needs, map needs, 3D/interactive needs, asset requirements, asset readiness, substitution policy, truth policy, media risks, confidence scoring, validation, and verification.
- Added compile-safe `runMediaIntelligenceVerification()` across real estate, healthcare, restaurant / food and beverage, automotive, education, D2C, hospitality, and interior / architecture contexts.

### Constraints - Phase 26D

- Media requirements and policy only.
- Feature flags remain false.
- No image/video generation, asset upload, media fetching, provider calls, Higgsfield MCP implementation, ai-v9 changes, builder behavior changes, rendering changes, production route changes, database calls, network calls, external service calls, LLM calls, Builder nodes, or production wiring.

### Added - Phase 26C Visual Mood Engine

- Added inert local Visual Mood Engine under `website-engine/visual-mood`.
- Added contracts for `VisualMoodInput`, `VisualMoodProfile`, `VisualEmotion`, `LightingProfile`, `CameraLanguage`, `DepthProfile`, `MaterialProfile`, `TextureProfile`, `ContrastProfile`, `AtmosphereProfile`, `ColorTemperatureProfile`, `ImageStyleProfile`, `LuxuryScale`, `EnergyScale`, `RealismScale`, `CinematicScale`, `SeasonalityProfile`, `WeatherProfile`, `VisualMoodConfidence`, `VisualMoodMetrics`, and `VisualMoodWarning`.
- Added deterministic helpers for primary/secondary emotion, lighting, camera language, depth, materials, textures, atmosphere, contrast, color temperature, image style, luxury, energy, realism, cinematic level, seasonality, weather, confidence scoring, validation, and verification.
- Added compile-safe `runVisualMoodVerification()` across real estate, healthcare, restaurant / food and beverage, automotive, education, hospitality, interior / architecture, and D2C contexts.

### Constraints - Phase 26C

- Visual mood metadata only.
- Feature flags remain false.
- No image generation, CSS generation, design generation, Builder nodes, component selection, Media Intelligence, Motion Intelligence, Higgsfield MCP implementation, provider calls, ai-v9 changes, builder behavior changes, rendering changes, production route changes, database calls, network calls, external service calls, LLM calls, or production wiring.

### Added - Phase 26B Inspiration Engine

- Added inert local Inspiration Engine under `website-engine/inspiration`.
- Added contracts for `InspirationInput`, `InspirationProfile`, `InspirationSource`, `InspirationTrait`, `InspirationMatch`, `InspirationScore`, `InspirationRisk`, `InspirationConfidence`, `InspirationMetrics`, and `InspirationWarning`.
- Added deterministic helpers for source construction, trait extraction, profile matching, match scoring, risk detection, profile building, validation, and verification.
- Added starter inspiration metadata categories for Apple-like minimal product storytelling, Stripe-like technical clarity, Linear-like SaaS precision, Airbnb-like trust and warmth, Awwwards-style cinematic editorial, luxury hospitality editorial, automotive performance storytelling, healthcare clarity and reassurance, restaurant sensory storytelling, architecture studio portfolio, premium D2C product storytelling, and education trust and aspiration.
- Added compile-safe `runInspirationVerification()` across real estate, healthcare, restaurant / food and beverage, automotive, education, hospitality, interior / architecture, and D2C contexts.

### Constraints - Phase 26B

- Inspiration metadata only.
- Feature flags remain false.
- No website copying, website fetching, scraping, provider calls, Higgsfield MCP implementation, UI generation, Builder nodes, final component selection, ai-v9 changes, builder behavior changes, rendering changes, production route changes, database calls, network calls, external service calls, LLM calls, or production wiring.

### Added - Phase 26A Creative Intelligence Layer Architecture

- Added documentation-only Creative Intelligence layer after Design Engine.
- Added architecture docs for Creative Intelligence, Inspiration Engine, Visual Mood Engine, Media Intelligence Engine, Motion Intelligence Engine, Creative Provider Abstraction, and Higgsfield MCP Strategy.
- Added module docs and specifications for creative profiles, inspiration, visual mood, media strategy, motion strategy, provider request/result contracts, and Higgsfield strategy.
- Added ADRs confirming BuildEZ owns creative strategy and Higgsfield is an optional provider, not an engine.
- Updated roadmap, lifecycle, design/component docs, glossary, project state, and changelog.

### Constraints - Phase 26A

- Documentation only.
- Feature flags remain false.
- No application code, ai-v9 changes, builder behavior, rendering, production route, provider implementation, Higgsfield MCP implementation, DB, network, external service, LLM, or production wiring changes.

### Added - Phase 26 Design Engine

- Added inert local Design Engine under `website-engine/design`.
- Added deterministic contracts and helpers for `DesignInput`, `DesignResult`, design intent, design language profiles, typography, color, spacing, layout, motion, responsive, density, theme, visual rhythm, interaction, brand adaptation, design tokens, contrast basics, confidence, warnings, metrics, validation, and verification.
- Added deterministic design language profiles for Minimal, Modern, Luxury, Premium, Editorial, Corporate, Creative, Organic, Clinical, Hospitality, Industrial, Fashion, Bold, Playful, Brutalist, Technology, Warm, and Heritage.
- Updated legacy `runDesign()` wrapper to delegate to `runDesignEngine()` while remaining local-only and inert.
- Added compile-safe `runDesignVerification()` across real estate, healthcare, restaurant / food and beverage, automotive, education, D2C/ecommerce, hospitality, and interior/architecture.

### Constraints - Phase 26

- Design Engine only.
- Visual language and token strategy only; no CSS generation, rendering, final components, layouts, Builder nodes, WebsiteSpec Builder, or generation.
- Feature flags remain false.
- No ai-v9 changes.
- No builder behavior, rendering, production route, Planner, Component Engine, Composition Engine, Mapper, Renderer, Critic, Repair, AI generation, database, external service, network, LLM, or production wiring changes.

### Added - Phase 25 Pattern Intelligence Engine

- Added inert local Pattern Intelligence Engine under `website-engine/pattern-intelligence`.
- Added deterministic contracts and helpers for `PatternIntelligenceInput`, pattern candidates, pattern sets, pattern categories, pattern roles, pattern sequences, compatibility, conflicts, scores, explanations, fallbacks, confidence, warnings, metrics, validation, and verification.
- Added local semantic pattern catalog with reusable patterns such as Editorial Hero, Product Value Hero, Booking Hero, Appointment Hero, Trust Band, Proof Stack, Locality Map Narrative, Lifestyle Gallery, Service Matrix, Menu Preview, Course Catalogue Preview, Vehicle Service Matrix, Project Showcase, Product Feature Stack, FAQ Objection Handling, Final Conversion Block, Sticky Mobile CTA, Founder Story, Process Timeline, Portfolio Showcase, Comparison Section, Review Proof Block, Contact Lead Capture, and Footer Trust Closure.
- Added `runPatternIntelligence()` returning `EngineResult<PatternIntelligenceResult>` with selected/rejected semantic patterns, confidence, explanations, decisions, warnings, metrics, and trace metadata.
- Added compile-safe `runPatternIntelligenceVerification()` across real estate, healthcare, restaurant / food and beverage, automotive, education, D2C/ecommerce, hospitality, and interior/architecture.

### Constraints - Phase 25

- Pattern Intelligence only.
- Semantic pattern reasoning only; no templates, component selection, visual design, layouts, Builder nodes, WebsiteSpec Builder, or generation.
- Feature flags remain false.
- No ai-v9 changes.
- No builder behavior, rendering, production route, Planner, Design Engine, Component Engine, Composition Engine, Mapper, Renderer, Critic, Repair, AI generation, database, external service, network, LLM, or production wiring changes.

### Added - Phase 24 Experience Engine

- Added inert local Experience Engine under `website-engine/experience`.
- Added deterministic contracts and helpers for `ExperienceInput`, journey stages, attention curve, trust curve, CTA cadence, proof placement, content density curve, media rhythm, interaction rhythm, scroll narrative, mobile journey, conversion friction points, confidence, warnings, metrics, validation, and verification.
- Added `runExperienceEngine()` returning `EngineResult<ExperienceStrategy>` with confidence, explanations, decisions, warnings, metrics, and trace metadata.
- Added compile-safe `runExperienceVerification()` across healthcare, restaurant / food and beverage, education, automotive, real estate, D2C/ecommerce, hospitality, and interior/architecture.

### Constraints - Phase 24

- Experience Engine only.
- Journey rhythm before Pattern, Design, Component, and Composition engines.
- Feature flags remain false.
- No ai-v9 changes.
- No builder behavior, rendering, production route, Planner, Pattern Intelligence, Design Engine, Component Engine, Composition Engine, Mapper, Renderer, Critic, Repair, WebsiteSpec Builder, AI generation, database, external service, network, LLM, component selection, layout generation, or production wiring changes.

### Added - Phase 23 Content Intelligence Engine

- Added inert local Content Intelligence Engine under `website-engine/content-intelligence`.
- Added deterministic contracts and helpers for `ContentIntelligenceInput`, message hierarchy, headline strategy, section messaging roles, CTA strategy, proof strategy, FAQ strategy, SEO content strategy, trust copy strategy, objection handling, locality content, content truth policy, missing content facts, confidence, warnings, metrics, validation, and verification.
- Added `runContentIntelligence()` returning `EngineResult<ContentStrategy>` with explicit missing content facts, confidence, explanations, decisions, warnings, metrics, and trace metadata.
- Added compile-safe `runContentIntelligenceVerification()` across healthcare, restaurant / food and beverage, education, automotive, real estate, D2C/ecommerce, hospitality, and interior/architecture.
- Preserved the agency-style sequence: Business Intelligence, Brand Intelligence, Content Intelligence, Experience Engine, Pattern Intelligence, Design Engine.

### Constraints - Phase 23

- Content Intelligence only.
- Strategy before copywriting; no final copy generation.
- Feature flags remain false.
- No ai-v9 changes.
- No builder behavior, rendering, production route, Planner, Experience Engine, Pattern Intelligence, Design Engine, Component Engine, Composition Engine, Mapper, Renderer, Critic, Repair, WebsiteSpec Builder, AI generation, database, external service, network, or LLM changes.

### Added - Phase 22 Brand Intelligence Engine

- Added inert local Brand Intelligence Engine under `website-engine/brand-intelligence`.
- Added deterministic contracts and helpers for `BrandIntelligenceInput`, brand identity, personality, voice, tone, emotion, positioning, visual direction, trust model, differentiation, brand risk, asset profile, confidence, warnings, metrics, validation, and verification.
- Added `runBrandIntelligence()` returning `EngineResult<BrandIntelligenceProfile>` with explicit missing brand facts, confidence, explanations, decisions, warnings, metrics, and trace metadata.
- Added compile-safe `runBrandIntelligenceVerification()` across real estate, healthcare, restaurant / food and beverage, automotive, education, hospitality, interior design, D2C, professional services, manufacturing, technology, NGO, and government contexts.
- Updated roadmap guidance so Phase 23 is Content Intelligence before Experience, Pattern, and Design.

### Constraints - Phase 22

- Brand Intelligence only.
- Feature flags remain false.
- No ai-v9 changes.
- No builder behavior, rendering, production route, Planner, Content Intelligence, Experience Engine, Pattern Intelligence, Design Engine, Component Engine, Composition Engine, Mapper, Renderer, Critic, Repair, AI generation, database, external service, network, or LLM changes.

### Added - Phase 21 Business Intelligence Engine

- Added inert local Business Intelligence Engine under `website-engine/business-intelligence`.
- Added deterministic contracts and helpers for `BusinessIntelligenceInput`, `BusinessIdentity`, business/revenue/offer/customer/journey/trust/proof/objection/positioning/locality/compliance profiles, `BusinessConfidence`, warnings, metrics, validation, and verification.
- Added `runBusinessIntelligence()` returning `EngineResult<BusinessIntelligenceProfile>` with explicit missing facts, confidence, explanations, decisions, warnings, metrics, and trace metadata.
- Added compile-safe `runBusinessIntelligenceVerification()` across real estate, healthcare, restaurant / food and beverage, automotive, education, D2C/ecommerce, hospitality, and interior/architecture.
- Added module README and Phase 21 implementation/developer-log docs.

### Constraints - Phase 21

- Business Intelligence only.
- Feature flags remain false.
- No ai-v9 changes.
- No builder behavior, rendering, production route, Planner, Brand, Content, Experience, Pattern, Design, Component, Composition, Mapper, Renderer, Critic, Repair, AI generation, database, external service, network, or LLM changes.

### Added - Phase 20 Architecture Review Gate After Compiler

- Added Architecture Review Gate after Website Compiler contracts.
- Confirmed Mapper should be deferred.
- Updated roadmap to prioritize Business Intelligence, Brand Intelligence, Content Intelligence, Experience, Pattern Intelligence, Design, Component, and Composition engines before Mapper.
- Confirmed Compiler remains contract-only and frozen until upstream intelligence/design/component/composition modules exist.
- Confirmed production behavior remains unchanged.

### Constraints - Phase 20

- Documentation and architecture review only.
- Feature flags remain false.
- No ai-v9 changes.
- No builder behavior, rendering, production route, Mapper, Planner, generation, database, network, external service, or LLM changes.

### Added - Phase 19 Website Compiler Contracts and Local Compilation Plan

- Added local Website Compiler contracts for `CompilerInput`, `CompilerResult`, `CompiledWebsitePlan`, `CompiledSection`, `CompiledComponent`, `CompiledAssetRequirement`, `CompiledResponsiveRule`, `CompiledQualityGate`, `CompilerExplanation`, `CompilerMetrics`, and `CompilerWarning`.
- Added deterministic compiler helpers: `runWebsiteCompiler()`, `compileWebsitePlan()`, `compileSections()`, `compileComponents()`, `compileAssets()`, `compileResponsiveRules()`, `compileQualityGates()`, `validateCompiledWebsitePlan()`, and `collectCompilerMetrics()`.
- Added mapper-ready plan output without Builder nodes, HTML, React components, CSS generation, rendering, or website generation.
- Added compile-safe `runCompilerVerification()`.

### Constraints - Phase 19

- Compiler contracts only.
- Feature flags remain false.
- No ai-v9 changes.
- No builder behavior, rendering, production route, Planner, Mapper, Renderer, Critic, Repair, AI generation, database, network, external service, LLM, or generated website changes.

### Added - Phase 18 Decision Engine

- Added deterministic Decision Engine contracts for `DecisionInput`, `DecisionResult`, `DecisionPlan`, `DecisionExplanation`, `DecisionMetrics`, and `DecisionConfidence`.
- Added deterministic selection helpers for best candidate, pattern set, component families, design language, composition strategy, asset strategy, CTA strategy, SEO strategy, decision plan construction, and metrics.
- Added `DecisionEngine.run()` and `runDecisionEngine()` as the future-facing selection API.
- Added Decision Plan validation and compile-safe `runDecisionVerification()`.
- Kept the existing resolver module for compatibility and marked resolver terminology as deprecated in docs.

### Constraints - Phase 18

- Decision Engine only.
- Feature flags remain false.
- No ai-v9 changes.
- No builder behavior, rendering, production route, Planner, Compiler, Mapper, Renderer, Critic, Repair, AI generation, database, network, external service, or LLM changes.

### Added - Phase 17 Website Engine Reasoning Layer

- Added deterministic Reasoning Engine contracts for `ReasoningInput`, `ReasoningResult`, `ReasoningCandidate`, `CandidateScore`, `CandidateExplanation`, `CandidateSet`, `ReasoningMetrics`, and `ReasoningConfidence`.
- Added candidate-set building across business families, industries, subindustries, website archetypes, patterns, component families, design languages, composition strategies, asset strategies, CTA strategies, SEO strategies, and repair strategies.
- Added deterministic scoring with compatibility, constraint, repository, graph, confidence, and overall score dimensions.
- Added deterministic ranking, candidate explanations, metrics collection, validation, and compile-safe `runReasoningVerification()`.
- Updated legacy reasoning skeleton entry points to delegate to local deterministic reasoning while preserving compatibility exports.

### Constraints - Phase 17

- Reasoning only.
- Feature flags remain false.
- No ai-v9 changes.
- No builder behavior, rendering, production route, Planner, Resolver, Compiler, Mapper, Renderer, Critic, Repair, AI generation, database, external service, network, or LLM changes.

### Added - Phase 16 Constraint Engine Contracts and Local Evaluation

- Added local Constraint Engine contracts for `ConstraintRule`, `ConstraintScope`, `ConstraintSeverity`, `ConstraintViolation`, `ConstraintSuggestion`, `ConstraintEvaluationInput`, `ConstraintEvaluationResult`, and `ConstraintEvaluationContext`.
- Added deterministic local evaluator APIs: `runConstraints()`, `evaluateConstraintRule()`, `evaluateConstraintRules()`, `collectConstraintRulesFromRepository()`, and `collectConstraintRulesFromGraph()`.
- Added starter constraints for fact truth, missing facts, placeholder content, unsupported claims, editability, renderer parity, conversion CTA presence, mobile CTA placement, composition repetition, asset readiness, accessibility, SEO, and industry compliance.
- Added industry-family constraint examples for healthcare, real estate, restaurant / food and beverage, automotive, and education without creating fake business facts.
- Added constraint validation and compile-safe `runConstraintVerification()`.

### Constraints - Phase 16

- Constraint Engine only.
- Feature flags remain false.
- No ai-v9 changes.
- No builder behavior, rendering, production route, Planner, Resolver, Compiler, Mapper, Renderer, Critic, Repair, AI generation, database, external service, or LLM changes.

### Added - Phase 15 Repository-backed Knowledge Graph Contracts and Local Indexing

- Added typed local Knowledge Graph contracts for `GraphNode`, `GraphEdge`, `GraphRelationship`, `GraphNodeType`, `GraphTraversalQuery`, `GraphTraversalResult`, `GraphPath`, and `GraphValidationResult`.
- Added repository-backed graph indexing from local repository records only.
- Added deterministic local graph APIs: `buildKnowledgeGraph()`, `indexRepositoryRecords()`, `getGraphNode()`, `listGraphNodes()`, `listGraphEdges()`, and `traverseGraph()`.
- Added query helpers for compatible archetypes, required patterns, forbidden patterns, asset needs, constraints, QA rules, and path explanations.
- Added graph validation and compile-safe `runGraphVerification()`.
- Replaced the real-estate-only graph fixture export with a repository-backed graph while preserving compatibility exports.

### Constraints - Phase 15

- Knowledge Graph only.
- Feature flags remain false.
- No ai-v9 changes.
- No builder behavior, rendering, production route, Planner, Resolver, Compiler, Mapper, Renderer, Critic, Repair, AI generation, database, external service, or LLM changes.

## 2026-07-05

### Added - Phase 14 Website Repository Records and Fixture Contracts

- Added production-quality local Website Repository record contracts, version metadata, query helpers, registry helpers, validation, and compile-safe verification.
- Added starter repository records for business families, industries, subindustries, archetypes, patterns, components, design languages, tokens, composition rules, constraints, asset rules, QA rules, repair rules, fixtures, examples, and anti-patterns.
- Added safe reusable starter coverage for real estate, healthcare, restaurant / food and beverage, automotive, and education without fake business facts.
- Added contract-only fixture metadata for real estate, healthcare, restaurant, automotive, education, D2C, hospitality, and interior design.
- Verified that real estate is one validation fixture, not the repository root or Website Engine foundation.

### Constraints - Phase 14

- Repository only.
- Feature flags remain false.
- No ai-v9 changes.
- No builder behavior, rendering, production route, Planner, Resolver, Compiler, Mapper, Renderer, Critic, Repair, AI generation, database, or external call changes.

### Added - Phase 13 Website Engine SDK Production Foundation

- Hardened Website Engine SDK contracts.
- Standardized `EngineResult`, `EngineWarning`, `EngineError`, `EngineMetrics`, `EngineTrace`, and subsystem versions.
- Added production-grade SDK type coverage for Website Intelligence profiles, WebsiteSpec, WebsiteDNA, resolver, compiler, simulation, repair, generation history, trace, decisions, and replay.
- Added lightweight SDK validators because Zod is not a project dependency.
- Added SDK schema descriptors, error classes, trace helpers, metadata/version utilities, and compile-safe SDK verification helper.

### Constraints - Phase 13

- SDK-only.
- Feature flags remain false.
- No ai-v9 changes.
- No production route changes.
- No planner, repository logic, resolver, compiler, design engine, generation, builder wiring, rendering, UI, or database migrations.

### Added - Phase 12A Website Intelligence Layer

- Added Website Intelligence Layer docs.
- Added Business Intelligence Engine.
- Added Brand Intelligence Engine.
- Added Content Intelligence Engine.
- Added Experience Engine.
- Added Pattern Intelligence Engine.
- Added Engine Trace System.
- Updated lifecycle and WebsiteSpec positioning so WebsiteSpec is the result of intelligence and reasoning.

### Constraints - Phase 12A

- Documentation-only.
- Application code unchanged.
- Builder behavior unchanged.
- ai-v9 unchanged.

### Added - Phase 11 Website Engine Skeleton

- Added Website Engine SDK skeleton with base types, version metadata, feature flags, trace helpers, error helpers, and placeholder validation.
- Added inert module entry functions for planner, knowledge, graph, repository, reasoning, constraints, resolver, specification, compiler, design, composition, assets, components, mapper, renderer, simulation, critic, repair, learning, and analytics.
- Added module README files documenting purpose, status, placeholder API, dependencies, phase, and safety notes.
- Added repository category and fixture placeholder folders without production generation data.
- Added disabled ai-v10 orchestrator skeleton.
- Made the existing ai-v10 generation entry point fail closed while `AI_V10_ENABLED` is false.

### Constraints - Phase 11

- No ai-v9 refactor.
- No LLM calls.
- No UI.
- No database migrations.
- No runtime rendering changes.
- Feature flags default false.

### Added - Phase 10 Website Engine Core Docs

- Added Website Engine Core architecture docs.
- Added Website Engine SDK docs.
- Added Website Repository docs.
- Added Constraint Engine docs.
- Added Resolver Engine docs.
- Added Website Compiler docs.
- Added Simulation Engine docs.
- Added ai-v9 to ai-v10 migration docs.
- Added Engine Lifecycle docs.
- Added core module docs for SDK, repository, constraints, resolver, compiler, and simulation.
- Added specifications for Engine SDK, repository records, constraints, resolver input/result, compiled plans, simulation, lifecycle trace, and ai-v10 orchestration contract.
- Added ADRs for SDK, repository, constraints, resolver, compiler, simulation-before-preview, and isolated ai-v9 migration.
- Added implementation phases 10-18.

### Constraints - Phase 10

- Documentation-only.
- Application code unchanged.
- Builder behavior unchanged.
- Runtime rendering untouched.
- ai-v9 unchanged and isolated.

### Added - Universal Foundation

- Added universal business ontology architecture.
- Added universal website ontology architecture.
- Added website archetypes as the strategy layer above industry-specific detail.
- Added industry inheritance model for families, industries, and subindustries.
- Added specifications for `BusinessOntology`, `WebsiteOntology`, and `IndustryInheritance`.
- Expanded `WebsiteArchetype` into a universal contract covering lead generation, brochure, corporate, portfolio, ecommerce, catalogue, booking, appointment, marketplace, directory, event, community, NGO, SaaS, documentation, knowledge base, blog/media, landing page, restaurant menu, hotel/resort, property showcase, product launch, recruitment, and investor relations.
- Added ADRs for universal business ontology and website archetypes over hardcoded industry generators.
- Added Phase 09 Universal Foundation implementation plan and developer log.

### Changed - Universal Foundation

- Reframed real estate as one validation fixture, not the foundation of the Website Engine.
- Clarified that BuildEZ must support real estate, healthcare, restaurant, education, automotive, and future industries by composition.

### Constraints - Universal Foundation

- This entry is documentation-only.
- No builder behavior, AI generation behavior, runtime rendering behavior, production Website Engine module, or ai-v9 behavior was intentionally changed.

### Added

- Added the Website Engine Architecture Bible documentation structure.
- Documented BuildEZ as a Website Operating System.
- Established WebsiteSpec as the planning-to-rendering contract.
- Added module contracts for planner, knowledge, graph, reasoning, specification, design, assets, components, composition, mapper, renderer, critic, repair, learning, and analytics.
- Added TypeScript-oriented specification docs for WebsiteSpec, knowledge graph, design tokens, component variants, QA scores, repair plans, and generation history.
- Added ADRs for platform architecture, AI orchestration, WebsiteSpec, knowledge graph, deterministic design, native editable nodes, renderer parity, visual QA, and documentation as a deliverable.
- Added implementation phase plans from architecture foundation through learning engine.

### Constraints

- This entry is documentation-only.
- No builder behavior, AI generation behavior, runtime rendering behavior, or ai-v9 behavior was intentionally changed.

### Next

- Begin Phase 01 by stabilizing current AI output and removing misleading fallback behavior without changing the broader architecture yet.
