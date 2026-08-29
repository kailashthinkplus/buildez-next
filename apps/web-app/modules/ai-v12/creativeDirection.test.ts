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
import { immersiveAcceptanceFailures, requiresExternal3DModel } from "./experienceAcceptance";

test("creative direction defaults to photorealistic imagery", () => {
  assert.deepEqual(parseCreativeDirection(undefined), DEFAULT_CREATIVE_DIRECTION);
  assert.equal(parseCreativeDirection("not-json").imageStyle, "Photorealistic");
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

test("immersive experience pill activates the complete advanced stack", () => {
  const plan = routeV12Capabilities("Create a premium product website", {
    experienceType: "Immersive 3D / cinematic",
  });
  assert.equal(plan.requires3D, true);
  assert.equal(plan.requiresWebGL, true);
  assert.equal(plan.requiresAdvancedMotion, true);
  assert.ok(plan.capabilities.includes("PARALLAX"));
  assert.ok(plan.recommendedLibraries.includes("gsap"));
  assert.ok(plan.recommendedLibraries.includes("@react-three/fiber"));
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
    rationale: "Immersive product launch",
  } satisfies V12DesignArchitectResult;

  enforceImmersiveMediaPlan(plan, {
    experienceType: "Immersive 3D / cinematic",
    imageStyle: "3D",
  });

  assert.equal(plan.mediaPlan.needsGeneratedImages, true);
  assert.equal(plan.mediaPlan.images.length, 3);
  assert.ok(plan.mediaPlan.images.every((item) => item.medium.includes("3D")));
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
    motionPlan: [], performanceRequirements: [], rationale: "Immersive",
  } satisfies V12DesignArchitectResult;

  enforceImmersiveMediaPlan(plan, { imageStyle: "No generated imagery" });
  assert.equal(plan.mediaPlan.needsGeneratedImages, false);
  assert.equal(plan.mediaPlan.images.length, 0);
});

test("generation skill rejects unrecognizable primitive 3D subjects", () => {
  assert.match(WEBSITE_DEVELOPMENT_SKILL, /SUBJECT FIDELITY IS A RELEASE-BLOCKING REQUIREMENT/);
  assert.match(WEBSITE_DEVELOPMENT_SKILL, /silhouette, relative proportions, component topology, landmark features/);
  assert.match(WEBSITE_DEVELOPMENT_SKILL, /generic blob or primitive assembly/);
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
  assert.equal(failures.length, 2);
  assert.match(failures.join(" "), /perspective 3D scene/);
  assert.match(failures.join(" "), /three simultaneous marked depth planes/);
});

test("immersive acceptance recognizes scroll-driven perspective depth", () => {
  const failures = immersiveAcceptanceFailures([{
    path: "src/Scene.tsx",
    content: "import { Canvas, useFrame } from '@react-three/fiber'; function Scene({scrollProgress}) { useFrame(({camera}) => { camera.position.z = 8 - scrollProgress * 3; camera.lookAt(0,0,0); }); return <Canvas><mesh /></Canvas>; } const shader = new THREE.ShaderMaterial();",
  }], {
    requires3D: true,
    requiresWebGL: true,
    capabilities: ["IMMERSIVE_3D", "PARALLAX", "SHADER_WEBGL"],
  });
  assert.deepEqual(failures, []);
});

test("realistic subject requests require an external model instead of primitive substitution", () => {
  assert.equal(requiresExternal3DModel("Create a photorealistic high-fidelity product in genuine 3D", { requires3D: true }), true);
  assert.equal(requiresExternal3DModel("Create an abstract code-native particle sculpture", { requires3D: true }), false);
  assert.equal(requiresExternal3DModel("Create a realistic photograph", { requires3D: false }), false);
  const failures = immersiveAcceptanceFailures([{
    path: "src/Scene.tsx",
    content: "import { Canvas, useFrame } from '@react-three/fiber'; function Scene({scroll}) { useFrame(({camera}) => camera.position.z = scroll); return <Canvas><mesh /></Canvas> } const shader = new THREE.ShaderMaterial();",
  }], {
    requires3D: true,
    requiresWebGL: true,
    capabilities: ["IMMERSIVE_3D", "PARALLAX", "SHADER_WEBGL"],
  }, { requiresExternalModel: true });
  assert.match(failures.join(" "), /external high-fidelity 3D model/);
});
