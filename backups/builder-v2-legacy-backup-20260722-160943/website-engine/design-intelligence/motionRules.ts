import type { MotionExecutionPlan } from "./DesignExecutionPlan";
import type { DesignResult } from "../design";
import { normalizeDesignFamily } from "./designRules";

export function compileMotionPlan(family?: string, designResult?: DesignResult): MotionExecutionPlan {
  if (designResult?.motionProfile.level === "none") return Object.freeze({ intensity: "none", behavior: "static", preferredEffects: Object.freeze([]), reducedMotionRequired: true });
  const normalized = normalizeDesignFamily(family);
  if (["real_estate", "food_and_beverage", "restaurant"].includes(normalized)) return Object.freeze({ intensity: "subtle", behavior: "slow-reveal", preferredEffects: Object.freeze(["fade", "slow-slide"] as const), reducedMotionRequired: true });
  if (["technology_saas", "saas", "automotive"].includes(normalized)) return Object.freeze({ intensity: designResult?.motionProfile.level === "medium" ? "moderate" : "subtle", behavior: "crisp-reveal", preferredEffects: Object.freeze(["fade", "short-slide", "stagger"] as const), reducedMotionRequired: true });
  return Object.freeze({ intensity: "subtle", behavior: "responsive-reveal", preferredEffects: Object.freeze(["fade", "short-slide"] as const), reducedMotionRequired: true });
}
