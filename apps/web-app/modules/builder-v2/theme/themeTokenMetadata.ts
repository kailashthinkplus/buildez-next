import { defaultThemeTokens, normalizeThemeTokens } from "./defaultTheme";
import type { BuilderThemeTokens } from "./theme.types";

export type ThemeTokenCategory =
  | "colors"
  | "typography"
  | "spacing"
  | "radius"
  | "shadow"
  | "buttons"
  | "defaults";

export type ThemeTokenMetadata = Readonly<{
  category: ThemeTokenCategory;
  key: string;
  path: string;
  label: string;
  value: unknown;
}>;

export type ThemePanelSection = Readonly<{
  id: ThemeTokenCategory;
  title: string;
  description: string;
  tokens: ThemeTokenMetadata[];
}>;

export function buildThemeTokenMetadata(
  tokens: BuilderThemeTokens = defaultThemeTokens
): ThemePanelSection[] {
  const safeTokens = normalizeThemeTokens(tokens);

  return [
    tokenSection("colors", "Global colors", "Color tokens used by canvas, runtime, and inspector color controls.", safeTokens.colors),
    tokenSection("typography", "Global fonts", "Typography tokens for heading and body text.", safeTokens.typography),
    tokenSection("spacing", "Spacing scale", "Shared spacing defaults for sections, containers, content, and cards.", safeTokens.spacing),
    tokenSection("radius", "Radius", "Shared border radius defaults for buttons, cards, and media.", safeTokens.radius),
    tokenSection("shadow", "Shadows", "Shared shadow presets for cards and media.", safeTokens.shadow),
    tokenSection("buttons", "Button defaults", "Primary and secondary button token defaults.", safeTokens.buttons),
    {
      id: "defaults",
      title: "Section and container defaults",
      description: "Layout defaults derived from spacing, radius, and surface tokens.",
      tokens: [
        {
          category: "defaults",
          key: "section.paddingY",
          path: "theme.defaults.section.paddingY",
          label: "Section vertical padding",
          value: safeTokens.spacing.sectionY,
        },
        {
          category: "defaults",
          key: "container.paddingX",
          path: "theme.defaults.container.paddingX",
          label: "Container horizontal padding",
          value: safeTokens.defaults.container.paddingX,
        },
        {
          category: "defaults",
          key: "container.maxWidth",
          path: "theme.defaults.container.maxWidth",
          label: "Container max width",
          value: safeTokens.defaults.container.maxWidth,
        },
      ],
    },
  ];
}

export function flattenThemeTokenMetadata(
  tokens: BuilderThemeTokens = defaultThemeTokens
): ThemeTokenMetadata[] {
  return buildThemeTokenMetadata(tokens).flatMap((section) => section.tokens);
}

export function getThemeTokenValue(tokens: BuilderThemeTokens, path: string): unknown {
  const safeTokens = normalizeThemeTokens(tokens);

  return path
    .replace(/^theme\./, "")
    .split(".")
    .reduce<unknown>((current, part) => {
      if (!current || typeof current !== "object") return undefined;
      return (current as Record<string, unknown>)[part];
    }, safeTokens);
}

function tokenSection(
  category: Exclude<ThemeTokenCategory, "defaults">,
  title: string,
  description: string,
  value: Record<string, unknown>
): ThemePanelSection {
  return {
    id: category,
    title,
    description,
    tokens: flattenObject(value, `theme.${category}`).map((token) => ({
      category,
      ...token,
    })),
  };
}

function flattenObject(
  value: Record<string, unknown>,
  prefix: string
): Omit<ThemeTokenMetadata, "category">[] {
  return Object.entries(value).flatMap(([key, entry]) => {
    const path = `${prefix}.${key}`;

    if (entry && typeof entry === "object" && !Array.isArray(entry)) {
      return flattenObject(entry as Record<string, unknown>, path);
    }

    return [
      {
        key,
        path,
        label: labelize(key),
        value: entry,
      },
    ];
  });
}

function labelize(value: string) {
  return value
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (char) => char.toUpperCase());
}
