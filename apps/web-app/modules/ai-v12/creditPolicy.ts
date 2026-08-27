import type { CreativeDirection } from "./creativeDirection";

export type V12CreditOperation =
  | "DISCUSS"
  | "ELEMENT_EDIT"
  | "IMAGE_EDIT"
  | "PAGE_GENERATION"
  | "WEBSITE_GENERATION";

export type V12CreditEstimate = {
  operation: V12CreditOperation;
  baseCredits: number;
  mediaCredits: number;
  attachmentCredits: number;
  estimatedCredits: number;
  reasons: string[];
};

function explicitlyRequestsGeneratedMedia(
  creativeDirection?: CreativeDirection,
) {
  const imageStyle = String(
    creativeDirection?.imageStyle || "",
  ).trim();

  return (
    imageStyle === "Photorealistic" ||
    imageStyle === "Editorial illustration" ||
    imageStyle === "Abstract" ||
    imageStyle === "Collage" ||
    imageStyle === "3D"
  );
}

/**
 * BuildEZ commercial credits.
 *
 * IMPORTANT:
 * These are NOT raw OpenAI tokens and are NOT dollars.
 *
 * They are product-controlled units which can later be calibrated
 * against provider cost telemetry without changing customer plans.
 */
export function estimateV12Credits(input: {
  context:
    | "Website"
    | "Page"
    | "Selected element"
    | "Image";

  mode:
    | "auto"
    | "discuss";

  creativeDirection?: CreativeDirection;

  attachmentCount?: number;
}): V12CreditEstimate {
  const reasons: string[] = [];

  let operation: V12CreditOperation;
  let baseCredits = 0;

  if (input.mode === "discuss") {
    operation = "DISCUSS";
    baseCredits = 5;
    reasons.push("AI discussion");
  } else if (input.context === "Website") {
    operation = "WEBSITE_GENERATION";
    baseCredits = 180;
    reasons.push("multi-page website generation");
  } else if (input.context === "Page") {
    operation = "PAGE_GENERATION";
    baseCredits = 90;
    reasons.push("single-page generation");
  } else if (input.context === "Image") {
    operation = "IMAGE_EDIT";
    baseCredits = 35;
    reasons.push("image-focused AI operation");
  } else {
    operation = "ELEMENT_EDIT";
    baseCredits = 20;
    reasons.push("selected-element AI edit");
  }

  /*
   * This is a reservation estimate, not the final long-term pricing
   * formula. We will calibrate it against real provider-cost telemetry.
   */
  const mediaCredits =
    input.mode !== "discuss" &&
    explicitlyRequestsGeneratedMedia(
      input.creativeDirection,
    )
      ? 35
      : 0;

  if (mediaCredits) {
    reasons.push("generated media requested");
  }

  const attachmentCount =
    Math.max(
      0,
      Math.floor(input.attachmentCount || 0),
    );

  const attachmentCredits =
    Math.min(attachmentCount * 5, 20);

  if (attachmentCredits) {
    reasons.push(
      `${attachmentCount} reference attachment${
        attachmentCount === 1 ? "" : "s"
      }`,
    );
  }

  return {
    operation,
    baseCredits,
    mediaCredits,
    attachmentCredits,

    estimatedCredits:
      baseCredits +
      mediaCredits +
      attachmentCredits,

    reasons,
  };
}
