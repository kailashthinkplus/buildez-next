// -------------------------------------------------------------
// schemaTypes.ts
// Canonical Inspector Schema Type System (V3)
// -------------------------------------------------------------

/**
 * Inspector tabs that appear in the UI.
 * Every schema can choose which tabs to expose.
 */
export type InspectorTab = "content" | "styles" | "layout";

/**
 * Primitive field types supported by the inspector.
 */
export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "color"
  | "select"
  | "image"
  | "toggle"
  | "slider"
  | "repeater"
  | "trbl"        // padding/margin object (top/right/bottom/left)
  | "raw";        // freeform editor (CSS, JSON, etc)

/**
 * Common base field properties shared by all field types.
 */
export interface BaseField {
  key: string;
  label: string;
  type: FieldType;
  description?: string;
  placeholder?: string;
}

/**
 * Select field options.
 */
export interface SelectOption {
  label: string;
  value: string;
}

/**
 * A standard field on a node (text, number, color, etc.)
 */
export interface StandardField extends BaseField {
  type:
    | "text"
    | "textarea"
    | "number"
    | "color"
    | "select"
    | "image"
    | "toggle"
    | "slider"
    | "raw";

  // optional numeric bounds for number/slider
  min?: number;
  max?: number;
  step?: number;

  // select field options
  options?: SelectOption[];
}

/**
 * TRBL input (top-right-bottom-left).
 */
export interface TRBLField extends BaseField {
  type: "trbl";
}

/**
 * Repeater field (array of structured objects).
 */
export interface RepeaterField extends BaseField {
  type: "repeater";
  itemLabel?: string;
  fields: StandardField[];
}

/**
 * Union of all possible field types.
 */
export type InspectorField = StandardField | TRBLField | RepeaterField;

/**
 * A group/section inside a tab ("Typography", "Spacing", etc.)
 */
export interface InspectorSection {
  title: string;
  fields: InspectorField[];
}

/**
 * A TAB inside the inspector (Content, Styles, Layout).
 */
export interface InspectorTabSchema {
  sections: InspectorSection[];
}

/**
 * The full schema for a node type.
 *
 * Each schema may define any of the three tabs.
 */
export interface InspectorSchema {
  label: string;

  // optional overrides for inspector UI
  icon?: string;
  description?: string;

  // tabs
  content?: InspectorTabSchema;
  styles?: InspectorTabSchema;
  layout?: InspectorTabSchema;
}

/**
 * A registry entry:
 *   NodeType → InspectorSchema
 */
export type InspectorRegistry = Record<string, InspectorSchema>;
