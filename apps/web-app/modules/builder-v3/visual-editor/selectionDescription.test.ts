import assert from "node:assert/strict";
import test from "node:test";

import type { BuilderSelection } from "./contracts";
import { describeBuilderSelection } from "./selectionDescription";

function selection(patch: Partial<BuilderSelection>): BuilderSelection {
  return {
    elementId: "internal-id",
    kind: "element",
    tagName: "div",
    sourceFile: "src/main.tsx",
    sourceAnchor: "42",
    editableCapabilities: [],
    projectRevision: 1,
    bounds: { top: 0, left: 0, width: 100, height: 40 },
    ...patch,
  };
}

test("selection descriptions prioritize visible content and semantic type", () => {
  assert.deepEqual(describeBuilderSelection(selection({ tagName: "h1", textContent: "Software that moves business forward." })), {
    title: "“Software that moves business forward.”",
    type: "Page heading",
  });
});

test("selection descriptions identify common visual components without exposing source identity", () => {
  const description = describeBuilderSelection(selection({ className: "feature-card service-card" }));
  assert.equal(description.title, "Card");
  assert.equal(description.type, "Card");
  assert.doesNotMatch(JSON.stringify(description), /main\.tsx|internal-id/);
});

test("selection descriptions use image alt text", () => {
  assert.deepEqual(describeBuilderSelection(selection({ kind: "image", tagName: "img", attributes: { alt: "Team planning a product launch" } })), {
    title: "“Team planning a product launch”",
    type: "Image",
  });
});
