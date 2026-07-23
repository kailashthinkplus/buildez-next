import assert from "node:assert/strict";
import test from "node:test";
import { instrumentTsxSource } from "./instrumentTsx";
import { patchElementSource } from "./sourcePatches";
import { validateBuilderBridgeMessage } from "./contracts";
import { imageRequestNeedsClarification } from "../../ai-v12/imageIntent";
import { createBuilderRuntimeScript } from "./runtimeScript";

const source = `export function Hero(){return <main><h1 className="hero">Hello</h1><img src="/hero.jpg" /></main>}`;

test("stable element identities survive ordinary text changes", () => {
  const first = instrumentTsxSource(source, "src/Hero.tsx", 4);
  const second = instrumentTsxSource(source.replace("Hello", "Welcome"), "src/Hero.tsx", 5);
  const ids = (value: string) => [...value.matchAll(/data-buildez-id="([^"]+)"/g)].map(match => match[1]);
  assert.deepEqual(ids(first), ids(second));
  assert.match(first, /data-buildez-source-file="src\/Hero.tsx"/);
  assert.match(first, /data-buildez-capabilities="[^"]*text/);
});

test("bridge rejects stale sessions and unknown messages", () => {
  assert.equal(validateBuilderBridgeMessage({ version: 1, sessionId: "right", type: "BUILDEZ_ELEMENT_SELECTED", payload: {} }, { sessionId: "right", direction: "to-builder" }), true);
  assert.equal(validateBuilderBridgeMessage({ version: 1, sessionId: "stale", type: "BUILDEZ_ELEMENT_SELECTED", payload: {} }, { sessionId: "right", direction: "to-builder" }), false);
  assert.equal(validateBuilderBridgeMessage({ version: 1, sessionId: "right", type: "UNKNOWN", payload: {} }, { sessionId: "right", direction: "to-builder" }), false);
});

test("source-backed text and attribute patches resolve exact JSX anchors", () => {
  const parsedAnchor = source.indexOf("<h1");
  const text = patchElementSource(source, "src/Hero.tsx", String(parsedAnchor), { operation: "text", value: "Source backed" });
  assert.match(text, />Source backed<\/h1>/);
  const styled = patchElementSource(source, "src/Hero.tsx", String(parsedAnchor), { operation: "attribute", name: "className", value: "updated" });
  assert.match(styled, /className="updated"/);
  assert.doesNotMatch(styled, /className="hero"/);
});

test("a stale source anchor fails instead of editing a different node", () => {
  assert.throws(() => patchElementSource(source, "src/Hero.tsx", "99999", { operation: "text", value: "Wrong" }), /stale or unsupported/);
});

test("underspecified image requests pause for clarification", () => {
  assert.equal(imageRequestNeedsClarification("Generate an image"), true);
  assert.equal(imageRequestNeedsClarification("Generate a wide luxury skincare hero image with amber bottles and warm sunlight"), false);
});

test("editor runtime tolerates an empty iframe referrer", () => {
  const runtime = createBuilderRuntimeScript("session");
  assert.match(runtime, /document\.referrer\?new URL\(document\.referrer\)\.origin:""/);
  assert.match(runtime, /__buildez_parent_origin/);
  assert.doesNotMatch(runtime, /PARENT_ORIGIN=new URL\(document\.referrer\)/);
});

test("overlay geometry does not create a mutation-observer feedback loop", () => {
  const runtime = createBuilderRuntimeScript("session");
  assert.match(runtime, /requestAnimationFrame\(refresh\)/);
  assert.match(runtime, /data-buildez-overlay/);
  assert.match(runtime, /attributeFilter:\["class","src","hidden"\]/);
  assert.doesNotMatch(runtime, /new MutationObserver\(refresh\)/);
});
