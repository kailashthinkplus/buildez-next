export type WebsiteDesignTokens = {
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
};
