// /apps/web-app/modules/builder/theme/theme.ts

import { colors } from "./tokens/colors";
import { typography } from "./tokens/typography";
import { spacing } from "./tokens/spacing";
import { radius } from "./tokens/radius";
import { shadows } from "./tokens/shadows";
import { effects } from "./tokens/effects";
import { breakpoints } from "./tokens/breakpoints";

export const BuildEZTheme = {
  colors,
  typography,
  spacing,
  radius,
  shadows,
  effects,
  breakpoints,
};

export type BuildEZThemeType = typeof BuildEZTheme;
