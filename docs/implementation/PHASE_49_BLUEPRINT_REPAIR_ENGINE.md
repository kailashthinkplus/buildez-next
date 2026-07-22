# Phase 49 — Deterministic Blueprint Repair Engine

## Scope

RC-15 executes only explicitly approved RC-14 repair recommendations. It does not alter AI generation, prompts, component compiler architecture, serialization format, or rendering. All Blueprint changes are produced by Builder commands and recorded by `CommandBus`.

## Lifecycle

```text
VisualRepairPlan
  → explicit recommendation approval
  → BlueprintRepairPlan
  → compatibility preflight
  → command construction
  → isolated CommandBus validation transaction
  → Blueprint / responsive / serialization gates
  → apply or simulate CommandBus transaction
  → effectiveness score and history metadata
```

An unapproved or untranslatable action is rejected. Simulation and execution clone the source into an isolated bus; the supplied Blueprint is never mutated.

## Commands

- `ReplaceComponentVariantCommand` atomically swaps a section subtree compiled by an existing native component compiler. Compatible content and media props are carried across by primitive role and order.
- `ChangeLayoutPatternCommand` records the approved pattern and updates the native container layout.
- `UpdateDesignTokenCommand` adjusts an existing semantic theme token by a deterministic delta.
- `ReduceContentDensityCommand` removes the final secondary text item from an approved section while preserving parent/child integrity.

Commands participate in one named transaction. Undo restores the normalized pre-repair Blueprint; redo restores the complete repaired transaction. `CommandHistoryMetadata` is JSON serializable.

## Validation gates

Before the result transaction runs, the proposed commands execute in a disposable validation bus. The candidate must pass:

1. native Blueprint schema and hierarchy validation;
2. catalog, component-family, business-family, and native compiler compatibility;
3. mobile width and overflow safety checks;
4. Blueprint serialization validation.

Unknown components, compiler-less replacements, incompatible families, invalid hierarchy, missing required structure, or non-serializable results are rejected without history or partial application. Optional absent media remains absent; the repair engine never creates fake asset URLs.

## Simulation and effectiveness

`mode: "simulate"` returns the candidate Blueprint, CommandBus history, and `RepairEffectivenessScore` without persistence. The development-only Visual Critic route renders this candidate through `PublishedPageRenderer`, alongside before/after visual scores and the approved proposal.

```ts
{
  before: 82,
  after: 91,
  improvement: 9,
  confidence: 0.86,
  accepted: true
}
```

Acceptance requires the deterministic visual score to improve or remain equal. Scores are measured from the actual candidate Blueprint; they are not estimated or inflated.

## Safety boundary

The apply result is an in-memory CommandBus state and repaired Blueprint. Persistence remains the caller's responsibility through the existing Builder save path. Future autonomous repair would still require explicit policy authorization, command execution, validation, and rollback; RC-15 introduces no autonomous loop.
