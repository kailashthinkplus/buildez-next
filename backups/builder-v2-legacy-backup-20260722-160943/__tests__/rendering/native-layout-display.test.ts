import assert from "node:assert/strict";
import test from "node:test";
import { resolveNativeLayoutDisplay } from "../../core/rendering/renderContract";

test("resolved grid remains authoritative when layout prop is missing", () => {
  assert.equal(resolveNativeLayoutDisplay({ resolvedDisplay: "grid" }), "grid");
});

test("resolved display takes precedence over a conflicting explicit layout prop", () => {
  assert.equal(resolveNativeLayoutDisplay({ resolvedDisplay: "grid", layoutProp: "flex" }), "grid");
});

test("layout prop supplies grid only when resolved display is absent", () => {
  assert.equal(resolveNativeLayoutDisplay({ layoutProp: "grid" }), "grid");
});

test("missing display and layout preserve the established flex widget default", () => {
  assert.equal(resolveNativeLayoutDisplay({}), "flex");
});

test("all supported canonical display values survive unchanged", () => {
  for (const display of ["block", "flex", "grid", "inline-block", "none"] as const) {
    assert.equal(resolveNativeLayoutDisplay({ resolvedDisplay: display, layoutProp: "grid" }), display);
  }
});

test("invalid display values do not override a valid fallback contract", () => {
  assert.equal(resolveNativeLayoutDisplay({ resolvedDisplay: "table", layoutProp: "grid" }), "grid");
  assert.equal(resolveNativeLayoutDisplay({ resolvedDisplay: "table", layoutProp: "table" }), "flex");
});
