# AI v10 Recovery Root Cause Fix RC-2C

## Scope and result

RC-2C adds compile-time geometry feasibility to `floatingProofSection` only. The compiler now determines whether the proof copy and its three metric cards can coexist in the nested desktop split before it emits responsive grid tracks. No runtime measurement, Blueprint schema, selection, scoring, prompt, renderer, or repair behavior changed.

The fixed Sanjeevini run is available at:

`apps/web-app/test-results/ai-v10-forensic/sanjeevini-group-seed-104729/`

The machine-readable calculation and capture diagnostics are in `archetype-feasibility.json` and `anomaly-provenance.json` in that directory.

## Previous geometry

`compileFloatingProof` always emitted:

- outer desktop grid: `1.15fr .85fr`, gap `48px`;
- metric grid: `repeat(3, 1fr)`, gap `12px`;
- three cards with `20px` horizontal padding on each side.

For the traced 1072px content width:

| Calculation | Previous value |
| --- | ---: |
| Width after outer gap | 1024px |
| Metrics share, `0.85 / 2` | 435.20px |
| Card width, `(435.20 - 24) / 3` | 137.06px |
| Heading content width, `137.06 - 40` | **97.06px** |
| Required heading content width | **220px** |

The CSS was valid, but the nested design was infeasible before rendering began.

## New feasibility contract

`evaluateLayoutFeasibility` accepts the estimated breakpoint width, outer track allocation and gap, inner gap, child count and padding, and declared minimum card/text widths. It returns:

```ts
{
  feasible,
  effectiveTrackWidth,
  effectiveCardWidth,
  effectiveContentWidth,
  selectedTrackCount,
  fallbackReason
}
```

For `floatingProofSection`, the declared minimums are a 260px card and 220px heading-content width. Selection is deterministic and checks track counts from three down to one.

The compiler contract is now:

- Desktop: retain the side-by-side `1.15fr .85fr` split only if all three nested cards satisfy the contract. Otherwise place the metrics below the proof copy and evaluate them against the full content width.
- Tablet: use the full row and select the largest feasible count; the traced estimate selects two tracks.
- Mobile: emit one track.

## Before and after calculations

| Case | Placement | Tracks | Card width | Content width | Result |
| --- | --- | ---: | ---: | ---: | --- |
| Previous 1072px desktop | 435.20px side track | 3 | 137.06px | 97.06px | infeasible |
| RC-2C 1072px desktop | below proof, 1072px | 3 | 349.33px | 309.33px | feasible |
| RC-2C 786px tablet | below proof, 786px | 2 | 387.00px | 347.00px | feasible |
| RC-2C 342px mobile | below proof, 342px | 1 | 342.00px | 302.00px | feasible |
| RC-2C 1952px wide desktop | 809.20px side track | 3 | 261.73px | 221.73px | feasible; split retained |

This uses the smallest existing Builder anatomy: the same section, proof column, metrics container, three editable cards, headings, and labels. Only responsive track emission and desktop placement change.

## Files changed

- `apps/web-app/modules/builder-v2/website-engine/layout-archetypes/layoutFeasibility.ts` — shared pure feasibility calculation and typed result.
- `apps/web-app/modules/builder-v2/website-engine/layout-archetypes/archetypeCompilers.ts` — applies the contract only in `compileFloatingProof`.
- `apps/web-app/modules/builder-v2/website-engine/layout-archetypes/index.ts` — exports the shared utility.
- `apps/web-app/modules/builder-v2/__tests__/website-engine/floating-proof-feasibility.test.ts` — wide, medium, tablet/mobile, and determinism regression coverage.
- `apps/web-app/scripts/analyze-ai-v10-rc2.ts` — records before/after feasibility calculations and Canvas/runtime metric parity evidence.

## Fixed fixture evidence

Seed `104729` regenerated all 10 sections with stable RC-2A provenance and RC-2B anatomy decisions. The current selection correctly assigns `framedCTA` to footer trust closure and `quoteInterlude` to the trust band, so this post-RC-2B run contains zero selected `floatingProofSection` instances. Consequently there are no floating-proof metric headings below 220px in this fixture, and no metric DOM nodes on which to report a non-vacuous Canvas/runtime width delta. The compiler is exercised at the exact 1072px traced width by the dedicated regression test and by `archetype-feasibility.json`.

Footer trust closure and trust band remain native, serialized, editable sections. The final Blueprint contains 146 nodes and 10 sections.

The six requested captures are included:

| Viewport | Runtime | Canvas |
| --- | --- | --- |
| Desktop | ![Runtime desktop](../../apps/web-app/test-results/ai-v10-forensic/sanjeevini-group-seed-104729/desktop.png) | ![Canvas desktop](../../apps/web-app/test-results/ai-v10-forensic/sanjeevini-group-seed-104729/desktop-canvas.png) |
| Tablet | ![Runtime tablet](../../apps/web-app/test-results/ai-v10-forensic/sanjeevini-group-seed-104729/tablet.png) | ![Canvas tablet](../../apps/web-app/test-results/ai-v10-forensic/sanjeevini-group-seed-104729/tablet-canvas.png) |
| Mobile | ![Runtime mobile](../../apps/web-app/test-results/ai-v10-forensic/sanjeevini-group-seed-104729/mobile.png) | ![Canvas mobile](../../apps/web-app/test-results/ai-v10-forensic/sanjeevini-group-seed-104729/mobile-canvas.png) |

## Renderer parity and RC-1 safety

The compiler emits only native responsive `gridTemplateColumns` values. Canvas and runtime continue through the shared resolved-style contract. The focused parity suite confirms that resolved `display: grid` remains authoritative when `props.layout` is absent, supported display values survive, and the established missing-layout default is unchanged. No zero-width or grid-to-flex regression was observed in the regenerated fixture.

## Remaining anomalies

The geometry report still records anomalies outside RC-2C scope:

- two substantive vertical text-overflow observations;
- 35 measurement-rounding/narrow-wrap observations;
- four gallery rail overflow observations, including intentional media overflow.

None is a floating-proof nested-track failure. Per the task boundary, `architecturalProjectShowcase`, `galleryJourney`, FAQ, text measurement, and gallery overflow behavior were not changed.

## Verification

- Archetype and compiler regressions: 9/9 passed.
- Focused rendering and Canvas/runtime parity suite: 25/25 passed.
- Sanjeevini deterministic generation: completed with seed `104729`.
- Runtime captures: desktop, tablet, mobile completed.
- Canvas captures: desktop, tablet, mobile completed.
- Feasibility and anomaly diagnostics: generated.
- `git diff --check`: passed.
- Builder typecheck: the repository-wide command remains red on pre-existing unrelated errors; no RC-2C file remains in the typecheck error output after correcting the new test typings.

## Behavioral confirmation

RC-2C does not change AI generation, Pattern Intelligence, component selection, composition order, archetype selection, copy, repair, responsive resolution, Canvas, runtime rendering, or the Blueprint schema. It only prevents `compileFloatingProof` from emitting a known-infeasible nested track arrangement.
