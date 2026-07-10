import type { IconNeed, MediaFamilyContext, MediaInput } from "./mediaStrategy";

function icon(id: string, label: string, purpose: string, notes: string[] = []): IconNeed {
  return Object.freeze({ id, label, purpose, truthLevel: "can_be_generated_or_substituted", required: true, suitableForAiGeneration: true, notes });
}

/**
 * Infers icon needs.
 *
 * @example
 * const icons = inferIconNeeds(input, context);
 */
export function inferIconNeeds(input: MediaInput, context: MediaFamilyContext): IconNeed[] {
  void input;
  const base = [icon("icon.contact", "Contact", "Contact affordance"), icon("icon.trust", "Trust/proof", "Proof scanning")];
  if (context.family === "healthcare") return [...base, icon("icon.services", "Services", "Service category scanning")];
  if (context.family === "food_and_beverage") return [...base, icon("icon.menu", "Menu", "Menu navigation"), icon("icon.reservation", "Reservation", "Booking CTA support")];
  if (context.family === "automotive") return [...base, icon("icon.service", "Service", "Service category scanning")];
  if (context.family === "education") return [...base, icon("icon.programs", "Programs", "Program category scanning")];
  if (context.family === "ecommerce_d2c") return [...base, icon("icon.shipping", "Shipping/returns", "Purchase confidence")];
  return base;
}
