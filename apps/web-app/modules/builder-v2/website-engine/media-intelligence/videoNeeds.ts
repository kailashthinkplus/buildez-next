import type { MediaFamilyContext, MediaInput, VideoNeed } from "./mediaStrategy";

function video(id: string, label: string, purpose: string, truthLevel: VideoNeed["truthLevel"], required = false, suitableForAiGeneration = false, notes: string[] = []): VideoNeed {
  return Object.freeze({ id, label, purpose, truthLevel, required, suitableForAiGeneration, notes });
}

/**
 * Infers video needs without generating videos.
 *
 * @example
 * const videos = inferVideoNeeds(input, context);
 */
export function inferVideoNeeds(input: MediaInput, context: MediaFamilyContext): VideoNeed[] {
  void input;
  if (context.family === "hospitality") return [video("video.destination_loop", "Destination or amenities loop", "Booking atmosphere", "provided_only", false)];
  if (context.family === "food_and_beverage") return [video("video.ambience_loop", "Restaurant ambience loop", "Sensory atmosphere", "provided_only", false)];
  if (context.family === "automotive") return [video("video.service_process", "Service/process video", "Process proof", "provided_only", false)];
  if (context.family === "real_estate") return [video("video.walkthrough", "Project walkthrough", "Spatial confidence", "provided_only", false)];
  if (context.family === "ecommerce_d2c") return [video("video.product_demo", "Product demo", "Use confidence", "provided_only", false)];
  return [];
}
