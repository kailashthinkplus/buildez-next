import { PageBlueprint } from "@/modules/blueprint/types";
import { RuntimePage } from "./runtimeTypes";

export function resolveRuntimePage(
  page: PageBlueprint
): RuntimePage {
  return {
    id: page.id,
    path: page.path,
    nodes: [],
  };
}
