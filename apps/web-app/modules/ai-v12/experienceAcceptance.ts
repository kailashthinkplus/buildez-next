import type { V12CapabilityPlan } from "./capabilityRouter";

type GeneratedFile = { path: string; content: string };

export function immersiveAcceptanceFailures(
  files: readonly GeneratedFile[],
  plan: Pick<V12CapabilityPlan, "requires3D" | "requiresWebGL" | "capabilities">,
  options: { requiresExternalModel?: boolean } = {},
) {
  const source = files
    .filter((file) => /\.(?:tsx?|jsx?|css|json)$/.test(file.path))
    .map((file) => file.content)
    .join("\n");
  const failures: string[] = [];

  if (plan.requires3D) {
    const r3fScene = /@react-three\/fiber/.test(source)
      && /<(?:Canvas|mesh|group)\b|useFrame\s*\(/.test(source);
    const nativeThreeScene = /PerspectiveCamera\s*\(/.test(source)
      && /(?:GLTFLoader|useGLTF|BufferGeometry|ExtrudeGeometry|LatheGeometry|BoxGeometry|SphereGeometry|CapsuleGeometry)\s*\(/.test(source);
    if (!r3fScene && !nativeThreeScene) {
      failures.push("Missing genuine perspective 3D scene or integrated 3D model; a full-screen shader plane does not satisfy 3D.");
    }
  }

  if (options.requiresExternalModel && !/(?:GLTFLoader|useGLTF|\.glb\b|\.gltf\b|model\/gltf|spline-viewer|@splinetool)/i.test(source)) {
    failures.push("Missing the required external high-fidelity 3D model integration.");
  }

  if (plan.capabilities.includes("PARALLAX")) {
    const depthValues = [...source.matchAll(/data-buildez-depth-layer=["'{]+([^"'}\s]+)/g)]
      .map((match) => match[1]);
    const distinctDepths = new Set(depthValues);
    const domDepthRuntime = /data-buildez-depth-layer/.test(source)
      && /(?:ScrollTrigger|addEventListener\s*\(\s*["']scroll|requestAnimationFrame)/.test(source)
      && /(?:translate3d|translateZ|yPercent|style\.transform|gsap\.(?:to|fromTo))/.test(source);
    const cameraDepthRuntime = /(?:useFrame|requestAnimationFrame)/.test(source)
      && /camera\.(?:position|rotation)|camera\.lookAt/.test(source)
      && /(?:scroll|progress|ScrollTrigger)/i.test(source);
    if (!cameraDepthRuntime && !(distinctDepths.size >= 3 && domDepthRuntime)) {
      failures.push("Missing verifiable spatial parallax: provide at least three simultaneous marked depth planes with distinct scroll transforms, or a scroll-driven perspective camera.");
    }
  }

  if (plan.requiresWebGL && !/(?:ShaderMaterial|shaderMaterial|vertexShader|fragmentShader)/.test(source)) {
    failures.push("Missing the required WebGL shader implementation.");
  }

  return failures;
}

export function requiresExternal3DModel(prompt: string, plan: Pick<V12CapabilityPlan, "requires3D">) {
  if (!plan.requires3D) return false;
  return /\b(?:photorealistic|photo-realistic|realistic|real-world|production-ready|high-fidelity|high fidelity|detailed model|actual 3d|real 3d|genuine 3d|glb|gltf|not (?:a )?(?:primitive|placeholder)|no (?:primitive|placeholder))\b/i.test(prompt);
}
