import type { V12CapabilityPlan } from "./capabilityRouter";

type GeneratedFile = { path: string; content: string };

export function immersiveAcceptanceFailures(
  files: readonly GeneratedFile[],
  plan: Pick<V12CapabilityPlan, "requires3D" | "requiresWebGL" | "capabilities">,
  options: {
    requiresExternalModel?: boolean;
    requiresMultipleCameraViews?: boolean;
    photorealisticPrimaryMediaUrls?: readonly string[];
    allowUntexturedGeometry?: boolean;
    requiresCinematicNarrative?: boolean;
    /**
     * A pre-rendered video frame sequence (see immersiveFrameSequence.ts)
     * was supplied for this generation and the prompt instructed the
     * model to render it on a scroll-scrubbed canvas instead of writing
     * live Three.js/R3F geometry. When true, a verified frame-sequence
     * canvas satisfies the requires3D / multi-camera / depth checks
     * below in place of the live-3D evidence they normally require.
     */
    hasFrameSequence3D?: boolean;
    frameSequenceUrls?: readonly string[];
  } = {},
) {
  const source = files
    .filter((file) => /\.(?:tsx?|jsx?|css|json)$/.test(file.path))
    .map((file) => file.content)
    .join("\n");
  const failures: string[] = [];

  if (options.requiresCinematicNarrative) {
    const hasVisualMedia = /<(?:img|video|canvas)\b|background-image\s*:|drawImage\s*\(/i.test(source);
    if (!hasVisualMedia) {
      failures.push("Cinematic experience has no substantial image, video, or canvas media layer.");
    }

    const hasScrollRuntime = /ScrollTrigger|useScroll\s*\(|addEventListener\s*\(\s*["']scroll|requestAnimationFrame|scrollY|scrollProgress/i.test(source);
    if (!hasScrollRuntime) {
      failures.push("Cinematic experience has no verifiable scroll-directed runtime.");
    }

    const hasAuthoredSetPiece = /\bpin\s*:|position\s*:\s*sticky|currentTime\s*=|drawImage\s*\(|useTransform\s*\(|clip-path\s*:|clipPath\s*[:=]/i.test(source);
    if (!hasAuthoredSetPiece) {
      failures.push("Cinematic experience is missing an authored set-piece such as a pinned stage, scroll playhead, frame canvas, or scene wipe.");
    }

    if (!/prefers-reduced-motion/i.test(source)) {
      failures.push("Cinematic experience is missing a prefers-reduced-motion fallback.");
    }
  }

  const frameSequenceScene = options.hasFrameSequence3D === true
    && /<canvas\b/i.test(source)
    && /drawImage\s*\(/.test(source)
    && /(?:scrollY|scrollProgress|ScrollTrigger|addEventListener\s*\(\s*["']scroll|requestAnimationFrame)/i.test(source);

  if (options.hasFrameSequence3D) {
    if (!frameSequenceScene) failures.push("Missing the required scroll-scrubbed canvas for the supplied Higgsfield video frames.");
    if (options.frameSequenceUrls && (options.frameSequenceUrls.length < 8 || options.frameSequenceUrls.some(url => !source.includes(url)))) {
      failures.push("Integrate every supplied Higgsfield frame URL in playback order; do not substitute still imagery or invented frames.");
    }
  }

  if (plan.requires3D) {
    const r3fScene = /@react-three\/fiber/.test(source)
      && /<Canvas\b/.test(source)
      && /<(?:box|sphere|plane|torus|torusKnot|octahedron|icosahedron|dodecahedron|cylinder|cone|capsule|extrude|buffer)Geometry\b|useGLTF\s*\(|<primitive\b/i.test(source);
    const nativeThreeScene = /PerspectiveCamera\s*\(/.test(source)
      && /(?:GLTFLoader|useGLTF|BufferGeometry|ExtrudeGeometry|LatheGeometry|BoxGeometry|SphereGeometry|CapsuleGeometry)\s*\(/.test(source);
    if (!r3fScene && !nativeThreeScene && !frameSequenceScene) {
      failures.push("Missing genuine perspective 3D scene, integrated 3D model, or scroll-scrubbed frame-sequence canvas; a full-screen shader plane does not satisfy 3D.");
    }

    if (!options.allowUntexturedGeometry && !frameSequenceScene) {
      const detailedSurfacePipeline = /(?:useGLTF\s*\(|GLTFLoader|useTexture\s*\(|TextureLoader|CanvasTexture|DataTexture|\b(?:map|normalMap|roughnessMap|metalnessMap|aoMap|displacementMap)\s*=\s*\{|\b(?:map|normalMap|roughnessMap|metalnessMap|aoMap|displacementMap)\s*:|(?:simplex|perlin|fbm|voronoi|noise)\s*\()/i.test(source);
      if (!detailedSurfacePipeline) {
        failures.push("3D subject uses untextured solid-color geometry; integrate a textured GLTF or physically detailed color, normal, roughness and ambient-occlusion surface maps.");
      }

      const plainSolidMaterials = [...source.matchAll(/<mesh(?:Basic|Lambert|Phong|Standard|Physical)Material\b([^>]*)\/?>(?:<\/mesh(?:Basic|Lambert|Phong|Standard|Physical)Material>)?/gi)]
        .filter((match) => /\bcolor\s*=/.test(match[1])
          && !/\b(?:map|normalMap|roughnessMap|metalnessMap|aoMap|displacementMap|envMap)\s*=/.test(match[1]))
        .length;
      if (plainSolidMaterials > 4) {
        failures.push("3D scene contains too many flat solid-color materials; reserve untextured color for a few semantic lights or accents and texture the visible subject surfaces.");
      }
    }
  }

  if (options.requiresMultipleCameraViews && !frameSequenceScene) {
    // A verified frame-sequence canvas already bakes its camera move
    // into the rendered frames themselves — there is no live `camera`
    // object to choreograph, so none of these checks apply to it.
    const cameraChoreography = /(?:CAMERA_SHOTS|cameraShots|cameraViews|cameraKeyframes)/.test(source)
      && /camera\.(?:position|rotation)|camera\.lookAt/.test(source)
      && /(?:scroll|progress|ScrollTrigger)/i.test(source);
    const multiAxisCamera = /camera\.position\.x/.test(source)
      && /camera\.position\.y/.test(source)
      && /camera\.position\.z/.test(source)
      && /camera\.lookAt/.test(source)
      && /(?:scroll|progress|ScrollTrigger)/i.test(source);
    if (!cameraChoreography && !multiAxisCamera) {
      failures.push("Missing multiple scroll-directed camera views; define camera shot/keyframe positions and targets, then interpolate them from scroll progress.");
    }

    const isolatedScenes = /\b(?:activeScene|activeShot|currentScene|currentShot)\b/.test(source)
      && /(?:\bvisible\s*=\s*\{|\.visible\s*=|(?:mount|render)Scene)/.test(source);
    if (!isolatedScenes) {
      failures.push("Missing camera-scene isolation; only the active and adjacent bounded scene sets may be visible during multi-camera transitions.");
    }

    const oversizedGeometry = [...source.matchAll(/<(?:box|plane|sphere|torus|cylinder|cone)Geometry\b[^>]*\bargs=\{\[([^\]]+)\]\}/gi)]
      .some((match) => (match[1].match(/-?\d+(?:\.\d+)?/g) || [])
        .some((value) => Math.abs(Number(value)) > 60));
    if (oversizedGeometry) {
      failures.push("Scene contains an oversized primitive spanning multiple camera sets; keep every architectural set spatially bounded and out of unrelated camera frustums.");
    }
  }

  const primaryMediaUrls = options.photorealisticPrimaryMediaUrls || [];
  if (primaryMediaUrls.length) {
    const primaryMediaVisible = primaryMediaUrls.some((url) => files.some((file) =>
      /(?:^|\/)(?:App|Home|Hero|Landing|pages?\/[^/]+)\.[jt]sx?$/i.test(file.path)
      && file.content.includes(url)));
    if (!primaryMediaVisible && !frameSequenceScene) {
      failures.push("Photorealistic hero media is not visibly integrated into the primary page composition; it may not exist only in a WebGL fallback or low-opacity decoration.");
    }

    const excessiveSparkles = [...source.matchAll(/<Sparkles\b[^>]*\bcount=\{?(\d+)/g)]
      .reduce((total, match) => total + Number(match[1]), 0) > 80;
    if (excessiveSparkles) {
      failures.push("Photorealistic composition is obscured by excessive global particles/sparkles; remove decorative particle fields and keep only restrained, scene-specific atmosphere.");
    }
  }

  if (options.requiresExternalModel && !frameSequenceScene && !/(?:GLTFLoader|useGLTF|\.glb\b|\.gltf\b|model\/gltf|spline-viewer|@splinetool)/i.test(source)) {
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
    const mediaDepthRuntime = (options.requiresCinematicNarrative === true || frameSequenceScene)
      && /(?:currentTime\s*=|drawImage\s*\()/.test(source)
      && /(?:scrollY|scrollProgress|ScrollTrigger|addEventListener\s*\(\s*["']scroll)/i.test(source);
    if (!mediaDepthRuntime && !cameraDepthRuntime && !(distinctDepths.size >= 3 && domDepthRuntime)) {
      failures.push("Missing verifiable cinematic depth: provide a scroll-synced video/frame playhead, at least three simultaneous marked depth planes with distinct transforms, or a scroll-driven perspective camera.");
    }
  }

  if (plan.requiresWebGL && !/(?:ShaderMaterial|shaderMaterial|vertexShader|fragmentShader)/.test(source)) {
    failures.push("Missing the required WebGL shader implementation.");
  }

  return failures;
}

export function requiresMultipleCameraViews(prompt: string) {
  return /\b(?:multiple|different|changing|cinematic)\s+(?:3d\s+)?camera\s+(?:views?|angles?|shots?|positions?)\b|\bcamera\s+(?:views?|angles?|shots?|positions?)\b[\s\S]{0,40}\b(?:scroll|change|transition|interpolate)\b/i.test(prompt);
}

export function requiresExternal3DModel(prompt: string, plan: Pick<V12CapabilityPlan, "requires3D">) {
  if (!plan.requires3D) return false;

  /*
   * "Real/genuine 3D" describes perspective geometry just as often as it
   * describes an imported model. Treating those phrases as an asset request
   * made perfectly valid code-native Three.js builds fail before generation.
   * Only require the external provider when the user explicitly asks for a
   * model asset/format or forbids a code-native representation.
   */
  const explicitModelAsset = /\b(?:glb|gltf|3d\s+model\s+(?:asset|file)|external\s+3d\s+model|import(?:ed)?\s+3d\s+model|use\s+(?:an?\s+)?(?:provided|uploaded)\s+3d\s+model)\b/i;
  const forbidsCodeNativeGeometry = /\b(?:not|no)\s+(?:a\s+)?(?:primitive|placeholder|procedural|code[- ]native)(?:\s+(?:geometry|model))?\b/i;
  const highFidelityModelSubject = /\b(?:photorealistic|photo-realistic|high-fidelity|high fidelity|production-ready)\b[\s\S]{0,80}\b(?:product|vehicle|car|watch|shoe|character|person|animal)\s+(?:3d\s+)?model\b/i;

  return explicitModelAsset.test(prompt)
    || forbidsCodeNativeGeometry.test(prompt)
    || highFidelityModelSubject.test(prompt);
}

export function allowsUntextured3DGeometry(prompt: string) {
  return /\b(?:low[- ]poly|wireframe|clay render|clay model|solid[- ]colou?r|flat[- ]shaded|untextured|abstract primitives?|geometric abstraction)\b/i.test(prompt);
}
