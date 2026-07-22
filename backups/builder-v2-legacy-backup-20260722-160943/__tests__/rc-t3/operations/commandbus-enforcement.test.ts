import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

test("RC-T3 active Builder store exposes no direct Blueprint replacement action", () => {
  const source = fs.readFileSync(
    path.resolve(process.cwd(), "modules/builder-v2/store/useBuilderStore.ts"),
    "utf8"
  );
  assert.doesNotMatch(source, /setBlueprint\s*\(/);
  assert.match(source, /commandBus\.initialize/);
  assert.match(source, /commandBus\.subscribe/);
});
