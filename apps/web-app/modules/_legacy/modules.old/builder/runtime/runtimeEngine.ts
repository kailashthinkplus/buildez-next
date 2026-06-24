import { SiteBlueprint } from "@/modules/blueprint/types";
import { RuntimeSite } from "./runtimeTypes";

export function generateRuntimeSite(site: SiteBlueprint): RuntimeSite {
  return {
    id: site.id,
    pages: {},
    tokens: site.tokens,
  };
}
