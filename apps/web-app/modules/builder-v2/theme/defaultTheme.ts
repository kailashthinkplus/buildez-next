import type { BuilderTheme } from "../types/blueprint";
import type {
  BuilderThemeTokens,
  ThemePreset,
  ThemeTokenPatch,
} from "./theme.types";

export const defaultThemeTokens: BuilderThemeTokens = {
  colors: {
    background: "#f8fafc",
    surface: "#ffffff",
    surfaceAlt: "#eef2f7",
    textPrimary: "#0f172a",
    textSecondary: "#475569",
    primary: "#2563eb",
    primaryContrast: "#ffffff",
    accent: "#f97316",
    border: "#dbe3ef",
  },
  typography: {
    headingFont: "Inter",
    bodyFont: "Inter",
    baseSize: 16,
    scale: {
      h1: 56,
      h2: 40,
      h3: 28,
      body: 16,
      small: 14,
    },
  },
  spacing: {
    sectionY: 88,
    containerX: 24,
    contentGap: 28,
    cardGap: 20,
  },
  defaults: {
    container: {
      maxWidth: "1120px",
      paddingX: {
        desktop: 24,
        tablet: 20,
        mobile: 16,
      },
    },
  },
  radius: {
    button: 10,
    card: 12,
    media: 14,
  },
  shadow: {
    card: "0 16px 42px rgba(15, 23, 42, 0.08)",
    media: "0 24px 70px rgba(15, 23, 42, 0.16)",
  },
  buttons: {
    primary: {
      backgroundColor: "#2563eb",
      color: "#ffffff",
      borderRadius: 10,
    },
    secondary: {
      backgroundColor: "transparent",
      color: "#0f172a",
      borderColor: "#cbd5e1",
      borderRadius: 10,
    },
  },
};

export const defaultThemePreset: ThemePreset = {
  id: "buildez-default",
  name: "BuildEZ Default",
  tone: "professional",
  previewImageUrl: "/theme-previews/buildez-default.png",
  demoData: {
    category: "Business starter",
    audience: "Consultants, agencies, and service teams",
    description:
      "A clean multi-purpose website starter with a polished workspace hero, trust metrics, and service cards.",
    sections: ["Hero", "Proof strip", "Services", "CTA"],
    highlights: ["Workspace imagery", "Metric cards", "Balanced business layout"],
  },
  tokens: defaultThemeTokens,
};

export function mergeThemeTokens(
  base: BuilderThemeTokens,
  patch?: ThemeTokenPatch
): BuilderThemeTokens {
  if (!patch) return normalizeThemeTokens(base);

  return normalizeThemeTokens({
    colors: { ...base.colors, ...patch.colors },
    typography: {
      ...base.typography,
      ...patch.typography,
      scale: {
        ...base.typography.scale,
        ...patch.typography?.scale,
      },
    },
    spacing: { ...base.spacing, ...patch.spacing },
    defaults: {
      container: {
        ...base.defaults.container,
        ...patch.defaults?.container,
        paddingX: {
          ...base.defaults.container.paddingX,
          ...patch.defaults?.container?.paddingX,
        },
      },
    },
    radius: { ...base.radius, ...patch.radius },
    shadow: { ...base.shadow, ...patch.shadow },
    buttons: {
      primary: {
        ...base.buttons.primary,
        ...patch.buttons?.primary,
      },
      secondary: {
        ...base.buttons.secondary,
        ...patch.buttons?.secondary,
      },
    },
  });
}

export function createBuilderTheme(
  preset: ThemePreset = defaultThemePreset,
  patch?: ThemeTokenPatch
): BuilderTheme {
  return {
    id: preset.id,
    name: preset.name,
    preset: preset.id,
    tokens: mergeThemeTokens(preset.tokens, patch) as unknown as Record<string, unknown>,
  };
}

export function normalizeTheme(inputTheme?: Partial<BuilderTheme> | null): BuilderTheme {
  const preset = typeof inputTheme?.preset === "string" && inputTheme.preset
    ? inputTheme.preset
    : defaultThemePreset.id;

  return stripUndefinedThemeValues({
    id: typeof inputTheme?.id === "string" && inputTheme.id
      ? inputTheme.id
      : preset,
    name: typeof inputTheme?.name === "string" && inputTheme.name
      ? inputTheme.name
      : defaultThemePreset.name,
    preset,
    tokens: normalizeThemeTokens(inputTheme?.tokens) as unknown as Record<string, unknown>,
  }) as BuilderTheme;
}

export function normalizeThemeTokens(inputTokens?: unknown): BuilderThemeTokens {
  const tokens = isRecord(inputTokens) ? inputTokens : {};
  const colors = isRecord(tokens.colors) ? tokens.colors : {};
  const typography = isRecord(tokens.typography) ? tokens.typography : {};
  const typographyScale = isRecord(typography.scale) ? typography.scale : {};
  const spacing = isRecord(tokens.spacing) ? tokens.spacing : {};
  const defaults = isRecord(tokens.defaults) ? tokens.defaults : {};
  const defaultContainer = isRecord(defaults.container) ? defaults.container : {};
  const defaultContainerPadding = isRecord(defaultContainer.paddingX)
    ? defaultContainer.paddingX
    : {};
  const radius = isRecord(tokens.radius) ? tokens.radius : {};
  const shadow = isRecord(tokens.shadow) ? tokens.shadow : {};
  const buttons = isRecord(tokens.buttons) ? tokens.buttons : {};
  const primaryButton = isRecord(buttons.primary) ? buttons.primary : {};
  const secondaryButton = isRecord(buttons.secondary) ? buttons.secondary : {};

  return stripUndefinedThemeValues({
    colors: {
      background: stringOr(colors.background, defaultThemeTokens.colors.background),
      surface: stringOr(colors.surface, defaultThemeTokens.colors.surface),
      surfaceAlt: stringOr(colors.surfaceAlt, defaultThemeTokens.colors.surfaceAlt),
      textPrimary: stringOr(
        colors.textPrimary ?? colors.text,
        defaultThemeTokens.colors.textPrimary
      ),
      textSecondary: stringOr(
        colors.textSecondary ?? colors.muted,
        defaultThemeTokens.colors.textSecondary
      ),
      primary: stringOr(colors.primary, defaultThemeTokens.colors.primary),
      primaryContrast: stringOr(
        colors.primaryContrast,
        defaultThemeTokens.colors.primaryContrast
      ),
      accent: stringOr(colors.accent, defaultThemeTokens.colors.accent),
      border: stringOr(colors.border, defaultThemeTokens.colors.border),
    },
    typography: {
      headingFont: stringOr(
        typography.headingFont,
        defaultThemeTokens.typography.headingFont
      ),
      bodyFont: stringOr(typography.bodyFont, defaultThemeTokens.typography.bodyFont),
      baseSize: numberOr(typography.baseSize, defaultThemeTokens.typography.baseSize),
      scale: {
        h1: numberOr(typographyScale.h1, defaultThemeTokens.typography.scale.h1),
        h2: numberOr(typographyScale.h2, defaultThemeTokens.typography.scale.h2),
        h3: numberOr(typographyScale.h3, defaultThemeTokens.typography.scale.h3),
        body: numberOr(typographyScale.body, defaultThemeTokens.typography.scale.body),
        small: numberOr(typographyScale.small, defaultThemeTokens.typography.scale.small),
      },
    },
    spacing: {
      sectionY: numberOr(spacing.sectionY, defaultThemeTokens.spacing.sectionY),
      containerX: numberOr(spacing.containerX, defaultThemeTokens.spacing.containerX),
      contentGap: numberOr(spacing.contentGap, defaultThemeTokens.spacing.contentGap),
      cardGap: numberOr(spacing.cardGap, defaultThemeTokens.spacing.cardGap),
    },
    defaults: {
      container: {
        maxWidth: stringOr(
          defaultContainer.maxWidth,
          defaultThemeTokens.defaults.container.maxWidth
        ),
        paddingX: {
          desktop: numberOr(
            defaultContainerPadding.desktop,
            defaultThemeTokens.defaults.container.paddingX.desktop
          ),
          tablet: numberOr(
            defaultContainerPadding.tablet,
            defaultThemeTokens.defaults.container.paddingX.tablet
          ),
          mobile: numberOr(
            defaultContainerPadding.mobile,
            defaultThemeTokens.defaults.container.paddingX.mobile
          ),
        },
      },
    },
    radius: {
      button: numberOr(radius.button, defaultThemeTokens.radius.button),
      card: numberOr(radius.card, defaultThemeTokens.radius.card),
      media: numberOr(radius.media, defaultThemeTokens.radius.media),
    },
    shadow: {
      card: stringOr(shadow.card, defaultThemeTokens.shadow.card),
      media: stringOr(shadow.media, defaultThemeTokens.shadow.media),
    },
    buttons: {
      primary: {
        backgroundColor: stringOr(
          primaryButton.backgroundColor,
          stringOr(colors.primary, defaultThemeTokens.buttons.primary.backgroundColor)
        ),
        color: stringOr(
          primaryButton.color,
          stringOr(colors.primaryContrast, defaultThemeTokens.buttons.primary.color)
        ),
        borderRadius: numberOr(
          primaryButton.borderRadius,
          numberOr(radius.button, defaultThemeTokens.buttons.primary.borderRadius)
        ),
      },
      secondary: {
        backgroundColor: stringOr(
          secondaryButton.backgroundColor,
          defaultThemeTokens.buttons.secondary.backgroundColor
        ),
        color: stringOr(
          secondaryButton.color,
          stringOr(colors.textPrimary, defaultThemeTokens.buttons.secondary.color)
        ),
        borderColor: stringOr(
          secondaryButton.borderColor,
          stringOr(colors.border, defaultThemeTokens.buttons.secondary.borderColor)
        ),
        borderRadius: numberOr(
          secondaryButton.borderRadius,
          numberOr(radius.button, defaultThemeTokens.buttons.secondary.borderRadius)
        ),
      },
    },
  }) as BuilderThemeTokens;
}

function stringOr(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function numberOr(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function stripUndefinedThemeValues<T>(value: T): T {
  if (Array.isArray(value)) {
    return value
      .map((entry) => stripUndefinedThemeValues(entry))
      .filter((entry) => entry !== undefined) as T;
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  const next: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(value)) {
    const normalized = stripUndefinedThemeValues(entry);
    if (normalized !== undefined) {
      next[key] = normalized;
    }
  }

  return next as T;
}
