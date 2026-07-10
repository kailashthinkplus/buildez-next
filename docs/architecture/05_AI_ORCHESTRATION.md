# AI Orchestration

AI orchestration is thin. It should not directly create arbitrary builder nodes, CSS, or unreviewed layouts. It asks the model to classify intent, identify missing facts, draft structured content candidates, and explain uncertainty.

The orchestrator must pass model output through schema validation and engine-owned constraints. On validation failure, it should request correction or fall back to a conservative deterministic path.

Prompt content should shrink as typed knowledge grows. Industry knowledge belongs in machine-readable graph data, not long prompt paragraphs.

## ai-v9 And ai-v10 Boundary

`ai-v9` remains the production/stable generation path until the Website Engine proves parity. It should not be rewritten during core engine development.

Future `ai-v10` should:

- Accept prompts and context.
- Call planner/specification/engine contracts.
- Delegate business, brand, content, experience, and pattern intelligence to Website Engine modules.
- Pass model output through SDK validators.
- Delegate repository lookup, constraints, reasoning, Decision Engine, compiler, mapper, simulation, critic, repair, learning, and analytics to Website Engine modules.
- Preserve fallback to `ai-v9` during shadow and limited rollout.

Future `ai-v10` should not:

- Own repository knowledge.
- Invent arbitrary layouts.
- Generate raw builder nodes directly.
- Bypass constraints, compiler, simulation, or critic.

## Implementation Guidance

Future Codex sessions should treat this document as architectural intent, then confirm current code before editing. Any behavior change must update the relevant module doc, specification, phase checklist, and changelog.
