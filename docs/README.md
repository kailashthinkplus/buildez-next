# BuildEZ Engineering Documentation

This directory is the source of truth for the BuildEZ Website Engine architecture. It exists so future Codex sessions and human engineers can continue the work without relying on prior chat history.

## Start Here

1. Read [PROJECT_STATE.md](./PROJECT_STATE.md) for the current state, constraints, and next implementation step.
2. Read [architecture/00_VISION.md](./architecture/00_VISION.md) and [architecture/01_CONSTITUTION.md](./architecture/01_CONSTITUTION.md) before changing builder generation behavior.
3. Read [architecture/23_UNIVERSAL_BUSINESS_ONTOLOGY.md](./architecture/23_UNIVERSAL_BUSINESS_ONTOLOGY.md), [architecture/24_UNIVERSAL_WEBSITE_ONTOLOGY.md](./architecture/24_UNIVERSAL_WEBSITE_ONTOLOGY.md), and [architecture/25_WEBSITE_ARCHETYPES.md](./architecture/25_WEBSITE_ARCHETYPES.md) before adding industry behavior.
4. Read [architecture/27_WEBSITE_ENGINE_CORE.md](./architecture/27_WEBSITE_ENGINE_CORE.md), [architecture/28_WEBSITE_ENGINE_SDK.md](./architecture/28_WEBSITE_ENGINE_SDK.md), and [architecture/35_ENGINE_LIFECYCLE.md](./architecture/35_ENGINE_LIFECYCLE.md) before implementing core modules.
5. Read [architecture/36_WEBSITE_INTELLIGENCE_LAYER.md](./architecture/36_WEBSITE_INTELLIGENCE_LAYER.md) before implementing planner, specification, resolver, or repository logic.
6. Read [architecture/07_WEBSITE_SPECIFICATION.md](./architecture/07_WEBSITE_SPECIFICATION.md) before touching any AI, mapping, rendering, QA, or repair workflow.
7. Read the relevant module document under [modules](./modules/) before implementing a module.
8. Update the matching phase file under [implementation](./implementation/) and add a developer log entry for material changes.

## Documentation Map

- `architecture/`: Long-term system architecture, principles, boundaries, and roadmap.
- `modules/`: Operational contracts for each future `modules/builder-v2/website-engine/*` module.
- `specifications/`: Typed domain contracts, with TypeScript interface examples.
- `adr/`: Architecture decision records that explain why the platform is shaped this way.
- `implementation/`: Phase plans with acceptance criteria and rollback plans.
- `developer-logs/`: Daily/feature logs for implementation sessions.
- `changelog/`: Human-readable architecture and implementation change history.

## Non-Negotiables

- Do not modify builder behavior when only updating architecture docs.
- The LLM plans; BuildEZ designs, composes, maps, renders, critiques, repairs, and learns.
- `WebsiteSpec` is the contract between planning and rendering.
- Website Engine SDK owns shared types and validators.
- Repository stores structured reusable intelligence.
- Constraint Engine, Decision Engine, Compiler, Mapper, Simulation, Renderer, Critic, Repair, Learning, and Analytics form the core lifecycle.
- Website Intelligence runs before WebsiteSpec: business, brand, content, experience, and pattern reasoning.
- Engine Trace records decisions for replayability.
- `ai-v9` remains isolated until parity and quality gates prove replacement is safe.
- Generated pages must remain editable as native builder nodes.
- Preview output must equal published output.
- No fake stats, fake testimonials, placeholder content, or generic SaaS layouts for vertical websites.
- Support every industry by composition, not by hardcoded industry-specific generators.
- Real estate is one validation fixture, not the foundation of the engine.
- Documentation is part of every feature.

## Universal Foundation

BuildEZ must compose websites from universal business ontology, website archetypes, section patterns, component patterns, and industry inheritance.

Cross-industry fixture coverage should include:

- Real estate: property showcase and lead generation.
- Healthcare: appointment and brochure.
- Restaurant: menu and booking.
- Education: brochure, admissions, and catalogue.
- Automotive: catalogue, service booking, and lead generation.
