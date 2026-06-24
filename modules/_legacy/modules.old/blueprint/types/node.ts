// RFC-004 — SectionBlueprint (Node-level model)

export interface PropsModel {
  text?: string;
  html?: string;
  src?: string;
  alt?: string;
  buttonLabel?: string;
  href?: string;
  items?: any[];
  icon?: string;
  label?: string;
  data?: Record<string, any>;
}

export interface LayoutModel {
  display: "flex" | "grid" | "freeform";
  direction?: "row" | "column";
  justify?: string;
  align?: string;
  gap?: number;
  cols?: number;
  rows?: number;
  freeform?: {
    x: number;
    y: number;
    width?: number;
    height?: number;
    rotation?: number;
  };
  responsive?: {
    tablet?: Partial<LayoutModel>;
    mobile?: Partial<LayoutModel>;
  };
}

export interface StyleModel {
  padding?: { t: number; r: number; b: number; l: number };
  margin?: { t: number; r: number; b: number; l: number };
  background?: string;
  border?: { width: number; color: string; radius: number };
  typography?: {
    font: string;
    weight: number;
    size: number;
    lineHeight: number;
    letterSpacing: number;
  };
  responsive?: {
    tablet?: Partial<StyleModel>;
    mobile?: Partial<StyleModel>;
  };
}

export interface EffectsModel {
  opacity?: number;
  blur?: number;
  brightness?: number;
  contrast?: number;
  saturation?: number;
  shadow?: any;
  backdropBlur?: number;
  parallax?: any;
  animation?: any;
  responsive?: {
    tablet?: Partial<EffectsModel>;
    mobile?: Partial<EffectsModel>;
  };
}

export interface SectionBlueprint {
  id: string;
  type: string;
  variant?: string;
  props: PropsModel;
  layout: LayoutModel;
  style: StyleModel;
  effects: EffectsModel;
  children: SectionBlueprint[];
}
