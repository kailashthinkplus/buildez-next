# Website Engine

The Website Engine is the durable platform namespace planned for `modules/builder-v2/website-engine/`. It owns typed domain knowledge, deterministic decisions, and the conversion from website intent into editable builder output.

Target folders: sdk, planner, knowledge, graph, repository, reasoning, decision, business-intelligence, brand-intelligence, content-intelligence, experience, pattern-intelligence, engine-trace, constraints, resolver compatibility, specification, compiler, design, composition, assets, components, mapper, renderer, simulation, critic, repair, learning, analytics.

Each folder should expose a small public API and keep domain data versioned so future generated pages can be explained and reproduced.

`website-engine` is the product capability. `ai-v10/orchestrator` is glue. `ai-v9` remains isolated until quality, parity, fixtures, fallback, and migration gates are satisfied.

## Implementation Guidance

Future Codex sessions should treat this document as architectural intent, then confirm current code before editing. Any behavior change must update the relevant module doc, specification, phase checklist, and changelog.
