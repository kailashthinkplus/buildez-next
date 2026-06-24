export type PropertyType =
  | "text"
  | "textarea"
  | "number"
  | "select"
  | "switch"
  | "slider"
  | "color"
  | "image"
  | "icon"
  | "url"
  | "spacing"
  | "border"
  | "shadow"
  | "typography"
  | "responsive"
  | "gradient"
  | "alignment";

export interface WidgetProperty {
  id: string;

  label: string;

  type: PropertyType;

  /* Where the value is stored */
  target?: "props" | "style";

  category:
    | "content"
    | "style"
    | "layout"
    | "advanced"
    | "animation"
    | "responsive";

  defaultValue?: unknown;

  options?: {
    label: string;
    value: unknown;
  }[];

  responsive?: boolean;

  aiEditable?: boolean;

  /* UI metadata */

  placeholder?: string;

  description?: string;

  min?: number;

  max?: number;

  step?: number;

  unit?: string;
}