import type { ImageNeed, MediaFamilyContext, MediaInput } from "./mediaStrategy";

function image(id: string, label: string, purpose: string, truthLevel: ImageNeed["truthLevel"], required = true, suitableForAiGeneration = false, notes: string[] = []): ImageNeed {
  return Object.freeze({ id, label, purpose, truthLevel, required, suitableForAiGeneration, notes });
}

/**
 * Infers image needs without fetching or generating images.
 *
 * @example
 * const images = inferImageNeeds(input, context);
 */
export function inferImageNeeds(input: MediaInput, context: MediaFamilyContext): ImageNeed[] {
  void input;
  if (context.family === "real_estate") return [
    image("image.project_exterior", "Project exterior or hero render", "Hero credibility", "must_be_real", true, false, ["Use real project imagery or provided render only."]),
    image("image.amenities", "Amenities", "Amenity proof", "must_be_real"),
    image("image.interiors", "Interiors", "Spatial confidence", "must_be_real"),
    image("image.floor_plan_preview", "Floor plan preview", "Plan comprehension", "provided_only", false),
  ];
  if (context.family === "healthcare") return [
    image("image.clinic", "Clinic exterior/interior", "Trust and wayfinding", "must_be_real"),
    image("image.team", "Doctors/team", "Human reassurance", "provided_only", false, false, ["Only use provider/team imagery if supplied."]),
    image("image.equipment", "Equipment or care environment", "Service clarity", "must_be_real", false),
  ];
  if (context.family === "food_and_beverage") return [
    image("image.food", "Food photography", "Appetite and menu confidence", "must_be_real"),
    image("image.ambience", "Restaurant ambience", "Visit confidence", "must_be_real"),
    image("image.menu", "Menu image or menu scan", "Menu clarity", "provided_only", false),
  ];
  if (context.family === "automotive") return [
    image("image.workshop", "Workshop or service bays", "Operational proof", "must_be_real"),
    image("image.vehicle", "Vehicle images", "Service/category relevance", "must_be_real"),
    image("image.before_after", "Before-after service proof", "Proof of work", "provided_only", false),
  ];
  if (context.family === "education") return [
    image("image.campus", "Campus or learning environment", "Institution trust", "must_be_real"),
    image("image.faculty", "Faculty", "Academic trust", "provided_only", false),
    image("image.course", "Course/program visuals", "Program comprehension", "can_be_generated_or_substituted", false, true),
  ];
  if (context.family === "hospitality") return [
    image("image.rooms", "Rooms", "Booking confidence", "must_be_real"),
    image("image.amenities", "Amenities", "Stay confidence", "must_be_real"),
    image("image.destination", "Destination/location", "Travel desire", "must_be_real"),
  ];
  if (context.family === "architecture_interiors") return [
    image("image.portfolio", "Portfolio projects", "Proof of taste and execution", "must_be_real"),
    image("image.materials", "Materials/process", "Material confidence", "must_be_real"),
    image("image.consultation", "Consultation visuals", "Process clarity", "can_be_generated_or_substituted", false, true),
  ];
  if (context.family === "ecommerce_d2c") return [
    image("image.product_packshot", "Product packshots", "Purchase confidence", "must_be_real"),
    image("image.product_detail", "Product detail shots", "Quality proof", "must_be_real"),
    image("image.lifestyle", "Lifestyle support", "Use-case storytelling", "can_be_generated_or_substituted", false, true),
  ];
  return [
    image("image.hero", "Business hero image", "First impression", "must_be_real"),
    image("image.proof", "Proof/supporting imagery", "Credibility", "provided_only", false),
  ];
}
