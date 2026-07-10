import type { CameraMovement, MotionFamilyContext, MotionInput } from "./motionStrategy";

/** Infers camera movement language as metadata only. */
export function inferCameraMovement(input: MotionInput, context: MotionFamilyContext): CameraMovement {
  void input;
  if (context.family === "automotive") return Object.freeze({ strategy: "Tracking", notes: ["precise performance feel"] });
  if (context.family === "real_estate" || context.family === "architecture_interiors") return Object.freeze({ strategy: "Architectural", notes: ["spatial exploration", "slow confidence"] });
  if (context.family === "hospitality") return Object.freeze({ strategy: "Cinematic", notes: ["destination atmosphere"] });
  if (context.family === "ecommerce_d2c") return Object.freeze({ strategy: "Product", notes: ["product detail support"] });
  if (context.family === "healthcare" || context.family === "education") return Object.freeze({ strategy: "Human eye", notes: ["approachable", "stable"] });
  return Object.freeze({ strategy: "Static", notes: ["clarity-first"] });
}
