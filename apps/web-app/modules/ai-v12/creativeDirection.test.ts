import assert from "node:assert/strict";
import test from "node:test";

import {
  DEFAULT_CREATIVE_DIRECTION,
  parseCreativeDirection,
} from "./creativeDirection";

test("creative direction defaults to photorealistic imagery", () => {
  assert.deepEqual(parseCreativeDirection(undefined), DEFAULT_CREATIVE_DIRECTION);
  assert.equal(parseCreativeDirection("not-json").imageStyle, "Photorealistic");
});

test("creative direction preserves supported choices and bounds audience input", () => {
  const direction = parseCreativeDirection(JSON.stringify({
    designStyle: "Editorial",
    imageStyle: "3D",
    colorMood: "Dark",
    density: "Airy",
    primaryGoal: "Build trust",
    motionStyle: "Immersive parallax",
    audience: `  ${"a".repeat(200)}  `,
  }));
  assert.equal(direction.designStyle, "Editorial");
  assert.equal(direction.imageStyle, "3D");
  assert.equal(direction.colorMood, "Dark");
  assert.equal(direction.density, "Airy");
  assert.equal(direction.primaryGoal, "Build trust");
  assert.equal(direction.motionStyle, "Immersive parallax");
  assert.equal(direction.audience.length, 160);
});

test("unsupported client values fall back safely", () => {
  const direction = parseCreativeDirection({
    designStyle: "Copy competitor",
    imageStyle: "Unknown",
  });
  assert.equal(direction.designStyle, "AI decides");
  assert.equal(direction.imageStyle, "Photorealistic");
});
