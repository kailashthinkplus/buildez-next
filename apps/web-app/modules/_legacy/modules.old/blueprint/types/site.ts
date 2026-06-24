// RFC-004 — SiteBlueprint

import { PageBlueprint } from "./page";
import { SiteTokens } from "./tokens";

export interface SiteBlueprint {
  id: string;
  name: string;
  home: string;
  pages: Record<string, PageBlueprint>;
  tokens: SiteTokens;
}
