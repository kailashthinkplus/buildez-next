# Phase 47: Visual Critic and Deterministic Repair Planning

## Purpose

RC-13 adds a deterministic critic after RC-12 visual-quality evaluation. It identifies visual risks, explains affected sections or nodes, and produces safe repair recommendations. It does not execute repairs, mutate Blueprints, select components, or change generation behavior.

## Pipeline

```text
Native Builder Blueprint
  + Composition metadata
  + Design Execution Plan
  + Visual Quality Score
        ↓
VisualCriticEngine
        ↓
Critic score + issues + repair priority
        ↓
VisualRepairPlanner
        ↓
Recommendation-only repair metadata
```

Golden preview artifacts now expose composition, design, visual-quality, and critic results together. The production Blueprint remains unchanged.

## Input and output

The critic accepts:

- native Builder Blueprint;
- ordered composition and section-weight metadata;
- Design Execution Plan;
- Visual Quality Score.

It returns:

```ts
{
  score,
  issues,
  recommendations,
  repairPriority,
  metadataOnly: true,
  blueprintMutated: false,
}
```

Every issue includes a stable ID, rule ID, category, severity, message, recommendation, affected section IDs, and affected native node IDs.

## Scoring

The critic begins with the deterministic visual-quality overall score and applies stable severity penalties:

| Severity | Penalty |
| --- | ---: |
| Low | 2 |
| Medium | 7 |
| High | 13 |
| Critical | 22 |

The highest issue severity becomes the repair priority. A page without issues has `none` priority.

## Rules

### Layout

- Detects three or more consecutive grid/card sections.
- Detects insufficient whitespace.
- Detects heroes without a clear heading/action balance.
- Detects weak rhythm and too many equal-weight sections.

### Typography

- Requires one page H1 and section-level H2 hierarchy.
- Detects excessive heading density.
- Detects long paragraphs and undersized body text while excluding semantic labels and microcopy.

### Conversion

- Detects missing primary conversion sections.
- Detects CTA overload.
- Detects conversion blocks placed too early.
- Detects missing trust evidence before conversion.

### Media

- Detects text-led heroes that may need a visual anchor.
- Detects insufficient visual storytelling.
- Detects repeated image sources or patterns.

### Responsive

- Detects fixed-width mobile overflow risk.
- Detects incomplete mobile stacking metadata.
- Detects missing or hidden mobile CTAs.

## Repair recommendation layer

`VisualRepairPlanner` maps findings to metadata-only actions:

- `replace_component_variant`
- `change_layout_pattern`
- `adjust_spacing_tokens`
- `adjust_typography_tokens`
- `adjust_cta_cadence`
- `add_media_slot`
- `adjust_responsive_intent`

Recommendations contain confidence and affected-section metadata. Every recommendation declares `automatic: false`. No Builder command is created and no mutation path is called.

For example, an unbalanced hero may recommend replacing its current variant with `HeroEditorialSplit01`. Repeated grids may recommend an `editorial_split` pattern. These are proposals for a future controlled repair system, not current execution.

## Golden integration

All 52 golden preview artifacts include critic score, issues, recommendations, and repair priority. Tests execute each case twice and require exact critic equality.

Intentional bad fixtures prove detection of:

- three consecutive grids;
- CTA overload and early conversion;
- missing trust;
- broken heading hierarchy;
- missing media;
- mobile overflow.

## Internal debug UI

Development and test environments expose:

```text
/internal/visual-critic/[caseId]
```

The route displays the RC-12 desktop capture, composition/design/visual/critic scores, detected problems, severity, affected sections, and recommendation-only repair actions. Production access is denied by the existing internal-preview gate.

## Future repair automation

A future phase may translate approved recommendations into normal Builder commands. That phase must validate confidence, user intent, structural safety, serialization, hydration, and runtime parity before mutation. RC-13 deliberately stops before that boundary.

## Safety boundaries

RC-13 changes no AI v10 orchestration, OpenAI prompt, Website Engine decision, Blueprint schema, renderer, canvas, serialization, runtime, hydration architecture, or component compiler. Critic evaluation is deterministic, local, metadata-only, and side-effect free.
