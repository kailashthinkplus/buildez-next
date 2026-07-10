import { createSkeletonResult, type EngineResult } from "../sdk";

export type RenderWebsitePlanInput = {
  mappedNodes?: unknown;
};

export type RenderWebsitePlanResult = {
  rendered: false;
  reason: string;
};

export function renderWebsitePlan(_input: RenderWebsitePlanInput = {}): EngineResult<RenderWebsitePlanResult> {
  return createSkeletonResult("renderer", {
    rendered: false,
    reason: "Renderer skeleton does not render runtime output.",
  });
}

