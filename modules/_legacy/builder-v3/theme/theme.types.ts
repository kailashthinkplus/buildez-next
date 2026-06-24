export interface ThemeTokens {
  colors: {
    background: string;
    surface: string;
    primary: string;
    secondary: string;
    text: string;
    muted: string;
    border: string;
  };

  typography: {
    fontFamily: string;
    baseFontSize: number;
    scale: number;
    headings: {
      h1: number;
      h2: number;
      h3: number;
      h4: number;
      h5: number;
      h6: number;
    };
  };

  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };

  radius: {
    sm: number;
    md: number;
    lg: number;
  };

  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
}
