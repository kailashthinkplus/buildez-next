import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import { aiV12Boundary } from "./ai-v12";
import { builderV3Boundary } from "./builder-v3";
import { normalizeProjectPath } from "./builder-v3/project-workspace/path";
import { createCanvasModeContract, isBuilderV3CanvasMode } from "./builder-v3/canvas";
import { validatePreviewMessage, validatePreviewProjectPaths } from "./builder-v3/preview";

const moduleRoot = path.dirname(new URL(import.meta.url).pathname);

function sourceFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const target = path.join(directory, entry);
    return statSync(target).isDirectory()
      ? sourceFiles(target)
      : /\.(?:ts|tsx)$/.test(entry)
        ? [target]
        : [];
  });
}

function assertNoDependency(directory: string, forbiddenSegment: string) {
  for (const file of sourceFiles(directory)) {
    const source = readFileSync(file, "utf8");
    assert.equal(
      source.includes(forbiddenSegment),
      false,
      `${path.relative(moduleRoot, file)} must not reference ${forbiddenSegment}`
    );
  }
}

test("RC1 creates disabled isolated module boundaries", () => {
  assert.deepEqual(builderV3Boundary, {
    moduleId: "builder-v3",
    boundaryVersion: 1,
    runtimeEnabled: false,
  });
  assert.deepEqual(aiV12Boundary, {
    moduleId: "ai-v12",
    boundaryVersion: 1,
    runtimeEnabled: false,
  });
});

test("Builder 3 has no Builder 2 dependency", () => {
  assertNoDependency(path.join(moduleRoot, "builder-v3"), "builder-v2");
});

test("AI V12 has no AI V11 dependency", () => {
  assertNoDependency(path.join(moduleRoot, "ai-v12"), "ai-v11");
});

test("V12 workspace paths are canonical and traversal-safe", () => {
  assert.equal(normalizeProjectPath("./src\\pages//Home.tsx"), "src/pages/Home.tsx");
  assert.throws(() => normalizeProjectPath("../secrets.env"), /traversal/);
  assert.throws(() => normalizeProjectPath("/etc/passwd"), /Invalid/);
});

test("preview and edit modes render the same canonical TSX project", () => {
  const preview = createCanvasModeContract("preview");
  const edit = createCanvasModeContract("edit");

  assert.equal(preview.renderSource, "canonical-vite-project");
  assert.equal(edit.renderSource, preview.renderSource);
  assert.equal(preview.interactionOverlay, "none");
  assert.equal(edit.interactionOverlay, "source-mapped-editing");
  assert.equal(isBuilderV3CanvasMode("preview"), true);
  assert.equal(isBuilderV3CanvasMode("edit"), true);
  assert.equal(isBuilderV3CanvasMode("blueprint"), false);
});

test("preview sandbox requires a Vite entry and rejects secret paths", () => {
  assert.deepEqual(validatePreviewProjectPaths(["package.json", "index.html", "src/main.tsx"]), ["package.json", "index.html", "src/main.tsx"]);
  assert.throws(() => validatePreviewProjectPaths(["package.json", "index.html", "src/main.tsx", ".env"]), /forbidden/);
  assert.throws(() => validatePreviewProjectPaths(["package.json", "index.html"]), /src\/main.tsx/);
});

test("preview bridge accepts only versioned messages from its session", () => {
  const message = { version: 1, sessionId: "preview-1", type: "preview.ready", payload: {} };
  assert.equal(validatePreviewMessage(message, "preview-1"), true);
  assert.equal(validatePreviewMessage(message, "preview-2"), false);
  assert.equal(validatePreviewMessage({ ...message, type: "run.javascript" }, "preview-1"), false);
});
