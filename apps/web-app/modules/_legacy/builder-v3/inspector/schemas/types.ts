// -------------------------------------------------------------
// Inspector Engine Types
// -------------------------------------------------------------

export type FieldType =
  | "text"
  | "number"
  | "color"
  | "select"
  | "slider"
  | "switch"
  | "spacing"
  | "shadow"
  | "grid-columns"
  | "image"
  | "richtext";

export interface Field {
  name: string;              // "props.style.fontSize"
  label: string;
  type: FieldType;
  component: any;            // React component
  options?: any[];           // for select
  min?: number;
  max?: number;
  step?: number;
}

export interface FieldGroup {
  title?: string;
  fields: Field[];
}

export interface InspectorSchema {
  content?: FieldGroup[];
  style?: FieldGroup[];
  layout?: FieldGroup[];
  effects?: FieldGroup[];
}
