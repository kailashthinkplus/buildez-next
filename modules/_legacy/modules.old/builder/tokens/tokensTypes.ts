export interface ColorToken {
  name: string;
  value: string;
}

export interface FontToken {
  name: string;
  family: string;
}

export interface SpaceToken {
  name: string;
  value: number;
}

export interface Tokens {
  colors: Record<string, string>;
  fonts: Record<string, string>;
  spacing: Record<string, number>;
  shadows: Record<string, string>;
}

export interface TokenUpdate {
  path: string;  // e.g. "colors.primary"
  value: any;
}
