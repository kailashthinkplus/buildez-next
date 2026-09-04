import assert from "node:assert/strict";
import test from "node:test";
import { instrumentTsxSource } from "./instrumentTsx";
import { patchElementSource, patchElementSources } from "./sourcePatches";
import { validateBuilderBridgeMessage } from "./contracts";
import { imageRequestNeedsClarification } from "../../ai-v12/imageIntent";
import { createBuilderRuntimeScript } from "./runtimeScript";
import { normalizeGeneratedReactEffects } from "../project-workspace/reactSourceSafety";
import {
  projectManifestHasPageRoute,
  resolvePageCanvasState,
} from "../pageCanvasState";

const source = `export function Hero(){return <main><h1 className="hero">Hello</h1><img src="/hero.jpg" /></main>}`;

test("stable element identities survive ordinary text changes", () => {
  const first = instrumentTsxSource(source, "src/Hero.tsx", 4);
  const second = instrumentTsxSource(source.replace("Hello", "Welcome"), "src/Hero.tsx", 5);
  const ids = (value: string) => [...value.matchAll(/data-buildez-id="([^"]+)"/g)].map(match => match[1]);
  assert.deepEqual(ids(first), ids(second));
  assert.equal(new Set(ids(first)).size, ids(first).length);
  assert.match(first, /data-buildez-source-file="src\/Hero.tsx"/);
  assert.match(first, /data-buildez-capabilities="[^"]*text/);
});

test("a blank selected page never reveals another route while generation runs", () => {
  const manifest = {
    pages: [{ route: "/", sourceFile: "src/pages/HomePage.tsx" }],
  };
  const hasNewPageRoute = projectManifestHasPageRoute(manifest, "new-page");

  assert.equal(hasNewPageRoute, false);
  assert.equal(resolvePageCanvasState({
    workspaceLoaded: true,
    pageId: "new-page-id",
    hasProjectRoute: hasNewPageRoute,
    agentRunning: false,
  }), "blank");
  assert.equal(resolvePageCanvasState({
    workspaceLoaded: true,
    pageId: "new-page-id",
    hasProjectRoute: hasNewPageRoute,
    agentRunning: true,
  }), "generating");
});

test("React Three Fiber primitives are not instrumented as DOM elements", () => {
  const threeSource = `
    import { Canvas } from "@react-three/fiber";
    export function Scene() {
      return <div className="stage"><Canvas><group data-buildez-id="stale"><mesh><boxGeometry /></mesh><fog /></group></Canvas></div>;
    }
  `;
  const instrumented = instrumentTsxSource(threeSource, "src/Scene.tsx", 7);

  assert.match(instrumented, /<div className="stage"[^>]*data-buildez-id=/);
  assert.doesNotMatch(instrumented, /<(?:group|mesh|fog)[^>]*data-buildez-id=/);
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

test("Inspector style values patch canonical JSX style objects", () => {
  const anchor = source.indexOf("<h1");
  const styled = patchElementSource(source, "src/Hero.tsx", String(anchor), { operation: "style", name: "fontSize", value: "48px" });
  assert.match(styled, /style=\{\{ fontSize: "48px" \}\}/);
  const existing = `export function Hero(){return <h1 style={{ color: "red", fontSize: "20px" }}>Hello</h1>}`;
  const updated = patchElementSource(existing, "src/Hero.tsx", String(existing.indexOf("<h1")), { operation: "style", name: "fontSize", value: "32px" });
  assert.match(updated, /color: "red"/);
  assert.match(updated, /fontSize: "32px"/);
  assert.doesNotMatch(updated, /fontSize: "20px"/);
});

test("multiple style patches produce exactly one JSX style attribute", () => {
  const anchor = source.indexOf("<h1");

  const styled = patchElementSources(
    source,
    "src/Hero.tsx",
    String(anchor),
    [
      {
        operation: "style",
        name: "fontSize",
        value: "64px",
      },
      {
        operation: "style",
        name: "fontWeight",
        value: "700",
      },
      {
        operation: "style",
        name: "color",
        value: "red",
      },
      {
        operation: "style",
        name: "lineHeight",
        value: "1.1",
      },
    ],
  );

  assert.equal(
    (styled.match(/\bstyle=/g) ?? []).length,
    1,
  );

  assert.match(
    styled,
    /fontSize: "64px"/,
  );

  assert.match(
    styled,
    /fontWeight: "700"/,
  );

  assert.match(
    styled,
    /color: "red"/,
  );

  assert.match(
    styled,
    /lineHeight: "1.1"/,
  );
});

test("multiple style patches merge with existing JSX styles", () => {
  const existing =
    `export function Hero(){return <h1 style={{ marginTop: "12px", color: "blue", fontSize: "20px" }}>Hello</h1>}`;

  const styled = patchElementSources(
    existing,
    "src/Hero.tsx",
    String(existing.indexOf("<h1")),
    [
      {
        operation: "style",
        name: "fontSize",
        value: "64px",
      },
      {
        operation: "style",
        name: "color",
        value: "red",
      },
      {
        operation: "style",
        name: "lineHeight",
        value: "1.1",
      },
    ],
  );

  assert.equal(
    (styled.match(/\bstyle=/g) ?? []).length,
    1,
  );

  assert.match(
    styled,
    /marginTop: "12px"/,
  );

  assert.match(
    styled,
    /fontSize: "64px"/,
  );

  assert.match(
    styled,
    /color: "red"/,
  );

  assert.match(
    styled,
    /lineHeight: "1.1"/,
  );

  assert.doesNotMatch(
    styled,
    /fontSize: "20px"/,
  );

  assert.doesNotMatch(
    styled,
    /color: "blue"/,
  );
});

test("rich text and media styles remain source-backed", () => {
  const anchor = source.indexOf("<h1");
  const rich = patchElementSource(source, "src/Hero.tsx", String(anchor), { operation: "html", value: "Build <strong>better</strong> websites" });
  assert.match(rich, /Build <strong>better<\/strong> websites/);
  const background = patchElementSource(source, "src/Hero.tsx", String(anchor), { operation: "style", name: "backgroundImage", value: 'url("https://cdn.example/hero.webp")' });
  assert.match(background, /backgroundImage: "url\(\\"https:\/\/cdn\.example\/hero\.webp\\"\)"/);
});

test("typography applies only to the highlighted text range", () => {
  const value = `export function Hero(){return <h1>Hello beautiful world</h1>}`;
  const anchor = value.indexOf("<h1");
  const styled = patchElementSource(value, "src/Hero.tsx", String(anchor), {
    operation: "textStyle",
    name: "color",
    value: "#7c3aed",
    selection: { start: 6, end: 15, text: "beautiful" },
  });

  assert.match(styled, /Hello <span style=\{\{ color: "#7c3aed" \}\}>beautiful<\/span> world/);
  assert.equal((styled.match(/color:/g) ?? []).length, 1);
});

test("multiple inspector typography changes stay scoped to the same highlighted text", () => {
  const value = `export function Hero(){return <h1>Hello beautiful world</h1>}`;
  const selection = { start: 6, end: 15, text: "beautiful" } as const;
  const colored = patchElementSource(value, "src/Hero.tsx", String(value.indexOf("<h1")), {
    operation: "textStyle", name: "color", value: "#7c3aed", selection,
  });
  const styled = patchElementSource(colored, "src/Hero.tsx", String(colored.indexOf("<h1")), {
    operation: "textStyle", name: "fontFamily", value: "Georgia", selection,
  });

  assert.match(styled, /Hello <span style=\{\{ color: "#7c3aed" \}\}><span style=\{\{ fontFamily: "Georgia" \}\}>beautiful<\/span><\/span> world/);
  assert.doesNotMatch(styled, /<h1 style=/);
});

test("highlighted typography can cross nested static text", () => {
  const value = `export function Hero(){return <p>Build <strong>better</strong> websites</p>}`;
  const anchor = value.indexOf("<p>");
  const styled = patchElementSource(value, "src/Hero.tsx", String(anchor), {
    operation: "textStyle",
    name: "fontWeight",
    value: "700",
    selection: { start: 6, end: 20, text: "better website" },
  });

  assert.match(styled, /<strong><span style=\{\{ fontWeight: "700" \}\}>better<\/span><\/strong>/);
  assert.match(styled, /<span style=\{\{ fontWeight: "700" \}\}> website<\/span>s/);
});

test("connected components and child field mappings persist in source", () => {
  const anchor = source.indexOf("<main");
  const connected = patchElementSource(source, "src/Hero.tsx", String(anchor), {
    operation: "connection", source: "products", sourceId: "featured", presentation: "carousel", limit: 6,
  });
  assert.match(connected, /data-buildez-source="products"/);
  assert.match(connected, /data-buildez-source-id="featured"/);
  assert.match(connected, /data-buildez-presentation="carousel"/);
  assert.match(connected, /data-buildez-limit="6"/);
  const childAnchor = source.indexOf("<h1");
  const mapped = patchElementSource(source, "src/Hero.tsx", String(childAnchor), { operation: "field", field: "title" });
  assert.match(mapped, /data-buildez-field="title"/);
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

test("editor runtime installs its message listener before announcing readiness", () => {
  const runtime = createBuilderRuntimeScript("session");
  const listener = runtime.indexOf('addEventListener("message"');
  const ready = runtime.indexOf('post("BUILDEZ_PREVIEW_READY"');

  assert.ok(listener >= 0);
  assert.ok(ready > listener);
});

test("editor runtime reports a highlighted text range to the inspector", () => {
  const runtime = createBuilderRuntimeScript("session");
  assert.match(runtime, /function liveSelectedText\(el\)/);
  assert.match(runtime, /textRange=\{element:el,value:live\}/);
  assert.match(runtime, /textRange=null/);
  assert.match(runtime, /selection\.isCollapsed/);
  assert.match(runtime, /textSelection:selectedText\(el\)/);
  assert.match(runtime, /selectionchange/);
});

test("generated concise React effects cannot return non-cleanup values", () => {
  const unsafe = `function App(){useEffect(() => setOpen(false), [path]);React.useLayoutEffect(() => window.scrollTo(0, 0), [path]);useEffect(() => () => unsubscribe(), [])}`;
  const safe = normalizeGeneratedReactEffects(unsafe, "src/main.tsx");
  assert.match(safe, /useEffect\(\(\) => \{ setOpen\(false\); \}, \[path\]\)/);
  assert.match(safe, /React\.useLayoutEffect\(\(\) => \{ window\.scrollTo\(0, 0\); \}, \[path\]\)/);
  assert.match(safe, /useEffect\(\(\) => \(\) => unsubscribe\(\), \[\]\)/);
});

test("editor runtime reports render crashes to the builder", () => {
  const runtime = createBuilderRuntimeScript("session");
  assert.match(runtime, /BUILDEZ_RUNTIME_ERROR/);
  assert.match(runtime, /unhandledrejection/);
  assert.match(runtime, /event instanceof ErrorEvent/);
});

test("overlay geometry does not create a mutation-observer feedback loop", () => {
  const runtime = createBuilderRuntimeScript("session");
  assert.match(runtime, /requestAnimationFrame\(refresh\)/);
  assert.match(runtime, /data-buildez-overlay/);
  assert.match(runtime, /attributeFilter:\["class","src","hidden"\]/);
  assert.doesNotMatch(runtime, /new MutationObserver\(refresh\)/);
  assert.match(runtime, /parent · /);
  assert.match(runtime, /parentBox/);
  assert.match(runtime, /data-buildez-selected/);
  assert.match(runtime, /outline:2px solid #2563eb/);
});
