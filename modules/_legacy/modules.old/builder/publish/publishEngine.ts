import { SiteBlueprint, PageBlueprint } from "@/modules/blueprint/types";
import { PublishResult } from "./publishTypes";

export async function publishSite(
  site: SiteBlueprint,
  pages: Record<string, PageBlueprint>
): Promise<PublishResult> {
  return { snapshotId: "", url: "" };
}
