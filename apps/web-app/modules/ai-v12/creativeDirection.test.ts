import assert from "node:assert/strict";
import test from "node:test";

import {
  DEFAULT_CREATIVE_DIRECTION,
  parseCreativeDirection,
} from "./creativeDirection";
import { requiresImmersiveToolchain, routeV12Capabilities } from "./capabilityRouter";
import { creativeMcpTools } from "./creativeMcp";
import { enforceImmersiveMediaPlan, type V12DesignArchitectResult } from "./designArchitect";
import { WEBSITE_DEVELOPMENT_SKILL } from "./websiteDevelopmentSkill";
import { allowsUntextured3DGeometry, immersiveAcceptanceFailures, requiresExternal3DModel, requiresMultipleCameraViews } from "./experienceAcceptance";
import { requestsFullPageGeneration } from "./generationIntent";

test("creative direction defaults to photorealistic imagery", () => {
  assert.deepEqual(parseCreativeDirection(undefined), DEFAULT_CREATIVE_DIRECTION);
  assert.equal(parseCreativeDirection("not-json").imageStyle, "Photorealistic");
});

test("website generation carries a concrete mobile-header alignment contract", () => {
  assert.match(WEBSITE_DEVELOPMENT_SKILL, /MOBILE HEADER RELEASE CONTRACT/);
  assert.match(WEBSITE_DEVELOPMENT_SKILL, /320px, 375px, and 430px/);
  assert.match(WEBSITE_DEVELOPMENT_SKILL, /no horizontal overflow/i);
});

test("creative direction preserves supported choices and bounds audience input", () => {
  const direction = parseCreativeDirection(JSON.stringify({
    experienceType: "Immersive 3D / cinematic",
    designStyle: "Editorial",
    imageStyle: "3D",
    colorMood: "Dark",
    density: "Airy",
    primaryGoal: "Build trust",
    motionStyle: "Immersive parallax",
    audience: `  ${"a".repeat(200)}  `,
  }));
  assert.equal(direction.designStyle, "Editorial");
  assert.equal(direction.experienceType, "Immersive 3D / cinematic");
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
  assert.equal(direction.experienceType, "Traditional modern");
});

test("immersive experience pill defaults to media-led cinematic motion", () => {
  const plan = routeV12Capabilities("Create a premium product website", {
    experienceType: "Immersive 3D / cinematic",
  });
  assert.equal(plan.requires3D, false);
  assert.equal(plan.requiresWebGL, false);
  assert.equal(plan.requiresAdvancedMotion, true);
  assert.ok(plan.capabilities.includes("PARALLAX"));
  assert.ok(plan.recommendedLibraries.includes("gsap"));
  assert.equal(plan.recommendedLibraries.includes("@react-three/fiber"), false);
});

test("explicit 3D media requires frame playback without the real-time subject stack", () => {
  const plan = routeV12Capabilities("Create a premium product website", {
    experienceType: "Immersive 3D / cinematic",
    imageStyle: "3D",
  });
  assert.equal(plan.requires3D, true);
  assert.equal(plan.requiresWebGL, false);
  assert.equal(plan.recommendedLibraries.includes("@react-three/fiber"), false);
});

test("traditional experience remains lightweight unless the prompt explicitly requests advanced work", () => {
  const standard = routeV12Capabilities("Create an accounting firm website", {
    experienceType: "Traditional modern",
  });
  assert.deepEqual(standard.capabilities, ["STANDARD"]);
  assert.equal(standard.requires3D, false);
  assert.equal(requiresImmersiveToolchain(standard, { experienceType: "Traditional modern" }), false);

  const explicit = routeV12Capabilities("Create an interactive 3D product scene", {
    experienceType: "Traditional modern",
  });
  assert.equal(explicit.requires3D, true);
  assert.equal(requiresImmersiveToolchain(explicit, { experienceType: "Traditional modern" }), true);
});

test("creative MCP routing only exposes configured tools needed by the experience", () => {
  const previous = process.env.MESHY_MCP_URL;
  process.env.MESHY_MCP_URL = "https://mcp.example.test/meshy";
  try {
    const standard = creativeMcpTools({ images: false, video: false, threeD: false, design: false });
    const immersive = creativeMcpTools({ images: false, video: false, threeD: true, design: false });
    assert.equal(standard.some((tool) => tool.server_label === "meshy"), false);
    assert.equal(immersive.some((tool) => tool.server_label === "meshy"), true);
  } finally {
    if (previous === undefined) delete process.env.MESHY_MCP_URL;
    else process.env.MESHY_MCP_URL = previous;
  }
});

test("immersive generation receives a minimum cinematic depth-asset plan", () => {
  const plan = {
    expandedBrief: "Launch a luxury watch through a scroll-directed product story.",
    experience: "IMMERSIVE_3D",
    capabilities: ["IMMERSIVE_3D", "PARALLAX"],
    libraries: ["three", "gsap"],
    designDirection: {
      concept: "A watch emerging from darkness",
      composition: "A live product object moves through layered scenes",
      typography: "Editorial serif",
      colorStrategy: "Obsidian and gold",
      spatialSystem: "Cinematic",
      visualLanguage: "Controlled studio light and tactile metal",
    },
    subjectFidelity: { primarySubject: "watch", recognitionCues: [], proportionAndTopology: [], materialAndSurfaceCues: [], forbiddenSubstitutions: [], validationViews: [] },
    sections: [],
    mediaPlan: {
      needsGeneratedImages: false,
      needsVideo: true,
      needs3DAssets: true,
      needsShaderCode: true,
      needsCustomSvg: false,
      needsDataViz: false,
      needsIcons: false,
      images: [],
      videos: [],
      codeVisualRequirements: [],
    },
    motionPlan: [],
    performanceRequirements: [],
    commerce: {
      mode: "NONE",
      confidence: 1,
      rationale: "Commerce is not relevant to this media-planning test.",
      needsClarification: false,
      clarificationQuestion: "",
      clarificationOptions: [],
    },
    rationale: "Immersive product launch",
  } satisfies V12DesignArchitectResult;

  enforceImmersiveMediaPlan(plan, {
    experienceType: "Immersive 3D / cinematic",
    imageStyle: "3D",
  });

  assert.equal(plan.mediaPlan.needsGeneratedImages, true);
  assert.equal(plan.mediaPlan.images.length, 3);
  assert.equal(plan.mediaPlan.needsVideo, true);
  assert.equal(plan.mediaPlan.videos.length, 1);
  assert.ok(plan.mediaPlan.images.every((item) => item.medium.includes("3D")));
});

test("cinematic acceptance requires media, choreography and reduced motion", () => {
  const failures = immersiveAcceptanceFailures([{
    path: "src/Home.tsx",
    content: "export function Home(){ return <main><section>Static copy</section></main> }",
  }], {
    requires3D: false,
    requiresWebGL: false,
    capabilities: ["PARALLAX", "MOTION_RICH"],
  }, { requiresCinematicNarrative: true });

  assert.match(failures.join(" "), /no substantial image, video, or canvas media layer/i);
  assert.match(failures.join(" "), /no verifiable scroll-directed runtime/i);
  assert.match(failures.join(" "), /missing an authored set-piece/i);
  assert.match(failures.join(" "), /prefers-reduced-motion/i);
});

test("cinematic acceptance recognizes a defensive scroll-scrubbed stage", () => {
  const failures = immersiveAcceptanceFailures([{
    path: "src/Home.tsx",
    content: `export function Home(){ return <main><section className="stage"><video muted playsInline poster="/hero.webp" /></section></main> }`,
  }, {
    path: "src/site.css",
    content: `.stage{position:sticky;top:0} @media (prefers-reduced-motion: reduce){.stage{position:relative}}`,
  }, {
    path: "src/motion.ts",
    content: `addEventListener('scroll',()=>requestAnimationFrame(()=>{ video.currentTime = scrollY / 1000 }))`,
  }], {
    requires3D: false,
    requiresWebGL: false,
    capabilities: ["PARALLAX", "MOTION_RICH"],
  }, { requiresCinematicNarrative: true });

  assert.deepEqual(failures, []);
});

test("explicit no-generated-imagery choice remains authoritative in immersive mode", () => {
  const plan = {
    expandedBrief: "An immersive launch",
    experience: "IMMERSIVE_3D",
    capabilities: ["IMMERSIVE_3D"],
    libraries: ["three"],
    designDirection: { concept: "Depth", composition: "Layered", typography: "Serif", colorStrategy: "Dark", spatialSystem: "Wide", visualLanguage: "Tactile" },
    subjectFidelity: { primarySubject: "launch subject", recognitionCues: [], proportionAndTopology: [], materialAndSurfaceCues: [], forbiddenSubstitutions: [], validationViews: [] },
    sections: [],
    mediaPlan: { needsGeneratedImages: false, needsVideo: true, needs3DAssets: true, needsShaderCode: true, needsCustomSvg: false, needsDataViz: false, needsIcons: false, images: [], videos: [], codeVisualRequirements: [] },
    motionPlan: [],
    performanceRequirements: [],
    commerce: {
      mode: "NONE",
      confidence: 1,
      rationale: "Commerce is not relevant to this media-planning test.",
      needsClarification: false,
      clarificationQuestion: "",
      clarificationOptions: [],
    },
    rationale: "Immersive",
  } satisfies V12DesignArchitectResult;

  enforceImmersiveMediaPlan(plan, { imageStyle: "No generated imagery" });
  assert.equal(plan.mediaPlan.needsGeneratedImages, false);
  assert.equal(plan.mediaPlan.images.length, 0);
});

test("generation skill rejects unrecognizable primitive 3D subjects", () => {
  assert.match(WEBSITE_DEVELOPMENT_SKILL, /SUBJECT FIDELITY IS A RELEASE-BLOCKING REQUIREMENT/);
  assert.match(WEBSITE_DEVELOPMENT_SKILL, /silhouette, relative proportions, component topology, landmark features/);
  assert.match(WEBSITE_DEVELOPMENT_SKILL, /generic blob or primitive assembly/);
  assert.match(WEBSITE_DEVELOPMENT_SKILL, /NEVER SHIP A 3D SUBJECT MADE FROM UNTEXTURED COLOR MATERIALS/);
  assert.match(WEBSITE_DEVELOPMENT_SKILL, /default camera view at desktop and mobile sizes/);
  assert.doesNotMatch(WEBSITE_DEVELOPMENT_SKILL, /For vehicles|For watches|For buildings/);
});

test("immersive acceptance rejects ambient WebGL and one-layer image drift", () => {
  const failures = immersiveAcceptanceFailures([{
    path: "src/Ambient.tsx",
    content: "new THREE.OrthographicCamera(); new THREE.ShaderMaterial(); gsap.to('[data-parallax]', { yPercent: 5 });",
  }], {
    requires3D: true,
    requiresWebGL: true,
    capabilities: ["IMMERSIVE_3D", "PARALLAX", "SHADER_WEBGL"],
  });
  assert.equal(failures.length, 3);
  assert.match(failures.join(" "), /perspective 3D scene/);
  assert.match(failures.join(" "), /untextured solid-color geometry/);
  assert.match(failures.join(" "), /three simultaneous marked depth planes/);
});

test("immersive acceptance recognizes scroll-driven perspective depth", () => {
  const failures = immersiveAcceptanceFailures([{
    path: "src/Scene.tsx",
    content: "import { Canvas, useFrame } from '@react-three/fiber'; import { useTexture } from '@react-three/drei'; function Scene({scrollProgress}) { const texture=useTexture('/surface.webp'); useFrame(({camera}) => { camera.position.z = 8 - scrollProgress * 3; camera.lookAt(0,0,0); }); return <Canvas><mesh><boxGeometry /><meshStandardMaterial map={texture} /></mesh></Canvas>; } const shader = new THREE.ShaderMaterial();",
  }], {
    requires3D: true,
    requiresWebGL: true,
    capabilities: ["IMMERSIVE_3D", "PARALLAX", "SHADER_WEBGL"],
  });
  assert.deepEqual(failures, []);
});

test("regenerate requests trigger a clean complete-site build", () => {
  assert.equal(requestsFullPageGeneration("Regenerate a new immersive 3D parallax website"), true);
  assert.equal(requestsFullPageGeneration("Recreate the whole landing page from scratch"), true);
  assert.equal(requestsFullPageGeneration("Make the button blue"), false);
});

test("multiple camera requests require scroll-directed shot choreography", () => {
  const prompt = "Create multiple camera views that transition while scrolling";
  assert.equal(requiresMultipleCameraViews(prompt), true);

  const failures = immersiveAcceptanceFailures([{
    path: "src/Scene.tsx",
    content: "import { Canvas, useFrame } from '@react-three/fiber'; function Scene({scroll}) { useFrame(({camera}) => { camera.position.z = scroll; camera.lookAt(0,0,0); }); return <Canvas><mesh><boxGeometry /></mesh></Canvas> }",
  }], {
    requires3D: true,
    requiresWebGL: false,
    capabilities: ["IMMERSIVE_3D", "PARALLAX"],
  }, { requiresMultipleCameraViews: true });

  assert.match(failures.join(" "), /multiple scroll-directed camera views/);
});

test("photorealistic immersive builds reject fallback-only media and scene-spanning artifacts", () => {
  const heroUrl = "https://assets.getbuildez.com/generated/hero.webp";
  const failures = immersiveAcceptanceFailures([{
    path: "src/components/ExperienceCanvas.tsx",
    content: `import { Canvas, useFrame } from '@react-three/fiber'; import { Sparkles } from '@react-three/drei'; function WebGLFallback(){return <img src="${heroUrl}"/>} function Scene({scroll}) { useFrame(({camera}) => { camera.position.x=scroll; camera.position.y=scroll; camera.position.z=scroll; camera.lookAt(0,0,0); }); return <Canvas><mesh><boxGeometry args={[90,2,90]}/></mesh><Sparkles count={180}/></Canvas> }`,
  }], {
    requires3D: true,
    requiresWebGL: false,
    capabilities: ["IMMERSIVE_3D", "PARALLAX"],
  }, {
    requiresMultipleCameraViews: true,
    photorealisticPrimaryMediaUrls: [heroUrl],
  });

  assert.match(failures.join(" "), /camera-scene isolation/);
  assert.match(failures.join(" "), /oversized primitive/);
  assert.match(failures.join(" "), /not visibly integrated/);
  assert.match(failures.join(" "), /excessive global particles/);
});

test("photorealistic immersive builds accept a visible hero and isolated bounded scenes", () => {
  const heroUrl = "https://assets.getbuildez.com/generated/hero.webp";
  const failures = immersiveAcceptanceFailures([{
    path: "src/pages/HomePage.tsx",
    content: `export function HomePage(){return <main><img className="hero-render" src="${heroUrl}" /></main>}`,
  }, {
    path: "src/Scene.tsx",
    content: `import { Canvas, useFrame } from '@react-three/fiber'; import { useTexture } from '@react-three/drei'; const cameraShots=[]; function Scene({activeScene,scroll}) { const maps=useTexture({map:'/albedo.webp',normalMap:'/normal.webp',roughnessMap:'/roughness.webp'}); useFrame(({camera}) => { camera.position.x=scroll; camera.position.y=scroll; camera.position.z=scroll; camera.lookAt(0,0,0); }); return <Canvas><group visible={activeScene === 0}><mesh><boxGeometry args={[12,8,18]}/><meshStandardMaterial {...maps}/></mesh></group></Canvas> }`,
  }], {
    requires3D: true,
    requiresWebGL: false,
    capabilities: ["IMMERSIVE_3D", "PARALLAX"],
  }, {
    requiresMultipleCameraViews: true,
    photorealisticPrimaryMediaUrls: [heroUrl],
  });

  assert.deepEqual(failures, []);
});

test("3D generation defaults to detailed textured surfaces unless the user requests a solid style", () => {
  assert.equal(allowsUntextured3DGeometry("Create an immersive museum"), false);
  assert.equal(allowsUntextured3DGeometry("Create a deliberate low-poly solid-color museum"), true);

  const failures = immersiveAcceptanceFailures([{
    path: "src/Scene.tsx",
    content: `import { Canvas } from '@react-three/fiber'; export function Scene(){return <Canvas><mesh><boxGeometry/><meshStandardMaterial color="#333"/></mesh></Canvas>}`,
  }], {
    requires3D: true,
    requiresWebGL: false,
    capabilities: ["IMMERSIVE_3D"],
  });

  assert.match(failures.join(" "), /untextured solid-color geometry/);
});

test("realistic subject requests require an external model instead of primitive substitution", () => {
  assert.equal(requiresExternal3DModel("Create a photorealistic high-fidelity product 3D model", { requires3D: true }), true);
  assert.equal(requiresExternal3DModel("Create an immersive museum using genuine perspective 3D and real 3D geometry", { requires3D: true }), false);
  assert.equal(requiresExternal3DModel("Create an abstract code-native particle sculpture", { requires3D: true }), false);
  assert.equal(requiresExternal3DModel("Create a realistic photograph", { requires3D: false }), false);
  const failures = immersiveAcceptanceFailures([{
    path: "src/Scene.tsx",
    content: "import { Canvas, useFrame } from '@react-three/fiber'; function Scene({scroll}) { useFrame(({camera}) => camera.position.z = scroll); return <Canvas><mesh><boxGeometry /></mesh></Canvas> } const shader = new THREE.ShaderMaterial();",
  }], {
    requires3D: true,
    requiresWebGL: true,
    capabilities: ["IMMERSIVE_3D", "PARALLAX", "SHADER_WEBGL"],
  }, { requiresExternalModel: true });
  assert.match(failures.join(" "), /external high-fidelity 3D model/);
});
