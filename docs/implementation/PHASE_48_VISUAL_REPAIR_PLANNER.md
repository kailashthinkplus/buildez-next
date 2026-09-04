# Phase 48 — Intelligent Visual Repair Planner

## Scope

RC-14 upgrades the RC-13 recommendation layer into deterministic, section-level repair planning. It does not change generation, select production components, execute Builder commands, or mutate a Blueprint.

## Pipeline

```text
Visual Quality Score
  → Visual Critic Rules
  → Section Diagnosis
  → Specialized Repair Planners
  → Immutable Repair Plan Metadata
```

The critic input remains the existing native Blueprint, composition plan, design execution plan, and visual quality score. Optional business-family and archetype identifiers improve catalog compatibility scoring without creating a new intelligence layer.

## Section diagnosis

Every section-attributable issue produces an `AffectedSectionDiagnosis` containing:

- section and component variant identifiers;
- issue and severity;
- deterministic confidence;
- a stable violation code;
- the design principle that was violated.

Node-level findings are mapped back to their owning semantic section. Findings such as a completely missing conversion path remain explainable page-level recommendations because no offending section exists.

## Specialized planners

`ComponentReplacementPlanner` ranks existing catalog variants using family compatibility, archetype compatibility, design direction, and registered native-compiler availability. It never invents a variant.

`LayoutRepairPlanner` targets the middle section in a repeated-grid run and recommends an existing editorial, timeline, narrative, rail, or showcase capability.

`ContentDensityPlanner` recommends reducing supporting-copy or heading density while preserving semantic meaning.

Token repairs use established semantic token paths. Current safe recommendations include `spacing.sectionY +12%` and a one-step `typography.h2` scale increase. These values are metadata and are not applied.

## Confidence and explainability

Confidence values are fixed functions of rule certainty and catalog compatibility; there is no random input. Every recommendation contains an instruction and reason list. Component replacements include the current variant, proposed catalog variant, compatibility rationale, and whether a native compiler is already registered.

## Golden benchmark and debug UI

All 52 RC-11 golden preview artifacts include the visual score, critic score, and repair plan. Negative fixtures cover luxury card fatigue, SaaS CTA overload, missing restaurant imagery, healthcare conversion without trust, and automotive pages without a conversion path.

The development-only `/internal/visual-critic/[caseId]` route includes a Repair Plan panel showing the current component, problem, suggestion, reasons, and confidence. It reads the existing RC-12 capture and does not introduce a renderer.

## Safety invariants

- `recommendationOnly` is always `true`.
- `blueprintMutated` is always `false`.
- Recommendations have `automatic: false`.
- No Blueprint command is dispatched.
- No renderer, schema, serialization, compiler, AI prompt, or generation decision is modified.

Future automatic repair must be a separately authorized command-driven phase with validation and rollback. RC-14 deliberately stops at the immutable plan boundary.
