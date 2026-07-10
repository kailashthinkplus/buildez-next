# Glossary

- Website Operating System: the platform layer that understands, composes, renders, critiques, repairs, and learns websites.
- WebsiteSpec: typed contract between planning and rendering.
- Archetype: reusable website strategy such as lead generation, portfolio, brochure, ecommerce, or booking.
- ComponentVariant: production-ready section or component implementation with metadata.
- Mapper: engine that converts spec and composition into native builder nodes.
- Critic: rendered-output evaluator.
- RepairPlan: typed set of changes intended to fix critic failures.
- AntiPattern: forbidden or discouraged choice for an industry, archetype, or section.
- BusinessFamily: broad business grouping such as healthcare, real estate, food and beverage, education, or automotive.
- Industry: a specific domain inside a business family.
- SubIndustry: a narrower specialization that inherits and overrides industry rules.
- BusinessModel: how an organization operates, such as service, venue, product, marketplace, institution, publisher, portfolio, or nonprofit.
- RevenueModel: how the organization captures value, such as lead, booking, appointment, transaction, subscription, donation, tuition, retainer, or quote.
- CustomerJourney: stages a visitor moves through before conversion.
- TrustModel: proof required for a visitor to believe and act.
- ConversionGoal: desired visitor action such as call, book, buy, apply, donate, download, or request quote.
- LocalityNeed: whether and how geography matters to the site.
- ComplianceNeed: required legal, regulatory, privacy, or claims constraint.
- ContentNeed: required business content fields needed to render truthfully.
- AssetNeed: required visual, document, or media asset needed to support the website.
- SectionPattern: reusable section intent such as hero, service list, inventory grid, menu, FAQ, proof band, or final CTA.
- ComponentPattern: editable implementation pattern that realizes a section pattern.
- IndustryInheritance: family -> industry -> subindustry rule resolution with traceable overrides.
- Website Engine SDK: pure shared contract layer for types, validators, versions, errors, and trace metadata.
- Website Repository: versioned structured knowledge store for families, industries, archetypes, patterns, components, constraints, fixtures, QA rules, repair rules, and anti-patterns.
- Constraint Engine: module that enforces typed rules before rendering.
- ConstraintRule: versioned rule with scope, severity, condition, and repair hint.
- Decision Engine: module that commits ranked reasoning candidates into one coherent Website Strategy.
- DecisionPlan: explainable deterministic Website Strategy selected by the Decision Engine.
- Resolver Engine: deprecated compatibility term for the pre-Phase-18 selection module.
- ResolverResult: deprecated compatibility output shape kept for older skeleton code.
- Website Compiler: module that converts WebsiteSpec and DecisionPlan into a mapper-ready CompiledWebsitePlan.
- CompiledWebsitePlan: fully resolved plan containing sections, components, props, assets, responsive rules, quality gates, and mapper targets.
- Architecture Review Gate: documentation-only checkpoint that decides whether the current foundation is ready for the next implementation phase.
- Compiler Freeze: Phase 20 decision to keep Compiler contract-only until intelligence, design, component, and composition engines enrich upstream inputs.
- Simulation Engine: pre-preview evaluator for structure, mobile, assets, accessibility, SEO, performance, parity, and editability risk.
- EngineLifecycleTrace: ordered trace of every engine stage, versions, warnings, errors, and fallback decisions.
- ai-v10 Orchestrator: future glue layer that calls Website Engine contracts and preserves ai-v9 fallback during migration.
- Website Intelligence Layer: pre-WebsiteSpec engines that understand business, brand, content, experience, and semantic patterns.
- BusinessIntelligenceProfile: resolved company understanding before website structure.
- BrandIntelligenceProfile: brand identity, voice, tone, trust posture, and risks before design.
- ContentStrategy: message hierarchy, CTA/proof/SEO/FAQ strategy, and truth policy before copywriting.
- ExperienceStrategy: journey, attention, trust, CTA cadence, density, media rhythm, and mobile narrative.
- PatternIntelligenceResult: semantic pattern selections, rejections, conflicts, and journey rationale before component selection.
- Creative Intelligence Layer: provider-agnostic art-direction layer after Design Engine and before media, motion, component, and composition execution.
- CreativeIntelligenceProfile: combined inspiration, visual mood, media, motion, and provider policy output.
- InspirationProfile: safe inspiration metadata; it describes creative territory without copying websites.
- VisualMoodProfile: visual art-direction attributes such as emotion, lighting, depth, texture, camera, material, contrast, and image style.
- MediaStrategy: required images, videos, icons, maps, documents, 3D assets, missing assets, fallback policy, and editability requirements.
- MotionStrategy: motion language, pacing, transition intent, parallax intent, reduced-motion policy, and interaction response before implementation.
- CreativeProviderRequest: provider-neutral request for bounded creative execution.
- CreativeProviderResult: provider-neutral result with artifacts, provenance, warnings, and editability requirements.
- Higgsfield MCP Strategy: optional provider strategy for cinematic/media/motion tasks; not a Website Engine source of truth.
- GenerationDecision: traceable decision record for one engine stage.
- GenerationReplay: references needed to reproduce a generation from trace and versions.

Cross-industry examples:

- Real estate: property showcase or lead-generation archetype with project assets, locality, and enquiry CTA.
- Healthcare: appointment archetype with provider credentials, privacy, and medical-claims caution.
- Restaurant: restaurant menu or booking archetype with menu, hours, ambience, location, and reservation CTA.
- Education: brochure or admissions archetype with programs, faculty, outcomes, and application CTA.
- Automotive: catalogue or booking archetype with inventory, warranties, test drive, and service appointment.

Real estate remains an important validation fixture, but it is not the foundation of the engine.

This glossary should grow whenever new engine terms enter implementation.

## Implementation Guidance

Future Codex sessions should treat this document as architectural intent, then confirm current code before editing. Any behavior change must update the relevant module doc, specification, phase checklist, and changelog.
