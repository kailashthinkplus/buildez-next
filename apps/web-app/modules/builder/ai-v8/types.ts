// /Users/kailash/buildez/apps/web-app/modules/builder/ai-v8/types.ts

export interface AIV8BrandContext {
  logoUrl?: string;
  designTokens?: {
    colors?: {
      primary?: string;
      accent?: string;
      background?: string;
      surface?: string;
      textPrimary?: string;
      textSecondary?: string;
    };
    typography?: {
      fontFamily?: string;
      headingFont?: string;
      bodyFont?: string;
    };
  };
}

export interface AIV8Result {
  html: string;
  metadata: {
    generatedAt: string;
    format: string;
    validation: {
      valid: boolean;
      warnings?: string[];
    };
  };
}
