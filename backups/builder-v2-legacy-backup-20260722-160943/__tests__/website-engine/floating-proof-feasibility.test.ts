import assert from "node:assert/strict";
import test from "node:test";

import {
  evaluateLayoutFeasibility,
  LayoutArchetypeRegistry,
} from "../../website-engine/layout-archetypes";
import type { RecipeContext } from "../../website-engine/builder-blueprint/recipes";

const feasibility = (estimatedContainerWidth: number, outerTrackAllocation: readonly number[], outerGap: number) =>
  evaluateLayoutFeasibility({
    estimatedContainerWidth,
    outerTrackAllocation,
    outerTrackIndex: outerTrackAllocation.length - 1,
    outerGap,
    innerGap: 12,
    childCount: 3,
    childPadding: 20,
    declaredMinimumCardWidth: 260,
    declaredMinimumTextContentWidth: 220,
  });

function context(maxWidth: string): RecipeContext {
  return {
    input: {
      designResult: {
        layoutProfile: { maxWidth },
        spacingProfile: { sectionY: 88, gutter: 24, gridGap: 20 },
        typographyProfile: { headingFamily: "Inter", bodyFamily: "Inter" },
        colorProfile: {
          background: "#ffffff",
          foreground: "#111111",
          accent: "#315b52",
          muted: "#f3f1ec",
        },
        themeProfile: { radius: 16, shadow: "none" },
      },
    } as unknown as RecipeContext["input"],
    section: {
      id: "trust",
      type: "proof",
      purpose: "Trust proof",
      patternIds: ["trust_band"],
      order: 0,
    },
    sectionNodeId: "section.trust",
    key: "trust",
  };
}

function styleFor(maxWidth: string, id: string) {
  const seeds = LayoutArchetypeRegistry.get("floatingProofSection").compile(context(maxWidth));
  const seed = seeds.find((candidate) => candidate.id === id);
  assert.ok(seed, `Expected ${id}`);
  return seed.style as {
    gridTemplateColumns?: { desktop?: string; tablet?: string; mobile?: string };
  };
}

test("floating proof retains three nested metric tracks only when the content contract is feasible", () => {
  const wide = feasibility(1952, [1.15, 0.85], 48);
  assert.equal(wide.feasible, true);
  assert.equal(wide.selectedTrackCount, 3);
  assert.ok(wide.effectiveContentWidth >= 220);

  const root = styleFor("2000px", "container.archetype.trust");
  const metrics = styleFor("2000px", "container.metrics.trust");
  assert.equal(root?.gridTemplateColumns?.desktop, "1.15fr .85fr");
  assert.equal(metrics?.gridTemplateColumns?.desktop, "repeat(3,1fr)");
});

test("floating proof moves metrics below proof copy when the nested side track is infeasible", () => {
  const nested = feasibility(1072, [1.15, 0.85], 48);
  assert.equal(nested.feasible, false);
  assert.ok(nested.effectiveContentWidth >= 220);

  const fullWidth = feasibility(1072, [1], 0);
  assert.equal(fullWidth.selectedTrackCount, 3);
  assert.ok(fullWidth.effectiveContentWidth >= 220);

  const root = styleFor("wide-editorial", "container.archetype.trust");
  const metrics = styleFor("wide-editorial", "container.metrics.trust");
  assert.equal(root?.gridTemplateColumns?.desktop, "1fr");
  assert.equal(metrics?.gridTemplateColumns?.desktop, "repeat(3,1fr)");
});

test("floating proof deterministically reduces tablet tracks and emits one mobile track", () => {
  const tablet = feasibility(786, [1], 0);
  const mobile = feasibility(342, [1], 0);
  assert.equal(tablet.selectedTrackCount, 2);
  assert.ok(tablet.effectiveContentWidth >= 220);
  assert.equal(mobile.selectedTrackCount, 1);
  assert.ok(mobile.effectiveContentWidth >= 220);

  const first = styleFor("wide-editorial", "container.metrics.trust");
  const second = styleFor("wide-editorial", "container.metrics.trust");
  assert.deepEqual(first, second);
  assert.equal(first?.gridTemplateColumns?.tablet, "repeat(2,1fr)");
  assert.equal(first?.gridTemplateColumns?.mobile, "1fr");
});
