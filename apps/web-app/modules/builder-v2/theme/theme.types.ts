export type ThemeTone =
  | "professional"
  | "friendly"
  | "premium"
  | "bold";

export interface BuilderThemeTokens {
  colors: {
    background: string;
    surface: string;
    surfaceAlt: string;
    textPrimary: string;
    textSecondary: string;
    primary: string;
    primaryContrast: string;
    accent: string;
    border: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    baseSize: number;
    scale: {
      h1: number;
      h2: number;
      h3: number;
      body: number;
      small: number;
    };
  };
  spacing: {
    sectionY: number;
    containerX: number;
    contentGap: number;
    cardGap: number;
  };
  radius: {
    button: number;
    card: number;
    media: number;
  };
  shadow: {
    card: string;
    media: string;
  };
  buttons: {
    primary: {
      backgroundColor: string;
      color: string;
      borderRadius: number;
    };
    secondary: {
      backgroundColor: string;
      color: string;
      borderColor: string;
      borderRadius: number;
    };
  };
}

export interface ThemePreset {
  id: string;
  name: string;
  tone: ThemeTone;
  previewImageUrl?: string;
  demoData?: {
    category: string;
    audience: string;
    description: string;
    sections: string[];
    highlights: string[];
  };
  tokens: BuilderThemeTokens;
}

export type ThemeTokenPatch = Partial<{
  colors: Partial<BuilderThemeTokens["colors"]>;
  typography: Partial<BuilderThemeTokens["typography"]>;
  spacing: Partial<BuilderThemeTokens["spacing"]>;
  radius: Partial<BuilderThemeTokens["radius"]>;
  shadow: Partial<BuilderThemeTokens["shadow"]>;
  buttons: Partial<{
    primary: Partial<BuilderThemeTokens["buttons"]["primary"]>;
    secondary: Partial<BuilderThemeTokens["buttons"]["secondary"]>;
  }>;
}>;
