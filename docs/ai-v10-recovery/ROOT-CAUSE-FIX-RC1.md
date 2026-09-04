# AI v10 Root Cause Fix RC-1

## Outcome

RC-1 makes the resolved native style contract authoritative for container display in both Canvas and published runtime. It also removes one adjacent, capture-proven Canvas-only overwrite that assigned flex percentage widths to children of a grid.

No AI generation, archetype selection, component scoring, Blueprint schema, creative enrichment, repair, or responsive resolution behavior changed.

## Precedence

Old Canvas and runtime precedence:

```text
props.layout ?? "flex"
```

The result was then written over `renderStyle.display`. A missing `props.layout` therefore forced flex even when the resolver had produced grid.

New shared precedence:

```text
valid resolved display
  ?? valid explicit props.layout
  ?? established widget default (flex)
```

Supported values are `block`, `flex`, `grid`, `inline-block`, and `none`. Canonical resolved style wins when it conflicts with an explicit legacy layout prop. Invalid values do not enter the rendered contract.

## Files changed

- `core/rendering/renderContract.ts`: shared `resolveNativeLayoutDisplay` contract.
- `canvas/NodeRenderer.tsx`: consumes the shared contract and no longer assigns flex percentage widths to grid children.
- `runtime/PublishedPageRenderer.tsx`: consumes the same shared contract.
- `__tests__/rendering/native-layout-display.test.ts`: precedence and supported-value regression coverage.
- `ai-v10/forensics/forensicTrace.ts`: models the corrected shared contract in diagnostics.
- `__tests__/website-engine/ai-v10-forensic-trace.test.ts`: verifies resolved/renderer display agreement.

## Fixed fixture geometry

Fixture: Sanjeevini Group, deterministic seed `104729`, desktop width `1440px`.

| Surface and node | Before | After |
| --- | ---: | ---: |
| Runtime `container.archetype.section_footer_trust_closure_4` display | flex | grid |
| Runtime `column.proof.section_footer_trust_closure_4` width | 0px | 588.80px |
| Runtime `heading.headline.section_footer_trust_closure_4` width | 0px | 513px |
| Canvas `column.proof.section_footer_trust_closure_4` width | 294.39px | 588.80px |
| Canvas `heading.headline.section_footer_trust_closure_4` width | 294.39px | 513px |
| Canvas `column.metric_1.section_footer_trust_closure_4` width | 45.69px | 137.06px |
| Canvas `heading.metric_1.section_footer_trust_closure_4` width | 5.69px | 97.06px |

Runtime and Canvas now agree exactly on the tested proof-column, headline, metric-card, and metric-heading widths. All captured grid containers whose `props.layout` is absent remain grid. There are no zero-width nodes in any captured Canvas or runtime viewport.

## Nearby fallback audit

- `gridTemplateColumns`: resolved tracks are retained; the existing generated-track value is used only when a grid has no resolved tracks. No change required.
- `flexDirection`, `alignItems`, `justifyContent`, and `gap`: resolved values already precede prop/default fallbacks. No equivalent defect was found.
- container `width`, `minWidth`, and `maxWidth`: resolved constraints already precede defaults. No equivalent defect was found.
- Canvas column width: a second destructive fallback was proven after the display fix. Grid children were assigned `100 / siblingCount %`, causing a one-third-of-one-third shrink. RC-1 now leaves grid item width to CSS grid, matching runtime. Flex-column behavior remains unchanged.

## Remaining anomalies

The RC-1 capture still records content overflow and narrow-content diagnostics that are not caused by display precedence:

- Runtime desktop: 36 overflow observations, 11 narrow-heading observations, and 6 narrow-text observations.
- Runtime tablet: 4 overflow observations and 6 narrow-heading observations.
- Runtime mobile: 1 overflow observation.
- Canvas: 9 desktop, 5 tablet, and 2 mobile overflow observations.

Metric heading content width is now 97.06px on both surfaces rather than 5.69px. That width follows the compiled nested three-track metric layout and 20px card padding; changing that composition is outside RC-1. The remaining observations are preserved in `20-rendered-dom-diagnostics.json` and were not hidden or repaired.

## Evidence

The refreshed artifact directory contains the unchanged stage snapshots, corrected style contract, independent Canvas/runtime DOM geometry, anomaly report, and desktop/tablet/mobile screenshots. Blueprint stage artifacts remain deterministic apart from timestamps, confirming that RC-1 changes rendering only.
