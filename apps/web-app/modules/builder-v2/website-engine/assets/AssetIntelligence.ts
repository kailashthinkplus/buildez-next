import type { WebsiteSpec } from "../specification";
import type { AssetRequirement } from "./types";

export function inferAssetRequirements(spec: WebsiteSpec): AssetRequirement[] {
  if (spec.business.industry !== "real-estate") return [];

  return [
    {
      id: "hero-project-image",
      sectionId: "hero",
      kind: "image",
      label: "Large project hero image",
      count: 1,
      required: true,
      prompt:
        "Photorealistic premium residential project exterior in India, natural daylight, architectural editorial photography, true-to-life materials, no text, no logo, no CGI.",
    },
    {
      id: "project-card-images",
      sectionId: "featured-projects",
      kind: "gallery",
      label: "Project card images",
      count: 4,
      required: true,
      prompt:
        "Photorealistic residential project image set: exterior, arrival court, balcony view, landscaped amenity, natural daylight, no text, no watermark.",
    },
    {
      id: "amenity-gallery",
      sectionId: "amenities-gallery",
      kind: "gallery",
      label: "Amenity and gallery images",
      count: 6,
      required: true,
      prompt:
        "Premium apartment amenities in India: clubhouse, pool, landscaped walkway, lobby, gym, interior finish details, editorial photography, no text.",
    },
    {
      id: "location-map",
      sectionId: "location-highlights",
      kind: "map",
      label: "Location context map",
      count: 1,
      required: false,
      prompt: "Location context map or city-area visual for project discovery.",
    },
  ];
}
