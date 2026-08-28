import assert from "node:assert/strict";
import test from "node:test";

import {
  DEFAULT_CREATIVE_DIRECTION,
  parseCreativeDirection,
} from "./creativeDirection";
import { requiresImmersiveToolchain, routeV12Capabilities } from "./capabilityRouter";
import { creativeMcpTools } from "./creativeMcp";
import { enforceImmersiveMediaPlan, type V12DesignArchitectResult } from "./designArchitect";

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
    sections: [],
    mediaPlan: { needsGeneratedImages: false, needsVideo: true, needs3DAssets: true, needsShaderCode: true, needsCustomSvg: false, needsDataViz: false, needsIcons: false, images: [], videos: [], codeVisualRequirements: [] },
    motionPlan: [], performanceRequirements: [], rationale: "Immersive",
  } satisfies V12DesignArchitectResult;

  enforceImmersiveMediaPlan(plan, { imageStyle: "No generated imagery" });
  assert.equal(plan.mediaPlan.needsGeneratedImages, false);
  assert.equal(plan.mediaPlan.images.length, 0);
});
