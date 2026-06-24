import { PageBlueprint } from "@/modules/blueprint/types";
import { Device } from "./previewTypes";

export function mapPreviewToRuntime(
  page: PageBlueprint,
  device: Device
): any {
  return page;
}
