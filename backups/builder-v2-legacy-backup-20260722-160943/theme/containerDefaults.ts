import type { BuilderBlueprint } from "../types/blueprint";
import type { BuilderResponsiveDevice } from "../core/responsive";
import { normalizeThemeTokens } from "./defaultTheme";

export function getThemeContainerMaxWidth(blueprint: BuilderBlueprint): string {
  return normalizeThemeTokens(blueprint.theme?.tokens).defaults.container.maxWidth;
}

export function getThemeContainerPaddingX(
  blueprint: BuilderBlueprint,
  device: BuilderResponsiveDevice
): number {
  return normalizeThemeTokens(blueprint.theme?.tokens).defaults.container.paddingX[device];
}
