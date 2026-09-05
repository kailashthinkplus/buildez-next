import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, writeFile, readFile, stat, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { parseProjectResponse, TruncatedResponseError } from "./projectResponse";
import { executableBinary } from "./executableBinary";
import { routeV12Capabilities, capabilityPlanPrompt } from "./capabilityRouter";
import { immersiveAcceptanceFailures } from "./experienceAcceptance";
const project = [
  { path: "package.json", content: '{"type":"module"}' },
  { path: "index.html", content: '<html><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>' },
  { path: "src/main.tsx", content: 'import App from "./App"; createRoot(document.getElementById("root")).render(<App/>);' },
  { path: "src/App.tsx", content: 'export default function App(){return <h1>Original</h1>}' },
];
const response = (files: unknown[]) => JSON.stringify({ message: "Updated", files });
test("targeted repairs merge before completeness validation", () => {
  const repair = { path: "./src/App.tsx", content: 'export default function App(){return <h1>Repaired</h1>}' };
  const result = parseProjectResponse(response([repair]), true, project);
  assert.equal(result.files.length, 4);
  assert.deepEqual(result.files.find(file => file.path === "index.html"), project[1]);
  assert.equal(result.files.find(file => file.path === "src/App.tsx")?.content, repair.content);
  assert.match(project[3].content, /Original/);
});
test("missing index.html is restored with the actual entry mount", () => {
  const result = parseProjectResponse(response(project.filter(file => file.path !== "index.html").map(file => file.path === "src/main.tsx" ? { ...file, content: file.content.replace('"root"', '"app"') } : file)), true);
  assert.match(result.files.find(file => file.path === "index.html")!.content, /id="app"/);
  assert.match(result.files.find(file => file.path === "index.html")!.content, /src="\/src\/main.tsx"/);
});
test("missing code and unsafe patches still fail", () => {
  assert.throws(() => parseProjectResponse(response(project.filter(file => file.path !== "src/main.tsx")), true), /src\/main.tsx/);
  for (const filePath of ["../escape", ".env", "node_modules/evil.js", ".git/config"]) assert.throws(() => parseProjectResponse(response([{ path: filePath, content: "invalid" }]), true, project));
  assert.throws(() => parseProjectResponse(response([project[0], { ...project[0], path: "./package.json" }]), true), /duplicate/);
  assert.throws(() => parseProjectResponse('{"files":[', true), TruncatedResponseError);
  assert.deepEqual(parseProjectResponse(response([]), false).files, []);
});
test("non-executable installed binaries get a private executable copy", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "buildez-binary-test-"));
  const work = await mkdtemp(path.join(tmpdir(), "buildez-binary-work-"));
  try {
    const source = path.join(dir, "ffprobe");
    await writeFile(source, "binary fixture", { mode: 0o644 });
    const resolved = await executableBinary(source, work);
    assert.equal(resolved, path.join(work, "ffprobe"));
    assert.equal(await readFile(resolved, "utf8"), "binary fixture");
    assert.equal((await stat(resolved)).mode & 0o777, 0o700);
    assert.equal((await stat(source)).mode & 0o777, 0o644);
    assert.equal(await executableBinary(resolved, dir), resolved);
  } finally { await Promise.all([rm(dir, { recursive: true, force: true }), rm(work, { recursive: true, force: true })]); }
});
const frameUrls = Array.from({ length: 8 }, (_, index) => `https://assets.example.test/frame-${index}.jpg`);
const frameFiles = [{ path: "src/App.tsx", content: `const frames=${JSON.stringify(frameUrls)}; export default function App(){return <canvas/>} addEventListener('scroll',()=>ctx.drawImage(images[Math.floor(scrollY)],0,0)); /* prefers-reduced-motion */` }];
test("explicit model and real-time 3D requests accept the Higgsfield frame contract", () => {
  for (const prompt of ["high-fidelity product 3D model", "Build a GLB product showcase", "Use Three.js for a real-time 3D watch with multiple camera views", "three-dimensional car"]) {
    const plan = routeV12Capabilities(prompt);
    assert.equal(plan.requires3D, true, prompt);
    assert.equal(plan.recommendedLibraries.includes("@react-three/fiber"), false);
    assert.match(capabilityPlanPrompt(plan), /Higgsfield video/);
    assert.deepEqual(immersiveAcceptanceFailures(frameFiles, plan, { hasFrameSequence3D: true, frameSequenceUrls: frameUrls, requiresExternalModel: true, requiresMultipleCameraViews: true, requiresCinematicNarrative: true, photorealisticPrimaryMediaUrls: ["https://assets.example.test/hero.jpg"] }), []);
  }
});
test("WebGL effects remain available alongside a valid 3D frame sequence", () => {
  const effects = routeV12Capabilities("Add a WebGL particle field background");
  assert.equal(effects.requires3D, false);
  assert.equal(effects.requiresWebGL, true);
  assert.ok(effects.recommendedLibraries.includes("three"));
  const plan = routeV12Capabilities("3D product with WebGL shader effects");
  assert.deepEqual(immersiveAcceptanceFailures([...frameFiles, {path:"src/effect.ts", content:"new THREE.ShaderMaterial()"}], plan, {hasFrameSequence3D:true,frameSequenceUrls:frameUrls}), []);
});
test("still images cannot replace required Higgsfield frames", () => {
  const plan = routeV12Capabilities("3D watch");
  assert.match(immersiveAcceptanceFailures([project[3]], plan, {hasFrameSequence3D:true,frameSequenceUrls:frameUrls}).join(" "), /Higgsfield/);
  assert.match(immersiveAcceptanceFailures(frameFiles, plan, {hasFrameSequence3D:true,frameSequenceUrls:[...frameUrls,"https://assets.example.test/missing.jpg"]}).join(" "), /every supplied Higgsfield/);
});

 test("explicit NO WebGL does not activate shaders from negated keywords", () => {
  const plan = routeV12Capabilities("Create a cinematic 3D-feeling architecture journey. NO WebGL. NO Three.js. Use frame progression and parallax.");
  assert.equal(plan.requires3D, true);
  assert.equal(plan.requiresWebGL, false);
  assert.equal(plan.capabilities.includes("SHADER_WEBGL"), false);
  assert.equal(plan.recommendedLibraries.includes("three"), false);
 });
