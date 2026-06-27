import type { NodeType } from "../types/blueprint";

export type ElementSource = "first-party" | "marketplace";
export type ElementTier = "default" | "premium";
export type ElementFeature =
  | "core_widgets"
  | "premium_widgets"
  | "ai_builder"
  | "commerce_widgets";

export interface ElementCatalogItem {
  id: string;
  type: NodeType;
  name: string;
  description: string;
  source: ElementSource;
  category:
    | "layout"
    | "content"
    | "media"
    | "conversion"
    | "commerce"
    | "data";
  tier: ElementTier;
  requiredFeature?: ElementFeature;
  allowedPlans: string[];
  marketplaceCategory: string;
  tags: string[];
  industryTags: string[];
  styleTags: string[];
  aiUseCases: string[];
  ai: {
    canGenerate: boolean;
    guidance: string;
  };
}
