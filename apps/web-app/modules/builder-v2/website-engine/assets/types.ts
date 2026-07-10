export type AssetRequirement = {
  id: string;
  sectionId: string;
  kind: "image" | "gallery" | "map" | "document";
  label: string;
  count: number;
  prompt: string;
  required: boolean;
};
