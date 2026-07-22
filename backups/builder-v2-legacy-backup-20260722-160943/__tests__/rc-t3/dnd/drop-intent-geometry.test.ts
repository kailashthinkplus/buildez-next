import assert from "node:assert/strict";
import test from "node:test";

import {
  resolveNonOverlappingDropEdge,
} from "../../../core/dnd/dropIntentGeometry";

test(
  "normal targets retain the established 12–28px edge behavior",
  () => {
    assert.equal(resolveNonOverlappingDropEdge(100), 20);
    assert.equal(resolveNonOverlappingDropEdge(200), 28);
    assert.equal(resolveNonOverlappingDropEdge(60), 12);
  },
);

test(
  "short zoom-scaled targets never receive overlapping edge zones",
  () => {
    for (const span of [8, 12, 16, 20, 24]) {
      const edge =
        resolveNonOverlappingDropEdge(span);

      assert.ok(
        edge < span / 2,
        `edge ${edge} must remain below half of span ${span}`,
      );

      assert.ok(edge >= 0);
    }
  },
);

test(
  "short targets keep both before and after positions reachable",
  () => {
    const span = 20;
    const edge =
      resolveNonOverlappingDropEdge(span);

    const beforePoint = edge / 2;
    const afterPoint = span - edge / 2;

    assert.ok(beforePoint <= edge);
    assert.ok(afterPoint >= span - edge);
    assert.ok(beforePoint < afterPoint);
  },
);

test("invalid spans resolve safely", () => {
  assert.equal(resolveNonOverlappingDropEdge(0), 0);
  assert.equal(resolveNonOverlappingDropEdge(-10), 0);
  assert.equal(
    resolveNonOverlappingDropEdge(Number.NaN),
    0,
  );
  assert.equal(
    resolveNonOverlappingDropEdge(
      Number.POSITIVE_INFINITY,
    ),
    0,
  );
});
