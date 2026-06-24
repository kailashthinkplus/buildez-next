// RFC-004 — PageBlueprint

import { SectionBlueprint } from "./node";
import { PageSEO } from "./seo";

export interface PageLayout {
  maxWidth?: number;
  padding?: number;
}

export interface PageBlueprint {
  id: string;
  path: string;
  name: string;
  seo: PageSEO;
  layout: PageLayout;
  sections: SectionBlueprint[];
}
